import React from 'react'
import { Star, Clock, Play, Ticket, Gift } from 'lucide-react'

export default function MovieCard({ movie, onClick }) {
  const { title, genre, rating, duration, year, posterUrl } = movie

  return (
    <div 
      onClick={onClick}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border/50 hover:border-magenta/50 transition-all duration-500 hover:shadow-2xl hover:shadow-magenta/20 cursor-pointer animate-[fadeUp_0.8s_ease-out_forwards]"
    >
      {/* Contenedor del Póster: Relación de aspecto estándar para mantener consistencia en la grilla */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-50"
        />

        {/* Gradiente animado on-hover: Mejora la legibilidad del texto flotante en contraste con la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Efecto decorativo de Resplandor: Coherencia con estética Dark/Neón */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(200, 22, 122, 0.2), inset 0 0 60px rgba(94, 9, 61, 0.2)'
          }}
        />

        {/* Agrupación de Distintivos: Clasificación de metadatos en esquina superior derecha */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
          {/* Distintivo de Calificación (Rating IMDb/TMDb) */}
          <div className="flex items-center gap-1 bg-carbon/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/50">
            <Star size={12} className="text-gold" fill="currentColor" />
            <span className="text-xs font-bold text-white">{rating}</span>
          </div>

          {/* Badge de Fidelización (Nuevo Requisito): Indica la ganancia de puntos al comprar tickets de esta película */}
          <div className="flex items-center gap-1 bg-gold/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-gold/40 glow-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
            <Gift size={12} className="text-gold" />
            <span className="text-xs font-bold text-gold">+10 pts</span>
          </div>
        </div>

        {/* Contenido Interactivo (Hover): Desliza hacia arriba para revelar información secundaria y Call to Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          {/* Metadatos secundarios: Año de lanzamiento y duración total */}
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium mb-3">
            {year && <span>{year}</span>}
            {year && duration && <span>•</span>}
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{duration}</span>
            </div>
          </div>

          {/* Píldora de Categoría / Género cinematográfico principal */}
          <div className="mb-3">
            <span className="inline-block bg-magenta/10 text-magenta text-xs font-bold px-2.5 py-1 rounded-full border border-magenta/30 tracking-wide uppercase">
              {genre}
            </span>
          </div>

          {/* Grupo de Acciones: Compra directa o Vista Previa (Tráiler) */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-magenta via-vinotinto to-gold text-white text-xs font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-magenta/30 transition-all duration-300 active:scale-95 cursor-pointer">
              <Ticket size={14} />
              Comprar
            </button>
            <button className="flex items-center justify-center w-10 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 active:scale-95 cursor-pointer">
              <Play size={14} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadatos Base: Título truncado y Género, siempre visibles debajo del póster */}
      <div className="p-4 bg-surface">
        <h3 className="font-display tracking-wide text-white text-lg sm:text-xl truncate group-hover:text-magenta transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs text-text-secondary mt-0.5 truncate font-medium">
          {genre}
        </p>
      </div>
    </div>
  )
}
