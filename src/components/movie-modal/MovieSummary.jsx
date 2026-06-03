import { Star, Clock, Calendar, Clapperboard } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function MovieSummary({ movie }) {
  const { t } = useLanguage()
console.log(movie)
  // 1. Si no hay objeto movie, evitamos que la aplicación falle
  if (!movie) return <div className="p-4 text-white">Cargando detalles...</div>;

  // 2. Extraemos info de forma segura. 
  // Si movie.movieInfo no existe, intentamos usar 'movie' directamente
  const info = movie.movieInfo || movie;

  // 3. Verificamos si realmente tenemos datos básicos para mostrar
  const hasData = info.originalTitle || info.title;

  if (!hasData) {
    return <div className="p-4 text-white">Cargando información...</div>;
  }

  return (
    <>
      <div>
        <h2 id="movie-modal-title" className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
          {info.originalTitle || info.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 text-xs font-bold">
            <Star size={11} fill="currentColor" />
            {movie.rating || '0.0'}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Clock size={11} />
            {info.duration || 'N/A'}
          </span>
          {/* Mapeo de géneros seguro */}
          <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
            {info.genres ? info.genres.map(g => g.name).join(', ') : (info.genre || 'N/A')}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Calendar size={11} />
            {info.releaseDate || info.year || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 mt-6">
        <div>
          <h3 className="text-xs font-display tracking-widest text-magenta mb-1">
            {t('movie.synopsisLabel')}
          </h3>
          <p className="text-text-primary/85 text-[13px] leading-relaxed font-body">
            {info.overview || 'Sin sinopsis disponible'}
          </p>
        </div>

        <div className="sm:w-52 bg-carbon/50 p-3.5 rounded-xl border border-white/5 space-y-2">
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase flex items-center gap-1">
              <Clapperboard size={9} /> {t('movie.director')}
            </p>
            <p className="text-white text-sm font-medium">
              {info.director || 'No disponible'}
            </p>
          </div>
          
          <div className="h-px bg-border/20" />
          
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase">
              {t('movie.cast')}
            </p>
            <p className="text-white/75 text-[11px] leading-relaxed">
              {info.cast || 'No disponible'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}