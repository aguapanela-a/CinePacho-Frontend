import { MapPin, Clock4, Loader } from 'lucide-react'
import Button from '../Button'
import { useLanguage } from '../../context/LanguageContext'
import { useMemo } from 'react'

export default function ShowtimePicker({
  multiplexName = 'Titán',
  selectedScreening,
  setSelectedScreening,
  handleProceedToSeats,
  backendScreenings = [],
  loadingScreenings = false,
}) {
  const { t } = useLanguage()

  const availableScreenings = useMemo(() => {
    if (!Array.isArray(backendScreenings)) return []
    
    return [...backendScreenings]
      .filter(s => s?.status?.toUpperCase() === 'ACTIVE')
      .sort((a, b) => {
        const dateA = new Date(a.screeningDate || 0).getTime()
        const dateB = new Date(b.screeningDate || 0).getTime()
        return dateA - dateB
      })
  }, [backendScreenings])

  const formatScreeningDisplay = (screening) => {
    if (!screening?.screeningDate) return { dateStr: '...', timeStr: '...' }
    
    const date = new Date(screening.screeningDate)
    
    // Verificación básica para fecha inválida
    if (isNaN(date.getTime())) return { dateStr: '---', timeStr: '--:--' }
    
    const dateStr = date.toLocaleDateString('es-CO', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
    const timeStr = date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    
    return { dateStr, timeStr }
  }

  return (
    <div className="bg-carbon/30 rounded-xl p-4 border border-white/5 space-y-3.5">
      <div className="flex items-center gap-2">
        <MapPin size={15} className="text-magenta" />
        <span className="font-display text-base tracking-widest text-white">
          {t('movie.showtimesIn') || 'Funciones en'} {multiplexName}
        </span>
      </div>

      {loadingScreenings ? (
        <div className="flex items-center justify-center py-6">
          <Loader size={16} className="text-magenta animate-spin mr-2" />
          <p className="text-xs text-text-secondary">Cargando funciones...</p>
        </div>
      ) : !selectedScreening ? (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
            {t('movie.availableShowtimes') || 'Funciones disponibles'}
          </p>
          
          {availableScreenings.length === 0 ? (
            <p className="text-xs text-text-secondary italic py-2">
              No hay funciones disponibles
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                      <span className="font-display text-xs tracking-wider">{dateStr} • {timeStr}</span>
                    </div>
                    <span className="text-[9px] font-semibold uppercase text-magenta/60 group-hover:text-magenta">
                      {screening.format || '2D'} • Sala {screening.roomNumber}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          <div className="bg-carbon/40 border border-magenta/30 rounded-xl px-4 py-3 space-y-2">
            <p className="text-[9px] text-text-secondary font-bold tracking-widest uppercase">
              {t('movie.selectedShowtime') || 'Función seleccionada'}
            </p>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-white font-medium">{formatScreeningDisplay(selectedScreening).dateStr}</p>
                <p className="text-sm font-display tracking-wider text-magenta">{formatScreeningDisplay(selectedScreening).timeStr}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-text-secondary font-bold">Formato / Sala</p>
                <p className="text-xs font-semibold text-white">
                  {selectedScreening.format || '2D'} • {selectedScreening.roomNumber}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedScreening(null)}
            className="w-full text-[9px] font-bold text-text-secondary hover:text-magenta transition-colors uppercase tracking-widest"
          >
            ← {t('movie.chooseAnother') || 'Elegir otra función'}
          </button>
        </div>
      )}

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