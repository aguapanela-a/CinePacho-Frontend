import { MapPin, Clock4 } from 'lucide-react'
import Button from '../Button'
import { useLanguage } from '../../context/useLanguage'
import { showtimeDates, showtimes as mockShowtimes, ticketFormats } from '../../data/mockMoviesData'

const formatPriceLabel = (price) => {
  if (price >= 1000) return `$${Math.round(price / 1000)}K`
  return `$${price.toLocaleString('es-CO')}`
}

export default function ShowtimePicker({
  multiplexName = 'Titán',
  selectedDate,
  setSelectedDate,
  selectedFormat,
  setSelectedFormat,
  selectedTime,
  setSelectedTime,
  selectedRoom,
  canProceedToSeats,
  handleProceedToSeats,
  backendScreenings = [],
}) {
  const { t } = useLanguage()

  // Extraer horarios reales del backend si hay screenings, sino usar mocks
  const showtimesList = backendScreenings
  .filter(s => {
    const sDate = s.screeningDate?.substring(0, 10);
    const dateKey = typeof selectedDate === 'object' ? selectedDate.dayKey : selectedDate;
    return s.status === 'ACTIVE' && sDate === dateKey && s.format === selectedFormat;
  })
  .map(s => s.screeningDate?.substring(11, 16))
  .sort();

// Y añade este useEffect para limpiar la selección si ya no existe el horario
useEffect(() => {
  if (selectedTime && !showtimesList.includes(selectedTime)) {
    setSelectedTime('');
  }
}, [selectedDate, selectedFormat, showtimesList]);

  return (
    <div className="bg-carbon/30 rounded-xl p-4 border border-white/5 space-y-3.5">
      <div className="flex items-center gap-2">
        <MapPin size={15} className="text-magenta" />
        <span className="font-display text-base tracking-widest text-white">
          {t('movie.showtimesIn') || 'Funciones en'} {multiplexName}
        </span>
      </div>

      {/* 1. Selección de Fecha */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
          {t('movie.dateLabel') || 'Selecciona el Día'}
        </p>
        <div className="flex flex-wrap gap-2">
          {showtimeDates.map(({ dayKey, date }) => (
            <button
              key={dayKey}
              type="button"
              onClick={() => {
                setSelectedDate(dayKey)
                setSelectedTime('') // Limpia el horario al cambiar de día
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedDate === dayKey
                  ? 'border-magenta bg-magenta/10 text-white'
                  : 'border-border/45 bg-carbon/50 text-text-secondary hover:text-white'
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Selección de Formato */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
          {t('movie.formatLabel') || 'Formato'}
        </p>
        <div className="flex flex-wrap gap-2">
          {ticketFormats.map(({ fmt, generalPrice }) => (
            <button
              key={fmt}
              type="button"
              onClick={() => {
                setSelectedFormat(fmt)
                setSelectedTime('') // Limpia el horario al cambiar de formato
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedFormat === fmt
                  ? 'border-magenta bg-magenta/10 text-white'
                  : 'border-border/45 bg-carbon/50 text-text-secondary hover:text-white'
              }`}
            >
              {fmt} · {formatPriceLabel(generalPrice)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Selección de Horario */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase">
          {t('movie.timeLabel') || 'Horarios Disponibles'}
        </p>
        <div className="flex flex-wrap gap-2">
          {showtimesList.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedTime === time
                  ? 'bg-gradient-to-r from-magenta to-vinotinto border-transparent text-white shadow-md shadow-magenta/10'
                  : 'border-border/40 bg-carbon/40 text-text-secondary hover:text-white hover:bg-carbon'
              }`}
            >
              <Clock4 size={12} />
              <span className="font-display text-xs tracking-wider">{time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner Informativo y Botón de Continuar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {canProceedToSeats && (
          <div className="flex-1 bg-carbon/40 border border-border/30 rounded-xl px-4 py-2 animate-[fadeIn_0.2s_ease-out]">
            <p className="text-[9px] text-text-secondary font-bold tracking-widest uppercase">
              {t('movie.selectionLabel') || 'Tu selección'}
            </p>
            <p className="text-white text-xs font-medium leading-relaxed">
              {typeof selectedDate === 'object' ? selectedDate.date : selectedDate} • {selectedTime} • {selectedFormat} •{' '}
              <span className="text-magenta font-semibold">{selectedRoom}</span>
            </p>
          </div>
        )}
        <Button
          onClick={handleProceedToSeats}
          variant="primary"
          size="md"
          disabled={!canProceedToSeats}
          className={`w-full sm:w-auto px-8 rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)] ${
            !canProceedToSeats ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          {t('movie.proceedToSeats') || 'Elegir Asientos'}
        </Button>
      </div>
    </div>
  )
}