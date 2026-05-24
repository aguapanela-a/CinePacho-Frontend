import { useMemo, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowLeft } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import MovieCard from '../components/MovieCard'
import { useLanguage } from '../context/useLanguage'
import { moviesData } from '../data/mockMoviesData'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const query = useQuery()
  const initialQuery = query.get('q')?.trim() || ''
  const [search, setSearch] = useState(initialQuery)
  const [selectedGenre, setSelectedGenre] = useState('Todos')

  useEffect(() => {
    const updateQuery = () => {
      setSearch(initialQuery)
    }
    updateQuery()
  }, [initialQuery])

  // Obtener géneros únicos para los filtros
  const uniqueGenres = useMemo(() => {
    const genres = new Set()
    moviesData.forEach(m => {
      // Separar por / si hay múltiples géneros y limpiar
      m.genre.split('/').forEach(g => genres.add(g.trim()))
    })
    return ['Todos', ...Array.from(genres).sort()]
  }, [])

  const filteredMovies = useMemo(() => {
    let results = moviesData

    if (initialQuery) {
      const normalized = initialQuery.toLowerCase()
      results = results.filter((movie) => {
        return (
          movie.title.toLowerCase().includes(normalized) ||
          movie.genre.toLowerCase().includes(normalized) ||
          movie.synopsis.toLowerCase().includes(normalized)
        )
      })
    }

    if (selectedGenre !== 'Todos') {
      results = results.filter(movie => movie.genre.includes(selectedGenre))
    }

    // Simplificado para 'precio/formato' usando una regla básica de mock
    // Como no hay 'precio' directo, usamos 'Formato' como filtro, simulando
    // 'Todos', 'IMAX', '3D', '2D'. (En este mock, asumimos formato basado en título o aleatorio si no existe,
    // pero vamos a omitir el filtro de formato/precio por ahora si no hay datos, o lo dejamos como 'Todos' por defecto)
    // Para simplificar según el requerimiento, implementamos género que sí existe.

    return results
  }, [initialQuery, selectedGenre])

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

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold tracking-widest text-text-secondary mb-1 uppercase">
                Género
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full sm:w-48 bg-surface border border-border/50 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-magenta"
              >
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {initialQuery === '' ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-10 text-center text-text-secondary">
            {t('search.emptyQuery')}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-10 text-center text-text-secondary">
            <p className="text-xl font-bold text-white mb-3">{t('search.noResults')}</p>
            <p>{t('search.noResultsHelp', { query: initialQuery })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => setTimeout(() => navigate(`/?q=${encodeURIComponent(search)}`), 0)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

