import { useState, useEffect } from 'react'
import { Plus, Star, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import { useApp } from '../context/useApp'
import { getAllSnacks, getAdminSnacks } from '../services/snackService'
import { useLanguage } from '../context/useLanguage'
import { useToast } from '../context/useToast'

export default function Snacks() {
  const { addToCart, user } = useApp()
  const { t } = useLanguage()
  const toast = useToast()

  const [snacks, setSnacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSnacks = async () => {
      setLoading(true)
      setError(null)

      try {
        let data;
        
        // Determinar si el usuario tiene privilegios de administrador
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
        
        if (isAdmin) {
          // Llama al endpoint de admin que retorna List<SnackByMultiplex>
          data = await getAdminSnacks();
        } else {
          // Llama al endpoint público para compradores
          const multiplexId = user?.multiplexId || user?.idMultiplex || import.meta.env.VITE_DEFAULT_MULTIPLEX_ID;
      console.log("Estoy pidiendo snacks para este Multiplex ID:", multiplexId);
          if (!multiplexId) throw new Error('Multiplex no definido');
          data = await getAllSnacks(multiplexId);
        }

        // Lógica de aplanamiento:
        // Si el backend devuelve grupos (estructura admin), aplanamos.
        // Si ya es un array de snacks (estructura pública), lo usamos tal cual.
        const flatSnacks = Array.isArray(data) 
          ? data.flatMap(item => item.snacks ? item.snacks : [item])
          : [];
          
        setSnacks(flatSnacks);
        
      } catch (err) {
        console.error("Error cargando snacks:", err);
        setError(err.message || 'Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    }
    fetchSnacks();
  }, [user]);

  const toCartItem = (snack) => {
    return {
      id: snack.idSnack,
      name: snack.nameSnack,
      description: snack.descriptionSnack,
      price: Number(snack.priceSnack) || 0, 
      type: 'snack',
      showtime: null, 
      image: snack.imageUrl || null,
      points: Number(snack.pointsSnack) || 0, 
      multiplexId: user?.multiplexId || user?.idMultiplex || import.meta.env.VITE_DEFAULT_MULTIPLEX_ID,
    }
  }

  const handleAddSnack = (snack) => {
    addToCart(toCartItem(snack))
    toast.success(t('toast.addedToCart'))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-16 animate-[fadeUp_0.5s_ease-out_forwards]">
        <h1 className="text-5xl md:text-6xl font-display uppercase tracking-widest text-white mb-4">
          <span className="gradient-brand">{t('snacks.title')}</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          {t('snacks.subtitle')}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl px-5 py-4 mb-8 max-w-xl mx-auto">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface border border-border/50 rounded-3xl h-64 animate-pulse" />
          ))}
        </div>
      ) : snacks.length === 0 ? (
        <div className="text-center py-24 text-text-secondary">
          <p className="text-lg">{t('snacks.emptyCatalog')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {snacks.map((snack, index) => (
            <div
              key={snack.idSnack}
              className="group relative bg-surface border border-border/50 rounded-3xl overflow-hidden flex flex-col h-full hover:border-magenta/40 transition-all duration-300"
            >
              <div className="relative h-48 bg-gradient-to-br from-magenta/10 to-vinotinto/10 flex items-center justify-center">
                <div className="absolute top-4 left-4 z-20 bg-carbon/80 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-sm font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>+{snack.pointsSnack || 0}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-display text-white mb-2">{snack.nameSnack}</h3>
                <span className="text-xl font-bold text-gold mb-4">
                  ${Number(snack.priceSnack).toLocaleString('es-CO')}
                </span>
                <p className="text-text-secondary text-sm mb-6 flex-1">
                  {snack.descriptionSnack}
                </p>

                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={snack.quantitySnack <= 0}
                  onClick={() => handleAddSnack(snack)}
                >
                  {snack.quantitySnack <= 0 ? t('snacks.outOfStock') : t('snacks.addToOrder')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}