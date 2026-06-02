import { MapPin, Clock4, Loader } from 'lucide-react'
import Button from './Button'
import { useLanguage } from '../../context/useLanguage'
// import { showtimes as mockShowtimes, ticketFormats } from '../../data/mockMoviesData'
import { useEffect} from 'react'
// import { getMovieSelectorsById } from '../../services/movieService'

const formatPriceLabel = (price) => {
  if (price >= 1000) return `$${Math.round(price / 1000)}K`
  return `$${price.toLocaleString('es-CO')}`
}

export default function ShowtimePicker({
  multiplexName = 'Titán',
  selectedScreening,
  setSelectedScreening,
  canProceedToSeats,
  handleProceedToSeats,
  backendScreenings = [],
  loadingScreenings = false,
}) {
  const { t } = useLanguage()

  // Agrupar funciones por película (en caso de múltiples películas en el modal)
  // y ordenar por fecha + hora
  const availableScreenings = [...backendScreenings]
    .filter(s => s.status?.toUpperCase() === 'ACTIVE')
    .sort((a, b) => new Date(a.screeningDate.substring(0, 10)) - new Date(b.screeningDate.substring(0, 10)))

  // Debug logging
  useEffect(() => {
    console.log('ShowtimePicker - backendScreenings:', backendScreenings)
    console.log('ShowtimePicker - availableScreenings (filtered ACTIVE):', availableScreenings)
  }, [backendScreenings, availableScreenings])

  // Formatear fecha + hora para mostrar
  const formatScreeningDisplay = (screening) => {
    try {
      // screeningDate viene en formato "yyyy-MM-dd HH:mm:ss"
      const dateString = screening.screeningDate
      if (!dateString) return { dateStr: 'Fecha desconocida', timeStr: 'Hora desconocida' }
      
      // Extraer hora directamente del string (posiciones 11-16)
      const timeStr = dateString.substring(11, 16)
      
      // Extraer y parsear fecha (posiciones 0-10)
      const dateStr = dateString.substring(0, 10)
      const date = new Date(dateStr)
      
      // Formatear la fecha localmente
      const formatted = date.toLocaleDateString('es-CO', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
      
      return { dateStr: formatted, timeStr }
    } catch (err) {
      console.error('Error formatting screening display:', err, screening)
      return { dateStr: 'Fecha', timeStr: 'Hora' }
    }
  }

  return (
    <div className="bg-carbon/30 rounded-xl p-4 border border-white/5 space-y-3.5">
      <div className="flex items-center gap-2">
        <MapPin size={15} className="text-magenta" />
        <span className="font-display text-base tracking-widest text-white">
          {t('movie.showtimesIn') || 'Funciones en'} {multiplexName}
        </span>
      </div>

      {!selectedScreening ? (
        // MODO 1: Mostrar lista de funciones disponibles para elegir
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
            {t('movie.availableShowtimes') || 'Funciones disponibles'}
          </p>
          
          {loadingScreenings ? (
            <div className="flex items-center justify-center py-6">
              <Loader size={16} className="text-magenta animate-spin mr-2" />
              <p className="text-xs text-text-secondary">Cargando funciones...</p>
            </div>
          ) : availableScreenings.length === 0 ? (
            <p className="text-xs text-text-secondary italic">
              No hay funciones disponibles en este momento
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {availableScreenings.map((screening) => {
                const { dateStr, timeStr } = formatScreeningDisplay(screening)
                return (
                  <button
                    key={screening.screeningId}
                    onClick={() => setSelectedScreening(screening)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-carbon/40 text-text-secondary hover:text-white hover:bg-carbon hover:border-magenta/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock4 size={14} className="group-hover:text-magenta" />
                      <span className="font-display text-xs tracking-wider">
                        {dateStr} • {timeStr}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold uppercase text-magenta/60 group-hover:text-magenta">
                      {screening.format || '_2D'} • Sala {screening.roomNumber}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        // MODO 2: Mostrar selección fija de la función elegida
        <div className="space-y-3.5">
          <div className="bg-carbon/40 border border-magenta/30 rounded-xl px-4 py-3 space-y-2">
            <p className="text-[9px] text-text-secondary font-bold tracking-widest uppercase">
              {t('movie.selectedShowtime') || 'Función seleccionada'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-white font-medium">
                  {formatScreeningDisplay(selectedScreening).dateStr}
                </p>
                <p className="text-sm font-display tracking-wider text-magenta">
                  {formatScreeningDisplay(selectedScreening).timeStr}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] text-text-secondary font-bold">Formato</p>
                <p className="text-xs font-semibold text-white">
                  {selectedScreening.format || '_2D'}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[9px] text-text-secondary font-bold">Sala</p>
                <p className="text-xs font-semibold text-white">
                  {selectedScreening.roomNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Botón para volver a elegir otra función */}
          <button
            onClick={() => setSelectedScreening(null)}
            className="w-full text-[9px] font-bold text-text-secondary hover:text-magenta transition-colors uppercase tracking-widest"
          >
            ← Elegir otra función
          </button>
        </div>
      )}

      {/* Botón de continuar (solo visible cuando hay screening seleccionada) */}
      {selectedScreening && (
        <div className="pt-2">
          <Button
            onClick={handleProceedToSeats}
            variant="primary"
            size="md"
            className="w-full rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)]"
          >
            {t('movie.proceedToSeats') || 'Elegir Asientos'}
          </Button>
        </div>
      )}
    </div>
  )
}