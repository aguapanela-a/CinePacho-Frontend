import { Star, Clock, Calendar, Clapperboard } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function MovieSummary({ movie }) {
  const { t } = useLanguage()

  // Como la consola confirma que movieInfo es el objeto padre:
  const info = movie?.movieInfo || {};

  return (
    <>
      <div>
        <h2 id="movie-modal-title" className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
          {info.title}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 text-xs font-bold">
            <Star size={11} fill="currentColor" />
            {movie.rating}
          </span>
          {/* Duración y Año: Si no vienen en info, los mantenemos opcionales */}
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Clock size={11} />
            {info.duration || 'N/A'}
          </span>
          <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
            {info.genres?.map(g => g.name).join(', ') || 'N/A'}
          </span>
          <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
            <Calendar size={11} />
            {info.release_date || info.releaseDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        <div>
          <h3 className="text-xs font-display tracking-widest text-magenta mb-1">
            {t('movie.synopsisLabel')}
          </h3>
          <p className="text-text-primary/85 text-[13px] leading-relaxed font-body">
            {info.overview || t('movie.noSynopsis')}
          </p>
        </div>

        <div className="sm:w-52 bg-carbon/50 p-3.5 rounded-xl border border-white/5 space-y-2">
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase flex items-center gap-1">
              <Clapperboard size={9} /> {t('movie.director')}
            </p>
            {/* ACCESO CORRECTO A DIRECTOR */}
            <p className="text-white text-sm font-medium">
              {info.director || t('movie.notAvailable')}
            </p>
          </div>
          
          <div className="h-px bg-border/20" />
          
          <div>
            <p className="text-[10px] font-bold text-magenta tracking-widest uppercase">
              {t('movie.cast')}
            </p>
            {/* ACCESO CORRECTO A CAST */}
            <p className="text-white/75 text-[11px] leading-relaxed">
              {info.cast || t('movie.notAvailable')}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}