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
import { getMovieTrailer, getMovieSelectorsById } from '../services/movieService'
import { getMovieReviews } from '../services/reviewService'
import { Play, Star, MessageSquare } from 'lucide-react'

export default function MovieModal({ movie, onClose, multiplexName = 'Multiplex', multiplexId }) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(showtimeDates[0] || '')
  const [selectedFormat, setSelectedFormat] = useState(ticketFormats[0]?.fmt || '2D')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedScreening, setSelectedScreening] = useState(null)

  const { addToCart } = useApp()
  const { t } = useLanguage()
  const toast = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [reviews, setReviews] = useState([])
  const [liveScreenings, setLiveScreenings] = useState(null)

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

  // Cargar datos reales: Trailer, Reviews y Funciones frescas
  useEffect(() => {
    if (!movie || !movie.id) return
    const fetchFreshData = async () => {
      try {
        const trailerData = await getMovieTrailer(movie.id).catch(() => null)
        if (trailerData && trailerData.key) setTrailerKey(trailerData.key)
        else if (typeof trailerData === 'string' && trailerData.length > 0) setTrailerKey(trailerData)

        const reviewsData = await getMovieReviews(movie.id).catch(() => [])
        if (Array.isArray(reviewsData)) setReviews(reviewsData)

        if (multiplexId) {
          const freshData = await getMovieSelectorsById(multiplexId, movie.id).catch(() => null)
          if (freshData && freshData.screenings) {
            setLiveScreenings(freshData.screenings)
          }
        }
      } catch (err) {
        console.error('Error fetching movie extra data', err)
      }
    }
    fetchFreshData()
  }, [movie, multiplexId])

  if (!movie) return null

  // Usar los screenings frescos del backend si existen, de lo contrario fallback a mock/cache
  const backendScreenings = liveScreenings || movie.screenings || []

  const canProceedToSeats = selectedDate && selectedFormat && selectedTime

  const handleProceedToSeats = () => {
    if (canProceedToSeats) {
      if (!backendScreenings || backendScreenings.length === 0) {
        toast.error('No hay funciones disponibles para esta película en el multiplex seleccionado.')
        return
      }

      const screening = backendScreenings.find(s => {
        const time = s.screeningDate?.substring(11, 16) // "HH:mm"
        return time === selectedTime && s.status === 'ACTIVE'
      })

      if (!screening) {
        toast.error('No se encontró la función seleccionada. Cambia de horario o actualiza la cartelera.')
        return
      }

      setSelectedScreening(screening)
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
        multiplexId,
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
            <div className="w-full md:w-80 shrink-0 relative aspect-[2/3] md:aspect-auto md:h-auto bg-carbon flex flex-col">
              <div className="relative flex-1">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-carbon via-transparent to-transparent opacity-90 md:opacity-40" />
                
                {trailerKey && !showTrailer && (
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="absolute inset-0 m-auto w-16 h-16 bg-magenta/80 text-white rounded-full flex items-center justify-center hover:bg-magenta hover:scale-110 transition-all shadow-[0_0_20px_rgba(200,22,122,0.8)] cursor-pointer"
                  >
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </button>
                )}
              </div>
            </div>

            {/* Contenido (columna derecha) */}
            <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col gap-5 min-w-0">

              {step === 2 ? (
                <SeatSelector
                  onBack={() => setStep(1)}
                  onConfirm={handleConfirmSeats}
                  roomId={activeRoomId}
                  screeningId={activeScreeningId}
                  selectedFormat={selectedFormat}
                  isLoading={isAddingToCart}
                />
              ) : (
                <>
                  <MovieSummary movie={movie} />

                  {/* Reseñas públicas */}
                  {reviews && reviews.length > 0 && (
                    <div className="mt-2 mb-4 bg-carbon/50 border border-border/50 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <MessageSquare size={14} className="text-gold" />
                        Comentarios de Usuarios
                      </h4>
                      <div className="space-y-3 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-magenta/30 scrollbar-track-carbon">
                        {reviews.slice(0, 5).map((rev, idx) => (
                          <div key={idx} className="text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-text-secondary">{rev.buyerName || 'Usuario'}</span>
                              <div className="flex items-center text-gold">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} fill={i < (rev.rating || 0) ? 'currentColor' : 'none'} className={i < (rev.rating || 0) ? 'text-gold' : 'text-border'} />
                                ))}
                              </div>
                            </div>
                            <p className="text-white/80 italic text-xs">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

      {/* Modal Iframe de YouTube */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
          <button 
            onClick={() => setShowTrailer(false)}
            className="absolute top-6 right-6 text-white hover:text-magenta transition-colors"
          >
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-magenta/20 border border-border/50">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
