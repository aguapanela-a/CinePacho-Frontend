import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Play } from 'lucide-react'
import { useApp } from '../context/useApp'
import SeatSelector from './SeatSelector'
import MovieSummary from './movie-modal/MovieSummary'
import ShowtimePicker from './movie-modal/ShowtimePicker'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'
import { getMovieTrailer, getMovieSelectorsById } from '../services/movieService'
import { getMovieReviews } from '../services/reviewService'
import { getAllMultiplexes } from '../services/multiplexService'

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

  // ✨ 1. EFECTO PARA CONTROLAR EL SCROLL Y LA TECLA ESCAPE
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

  // ✨ 2. UN SOLO EFECTO PARA TRAER LA DATA OPTIMIZADA
  useEffect(() => {
    if (!movie || !movie.id) return
    const fetchFreshData = async () => {
      try {
        const trailerData = await getMovieTrailer(movie.id).catch(() => null)
        
        // 🛡️ Filtro seguro para getMovieTrailer
        if (trailerData?.key) {
          setTrailerKey(trailerData.key)
        } else if (typeof trailerData === 'string' && !trailerData.includes('No hay trailer')) {
          setTrailerKey(trailerData)
        } else {
          setTrailerKey(null)
        }

        const reviewsData = await getMovieReviews(movie.id).catch(() => [])
        if (Array.isArray(reviewsData)) setReviews(reviewsData)

        setLoadingScreenings(true)

        if (multiplexId) {
          // Modo multiplex específico
          const freshData = await getMovieSelectorsById(multiplexId, movie.id).catch(() => null)
          if (freshData) {
            setLiveScreenings(Array.isArray(freshData.screenings) ? freshData.screenings : [])
            if (freshData.movieInfo) setFetchedMovieInfo(freshData.movieInfo)
            
            // 🛡️ Filtro por si viene en freshData
            if (freshData.key && !freshData.key.includes('No hay trailer')) {
              setTrailerKey(freshData.key)
            }
          }
        } else {
          // Modo "Todos"
          const allMultiplexes = await getAllMultiplexes().catch(() => [])
          const results = await Promise.allSettled(
            allMultiplexes.map(plex => getMovieSelectorsById(plex.idMultiplex, movie.id))
          )
          const allScreenings = results
            .filter(r => r.status === 'fulfilled' && r.value?.screenings)
            .flatMap(r => r.value.screenings)

          setLiveScreenings(allScreenings)

          const firstValid = results.find(r => r.status === 'fulfilled' && r.value?.movieInfo)
          if (firstValid) {
            setFetchedMovieInfo(firstValid.value.movieInfo)
            
            // 🛡️ Filtro por si viene en el primer multiplex válido
            if (firstValid.value?.key && !firstValid.value.key.includes('No hay trailer')) {
              setTrailerKey(firstValid.value.key)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching movie extra data', err)
      } finally {
        setLoadingScreenings(false)
      }
    }
    fetchFreshData()
  }, [movie, multiplexId])

  if (!movie) return null

  const backendScreenings = liveScreenings || movie.screenings || []

  const enrichedMovie = {
    ...movie,
    overview: fetchedMovieInfo?.overview || movie.overview,
    genres: fetchedMovieInfo?.genres || movie.genres
  }

  const canProceedToSeats = selectedScreening !== null

  const handleProceedToSeats = () => {
    if (selectedScreening) setStep(2)
  }

  const handleConfirmSeats = (selectedSeatIds, total) => {
    setIsAddingToCart(true)
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
            {/* CONTENEDOR PÓSTER + BOTÓN PLAY */}
            <div className="w-full md:w-80 shrink-0 relative aspect-[2/3] bg-carbon">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              {trailerKey && (
                <button 
                  onClick={() => setShowTrailer(true)} 
                  className="absolute inset-0 m-auto w-16 h-16 bg-magenta/80 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform z-20"
                >
                  <Play fill="currentColor" size={24} className="ml-1" />
                </button>
              )}    
            </div>

            {/* SECCIÓN DE DETALLES */}
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
              ) : (
                <>
                  <MovieSummary movie={enrichedMovie} />
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

      {/* REPRODUCTOR DE TRAILER */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setShowTrailer(false)} className="absolute top-6 right-6 text-white hover:scale-110 transition-transform">
            <X size={32} />
          </button>
          <iframe 
            className="w-full max-w-5xl aspect-video rounded-2xl shadow-2xl" 
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} 
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>,
    document.body
  )
}