import { Star, Clock, Play, Ticket } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'

export default function MovieCard({ movie, onClick }) {
  const { title, genre, rating, duration, year, posterUrl } = movie
  const { t } = useLanguage()

  const handleCardClick = () => onClick?.()

  const handleBuyClick = (e) => {
    e.stopPropagation()
    onClick?.()
  }

  // Manejador para soportar navegación por teclado (Accesibilidad)
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
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={title}
            loading="lazy()"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-gold font-bold text-xs border border-gold/20">
                <Star size={12} fill="currentColor" /> {rating}
              </span>
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-text-secondary text-xs">
                <Clock size={12} /> {duration} min
              </span>
            </div>
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
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-10 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
                aria-label={t('movieCard.trailer') || 'Ver trailer'}
              >
                <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-surface">
          <h3 className="font-display tracking-wide text-white text-lg sm:text-xl truncate group-hover:text-magenta transition-colors duration-300">
            {title}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider truncate max-w-[70%]">
              {genre}
            </p>
            <span className="text-xs text-text-secondary/60 font-bold font-display">
              {year}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
