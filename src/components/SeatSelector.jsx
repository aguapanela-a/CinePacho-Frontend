import { useState, useEffect, Fragment } from 'react'
import { Monitor, Armchair, ArrowLeft, Star, Loader2 } from 'lucide-react'
import Button from './Button'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'
import { getSeatsByRoom, toggleSeatStatus } from '../services/seatService'
import { ticketFormats } from '../data/mockMoviesData'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'] // 6 rows: A-D (40 general seats), E-F (20 preferential seats)
const COLS = 10

export default function SeatSelector({
  onBack,
  onConfirm,
  roomId = '650e8400-e29b-41d4-a716-446655440000', // Mock de room default
  screeningId, // Agregado para llamar endpoints específicos de la función
  basePrice = 11000, // Default to General seat price for 2D
  preferentialPrice = 15000, // Default to Preferential seat price for 2D
  selectedFormat = '2D', // Movie format (2D, 3D, IMAX)
  maxSeats = 6,
  isLoading = false
}) {
  const [selectedSeats, setSelectedSeats] = useState([])
  const { t } = useLanguage()
  const toast = useToast()

  const [occupiedSeats, setOccupiedSeats] = useState(new Set())
  const [backendSeats, setBackendSeats] = useState([])
  const [seatTimers, setSeatTimers] = useState({})
  const [tick, setTick] = useState(0)

  const reloadSeats = async () => {
    if (!roomId || !screeningId) return
    const data = await getSeatsByRoom(roomId, screeningId)
    setBackendSeats(data)
    const occupied = new Set(
      data.filter(s => s.status === 'BLOCKED' || s.status === 'SOLD').map(s => s.idSeat)
    )
    setOccupiedSeats(occupied)
  }

  useEffect(() => {
    if (!roomId || !screeningId) return
    reloadSeats().catch(err => console.error('Error loading seats:', err))
  }, [roomId, screeningId])

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatRemainingTime = (expiry) => {
    if (!expiry) return '--:--'
    const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
    const seconds = String(remaining % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  useEffect(() => {
    const expiredSeats = Object.entries(seatTimers)
      .filter(([, expiry]) => expiry <= Date.now())
      .map(([seatId]) => seatId)

    if (expiredSeats.length > 0) {
      setSeatTimers(prev => {
        const next = { ...prev }
        expiredSeats.forEach(id => delete next[id])
        return next
      })
      setSelectedSeats(prev => prev.filter(id => !expiredSeats.includes(id)))
      reloadSeats().catch(err => console.error('Error reloading seats after timer expiry:', err))
    }
  }, [tick, seatTimers])

  // Mapping A1...F10 to backend seat index (assuming sequential 1-60)
  const getBackendSeat = (rowStr, colInt) => {
    const rowIndex = ROWS.indexOf(rowStr)
    const seatNumber = rowIndex * COLS + colInt
    return backendSeats.find(s => s.seatNumber === seatNumber)
  }

  const toggleSeat = async (seatId) => {
    if (!roomId || !screeningId) return

    const isSelected = selectedSeats.includes(seatId)
    const backendSeat = backendSeats.find((seat) => seat.idSeat === seatId)
    const isSold = backendSeat?.status === 'SOLD'
    const isBlocked = backendSeat?.status === 'BLOCKED'
    const isOccupied = isSold || (isBlocked && !isSelected)

    if (isSelected) {
      try {
        const result = await toggleSeatStatus(seatId, screeningId)
        setSelectedSeats(prev => prev.filter(s => s !== seatId))
        setSeatTimers(prev => {
          const next = { ...prev }
          delete next[seatId]
          return next
        })
        await reloadSeats()
        if (result?.status === 'AVAILABLE') {
          toast.success(t('seats.unblockedSuccess') || 'Silla liberada correctamente.')
        }
      } catch (err) {
        if (err.status === 409) {
          toast.error(t('seats.conflictAlert') || 'La silla ya fue ocupada por otro usuario.')
        } else {
          toast.error(err.message || 'No se pudo liberar la silla')
        }
      }
      return
    }

    if (isOccupied) {
      toast.error(t('seats.occupiedAlert') || 'La silla está ocupada o bloqueada por otro usuario.')
      return
    }

    if (selectedSeats.length >= maxSeats) {
      toast.error(t('seats.maxSeatsAlert', { max: maxSeats }))
      return
    }

    try {
      const result = await toggleSeatStatus(seatId, screeningId)
      if (result?.status === 'BLOCKED') {
        setSelectedSeats(prev => [...prev, seatId])
        const expiry = result.expiresAt ? new Date(result.expiresAt).getTime() : Date.now() + 10 * 60 * 1000
        setSeatTimers(prev => ({
          ...prev,
          [seatId]: expiry,
        }))
      } else if (result?.status === 'AVAILABLE') {
        setSelectedSeats(prev => prev.filter(s => s !== seatId))
        setSeatTimers(prev => {
          const next = { ...prev }
          delete next[seatId]
          return next
        })
      }
      await reloadSeats()
    } catch (err) {
      if (err.status === 409) {
        toast.error(t('seats.conflictAlert') || 'La silla ya fue ocupada por otro usuario.')
      } else if (err.status === 400) {
        toast.error(t('seats.invalidAlert') || 'Solicitud inválida al intentar bloquear la silla.')
      } else {
        toast.error(err.message || 'No se pudo reservar la silla')
      }
    }
  }

  const isPreferential = (seatId) => {
    // Rows E and F are Preferential (20 seats), A-D are General (40 seats) = 60 seats total per room
    return seatId.startsWith('E') || seatId.startsWith('F')
  }

  // Get pricing based on selected format
  const formatPricing = ticketFormats.find(f => f.fmt === selectedFormat) || ticketFormats[0]
  const generalPrice = formatPricing.generalPrice
  const prefPrice = formatPricing.preferentialPrice

  const getSeatClass = (seatId) => {
    const pref = isPreferential(seatId)
    if (selectedSeats.includes(seatId)) return 'bg-gradient-to-t from-magenta to-vinotinto border-magenta shadow-[0_0_15px_rgba(200,22,122,0.5)] text-white'

    const backendSeat = backendSeats.find((seat) => seat.idSeat === seatId)
    const isSold = backendSeat?.status === 'SOLD'
    const isBlocked = backendSeat?.status === 'BLOCKED'
    if (isSold || isBlocked || occupiedSeats.has(seatId)) {
      return 'bg-red-500/10 border-red-500/20 text-transparent cursor-not-allowed opacity-50'
    }

    // Estilos distintos para Preferencial (borde dorado) vs General (borde blanco)
    if (pref) {
      return 'bg-gold/5 border-gold/40 text-gold/60 hover:bg-gold/20 hover:border-gold hover:text-gold transition-all cursor-pointer'
    }
    return 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white transition-all cursor-pointer'
  }

  // Calculate total: General seats use generalPrice, Preferential seats use prefPrice (based on format)
  const total = selectedSeats.reduce((acc, seatId) => {
    return acc + (isPreferential(seatId) ? prefPrice : generalPrice)
  }, 0)

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-bold tracking-wide"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="text-right">
          <h3 className="font-display text-white text-xl tracking-widest uppercase">{t('seats.title')}</h3>
          <p className="text-xs text-text-secondary">{t('seats.maxSeats', { max: maxSeats })}</p>
        </div>
      </div>

      {/* Screen */}
      <div className="mb-10 text-center relative px-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-magenta to-transparent opacity-50 rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-magenta/10 blur-xl rounded-[100%]" />
        <p className="text-[10px] font-bold text-magenta tracking-widest uppercase mt-3 flex items-center justify-center gap-1.5">
          <Monitor size={12} /> {t('seats.screen')}
        </p>
      </div>

      {/* Seat Grid */}
      <div className="flex-1 overflow-x-auto pb-6">
        <div className="min-w-fit mx-auto flex flex-col items-center gap-3">
          {ROWS.map(row => (
            <div key={row} className="flex items-center gap-4">
              <span className="w-4 text-xs font-bold text-text-secondary text-right">{row}</span>
              <div className="flex gap-2">
                {Array.from({ length: COLS }).map((_, i) => {
                  const col = i + 1
                  const seatId = `${row}${col}`
                  const backendSeat = getBackendSeat(row, col)
                  const actualSeatId = backendSeat ? backendSeat.idSeat : seatId
                  const isSelected = selectedSeats.includes(actualSeatId)
                  const isSold = backendSeat?.status === 'SOLD'
                  const isBlocked = backendSeat?.status === 'BLOCKED'
                  const isOccupied = isSold || (isBlocked && !isSelected)
                  const isAisle = col === 3 || col === 7 // Pasillo después de columnas 3 y 7

                  return (
                    <Fragment key={actualSeatId}>
                      <button
                        type="button"
                        onClick={() => toggleSeat(actualSeatId)}
                        disabled={isOccupied}
                        aria-pressed={selectedSeats.includes(actualSeatId)}
                        aria-label={`${t('seats.title')} ${seatId}${isPreferential(seatId) ? `, ${t('seats.preferential')}` : `, ${t('seats.general')}`}${isOccupied ? `, ${t('seats.occupied')}` : ''}`}
                        className={`relative min-w-[44px] min-h-[44px] w-[44px] h-[44px] rounded-t-xl rounded-b-md border flex items-center justify-center text-xs font-bold transition-all overflow-hidden ${getSeatClass(actualSeatId)}`}
                      >
                        {isPreferential(seatId) && !selectedSeats.includes(actualSeatId) && !isOccupied && (
                          <Star size={8} className="absolute top-1 text-gold/40" />
                        )}
                        {selectedSeats.includes(actualSeatId) ? col : ''}
                      </button>
                      {isAisle && <div className="w-4 sm:w-8" />}
                    </Fragment>
                  )
                })}
              </div>
              <span className="w-4 text-xs font-bold text-text-secondary">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-white/5 border border-white/20" /> {t('seats.general')}
        </div>
        <div className="flex items-center gap-2 text-xs text-gold font-bold">
          <div className="relative w-5 h-5 rounded-t-lg bg-gold/5 border border-gold/40 flex items-center justify-center">
            <Star size={8} className="absolute top-1 text-gold/60" />
          </div> {t('seats.preferential')}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-gradient-to-t from-magenta to-vinotinto border border-magenta" /> {t('seats.selected')}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-red-500/10 border border-red-500/20 opacity-50" /> {t('seats.occupied')}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-2 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
            {selectedSeats.length} {t('seats.seatsSelected')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : t('seats.none')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {selectedSeats.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">{t('seats.totalToPay')}</p>
              <p className="text-gold font-display text-xl tracking-wider">
                ${total.toLocaleString('es-CO')}
              </p>
            </div>
          )}
          {selectedSeats.length > 0 && (
            <div className="mt-3 text-xs text-text-secondary space-y-1">
              <p className="font-bold uppercase tracking-widest">{t('seats.blockedTimerLabel') || 'Tiempo restante por asiento'}</p>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seatId => (
                  <span key={seatId} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-border/60 px-3 py-1 text-[11px] text-text-secondary">
                    <strong className="text-white">{seatId}</strong>
                    {formatRemainingTime(seatTimers[seatId])}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Button
            onClick={() => onConfirm(selectedSeats, total)}
            variant="primary"
            size="md"
            disabled={selectedSeats.length === 0 || isLoading}
            className={`w-full sm:w-auto px-8 rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)] ${selectedSeats.length === 0 || isLoading ? 'opacity-40 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Armchair size={16} />
                {t('seats.confirmBtn')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

