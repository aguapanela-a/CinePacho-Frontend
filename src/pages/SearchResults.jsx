import { useMemo, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowLeft, Loader2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import { useLanguage } from '../context/useLanguage'
import { searchMovies } from '../services/movieService'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const query = useQuery()
  const initialQuery = query.get('q')?.trim() || ''
  const [search, setSearch] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setSearch(initialQuery)
  }, [initialQuery])

  // Realizar búsqueda con el API real
  useEffect(() => {
    const performSearch = async () => {
      if (!initialQuery) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await searchMovies(initialQuery)
        // TMDB search via backend devuelve data.results
        if (data && data.results) {
          const mapped = data.results.map(item => ({
            id: item.id,
            title: item.title,
            year: item.release_date?.substring(0, 4) || 'N/A',
            genre: 'Película', // TMDB devuelve IDs de géneros, dejamos uno genérico por ahora
            rating: item.vote_average,
            synopsis: item.overview,
            posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750',
            backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
          }))
          setResults(mapped)
        } else {
          setResults([])
        }
      } catch (err) {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [initialQuery])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!search.trim()) {
      navigate('/search')
      return
    }
    navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen bg-carbon text-text-primary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.5em] text-gold font-bold mb-2">{t('search.resultsLabel')}</p>
            <h1 className="text-5xl md:text-6xl font-display text-white tracking-widest">
              {t('search.heading')}
            </h1>
            <p className="max-w-2xl mt-4 text-text-secondary text-base leading-relaxed">
              {initialQuery
                ? t('search.searchingFor', { query: initialQuery })
                : t('search.searchPrompt')}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-surface transition-all"
          >
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('search.label')}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-magenta px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition-all"
            >
              <Search size={18} /> {t('search.button')}
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-20 flex flex-col items-center justify-center text-text-secondary">
             <Loader2 size={40} className="animate-spin mb-4 text-magenta" />
             <p className="font-bold tracking-widest uppercase">Buscando...</p>
          </div>
        ) : initialQuery === '' ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-10 text-center text-text-secondary">
            {t('search.emptyQuery')}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-10 text-center text-text-secondary">
            <p className="text-xl font-bold text-white mb-3">{t('search.noResults')}</p>
            <p>{t('search.noResultsHelp', { query: initialQuery })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => setTimeout(() => navigate(`/?q=${encodeURIComponent(search)}`), 0)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
