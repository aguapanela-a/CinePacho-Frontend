import React, { useState, useEffect } from 'react'
import { Plus, Star, Loader2, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import { getAllSnacks } from '../services/snackService'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatCurrency'

export default function Snacks() {
  const { addToCart } = useApp()
  const { t } = useLanguage()
  const toast = useToast()

  const [snacks, setSnacks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchSnacks = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllSnacks()
        setSnacks(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSnacks()
  }, [])

  // Mapea los campos del backend al formato que espera el carrito
  const toCartItem = (snack) => {
    const unitPrice = Number(snack.priceSnack) || 0
    return {
      id: snack.idSnack,
      name: snack.nameSnack,
      description: snack.descriptionSnack,
      unitPrice,
      price: formatCurrency(unitPrice),
      points: Math.floor(unitPrice / 5000),
      type: 'snack',
      showtime: null,
      image: snack.imageUrl || null,
    }
  }

  const handleAddSnack = (snack) => {
    addToCart(toCartItem(snack))
    toast.success(t('toast.addedToCart'))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Cabecera */}
      <div className="text-center mb-16 animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl md:text-6xl font-display uppercase tracking-widest text-white mb-4">
          <span className="gradient-brand">{t('snacks.title')}</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          {t('snacks.subtitle')}
          <span className="block mt-2 text-gold font-semibold">
            {t('snacks.pointsReminder')}
          </span>
        </p>
      </div>

      {/* Error de carga */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto">
          <AlertCircle size={18} />
          {t('snacks.errorLoading')} {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-border/50 rounded-3xl overflow-hidden animate-pulse">
              <div className="h-48 sm:h-56 bg-carbon/60" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-carbon rounded-xl w-3/4" />
                <div className="h-3 bg-carbon rounded-xl w-full" />
                <div className="h-10 bg-carbon rounded-2xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : snacks.length === 0 && !error ? (
        <div className="text-center py-24 text-text-secondary">
          <p className="text-lg">{t('snacks.emptyCatalog')}</p>
        </div>
      ) : (
        /* Grid de productos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {snacks.map((snack, index) => (
            <div
              key={snack.idSnack}
              className="group relative bg-surface border border-border/50 rounded-3xl overflow-hidden hover:border-magenta/40 transition-all duration-300 hover:shadow-2xl hover:shadow-magenta/20 flex flex-col h-full animate-[fadeUp_0.5s_ease-out_forwards]"
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              {/* Imagen generada via UI Avatars como placeholder estilizado */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-magenta/10 to-vinotinto/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-carbon/20 group-hover:bg-transparent transition-colors duration-300 z-10" />
                <div className="text-6xl select-none z-0">🍿</div>

                {/* Badge de puntos */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-carbon/80 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  <Star size={14} fill="currentColor" />
                  <span>+{Math.floor(Number(snack.priceSnack) / 5000)} {t('common.points')}</span>
                </div>

                {/* Badge stock bajo */}
                {snack.quantitySnack <= 5 && snack.quantitySnack > 0 && (
                  <div className="absolute top-4 right-4 z-20 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-bold">
                    {t('snacks.lastUnits')}
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-display tracking-wide text-white group-hover:text-magenta transition-colors">
                    {snack.nameSnack}
                  </h3>
                  <span className="text-xl font-bold font-display text-gold whitespace-nowrap">
                    ${Number(snack.priceSnack).toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-6 flex-1 hidden sm:block">
                  {snack.descriptionSnack}
                </p>

                <Button
                  variant="secondary"
                  className="w-full mt-auto"
                  disabled={snack.quantitySnack <= 0}
                  onClick={() => handleAddSnack(snack)}
                >
                  {snack.quantitySnack <= 0 ? (
                    t('snacks.outOfStock')
                  ) : (
                    <><Plus size={18} /> {t('snacks.addToOrder')}</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
