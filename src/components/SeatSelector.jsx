import { useState, useEffect, Fragment, useCallback } from 'react'
import { Monitor, ArrowLeft, Star, Loader2, Clock } from 'lucide-react'
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
})
 {
  const [selectedSeats, setSelectedSeats] = useState(initialSeats)

  const { t } = useLanguage()
  const toast = useToast()

  const [backendSeats, setBackendSeats] = useState([])
  const [seatTimers, setSeatTimers] = useState({})
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [isProcessingSeat, setIsProcessingSeat] = useState(false)

  const reloadSeats = useCallback(async () => {
    if (!roomId || !screeningId) return
    try {
      const data = await getSeatsByRoom(roomId, screeningId)
      setBackendSeats(data)
    } catch (err) {
      console.error('Error loading seats:', err)
      toast.error(t('Error al cargar la disponibilidad') || 'Error al cargar la disponibilidad')
    }
  }, [roomId, screeningId, t, toast])

  useEffect(() => {
    reloadSeats()
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [reloadSeats])

  const formatRemainingTime = (expiry, now) => {
    if (!expiry || isNaN(expiry)) return '--:--'
    const remaining = Math.max(0, Math.ceil((expiry - now) / 1000))
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
    const seconds = String(remaining % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  useEffect(() => {
    let hasExpired = false
    Object.entries(seatTimers).forEach(([seatId, expiry]) => {
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
    if (hasExpired) reloadSeats()
  }, [currentTime, seatTimers, reloadSeats])

  const toggleSeat = async (seat) => {
    if (!seat || isProcessingSeat) return
    const isSelected = selectedSeats.includes(seat.idSeat)

    if (!isSelected && seat.status?.toUpperCase() !== 'AVAILABLE') {
      toast.error(t('La silla no está disponible') || 'La silla no está disponible')
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
        const expiry = currentTime + 10 * 60 * 1000 
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

  const formatPricing = ticketFormats?.find(f => f.fmt === selectedFormat) || ticketFormats?.[0] || { generalPrice: 0, preferentialPrice: 0 }
  const generalPrice = formatPricing.generalPrice
  const prefPrice = formatPricing.preferentialPrice

  const total = selectedSeats.reduce((acc, id) => {
    const s = backendSeats.find(seat => seat.idSeat === id)
    return acc + (s?.type?.toUpperCase() === 'PREFERENTIAL' ? prefPrice : generalPrice)
  }, 0)

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
          {nextExpiry && (
            <p className="text-xs text-magenta/80 flex items-center justify-end gap-1 mt-1 font-mono">
              <Clock size={12} /> {t('seats.timer') || 'Tiempo de reserva:'} {formatRemainingTime(nextExpiry, currentTime)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 text-center relative px-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-magenta to-transparent opacity-50 rounded-full" />
        <p className="text-[10px] font-bold text-magenta tracking-widest uppercase mt-3">
          <Monitor size={12} className="inline mr-1" /> {t('seats.screen')}
        </p>
      </div>

      <div className="flex-1 w-full max-w-xl mx-auto px-2 pb-6">
        <div className="flex flex-col items-center gap-2">
          {ROWS.map(row => (
            <div key={row} className="flex items-center gap-3 w-full justify-center">
              <span className="w-6 text-[10px] font-bold text-text-secondary">{row}</span>
              
              <div className="flex gap-1.5 flex-1 justify-center max-w-[400px]">
                {Array.from({ length: COLS }).map((_, i) => {
                  const seatNumber = (ROWS.indexOf(row) * COLS) + (i + 1)
                  const seat = backendSeats.find(s => s.seatNumber === seatNumber)
                  
                  if (!seat) return <div key={i} className="flex-1" />
                  
                  const isSelected = selectedSeats.includes(seat.idSeat)
                  const isOccupied = seat.status?.toUpperCase() === 'SOLD' || (seat.status?.toUpperCase() === 'BLOCKED' && !isSelected)
                  const isPref = seat.type?.toUpperCase() === 'PREFERENTIAL'

                  return (
                    <Fragment key={seat.idSeat}>
                      <button
                        onClick={() => toggleSeat(seat)}
                        disabled={isOccupied || isProcessingSeat}
                        className={`flex-1 aspect-square min-w-[28px] max-w-[40px] rounded-t-lg rounded-b-sm border flex items-center justify-center text-[10px] font-bold transition-all
                          ${isSelected ? 'bg-magenta border-magenta text-white shadow-[0_0_10px_rgba(200,22,122,0.4)]' : 
                            isOccupied ? 'bg-red-500/10 border-red-500/20 text-transparent cursor-not-allowed opacity-50' :
                            isPref ? 'bg-gold/5 border-gold/40 text-gold hover:bg-gold/20' :
                            'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/50'
                          }`}
                      >
                        {isSelected ? (i + 1) : (isPref && !isOccupied ? <Star size={10} /> : '')}
                      </button>
                      {(i === 2 || i === 6) && <div className="w-3" />}
                    </Fragment>
                  )
                })}
              </div>
              
              <span className="w-6 text-[10px] font-bold text-text-secondary text-right">{row}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
         <p className="text-gold font-display text-xl">${total.toLocaleString('es-CO')}</p>
         <Button onClick={() => onConfirm(selectedSeats, total)} disabled={selectedSeats.length === 0 || isLoading || isProcessingSeat}>
            {isLoading || isProcessingSeat ? <Loader2 className="animate-spin" /> : t('seats.confirmBtn')}
         </Button>
      </div>
    </div>
  )// JAJAJJAJA"
}