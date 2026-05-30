import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useApp } from '../context/useApp'
import SeatSelector from './SeatSelector'
import MovieSummary from './movie-modal/MovieSummary'
import ShowtimePicker from './movie-modal/ShowtimePicker'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'
import { showtimeDates, ticketFormats } from '../data/mockMoviesData'

export default function MovieModal({ movie, onClose, multiplexName = 'Titán' }) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(showtimeDates[0] || '')
  const [selectedFormat, setSelectedFormat] = useState(ticketFormats[0]?.fmt || '2D')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedScreening, setSelectedScreening] = useState(null)

  const { addToCart } = useApp()
  const { t } = useLanguage()
  const toast = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [movie, handleEscape])

  if (!movie) return null

  // Extraer screenings reales del backend (si existen) 
  const backendScreenings = movie.screenings || []

  const canProceedToSeats = selectedDate && selectedFormat && selectedTime

  const handleProceedToSeats = () => {
    if (canProceedToSeats) {
      // Si hay screenings del backend, buscar el que coincida con la hora seleccionada
      if (backendScreenings.length > 0) {
        const screening = backendScreenings.find(s => {
          const time = s.screeningDate?.substring(11, 16) // "HH:mm"
          return time === selectedTime && s.status === 'ACTIVE'
        })
        setSelectedScreening(screening || null)
      }
      setStep(2)
    }
  }

  // Obtener roomId del screening seleccionado (o usar default)
  const activeRoomId = selectedScreening?.roomId || '650e8400-e29b-41d4-a716-446655440000'
  const activeRoomName = selectedScreening?.roomNumber || 'Sala 3'
  const activeScreeningId = selectedScreening?.screeningId || null

  const handleConfirmSeats = async (seats, total) => {
    setIsAddingToCart(true)
    try {
      // Create a unique ID based on movie, date, time, format, and room to prevent duplicates
      const dateStr = typeof selectedDate === 'object' ? selectedDate.dayKey : selectedDate
      const uniqueId = `${movie.id}-${dateStr}-${selectedTime}-${selectedFormat}-${activeRoomName}`

      // Calculate unit price per seat
      const unitPrice = total / seats.length

      addToCart({
        id: uniqueId,
        name: movie.title,
        type: 'ticket',
        showtime: `${typeof selectedDate === 'object' ? selectedDate.date : selectedDate} — ${selectedTime} (${selectedFormat})`,
        room: activeRoomName,
        qty: seats.length,
        seats,
        seatIds: seats, // UUIDs reales del backend para checkout
        screeningId: activeScreeningId, // UUID del screening para POST /api/checkout/stripe
        unitPrice, // Pass unit price directly to prevent recalculation
        price: total,
      })
      toast.success(t('movie.addedToCart') || 'Entradas agregadas al carrito')
      onClose()
    } catch {
      toast.error(t('movie.errorAdding') || 'Error al agregar al carrito')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-surface border border-border/40 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 w-10 h-10 rounded-xl bg-carbon/60 border border-white/5 flex items-center justify-center text-text-secondary hover:text-white hover:bg-carbon transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row">
            
            {/* Poster / Trailer (columna izquierda) */}
            <div className="w-full md:w-80 shrink-0 relative aspect-[2/3] md:aspect-auto md:h-auto bg-carbon">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-carbon via-transparent to-transparent opacity-90 md:opacity-40" />
            </div>

            {/* Contenido (columna derecha) */}
            <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col gap-5 min-w-0">

              {step === 2 ? (
                <SeatSelector
                  onBack={() => setStep(1)}
                  onConfirm={handleConfirmSeats}
                  roomId={activeRoomId}
                  selectedFormat={selectedFormat}
                  isLoading={isAddingToCart}
                />
              ) : (
                <>
                  <MovieSummary movie={movie} />

                  <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                  <ShowtimePicker
                    multiplexName={multiplexName}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedFormat={selectedFormat}
                    setSelectedFormat={setSelectedFormat}
                    selectedTime={selectedTime}
                    setSelectedTime={setSelectedTime}
                    selectedRoom={activeRoomName}
                    canProceedToSeats={canProceedToSeats}
                    handleProceedToSeats={handleProceedToSeats}
                    backendScreenings={backendScreenings}
                  />
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
