import { useState, useEffect } from 'react'
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
  const [liveScreenings, setLiveScreenings] = useState(null)
  const [fetchedMovieInfo, setFetchedMovieInfo] = useState(null)
  const [loading, setLoading] = useState(true) // Estado unificado de carga

  useEffect(() => {
    if (!movie?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [trailerData, selectorData] = await Promise.all([
          getMovieTrailer(movie.id).catch(() => null),
          multiplexId ? getMovieSelectorsById(multiplexId, movie.id).catch(() => null) : null
        ])

        // Trailer
        if (trailerData && typeof trailerData === 'string' && !trailerData.includes('No hay trailer')) {
          setTrailerKey(trailerData)
        } else if (trailerData?.key) {
          setTrailerKey(trailerData.key)
        }

        // Screenings
        if (selectorData) {
          setLiveScreenings(Array.isArray(selectorData.screenings) ? selectorData.screenings : [])
          setFetchedMovieInfo(selectorData.movieInfo || null)
        } else if (!multiplexId) {
          const allPlex = await getAllMultiplexes().catch(() => [])
          const results = await Promise.allSettled(allPlex.map(p => getMovieSelectorsById(p.idMultiplex, movie.id)))
          setLiveScreenings(results.filter(r => r.status === 'fulfilled').flatMap(r => r.value?.screenings || []))
          const validInfo = results.find(r => r.value?.movieInfo)?.value.movieInfo
          if (validInfo) setFetchedMovieInfo(validInfo)
        }
      } catch (err) {
        console.error('Error loading movie details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [movie?.id, multiplexId])

  if (!movie) return null

  const enrichedMovie = { ...movie, ...fetchedMovieInfo }
  const backendScreenings = liveScreenings || movie.screenings || []

  const handleConfirmSeats = (selectedSeatIds, total) => {
    setIsAddingToCart(true)
    addToCart({
      id: `${movie.id}-${selectedScreening.screeningId}`,
      title: movie.title,
      type: 'TICKET',
      showtime: `${selectedScreening.screeningDate?.substring(0, 10)} — ${selectedScreening.screeningDate?.substring(11, 16)}`,
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
                <button onClick={() => setShowTrailer(true)} className="absolute inset-0 m-auto w-16 h-16 bg-magenta/80 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform z-20">
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
              ) : loading ? (
                <div className="flex-1 flex items-center justify-center text-white/50 animate-pulse">Cargando detalles...</div>
              ) : (
                <>
                  <MovieSummary movie={enrichedMovie} />
                  <ShowtimePicker
                    multiplexName={multiplexName}
                    selectedScreening={selectedScreening}
                    setSelectedScreening={setSelectedScreening}
                    canProceedToSeats={selectedScreening !== null}
                    handleProceedToSeats={() => setStep(2)}
                    backendScreenings={backendScreenings}
                    loadingScreenings={loading}
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
          <iframe 
            className="w-full max-w-5xl aspect-video" 
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} 
            allow="autoplay; encrypted-media" 
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>,
    document.body
  )
}