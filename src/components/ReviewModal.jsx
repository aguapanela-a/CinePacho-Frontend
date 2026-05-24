import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Star, Film, Building2, Send } from 'lucide-react'
import Button from './Button'
import { useToast } from '../context/useToast'
import { useLanguage } from '../context/useLanguage'

function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-text-secondary tracking-widest uppercase">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={`transition-colors ${
                star <= (hovered || value)
                  ? 'text-gold fill-gold'
                  : 'text-border'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReviewModal({ order, onClose }) {
  const [movieRating, setMovieRating] = useState(0)
  const [serviceRating, setServiceRating] = useState(0)
  const [comment, setComment] = useState('')
  const toast = useToast()
  const { t } = useLanguage()

  if (!order) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (movieRating === 0 && serviceRating === 0) {
      toast.error(t('review.selectAtLeastOne') || 'Selecciona al menos una calificación')
      return
    }

    // Guardar en localStorage hasta tener backend
    const reviews = JSON.parse(localStorage.getItem('cinepacho_reviews') || '[]')
    reviews.push({
      orderId: order.id,
      movieRating,
      serviceRating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    })
    localStorage.setItem('cinepacho_reviews', JSON.stringify(reviews))

    toast.success(t('review.submitted') || '¡Evaluación enviada!')
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ isolation: 'isolate' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg bg-surface border border-border/50 rounded-3xl p-8 animate-[scaleIn_0.25s_ease-out_forwards]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display tracking-widest text-white uppercase">
              {t('review.title') || 'Evaluar'} <span className="gradient-brand">{t('review.experience') || 'Experiencia'}</span>
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {t('review.orderLabel') || 'Orden'} {order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-border/50 hover:bg-carbon transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calificar Película */}
          <div className="bg-carbon border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-magenta">
              <Film size={18} />
              <span className="text-sm font-bold tracking-wider uppercase">
                {t('review.rateMovie') || 'Califica la Película'}
              </span>
            </div>
            <StarRating
              value={movieRating}
              onChange={setMovieRating}
              label={t('review.movieQuality') || '¿Qué te pareció la película?'}
            />
          </div>

          {/* Calificar Servicio */}
          <div className="bg-carbon border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-gold">
              <Building2 size={18} />
              <span className="text-sm font-bold tracking-wider uppercase">
                {t('review.rateService') || 'Califica el Servicio'}
              </span>
            </div>
            <StarRating
              value={serviceRating}
              onChange={setServiceRating}
              label={t('review.serviceQuality') || '¿Cómo fue la atención en el multiplex?'}
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-xs font-bold tracking-widest text-text-secondary mb-2 uppercase">
              {t('review.comment') || 'Comentario (opcional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder={t('review.commentPlaceholder') || 'Cuéntanos tu experiencia...'}
              className="w-full bg-carbon border border-border/50 rounded-2xl px-4 py-3 outline-none focus:border-magenta transition-colors resize-none text-sm"
            />
            <p className="text-right text-[10px] text-text-secondary mt-1">{comment.length}/300</p>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full">
            <Send size={16} />
            {t('review.submit') || 'Enviar Evaluación'}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  )
}

