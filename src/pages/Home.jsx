import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, Star, Clock } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import MovieCardSkeleton from '../components/MovieCardSkeleton'
import MovieModal from '../components/MovieModal'
import Button from '../components/Button'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'

import { getMovieSelectorsByMultiplex, getTopRatedMovies } from '../services/movieService'
import { getAllMultiplexes } from '../services/multiplexService'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const toast = useToast()

  // Estados de Filtros y Búsqueda
  const [displayMultiplex, setDisplayMultiplex] = useState('Todos')
  const [search, setSearch] = useState('')
  // Nuevo estado para la búsqueda con debounce (retraso)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Estados para datos de la API
  const [movies, setMovies] = useState([])
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [multiplexesList, setMultiplexesList] = useState([])
  const [multiplexesLoading, setMultiplexesLoading] = useState(true)
  const [multiplexesError, setMultiplexesError] = useState(null)

  // Auxiliar para obtener el UUID correspondiente al multiplex seleccionado
  const getMultiplexId = (id) => {
    return id && id !== 'Todos' ? id : null
  }
  const currentMultiplexId = getMultiplexId(displayMultiplex)

  // 0. EFECTO: Cargar multiplexes desde el backend
  useEffect(() => {
    const loadMultiplexes = async () => {
      setMultiplexesLoading(true)
      setMultiplexesError(null)
      try {
        const data = await getAllMultiplexes()
        if (Array.isArray(data)) {
          setMultiplexesList(data)
        } else {
          setMultiplexesError('No se pudieron cargar los multiplexes')
        }
      } catch (err) {
        setMultiplexesError(err.message)
        console.error('Error cargando multiplexes:', err)
      } finally {
        setMultiplexesLoading(false)
      }
    }

    loadMultiplexes()
  }, [])

  // 1. EFECTO: Manejo del Debounce para el input de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300) // Espera 300ms antes de actualizar la búsqueda real para la API

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  // 2. EFECTO: Cargar películas desde el Backend basándose en multiplex y debouncedSearch
  useEffect(() => {
    let isMounted = true


    if (displayMultiplex === 'Todos') {
      // Cargar películas top-rated sin multiplex específico
      getTopRatedMovies()
        .then((data) => {
          if (!isMounted) return

          if (Array.isArray(data)) {
            const mappedMovies = data.map((movie) => {
              const genresStr = Array.isArray(movie.genres)
                ? movie.genres.map(g => typeof g === 'string' ? g : g.name).join(', ')
                : 'Varios'

              return {
                id: movie.idMovie,
                title: movie.originalTitle || 'Sin Título',
                originalTitle: movie.originalTitle,
                overview: movie.overview || '',
                genre: genresStr,
                rating: movie.rating || 0.0,
                year: movie.year || 'N/A',
                duration: '120 min',
                posterPath: movie.posterPath,
                backdropPath: movie.backdropPath,
                posterUrl: movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '/placeholder.jpg',
                backdropUrl: movie.backdropPath ? `https://image.tmdb.org/t/p/original${movie.backdropPath}` : '',
                trailerKey: null,
                screenings: []
              }
            })

            if (isMounted) {
              setMovies(mappedMovies)
              if (mappedMovies.length > 0) {
                setFeaturedMovie(mappedMovies[0])
              } else {
                setFeaturedMovie(null)
              }
              setIsLoading(false)
            }
          }
        })
        .catch((error) => {
          console.error('Error cargando películas top-rated:', error)
          if (isMounted) {
            toast.error('No se pudo conectar con el servidor de CinePacho')
            setMovies([])
            setFeaturedMovie(null)
            setIsLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    }

    // Usamos directamente el id calculado para evitar añadir funciones u objetos pesados a las dependencias
    const multiplexId = getMultiplexId(displayMultiplex)

    if (!multiplexId) {
      console.warn('Home: multiplexId no válido para', displayMultiplex)
      if (isMounted) {
        setMovies([])
        setFeaturedMovie(null)
        setIsLoading(false)
      }
      toast.error('Multiplex no configurado. Selecciona otro o revisa la configuración.')
      return
    }

    getMovieSelectorsByMultiplex(multiplexId, debouncedSearch)
      .then((data) => {
        if (!isMounted) return

        if (Array.isArray(data)) {
          const mappedMovies = data.map((selector) => {
            const info = selector.movieInfo || {}
            const releaseYear = info.releaseDate ? info.releaseDate.substring(0, 4) : 'N/A'
            const genresStr = info.genreIds && info.genreIds.length > 0 
              ? info.genreIds.map(g => g.name).join(', ') 
              : 'Acción'

            return {
              id: info.id,
              title: info.originalTitle || 'Sin Título',
              originalTitle: info.originalTitle,
              overview: info.overview || '',
              genre: genresStr,
              rating: selector.rating || 0.0,
              year: releaseYear,
              duration: '120 min',
              posterPath: info.posterPath,
              backdropPath: info.backdropPath,
              posterUrl: info.posterPath ? `https://image.tmdb.org/t/p/w500${info.posterPath}` : '/placeholder.jpg',
              backdropUrl: info.backdropPath ? `https://image.tmdb.org/t/p/original${info.backdropPath}` : '',
              trailerKey: selector.key || null,
              screenings: selector.screenings || []
            }
          })

          setMovies(mappedMovies)

          if (mappedMovies.length > 0) {
            setFeaturedMovie(mappedMovies[0])
          } else {
            setFeaturedMovie(null)
          }
        }
      })
      .catch((error) => {
        console.error("Error cargando la cartelera:", error)
        toast.error("No se pudo conectar con el servidor de CinePacho")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  // Eliminamos currentMultiplexId y cambiamos search por debouncedSearch
  }, [displayMultiplex, debouncedSearch, toast])

  // Filtrado local en el Front sobre el estado actual
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [movies, search])

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16 selection:bg-magenta selection:text-white">
      {/* SECCIÓN HERO (Película Destacada) */}
      <section className="relative h-[55vh] sm:h-[75vh] w-full flex items-end overflow-hidden border-b border-border/30">
        {isLoading ? (
          <div className="absolute inset-0 bg-carbon animate-pulse" />
        ) : featuredMovie ? (
          <>
            <div className="absolute inset-0 scale-105 animate-[subtleZoom_20s_ease-out_infinite] transition-transform duration-1000">
              <img
                src={featuredMovie.backdropPath ? `https://image.tmdb.org/t/p/original${featuredMovie.backdropPath}` : '/placeholder-backdrop.jpg'}
                alt={featuredMovie.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-16 z-10 space-y-4 sm:space-y-5 animate-[fadeUp_0.8s_ease-out]">
              <div className="inline-flex items-center gap-2 bg-magenta/10 border border-magenta/30 px-3 py-1 rounded-full backdrop-blur-md">
                <TrendingUp size={14} className="text-magenta animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-magenta font-display">
                  {t('home.featuredLabel') || 'Destacada en Cartelera'}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-wider text-white leading-none max-w-4xl drop-shadow-md">
                {featuredMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-text-secondary">
                <span className="flex items-center gap-1 text-gold">
                  <Star size={14} fill="currentColor" /> {featuredMovie.rating?.toFixed(1)}
                </span>
                <span>•</span>
                <span className="uppercase tracking-wider">{featuredMovie.genre}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {featuredMovie.duration}
                </span>
              </div>

              <p className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed font-body font-normal line-clamp-3 sm:line-clamp-none drop-shadow">
                {featuredMovie.overview}
              </p>

              <div className="pt-2">
                <Button
                  onClick={() => setSelectedMovie(featuredMovie)}
                  variant="primary"
                  size="lg"
                  className="rounded-xl group font-display tracking-widest text-xs sm:text-sm shadow-xl shadow-magenta/20 hover:shadow-magenta/40"
                >
                  <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  {t('home.getTicketsBtn') || 'RESERVAR FUNCIONES'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-carbon/50">
            <p className="text-text-secondary font-display tracking-widest text-sm uppercase">
              {displayMultiplex === 'Todos' ? 'Por favor selecciona un multiplex' : 'No hay películas disponibles'}
            </p>
          </div>
        )}
      </section>

      {/* CONTENIDO PRINCIPAL (Filtros y Grid de Películas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 space-y-8">
        <div className="flex flex-col gap-6 border-b border-border/30 pb-6">
          {/* Selector de Multiplex */}
          <div className="space-y-3">
            <label className="text-[11px] font-display font-bold tracking-widest text-magenta uppercase">
              {t('home.selectMultiplexLabel') || 'Selecciona tu Multiplex'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDisplayMultiplex('Todos')}
                className={`px-4 py-2 rounded-xl text-xs font-display tracking-wider font-semibold uppercase border transition-all duration-300 ${
                  displayMultiplex === 'Todos'
                    ? 'bg-magenta border-magenta text-white shadow-lg shadow-magenta/20'
                    : 'bg-surface/40 border-border/40 text-text-secondary hover:border-magenta/40 hover:text-white'
                }`}
              >
                Todos
              </button>
              {multiplexesLoading ? (
                <p className="text-text-secondary text-xs py-2">Cargando multiplexes...</p>
              ) : multiplexesError ? (
                <p className="text-red-400 text-xs py-2">Error: {multiplexesError}</p>
              ) : (
                multiplexesList.map((plex) => (
                  <button
                    key={plex.idMultiplex}
                    onClick={() => setDisplayMultiplex(plex.idMultiplex)}
                    className={`px-4 py-2 rounded-xl text-xs font-display tracking-wider font-semibold uppercase border transition-all duration-300 ${
                      displayMultiplex === plex.idMultiplex
                        ? 'bg-magenta border-magenta text-white shadow-lg shadow-magenta/20'
                        : 'bg-surface/40 border-border/40 text-text-secondary hover:border-magenta/40 hover:text-white'
                    }`}
                  >
                    {plex.nameMultiplex}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Barra de Búsqueda */}
          <div className="w-full max-w-md ml-auto">
            <SearchBar value={search} onChange={setSearch} placeholder={t('home.searchPlaceholder') || "Buscar películas..."} />
          </div>
        </div>

        {/* Grid de Películas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <MovieCardSkeleton key={i} />)
          ) : (
            filteredMovies.map((movie, index) => (
              <div
                key={movie.id}
                style={{ animationDelay: `${index * 0.07}s` }}
                className="animate-[fadeUp_0.5s_ease-out_forwards]"
              >
                <MovieCard
                  movie={movie}
                  onClick={() => setSelectedMovie(movie)}
                />
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredMovies.length === 0 && displayMultiplex !== 'Todos' && (
          <div className="text-center py-24">
            <p className="text-text-secondary text-xl font-display tracking-widest">
              {t('home.noMoviesFound') || 'No se encontraron películas para'} "{' '}
              <span className="text-white">{search}</span>"
            </p>
          </div>
        )}
      </section>

      {/* MODAL DESPLEGABLE DE PELÍCULA */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          multiplexName={displayMultiplex}
          multiplexId={currentMultiplexId}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  )
}