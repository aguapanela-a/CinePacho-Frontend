import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Play, Gift, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SeatSelector from './SeatSelector'
import MovieSummary from './movie-modal/MovieSummary'
import ShowtimePicker from './movie-modal/ShowtimePicker'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { showtimeDates, ticketFormats } from '../data/mockMoviesData'
import { formatCurrency } from '../utils/formatCurrency'

export default function MovieModal({ movie, onClose, multiplexName = 'Titán' }) {
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

  return (
    <MovieModalContent
      key={`${movie.id}-${multiplexName}`}
      movie={movie}
      onClose={onClose}
      multiplexName={multiplexName}
    />
  )
}

function MovieModalContent({ movie, onClose, multiplexName }) {
  const [selectedDate, setSelectedDate] = useState(showtimeDates[0].date)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null) // NEW STATE: selectedRoom
  const [step, setStep] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addToCart } = useApp()
  const { t } = useLanguage()
  const toast = useToast()

  // Update canProceedToSeats to include selectedRoom
  const canProceedToSeats = selectedDate && selectedTime && selectedFormat && selectedRoom

  const handleProceedToSeats = () => {
    if (!canProceedToSeats) return
    setStep(2)
  }

  const handleConfirmSeats = async (selectedSeats, total) => {
    setIsAddingToCart(true)
    // Simular latencia de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const unitPrice = Math.round(total / selectedSeats.length)
    addToCart({
      id: `${movie.id}-${selectedDate}-${selectedTime}-${selectedRoom}`, // Include selectedRoom in ID
      name: movie.title,
      type: 'ticket',
      showtime: `${selectedDate} - ${selectedTime} • ${selectedRoom} • ${t('movie.seats')}: ${selectedSeats.join(', ')}`, // Include selectedRoom in showtime string
      format: selectedFormat,
      unitPrice,
      price: formatCurrency(unitPrice),
      qty: selectedSeats.length,
      points: 10,
      image: movie.posterUrl,
    })
    toast.success(t('toast.addedToCart'))
    setIsAddingToCart(false)
    onClose()
  }

  const getPrice = () => {
    if (!selectedFormat) return 0
    const format = ticketFormats.find((f) => f.fmt === selectedFormat)
    return format?.price ?? ticketFormats[0].price
  }

  // createPortal renderiza fuera del árbol DOM de <main>, 
  // así el transform de la animación no rompe position:fixed
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ isolation: 'isolate' }}
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        className="relative z-10 w-full max-w-[1080px] max-h-[90vh] bg-surface rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.9)] border border-border/40 overflow-hidden flex flex-col animate-[scaleIn_0.25s_ease-out_forwards]"
      >

        {/* Botón cerrar — siempre visible */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 bg-carbon/90 rounded-full text-text-secondary hover:text-white hover:bg-magenta transition-all duration-200 shadow-lg cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* CONTENIDO SCROLLABLE */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col lg:flex-row min-h-0">

            {/* ─── POSTER (columna izquierda / banner mobile) ─── */}
            <div className="relative lg:w-[280px] xl:w-[320px] shrink-0 bg-carbon">
              <div className="relative h-48 sm:h-56 lg:h-full lg:min-h-[500px]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Degradado para integración visual */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-surface/80" />

                {/* Botón trailer */}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-magenta/80 hover:border-magenta transition-all hover:scale-110 duration-200 shadow-xl cursor-pointer">
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                </button>

                {/* Badge puntos */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-carbon/85 backdrop-blur-md border border-gold/40 text-gold px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Gift size={11} />
                  +10 {t('common.points')}
                </div>
              </div>
            </div>

            {/* ─── CONTENIDO (columna derecha) ─── */}
            <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col gap-5 min-w-0">

              {step === 2 ? (
                <SeatSelector 
                  onBack={() => setStep(1)}
                  onConfirm={handleConfirmSeats}
                  basePrice={getPrice()}
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
                    selectedRoom={selectedRoom} // PASS NEW STATE
                    setSelectedRoom={setSelectedRoom} // PASS NEW STATE
                    canProceedToSeats={canProceedToSeats}
                    handleProceedToSeats={handleProceedToSeats}
                    getPrice={getPrice}
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
