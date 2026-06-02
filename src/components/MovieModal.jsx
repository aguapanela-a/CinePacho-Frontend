import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Play, Star, MessageSquare } from 'lucide-react'
import { useApp } from '../context/useApp'
import SeatSelector from './SeatSelector'
import MovieSummary from './movie-modal/MovieSummary'
import ShowtimePicker from './movie-modal/ShowtimePicker'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'
import { getMovieTrailer, getMovieSelectorsById } from '../services/movieService'
import { getMovieReviews } from '../services/reviewService'

export default function MovieModal({ movie, onClose, multiplexName = 'Multiplex', multiplexId }) {
  const [step, setStep] = useState(1)
  
  const [selectedScreening, setSelectedScreening] = useState(null)

  const { addToCart } = useApp()
  const { t } = useLanguage()
  const toast = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [reviews, setReviews] = useState([])
  const [liveScreenings, setLiveScreenings] = useState(null)
  const [fetchedMovieInfo, setFetchedMovieInfo] = useState(null)
  const [loadingScreenings, setLoadingScreenings] = useState(false)


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

  useEffect(() => {
    if (!movie || !movie.id) return
    const fetchFreshData = async () => {
      try {
        const trailerData = await getMovieTrailer(movie.id).catch(() => null)
        if (trailerData?.key) setTrailerKey(trailerData.key)
        else if (typeof trailerData === 'string') setTrailerKey(trailerData)

        const reviewsData = await getMovieReviews(movie.id).catch(() => [])
        if (Array.isArray(reviewsData)) setReviews(reviewsData)

        if (multiplexId) {
          setLoadingScreenings(true)
          const freshData = await getMovieSelectorsById(multiplexId, movie.id).catch(() => null)
          if (freshData) {
            console.log('MovieSelectorDTO:', freshData)

            // 1. Guardar funciones
            const screenings = Array.isArray(freshData.screenings) ? freshData.screenings : []
            setLiveScreenings(screenings)

            // 2. Guardar la info de la película (overview, géneros, etc.)
            if (freshData.movieInfo) {
              setFetchedMovieInfo(freshData.movieInfo)
            }
          }
          setLoadingScreenings(false)
        }
      } catch (err) {
        console.error('Error fetching movie extra data', err)
        setLoadingScreenings(false)
      }
    }
    fetchFreshData()
  }, [movie, multiplexId])

  if (!movie) return null

  const backendScreenings = liveScreenings || movie.screenings || []

  // Fusionamos el movie original con los datos nuevos del backend si existen
  const enrichedMovie = {
    ...movie,
    overview: fetchedMovieInfo?.overview || movie.overview,
    genres: fetchedMovieInfo?.genres || movie.genres
  }

  // Puede proceder a asientos solo si hay screening seleccionada
  const canProceedToSeats = selectedScreening !== null
  

  const handleProceedToSeats = () => {
    if (selectedScreening) {
      setStep(2)
    }
  }

  const handleConfirmSeats = (selectedSeatIds, total) => {
    setIsAddingToCart(true)
    
    // La información viene de la screening seleccionada
    const screeningDate = selectedScreening.screeningDate
    const dateDisplayStr = screeningDate?.substring(0, 10) || 'N/A'
    const timeDisplayStr = screeningDate?.substring(11, 16) || 'N/A'
    
    addToCart({
      id: `${movie.id}-${selectedScreening.screeningId}`,
      title: movie.title,
      type: 'TICKET',
      showtime: `${dateDisplayStr} — ${timeDisplayStr}`,
      seats: selectedSeatIds,
      qty: selectedSeatIds.length,
      unitPrice: total / selectedSeatIds.length,
      screeningId: selectedScreening.screeningId,
      multiplexId
    })
    
    toast.success(t('movie.addedToCart') || 'Entradas agregadas')
    onClose()
    setIsAddingToCart(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface border border-border/40 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        <button onClick={onClose} className="absolute right-4 top-4 z-30 w-10 h-10 rounded-xl bg-carbon/60 flex items-center justify-center hover:bg-carbon">
          <X size={18} />
        </button>

        <div className="overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-80 shrink-0 relative aspect-[2/3] bg-carbon">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="absolute inset-0 m-auto w-16 h-16 bg-magenta/80 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Play fill="currentColor" size={24} className="ml-1" />
                </button>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col gap-5">
              {step === 2 ? (
                <SeatSelector
                  onBack={() => setStep(1)}
                  onConfirm={handleConfirmSeats}
                  roomId={selectedScreening?.roomId}
                  screeningId={selectedScreening?.screeningId}
                  selectedFormat={selectedScreening?.format}
                  isLoading={isAddingToCart}
                />
              // ... dentro del return
              ) : (
                <>
                  <MovieSummary movie={enrichedMovie} /> {/* <-- Cambiado aquí */}
                  <ShowtimePicker
                    multiplexName={multiplexName}
                    selectedScreening={selectedScreening}
                    setSelectedScreening={setSelectedScreening}
                    canProceedToSeats={canProceedToSeats}
                    handleProceedToSeats={handleProceedToSeats}
                    backendScreenings={backendScreenings}
                    loadingScreenings={loadingScreenings}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setShowTrailer(false)} className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <iframe className="w-full max-w-5xl aspect-video" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} allowFullScreen></iframe>
        </div>
      )}
    </div>,
    document.body
  )
}