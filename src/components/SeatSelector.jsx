import { useState, useEffect, Fragment } from 'react'
import { Monitor, Armchair, ArrowLeft, Star, Loader2 } from 'lucide-react'
import Button from './Button'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'
import { getSeatsByRoom, toggleSeatStatus } from '../services/seatService'
import { ticketFormats } from '../data/mockMoviesData'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 10

export default function SeatSelector({
  onBack,
  onConfirm,
  roomId = null,
  screeningId,
  selectedFormat = '2D',
  maxSeats = 6,
  isLoading = false
}) {
  const [selectedSeats, setSelectedSeats] = useState([])
  const { t } = useLanguage()
  const toast = useToast()

  const [backendSeats, setBackendSeats] = useState([])
  const [seatTimers, setSeatTimers] = useState({})
  const [tick, setTick] = useState(0)

  const reloadSeats = async () => {
    if (!roomId || !screeningId) return
    try {
      const data = await getSeatsByRoom(roomId, screeningId)
      setBackendSeats(data)
    } catch (err) {
      console.error('Error loading seats:', err)
      toast.error(t('seats.errorLoading') || 'Error al cargar la disponibilidad')
    }
  }

  useEffect(() => {
    reloadSeats()
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [roomId, screeningId])

  const formatRemainingTime = (expiry) => {
    if (!expiry) return '--:--'
    const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
    const seconds = String(remaining % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  // Limpieza de timers expirados
  useEffect(() => {
    const now = Date.now()
    Object.entries(seatTimers).forEach(([seatId, expiry]) => {
      if (expiry <= now) {
        setSeatTimers(prev => {
          const next = { ...prev }
          delete next[seatId]
          return next
        })
        setSelectedSeats(prev => prev.filter(id => id !== seatId))
        reloadSeats()
      }
    })
  }, [tick])

  const toggleSeat = async (seat) => {
    if (!seat) return
    const isSelected = selectedSeats.includes(seat.idSeat)
    
    // Validar estados bloqueados/vendidos por otros
    if (!isSelected && seat.status?.toUpperCase() !== 'AVAILABLE') {
      toast.error(t('seats.occupiedAlert') || 'La silla no está disponible')
      return
    }

    if (!isSelected && selectedSeats.length >= maxSeats) {
      toast.error(t('seats.maxSeatsAlert', { max: maxSeats }))
      return
    }

    try {
      const result = await toggleSeatStatus(seat.idSeat, screeningId)
      
      if (!isSelected) {
        setSelectedSeats(prev => [...prev, seat.idSeat])
        const expiry = Date.now() + 10 * 60 * 1000 // 10 min hardcoded fallback
        setSeatTimers(prev => ({ ...prev, [seat.idSeat]: expiry }))
      } else {
        setSelectedSeats(prev => prev.filter(id => id !== seat.idSeat))
        setSeatTimers(prev => { const next = { ...prev }; delete next[seat.idSeat]; return next })
      }
      await reloadSeats()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar estado')
    }
  }

  const formatPricing = ticketFormats.find(f => f.fmt === selectedFormat) || ticketFormats[0]
  const generalPrice = formatPricing.generalPrice
  const prefPrice = formatPricing.preferentialPrice

  const total = selectedSeats.reduce((acc, id) => {
  const s = backendSeats.find(seat => seat.idSeat === id)
  return acc + (s?.type?.toUpperCase() === 'PREFERENTIAL' ? prefPrice : generalPrice)
}, 0)

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white text-sm font-bold tracking-wide">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="text-right">
          <h3 className="font-display text-white text-xl tracking-widest uppercase">{t('seats.title')}</h3>
        </div>
      </div>

      <div className="mb-10 text-center relative px-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-magenta to-transparent opacity-50 rounded-full" />
        <p className="text-[10px] font-bold text-magenta tracking-widest uppercase mt-3"><Monitor size={12} className="inline mr-1" /> {t('seats.screen')}</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-6">
        <div className="min-w-fit mx-auto flex flex-col items-center gap-3">
          {ROWS.map(row => (
            <div key={row} className="flex items-center gap-4">
              <span className="w-4 text-xs font-bold text-text-secondary">{row}</span>
              <div className="flex gap-2">
                {Array.from({ length: COLS }).map((_, i) => {
                  const seatNumber = (ROWS.indexOf(row) * COLS) + (i + 1)
                  const seat = backendSeats.find(s => s.seatNumber === seatNumber)
                  
                  if (!seat) return <div key={i} className="w-[44px]" />
                  
                  const isSelected = selectedSeats.includes(seat.idSeat)
                  const seatStatus = seat.status?.toUpperCase()
                  const seatType = seat.type?.toUpperCase()

                  const isOccupied = seatStatus === 'SOLD' || (seatStatus === 'BLOCKED' && !isSelected)
                  const isPref = seatType === 'PREFERENTIAL'

                  return (
                    <Fragment key={seat.idSeat}>
                      <button
                        onClick={() => toggleSeat(seat)}
                        disabled={isOccupied}
                        className={`w-[44px] h-[44px] rounded-t-xl rounded-b-md border flex items-center justify-center text-xs font-bold transition-all
                          ${isSelected ? 'bg-magenta border-magenta text-white shadow-[0_0_15px_rgba(200,22,122,0.5)]' : 
                            isOccupied ? 'bg-red-500/10 border-red-500/20 text-transparent cursor-not-allowed opacity-50' :
                            isPref ? 'bg-gold/5 border-gold/40 text-gold hover:border-gold' :
                            'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/50'
                          }`}
                      >
                        {isSelected ? (i + 1) : (isPref && !isOccupied ? <Star size={10} /> : '')}
                      </button>
                      {(i === 2 || i === 6) && <div className="w-8" />}
                    </Fragment>
                  )
                })}
              </div>
              <span className="w-4 text-xs font-bold text-text-secondary">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer y Total */}
      <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
         <p className="text-gold font-display text-xl">${total.toLocaleString('es-CO')}</p>
         <Button onClick={() => onConfirm(selectedSeats, total)} disabled={selectedSeats.length === 0 || isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : t('seats.confirmBtn')}
         </Button>
      </div>
    </div>
  )
}