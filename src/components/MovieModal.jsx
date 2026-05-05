import React, { useState, useEffect } from 'react'
import { X, Play, Clock, Star, MapPin, Clock4, Armchair } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from './Button'

const showtimeDates = [
  { day: 'Hoy', date: '24 Oct' },
  { day: 'Mañana', date: '25 Oct' },
  { day: 'Jueves', date: '26 Oct' },
  { day: 'Viernes', date: '27 Oct' },
]

const showtimes = ['14:30', '16:45', '19:15', '21:00', '22:45']

export default function MovieModal({ movie, onClose }) {
  const [selectedDate, setSelectedDate] = useState(showtimeDates[0].date)
  const [selectedTime, setSelectedTime] = useState(showtimes[2])
  const [selectedFormat, setSelectedFormat] = useState('2D')
  const { addToCart } = useApp()

  // Bloqueo de scroll nativo del body cuando el modal está abierto para evitar dobles barras de desplazamiento
  useEffect(() => {
    if (movie) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [movie])

  if (!movie) return null

  const handleAddToCart = () => {
    addToCart({
      id: movie.id,
      name: movie.title,
      type: 'ticket',
      showtime: `${selectedDate} - ${selectedTime}`,
      format: selectedFormat,
      price: '$15.000',
      points: 10,
      image: movie.posterUrl,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-carbon/90 backdrop-blur-md overflow-y-auto custom-scrollbar animate-[fadeIn_0.3s_ease-out]">
      <div 
        className="min-h-screen py-0 sm:py-10 px-0 sm:px-6 lg:px-10 flex flex-col items-center justify-start"
        onClick={(e) => {
          // Detecta clic en el fondo difuminado para cerrar el modal suavemente
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {/* Contenedor Principal: Expandido para cumplir con Ley de Fitts y evitar recortes visuales */}
        <div className="relative w-full max-w-[1200px] bg-surface rounded-none sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden shadow-magenta/5 border border-border/50 animate-[fadeUp_0.4s_ease-out_forwards]">
          
          {/* Acción rápida de salida posicionada en una zona predecible (Ley de Jakob) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[70] p-3 sm:p-2 bg-carbon/80 backdrop-blur-md rounded-full text-white hover:bg-magenta hover:text-white transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <X size={24} />
          </button>

          {/* Zona Superior: Encabezado interactivo con Placeholder para Trailer y degradado en modo blend */}
          <div className="relative w-full h-72 sm:h-96 md:h-[500px] bg-carbon flex items-center justify-center overflow-hidden">
            <img 
              src={movie.backdropUrl || movie.posterUrl} 
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            {/* Superposición sutil de color para integración perfecta del fondo con el póster */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-carbon/40" />
            
            <button className="relative z-10 w-24 h-24 rounded-full bg-magenta/20 backdrop-blur-md border border-magenta flex items-center justify-center text-white hover:bg-magenta transition-all hover:scale-110 duration-300 shadow-[0_0_40px_rgba(200,22,122,0.8)]">
              <Play size={40} fill="currentColor" className="ml-2" />
            </button>
          </div>

          {/* Estructura del contenido dividida en bloques para reducir carga cognitiva (Ley de Miller) */}
          <div className="relative z-10 px-6 sm:px-12 lg:px-16 pb-16 -mt-24 sm:-mt-32">
            
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              
              {/* Columna Izquierda: Identidad visual directa y atributos de ficha técnica */}
              <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-start shrink-0">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title}
                  className="w-48 sm:w-64 lg:w-full rounded-2xl shadow-2xl border border-white/10 hidden sm:block"
                />
                
                <div className="mt-8 space-y-5 w-full bg-carbon/50 p-6 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-magenta text-xs font-bold tracking-widest mb-1.5 uppercase">Director</p>
                    <p className="text-white font-medium text-lg">{movie.director || 'Christopher Nolan'}</p>
                  </div>
                  <div>
                    <p className="text-magenta text-xs font-bold tracking-widest mb-1.5 uppercase">Reparto Principal</p>
                    <p className="text-white/90 font-medium text-sm leading-relaxed">Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.</p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Datos informacionales prioritarios y panel de conversión (Funciones/Boletas) */}
              <div className="w-full lg:w-2/3 pt-6 lg:pt-32 space-y-10">
                
                {/* Metadatos Clasificatorios y Badges de Resumen */}
                <div>
                  <h2 className="text-5xl sm:text-6xl md:text-7xl font-display uppercase tracking-widest text-white drop-shadow-2xl mb-6 leading-none">
                    {movie.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold tracking-widest text-text-primary">
                    <div className="flex items-center gap-1.5 text-gold bg-gold/10 px-4 py-1.5 rounded-full border border-gold/30">
                      <Star size={16} fill="currentColor" />
                      <span>{movie.rating} / 10</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-light px-4 py-1.5 rounded-full border border-border">
                      <Clock size={16} />
                      <span>{movie.duration}</span>
                    </div>
                    <div className="bg-surface-light px-4 py-1.5 rounded-full border border-border text-magenta">
                      {movie.genre}
                    </div>
                    <div className="bg-surface-light px-4 py-1.5 rounded-full border border-border">
                      +12 AÑOS
                    </div>
                  </div>
                </div>

                {/* Resumen argumental destacado con jerarquía visual enfocada */}
                <div>
                  <h3 className="text-xl font-display tracking-widest text-magenta mb-3">SINOPSIS</h3>
                  <p className="text-text-primary/90 text-base sm:text-lg leading-relaxed font-body">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Divisor Visual Estético */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-10" />

                {/* Selector de Sesiones Interactivo: Implementa proximidad y contraste para guiar la selección */}
                <div className="bg-carbon/40 rounded-3xl p-6 sm:p-8 border border-white/5">
                  <h3 className="text-2xl font-display tracking-widest text-white mb-6 flex items-center gap-3">
                    <MapPin size={24} className="text-magenta" />
                    Funciones en Titán
                  </h3>
                  
                  {/* Selector Horizontal de Fechas */}
                  <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {showtimeDates.map((d) => (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDate(d.date)}
                        className={`flex flex-col items-center justify-center min-w-[90px] py-3 rounded-2xl border-2 transition-all duration-300 ${
                          selectedDate === d.date 
                          ? 'border-magenta bg-magenta/10 text-magenta shadow-[0_0_20px_rgba(200,22,122,0.2)]' 
                          : 'border-border/50 bg-carbon text-text-secondary hover:border-text-secondary hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider mb-1">{d.day}</span>
                        <span className="text-xl font-display tracking-widest">{d.date}</span>
                      </button>
                    ))}
                  </div>

                  {/* Pills Selectores de Formato (Disponibilidad en 2D/3D/IMAX) */}
                  <div className="flex gap-3 mt-6">
                    {['2D', '3D', 'IMAX'].map(fmt => (
                      <button 
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-6 py-2 rounded-full text-sm font-bold tracking-widest transition-all duration-300 ${
                          selectedFormat === fmt 
                          ? 'bg-gradient-to-r from-magenta to-vinotinto text-white shadow-lg shadow-magenta/20' 
                          : 'bg-surface-light text-text-secondary border border-border hover:text-white hover:border-magenta/50'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>

                  {/* Grilla interactiva de Horarios disponibles - Agrupamiento visual claro */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    {showtimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 transition-all duration-300 ${
                          selectedTime === time
                          ? 'border-gold bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,146,42,0.3)] scale-105'
                          : 'border-border/50 bg-carbon text-text-secondary hover:border-gold/50 hover:text-white'
                        }`}
                      >
                        <Clock4 size={18} />
                        <span className="text-2xl font-display tracking-widest">{time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Componente Final: CTA Primario (Tendencia a la meta) que procesa la compra agregando al carrito */}
                <div className="pt-6">
                  <Button 
                    onClick={handleAddToCart}
                    variant="primary" 
                    size="lg" 
                    className="w-full sm:w-auto px-12 py-5 text-lg rounded-2xl shadow-[0_0_30px_rgba(200,22,122,0.4)] hover:shadow-[0_0_50px_rgba(200,22,122,0.6)]"
                  >
                    <Armchair size={22} className="mr-2" />
                    Seleccionar Asientos
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
