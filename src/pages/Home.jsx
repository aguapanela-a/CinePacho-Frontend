import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, Star, Clock } from 'lucide-react'
import { mapMovieData } from '../utils/movieMapper'
import { getMovieSelectorsByMultiplex, getTopRatedMovies } from '../services/movieService'
import { getAllMultiplexes } from '../services/multiplexService'

import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import MovieCardSkeleton from '../components/MovieCardSkeleton'
import MovieModal from '../components/MovieModal'
import Button from '../components/Button'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const toast = useToast()

  // Estados
  const [displayMultiplex, setDisplayMultiplex] = useState('Todos')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [movies, setMovies] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [multiplexesList, setMultiplexesList] = useState([])

  // Memoización para el ID del multiplex
  const currentMultiplexId = useMemo(() => 
    displayMultiplex === 'Todos' ? null : displayMultiplex, 
  [displayMultiplex])

  // Cargar lista de multiplexes al montar
  useEffect(() => {
    getAllMultiplexes().then(setMultiplexesList).catch(err => {
      console.error("Error cargando multiplexes:", err)
    })
  }, [])

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  // Carga de películas (cuando cambia multiplex o búsqueda)
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    const loadData = async () => {
      try {
        const rawData = displayMultiplex === 'Todos' 
          ? await getTopRatedMovies() 
          : await getMovieSelectorsByMultiplex(currentMultiplexId, debouncedSearch)

        if (isMounted) {
          const normalized = mapMovieData(rawData)
          setMovies(normalized)
          setFeaturedMovie(normalized[0] || null)
        }
      } catch (err) {
        if (isMounted) toast.error(t('home.errorLoading') || 'Error al cargar')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [displayMultiplex, currentMultiplexId, debouncedSearch, t])

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16 selection:bg-magenta selection:text-white">
      {/* SECCIÓN HERO */}
      <section className="relative h-[55vh] sm:h-[75vh] w-full flex items-end overflow-hidden border-b border-border/30">
        {isLoading ? (
          <div className="absolute inset-0 bg-carbon animate-pulse" />
        ) : featuredMovie ? (
          <>
            <div className="absolute inset-0 scale-80 animate-[subtleZoom_20s_ease-out_infinite] transition-transform duration-1000">
              <img 
                src={featuredMovie.backdropUrl || '/placeholder-backdrop.jpg'} 
                alt={featuredMovie.title} 
                className="w-full h-full object-cover object-top" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>
            <div className="relative w-full max-w-7xl mx-auto px-4 pb-16 z-10 space-y-4">
              <h1 className="text-4xl sm:text-7xl font-display uppercase text-white">{featuredMovie.title}</h1>
              <p className="text-text-secondary text-sm max-w-2xl">{featuredMovie.overview}</p>
              <Button onClick={() => setSelectedMovie(featuredMovie)} variant="primary" size="lg">
                <Play size={16} /> {t('home.getTicketsBtn') || 'RESERVAR'}
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-secondary uppercase tracking-widest">
            {t('home.noMoviesFound') || 'No hay películas disponibles'}
          </div>
        )}
      </section>

      {/* FILTROS Y BÚSQUEDA */}
      <section className="max-w-7xl mx-auto px-4 mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setDisplayMultiplex('Todos')} 
            className={`px-4 py-2 rounded-xl text-xs uppercase border ${displayMultiplex === 'Todos' ? 'bg-magenta border-magenta text-white' : 'bg-surface/40 border-border/40 text-text-secondary'}`}
          >
            Todos
          </button>
          {multiplexesList.map(plex => (
            <button 
              key={plex.idMultiplex} 
              onClick={() => setDisplayMultiplex(plex.idMultiplex)} 
              className={`px-4 py-2 rounded-xl text-xs uppercase border ${displayMultiplex === plex.idMultiplex ? 'bg-magenta border-magenta text-white' : 'bg-surface/40 border-border/40 text-text-secondary'}`}
            >
              {plex.nameMultiplex}
            </button>
          ))}
        </div>
        <div className="w-full max-w-md">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder={t('home.searchPlaceholder') || "Buscar películas..."} 
          />
        </div>
      </section>

      {/* GRID DE PELÍCULAS */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        {!isLoading && movies.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <p className="text-xl">{t('home.noMoviesFound') || 'No se encontraron resultados'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {isLoading 
              ? Array.from({ length: 4 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : movies.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onClick={() => setSelectedMovie(movie)} 
                  />
                ))
            }
          </div>
        )}
      </section>

      {/* MODAL */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie}
          multiplexName={multiplexesList.find(p => p.idMultiplex === displayMultiplex)?.nameMultiplex || 'Cartelera General'}
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  )
}