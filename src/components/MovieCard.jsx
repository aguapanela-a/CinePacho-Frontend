import { Star, Clock, Play, Ticket } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'

export default function MovieCard({ movie, onClick }) {
  const { title, genre, rating, duration, year, posterUrl, description, director } = movie
  const { t } = useLanguage()

  const handleCardClick = () => onClick?.()

  const handleBuyClick = (e) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <article className="group relative bg-surface rounded-2xl overflow-hidden border border-border/50 hover:border-magenta/50 transition-all duration-500 hover:shadow-2xl hover:shadow-magenta/20 cursor-pointer animate-[fadeUp_0.5s_ease-out_forwards]">
      <div
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta rounded-2xl outline-none"
        aria-label={`${title} — ${t('movieCard.viewTimes') || 'Ver funciones'}`}
        role="button"
        tabIndex="0"
      >
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-carbon">
          {/* Fondo difuminado de seguridad para evitar saltos visuales */}
          <img
            src={posterUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110"
            loading="lazy"
            aria-hidden="true"
          />
          {/* Capa principal del póster */}
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Calificación */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="inline-flex items-center gap-1 bg-carbon/80 backdrop-blur-md text-gold text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/5">
              <Star size={11} fill="currentColor" />
              {rating ? rating.toFixed(1) : '0.0'}
            </span>
          </div>

          {/* Acciones Rápidas (Hover Overlay) */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 bg-gradient-to-t from-carbon via-carbon/90 to-transparent">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBuyClick}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-magenta via-vinotinto to-gold text-white text-xs font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-magenta/30 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <Ticket size={14} />
                {t('movieCard.buyBtn') || 'Comprar'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClick?.()
                }}
                className="flex items-center justify-center w-10 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
                aria-label={t('movieCard.trailer') || 'Ver trailer'}
              >
                <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Información del pie de la tarjeta */}
        <div className="p-4 bg-surface">
          <h3 className="font-display tracking-wide text-white text-lg sm:text-xl truncate group-hover:text-magenta transition-colors duration-300">
            {title}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider truncate max-w-[70%]">
              {genre}
            </p>
            <span className="text-xs text-text-secondary/70 font-body shrink-0">
              {year}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}