import { Star, Clock, Calendar } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function MovieSummary({ movie }) {
  const { t } = useLanguage()
  
  // Extraemos la info basándonos en la estructura enriquecida que viene del padre
  const info = movie.movieInfo || movie;

  return (
    <>
      <div>
        <h2 id="movie-modal-title" className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
          {info.originalTitle || info.title || 'N/A'}
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
          <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
            {Array.isArray(info.genres) 
              ? info.genres.map(g => (typeof g === 'string' ? g : g.name)).join(', ') 
              : info.genre || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Calendar size={11} />
            {info.releaseDate || info.year || 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-display tracking-widest text-magenta mb-1">
          {t('movie.synopsisLabel')}
        </h3>
        <p className="text-text-primary/85 text-[13px] leading-relaxed font-body max-w-2xl">
          {info.overview || t('Sinopsis')}
        </p>
      </div>
    </>
  )
}