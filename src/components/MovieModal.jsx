import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Play, Clock, Star, MapPin, Clock4, Armchair, Gift, Clapperboard, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './Button'

const showtimeDates = [
  { day: 'Hoy', date: '24 Oct' },
  { day: 'Mañana', date: '25 Oct' },
  { day: 'Jueves', date: '26 Oct' },
  { day: 'Viernes', date: '27 Oct' },
]

const showtimes = ['14:30', '16:45', '19:15', '21:00', '22:45']

const castData = {
  1: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
  2: 'Timothée Chalamet, Zendaya, Austin Butler, Florence Pugh',
  3: 'Amy Poehler, Maya Hawke, Ayo Edebiri, Kensington Tallman',
  4: 'Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen',
  5: 'Bill Skarsgård, Lily-Rose Depp, Nicholas Hoult, Willem Dafoe',
  6: 'Cynthia Erivo, Ariana Grande, Jeff Goldblum, Michelle Yeoh',
  7: 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Morena Baccarin',
  8: 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced',
}

export default function MovieModal({ movie, onClose }) {
  const [selectedDate, setSelectedDate] = useState(showtimeDates[0].date)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const { addToCart } = useApp()

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [movie, handleEscape])

  useEffect(() => {
    if (movie) {
      setSelectedDate(showtimeDates[0].date)
      setSelectedTime(null)
      setSelectedFormat(null)
    }
  }, [movie])

  if (!movie) return null

  const canAddToCart = selectedDate && selectedTime && selectedFormat

  const handleAddToCart = () => {
    if (!canAddToCart) return
    addToCart({
      id: movie.id,
      name: movie.title,
      type: 'ticket',
      showtime: `${selectedDate} - ${selectedTime}`,
      format: selectedFormat,
      price: selectedFormat === 'IMAX' ? '$25.000' : selectedFormat === '3D' ? '$20.000' : '$15.000',
      points: 10,
      image: movie.posterUrl,
    })
    onClose()
  }

  const getPrice = () => {
    if (!selectedFormat) return null
    if (selectedFormat === 'IMAX') return '$25.000'
    if (selectedFormat === '3D') return '$20.000'
    return '$15.000'
  }

  // createPortal renderiza fuera del árbol DOM de <main>, 
  // así el transform de la animación no rompe position:fixed
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ isolation: 'isolate' }}
    >
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* ═══════════════════════════════════════════════
          MODAL CENTRADO — max-h para que quepa en viewport
      ═══════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[1080px] max-h-[90vh] bg-surface rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.9)] border border-border/40 overflow-hidden flex flex-col animate-[scaleIn_0.25s_ease-out_forwards]">

        {/* Botón cerrar — siempre visible */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 bg-carbon/90 rounded-full text-text-secondary hover:text-white hover:bg-magenta transition-all duration-200 shadow-lg cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* CONTENIDO SCROLLABLE */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="flex flex-col lg:flex-row min-h-0">

            {/* ─── POSTER (columna izquierda / banner mobile) ─── */}
            <div className="relative lg:w-[280px] xl:w-[320px] shrink-0 bg-carbon">
              <div className="relative h-48 sm:h-56 lg:h-full lg:min-h-[500px]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Degradado para integración visual */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-surface/80" />

                {/* Botón trailer */}
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-magenta/80 hover:border-magenta transition-all hover:scale-110 duration-200 shadow-xl cursor-pointer">
                  <Play size={22} fill="currentColor" className="ml-0.5" />
                </button>

                {/* Badge puntos */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-carbon/85 backdrop-blur-md border border-gold/40 text-gold px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Gift size={11} />
                  +10 pts
                </div>
              </div>
            </div>

            {/* ─── CONTENIDO (columna derecha) ─── */}
            <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col gap-5 min-w-0">

              {/* TÍTULO + BADGES */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-widest text-white leading-none mb-3 pr-8">
                  {movie.title}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 text-xs font-bold">
                    <Star size={11} fill="currentColor" />
                    {movie.rating}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
                    <Clock size={11} />
                    {movie.duration}
                  </span>
                  <span className="bg-magenta/10 px-2.5 py-1 rounded-full border border-magenta/30 text-xs font-bold text-magenta">
                    {movie.genre}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-light px-2.5 py-1 rounded-full border border-border text-xs font-bold text-text-primary">
                    <Calendar size={11} />
                    {movie.year}
                  </span>
                </div>
              </div>

              {/* SINOPSIS + FICHA — en 2 columnas compactas */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <h3 className="text-xs font-display tracking-widest text-magenta mb-1">SINOPSIS</h3>
                  <p className="text-text-primary/85 text-[13px] leading-relaxed font-body">
                    {movie.synopsis}
                  </p>
                </div>
                <div className="sm:w-52 bg-carbon/50 p-3.5 rounded-xl border border-white/5 space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-magenta tracking-widest uppercase flex items-center gap-1">
                      <Clapperboard size={9} /> Director
                    </p>
                    <p className="text-white text-sm font-medium">{movie.director}</p>
                  </div>
                  <div className="h-px bg-border/20" />
                  <div>
                    <p className="text-[10px] font-bold text-magenta tracking-widest uppercase">Reparto</p>
                    <p className="text-white/75 text-[11px] leading-relaxed">
                      {castData[movie.id] || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* DIVISOR */}
              <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

              {/* ═══ SELECTOR DE FUNCIONES — todo compacto ═══ */}
              <div className="bg-carbon/30 rounded-xl p-4 border border-white/5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-magenta" />
                  <span className="font-display text-base tracking-widest text-white">Funciones en Titán</span>
                </div>

                {/* Fechas */}
                <div>
                  <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">Fecha</p>
                  <div className="flex gap-1.5">
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
                        <span className="text-[9px] font-bold uppercase leading-tight">{d.day}</span>
                        <span className="text-xs font-display tracking-wider">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formato + Horarios en una fila */}
                <div className="flex flex-col sm:flex-row gap-3.5">
                  <div className="shrink-0">
                    <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">Formato</p>
                    <div className="flex gap-1.5">
                      {[
                        { fmt: '2D', price: '$15K' },
                        { fmt: '3D', price: '$20K' },
                        { fmt: 'IMAX', price: '$25K' },
                      ].map(({ fmt, price }) => (
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
                          <span className={`text-[9px] ${selectedFormat === fmt ? 'text-white/60' : 'text-text-secondary/40'}`}>{price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mb-1.5">Horario</p>
                    <div className="flex flex-wrap gap-1.5">
                      {showtimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-all duration-150 cursor-pointer ${
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

              {/* CTA FINAL */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                {canAddToCart && (
                  <div className="flex-1 bg-carbon/40 border border-border/30 rounded-xl px-4 py-2 animate-[fadeIn_0.2s_ease-out]">
                    <p className="text-[9px] text-text-secondary font-bold tracking-widest uppercase">Selección</p>
                    <p className="text-white text-sm font-medium">
                      {selectedDate} • {selectedTime} • {selectedFormat}
                      <span className="text-gold font-bold ml-2">{getPrice()}</span>
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  size="md"
                  className={`w-full sm:w-auto px-8 rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)] ${
                    !canAddToCart ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  disabled={!canAddToCart}
                >
                  <Armchair size={16} />
                  {canAddToCart ? 'Agregar al Carrito' : 'Selecciona función'}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
