import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, TrendingUp, Star, Clock, Gift } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import MovieCardSkeleton from '../components/MovieCardSkeleton'
import MovieModal from '../components/MovieModal'
import Button from '../components/Button'
import { useLanguage } from '../context/useLanguage'

import { getMovieSelectorsByMultiplex } from '../services/movieService'

const multiplexes = [
  'Todos',
  'Titán',
  'Unicentro',
  'Plaza Central',
  'Gran Estación',
  'Embajador',
  'Las Américas',
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [activePlex, setActivePlex] = useState('Todos')
  const [sortBy, setSortBy] = useState('default')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [movies, setMovies] = useState([])
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const query = search.trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  // Cargar películas desde la API (simulando multiplex 'Titán' por defecto con el UUID del backend)
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        // UUID hardcodeado para Titán basado en API_Docs_Backend_NEW.md
        const titanId = '550e8400-e29b-41d4-a716-446655440000'
        const data = await getMovieSelectorsByMultiplex(titanId)
        
        // Mapeamos el DTO del backend a nuestro formato local
        const mappedMovies = Array.isArray(data) ? data.map(item => ({
          id: item.movieInfo.id,
          title: item.movieInfo.originalTitle,
          year: item.movieInfo.releaseDate?.substring(0, 4) || 'N/A',
          duration: '120m', // Backend doesn't return duration directly in movieInfo
          genre: item.movieInfo.genreIds && item.movieInfo.genreIds.length > 0 
                  ? item.movieInfo.genreIds[0].name 
                  : 'N/A',
          rating: item.rating,
          synopsis: item.movieInfo.overview,
          posterUrl: item.movieInfo.posterPath,
          backdropUrl: item.movieInfo.backdropPath,
          multiplexes: ['Todos', 'Titán'],
          // Pasar los screenings reales del backend
          screenings: item.screenings || [],
        })) : []
        setMovies(mappedMovies)
      } catch {
        setMovies([]) // fallback a array vacio si falla
      } finally {
        setIsLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const featuredMovie = movies.length > 0 ? movies[0] : null
  const displayMultiplex = activePlex === 'Todos' ? 'Titán' : activePlex

  const filteredMovies = useMemo(() => {
    let result = movies.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                            (m.genre || '').toLowerCase().includes(search.toLowerCase())
      const matchesPlex = activePlex === 'Todos' || (m.multiplexes && m.multiplexes.includes(activePlex))
      return matchesSearch && matchesPlex
    })

    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return result
  }, [movies, search, activePlex, sortBy])

  return (
    <div className="min-h-screen pb-12">
      {/* Sección Hero: Punto focal primario diseñado para alto impacto visual y conversión inmediata */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10">
        <div className="relative w-full rounded-3xl overflow-hidden min-h-[450px] lg:min-h-[500px] flex items-center bg-carbon border border-border/50 animate-[fadeUp_0.5s_ease-out_forwards]">

          {featuredMovie && (
            <div className="absolute inset-0 z-0">
              <img
                src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
                alt={`${featuredMovie.title} Background`}
                loading="eager"
                fetchPriority="high"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-magenta/60 via-transparent to-carbon mix-blend-color-burn" />
              <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/80 to-transparent" />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-magenta/40 blur-[100px] rounded-full" />
            </div>
          )}

          {/* Capa de Contenido (Izquierda): Textos e interacciones con Jerarquía tipográfica definida */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 w-full lg:w-3/5">
            {featuredMovie ? (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/40 text-gold px-4 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(212,146,42,0.2)]">
                  <Star size={14} fill="currentColor" />
                  <span>{t('home.featuredOfWeek')}</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display text-white tracking-widest drop-shadow-xl font-bold">
                  {featuredMovie.title.toUpperCase()}
                </h1>

                <div className="flex items-center gap-3 text-sm text-text-primary font-bold font-display tracking-widest">
                  <div className="flex items-center gap-1.5 text-gold">
                    <Clock size={16} />
                    <span>{featuredMovie.duration?.toUpperCase()}</span>
                  </div>
                  <span className="text-border">•</span>
                  <span>{featuredMovie.year}</span>
                  <span className="text-border">•</span>
                  <span>{featuredMovie.genre?.toUpperCase()}</span>
                </div>

                <p className="text-text-primary/90 text-sm sm:text-base leading-relaxed max-w-md font-body">
                  {featuredMovie.synopsis}
                </p>

                <div className="pt-2">
                  <Button
                    onClick={() => setSelectedMovie(featuredMovie)}
                    variant="primary"
                    size="lg"
                    className="rounded-2xl px-8 shadow-[0_0_30px_rgba(200,22,122,0.4)] hover:shadow-[0_0_40px_rgba(200,22,122,0.6)]"
                  >
                    <Play size={18} fill="currentColor" />
                    {t('home.viewDetailsAndTimes')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-8 bg-carbon/50 rounded w-1/4 animate-pulse" />
                <div className="h-16 bg-carbon/50 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-carbon/50 rounded w-1/2 animate-pulse" />
                <div className="h-24 bg-carbon/50 rounded w-full animate-pulse" />
              </div>
            )}
          </div>

          {/* Overlay Decorativo (Derecha): Tarjeta interactiva con Floating Animation (Aislamiento visual) */}
          <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-20 animate-[float_6s_ease-in-out_infinite]">
            {featuredMovie ? (
              <div className="relative w-64 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-magenta/20 bg-carbon cursor-pointer" onClick={() => setSelectedMovie(featuredMovie)}>
                <img
                  src={featuredMovie.posterUrl}
                  alt={`${featuredMovie.title} Poster`}
                  loading="lazy"
                  className="w-full h-auto hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-carbon/90 backdrop-blur-md border border-gold/50 text-gold px-3 py-1 rounded-full text-xs font-bold glow-gold">
                  <Gift size={14} className="text-gold" />
                  <span>+10 PTS</span>
                </div>
              </div>
            ) : (
              <div className="w-64 h-96 bg-carbon/50 rounded-2xl border-2 border-white/10 animate-pulse" />
            )}
          </div>
        </div>
      </section>

      {/* Componentes de Filtrado de Inventario: Sistema de búsqueda bidireccional (Texto/Sedes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative z-30 -mt-6">
        <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-3xl shadow-xl space-y-6">
          <form className="grid gap-4" onSubmit={handleSearchSubmit}>
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              label={t('home.searchLabel')}
            />
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                {t('home.searchButton')}
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 border-t border-border/30 pt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {multiplexes.map((plex) => (
                <button
                  key={plex}
                  onClick={() => {
                    if (activePlex !== plex) {
                      setIsLoading(true)
                      setActivePlex(plex)
                      setTimeout(() => setIsLoading(false), 500)
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer border ${activePlex === plex
                    ? 'bg-gradient-to-r from-magenta to-vinotinto text-white border-magenta/50 shadow-[0_0_15px_rgba(200,22,122,0.4)]'
                    : 'bg-surface border-border/80 text-text-secondary hover:text-white hover:border-magenta/50'
                    }`}
                >
                  {plex === 'Todos' ? t('common.all') : plex}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
                Ordenar por
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-carbon border border-border/50 text-white rounded-full px-4 py-2 text-sm outline-none focus:border-magenta font-bold"
              >
                <option value="default">Por Defecto</option>
                <option value="rating">Mejor Valoradas</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Principal de Inventario (Cartelera) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-display tracking-widest text-white uppercase">
              {t('home.onBillboard')}
            </h2>
            <p className="text-sm font-medium text-text-secondary mt-1 tracking-wide">
              {t('home.discoverBest')}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-magenta font-bold cursor-pointer hover:text-white transition-colors">
            {t('home.viewAll')}
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))
          ) : (
            filteredMovies.map((movie, index) => (
              <div key={movie.id} style={{ animationDelay: `${index * 0.07}s` }} className="animate-[fadeUp_0.5s_ease-out_forwards]">
                <MovieCard movie={movie} onClick={() => setSelectedMovie(movie)} />
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredMovies.length === 0 && (
          <div className="text-center py-24 animate-[fadeUp_0.8s_ease-out_forwards]">
            <p className="text-text-secondary text-xl font-display tracking-widest">
              {t('home.noMoviesFound')} "<span className="text-white">{search}</span>"
            </p>
          </div>
        )}
      </section>

      {/* Renderizado Condicional del Modal: Controlado por el estado local setSelectedMovie */}
      <MovieModal
        movie={selectedMovie}
        multiplexName={displayMultiplex}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  )
}


