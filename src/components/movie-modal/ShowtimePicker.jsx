import { MapPin, Clock4, Armchair } from 'lucide-react'
import Button from '../Button'
import { useLanguage } from '../../context/LanguageContext'
import { showtimeDates, showtimes, ticketFormats } from '../../data/mockMoviesData'

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
  canProceedToSeats,
  selectedTime,
  setSelectedTime,
  selectedRoom, // NEW PROP
  setSelectedRoom, // NEW PROP
  canProceedToSeats,
  handleProceedToSeats,
  getPrice,
}) {
  const { t } = useLanguage()

  return (
    <>
      <div className="bg-carbon/30 rounded-xl p-4 border border-white/5 space-y-3.5">
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-magenta" />
          <span className="font-display text-base tracking-widest text-white">
            {t('movie.showtimesIn')} {multiplexName}
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">{t('movie.dateLabel')}</p>
          <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {showtimeDates.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center min-w-[65px] py-1.5 px-2.5 rounded-lg border text-center transition-all duration-150 cursor-pointer ${
                  selectedDate === d.date
                    ? 'border-magenta bg-magenta/10 text-magenta'
                    : 'border-border/40 bg-carbon text-text-secondary hover:border-text-secondary hover:text-white'
                }`}
              >
                <span className="text-[9px] font-bold uppercase leading-tight">{t(d.dayKey)}</span>
                <span className="text-xs font-display tracking-wider">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* NEW: Room Selector */}
        <div>
          <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">
            {t('movie.roomLabel', 'Sala')} {/* Default for movie.roomLabel if not in translations */}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 15 }, (_, i) => `Sala ${i + 1}`).map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`min-w-[60px] justify-center px-3 py-1.5 rounded-lg border text-xs transition-all duration-150 cursor-pointer ${
                  selectedRoom === room
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                    : 'border-border/40 bg-carbon text-text-secondary hover:border-cyan-400/40 hover:text-white'
                }`}
              >
                <span className="font-display text-sm tracking-wider">{room}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5">
          <div className="shrink-0">
            <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">{t('movie.formatLabel')}</p>
            <div className="flex gap-1.5">
              {ticketFormats.map(({ fmt, price }) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`flex flex-col items-center px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-gradient-to-r from-magenta to-vinotinto text-white shadow-md shadow-magenta/20'
                      : 'bg-surface-light text-text-secondary border border-border hover:text-white hover:border-magenta/40'
                  }`}
                >
                  <span>{fmt}</span>
                  <span className={`text-[9px] ${selectedFormat === fmt ? 'text-white/60' : 'text-text-secondary/40'}`}>
                    {formatPriceLabel(price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">{t('movie.timeLabel')}</p>
            <div className="flex flex-wrap gap-1.5">
              {showtimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`flex items-center gap-1 min-w-[60px] justify-center px-3 py-1.5 rounded-lg border text-xs transition-all duration-150 cursor-pointer ${
                    selectedTime === time
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-border/40 bg-carbon text-text-secondary hover:border-gold/40 hover:text-white'
                  }`}
                >
                  <Clock4 size={11} />
                  <span className="font-display text-sm tracking-wider">{time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        {canProceedToSeats && (
          <div className="flex-1 bg-carbon/40 border border-border/30 rounded-xl px-4 py-2 animate-[fadeIn_0.2s_ease-out]">
            <p className="text-[9px] text-text-secondary font-bold tracking-widest uppercase">{t('movie.selectionLabel')}</p>
            <p className="text-white text-sm font-medium">
              {selectedDate} • {selectedTime} • {selectedFormat} • {selectedRoom} {/* ADD selectedRoom */}
              <span className="text-gold font-bold ml-2">${getPrice().toLocaleString('es-CO')}</span>
            </p>
          </div>
        )}
        <Button
          onClick={handleProceedToSeats}
          variant="primary"
          size="md"
          className={`w-full sm:w-auto px-8 rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)] ${
            !canProceedToSeats ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          disabled={!canProceedToSeats}
        >
          <Armchair size={16} />
          {canProceedToSeats ? t('movie.selectSeatsBtn') : t('movie.selectShowtimeBtn')}
        </Button>
      </div>
    </>
  )
}
