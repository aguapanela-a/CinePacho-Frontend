import { Star, Clock, Calendar, Clapperboard } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function MovieSummary({ movie }) {
  const { t } = useLanguage()

  // Intentamos capturar los datos desde cualquier estructura posible
  // 1. Si llega como movie.movieInfo
  // 2. Si llega aplanado en la raíz (movie)
  const data = movie?.movieInfo || movie || {};

  return (
    <>
      <div>
        <h2 id="movie-modal-title" className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
          {data.originalTitle || data.title || 'Título no disponible'}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 text-xs font-bold">
            <Star size={11} fill="currentColor" />
            {data.rating || '0.0'}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Clock size={11} />
            {data.duration || 'N/A'}
          </span>
          <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
            {data.genre || (data.genres && Array.isArray(data.genres) ? data.genres.map(g => g.name).join(', ') : '') || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Calendar size={11} />
            {data.releaseDate || data.year || 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 mt-6">
        <div>
          <h3 className="text-xs font-display tracking-widest text-magenta mb-1">
            {t('movie.synopsisLabel')}
          </h3>
          <p className="text-text-primary/85 text-[13px] leading-relaxed font-body">
            {data.overview || t('movie.noSynopsis')}
          </p>
        </div>

        <div className="sm:w-52 bg-carbon/50 p-3.5 rounded-xl border border-white/5 space-y-2">
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase flex items-center gap-1">
              <Clapperboard size={9} /> {t('movie.director')}
            </p>
            {/* Si aún no aparece, verifica en la pestaña Network del navegador */}
            <p className="text-white text-sm font-medium">
              {data.director || t('movie.notAvailable')}
            </p>
          </div>
          
          <div className="h-px bg-border/20" />
          
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase">
              {t('movie.cast')}
            </p>
            <p className="text-white/75 text-[11px] leading-relaxed">
              {data.cast || t('movie.notAvailable')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}