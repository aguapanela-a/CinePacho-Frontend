import { useState, useEffect, Fragment, useCallback } from 'react'
import { Monitor, ArrowLeft, Star, Loader2, Clock } from 'lucide-react' // Eliminado Armchair
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
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [isProcessingSeat, setIsProcessingSeat] = useState(false) // Feedback de carga para clics

  // Usamos useCallback para evitar recrear la función en cada render
  const reloadSeats = useCallback(async () => {
    if (!roomId || !screeningId) return
    try {
      const data = await getSeatsByRoom(roomId, screeningId)
      setBackendSeats(data)
    } catch (err) {
      console.error('Error loading seats:', err)
      toast.error(t('seats.errorLoading') || 'Error al cargar la disponibilidad')
    }
  }, [roomId, screeningId, t, toast])

  // Carga inicial de asientos
  useEffect(() => {
    reloadSeats()
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [reloadSeats])

  // Formatear tiempo restante (Ahora sí se usa abajo)
  // Cambia tu función para que acepte "now":
  const formatRemainingTime = (expiry, now) => {
    if (!expiry || isNaN(expiry)) return '--:--'

    // Usamos el "now" que viene del estado controlado de React
    const remaining = Math.max(0, Math.ceil((expiry - now) / 1000))
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
    const seconds = String(remaining % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  // Limpieza de timers expirados corregida (Evita llamadas múltiples al backend)
  // Cambia tu segundo useEffect por este:
  useEffect(() => {
    let hasExpired = false

    Object.entries(seatTimers).forEach(([seatId, expiry]) => {
      // Usamos currentTime del estado en lugar de Date.now() directo
      if (expiry <= currentTime) {
        hasExpired = true
        setSeatTimers(prev => {
          const next = { ...prev }
          delete next[seatId]
          return next
        })
        setSelectedSeats(prev => prev.filter(id => id !== seatId))
      }
    })

    if (hasExpired) {
      reloadSeats()
    }
  }, [currentTime, seatTimers, reloadSeats]) // <-- Cambiado tick por currentTime


  const toggleSeat = async (seat) => {
    if (!seat || isProcessingSeat) return
    const isSelected = selectedSeats.includes(seat.idSeat)
    
    if (!isSelected && seat.status?.toUpperCase() !== 'AVAILABLE') {
      toast.error(t('seats.occupiedAlert') || 'La silla no está disponible')
      return
    }

    if (!isSelected && selectedSeats.length >= maxSeats) {
      toast.error(t('seats.maxSeatsAlert', { max: maxSeats }))
      return
    }

    try {
      setIsProcessingSeat(true)
      await toggleSeatStatus(seat.idSeat, screeningId)
      
      if (!isSelected) {
        setSelectedSeats(prev => [...prev, seat.idSeat])
        const expiry = Date.now() + 10 * 60 * 1000 // 10 min fallback
        setSeatTimers(prev => ({ ...prev, [seat.idSeat]: expiry }))
      } else {
        setSelectedSeats(prev => prev.filter(id => id !== seat.idSeat))
        setSeatTimers(prev => { 
          const next = { ...prev }
          delete next[seat.idSeat]
          return next 
        })
      }
      await reloadSeats()
    } catch (err) {
      toast.error(err.message || 'Error al actualizar estado')
    } finally {
      setIsProcessingSeat(false)
    }
  }

  // Fallback seguro por si ticketFormats viene vacío
  const formatPricing = ticketFormats?.find(f => f.fmt === selectedFormat) || ticketFormats?.[0] || { generalPrice: 0, preferentialPrice: 0 }
  const generalPrice = formatPricing.generalPrice
  const prefPrice = formatPricing.preferentialPrice

  const total = selectedSeats.reduce((acc, id) => {
    const s = backendSeats.find(seat => seat.idSeat === id)
    return acc + (s?.type?.toUpperCase() === 'PREFERENTIAL' ? prefPrice : generalPrice)
  }, 0)

  // Obtener el timer del asiento más próximo a expirar para mostrarlo en el UI
  const dynamicTimers = Object.values(seatTimers)
  const nextExpiry = dynamicTimers.length > 0 ? Math.min(...dynamicTimers) : null

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white text-sm font-bold tracking-wide">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="text-right">
          <h3 className="font-display text-white text-xl tracking-widest uppercase">{t('seats.title')}</h3>
          {/* Agregado: Feedback visual del tiempo de reserva */}
          {nextExpiry && (
            <p className="text-xs text-magenta/80 flex items-center justify-end gap-1 mt-1 font-mono">
              <Clock size={12} /> {t('seats.timer') || 'Tiempo de reserva:'} {formatRemainingTime(nextExpiry, currentTime)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-10 text-center relative px-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-magenta to-transparent opacity-50 rounded-full" />
        <p className="text-[10px] font-bold text-magenta tracking-widest uppercase mt-3">
          <Monitor size={12} className="inline mr-1" /> {t('seats.screen')}
        </p>
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
                        disabled={isOccupied || isProcessingSeat}
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
         <Button onClick={() => onConfirm(selectedSeats, total)} disabled={selectedSeats.length === 0 || isLoading || isProcessingSeat}>
            {isLoading || isProcessingSeat ? <Loader2 className="animate-spin" /> : t('seats.confirmBtn')}
         </Button>
      </div>
    </div>
  )
}