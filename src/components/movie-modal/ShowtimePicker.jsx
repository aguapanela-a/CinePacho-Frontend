import { MapPin, Clock4 } from 'lucide-react'
import Button from '../Button'
import { useLanguage } from '../../context/useLanguage'
import { ticketFormats } from '../../data/mockMoviesData'

const formatPriceLabel = (price) => {
  if (price >= 1000) return `$${Math.round(price / 1000)}K`
  return `$${price.toLocaleString('es-CO')}`
}

const formatBackendDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date)
  } catch {
    return dateString
  }
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

  const backendDates = backendScreenings.length > 0
    ? [...new Set(
        backendScreenings
          .map(s => s.screeningDate?.substring(0, 10))
          .filter(Boolean)
      )].sort()
    : []

  const dateOptions = backendDates.length > 0
    ? backendDates.map((date) => ({ value: date, label: formatBackendDate(date) }))
    : []

  const showtimesList = backendDates.length > 0
    ? [...new Set(
        backendScreenings
          .filter((s) => s.status === 'ACTIVE')
          .filter((s) => {
            if (!selectedDate) return true
            return s.screeningDate?.substring(0, 10) === selectedDate
          })
          .map(s => s.screeningDate?.substring(11, 16))
          .filter(Boolean)
      )].sort()
    : []

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
          {dateOptions.length > 0 ? (
            dateOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSelectedDate(value)
                  setSelectedTime('')
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedDate === value
                    ? 'border-magenta bg-magenta/10 text-white'
                    : 'border-border/45 bg-carbon/50 text-text-secondary hover:text-white'
                }`}
              >
                {label}
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-border/40 bg-carbon/60 px-4 py-3 text-xs text-text-secondary">
              {t('movie.noDatesAvailable') || 'No hay días disponibles para esta película en el multiplex seleccionado.'}
            </div>
          )}
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
                setSelectedTime('')
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
          {showtimesList.length > 0 ? (
            showtimesList.map((time) => (
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
            ))
          ) : (
            <div className="rounded-xl border border-border/40 bg-carbon/60 px-4 py-3 text-xs text-text-secondary">
              {t('movie.noTimesAvailable') || 'No hay horarios activos disponibles para la fecha seleccionada.'}
            </div>
          )}
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
