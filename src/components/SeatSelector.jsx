import React, { useState, useMemo } from 'react'
import { Monitor, Armchair, ShieldCheck, ArrowLeft, Plus, Star } from 'lucide-react'
import Button from './Button'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const COLS = 10

export default function SeatSelector({ 
  onBack, 
  onConfirm, 
  formatPrice, 
  maxSeats = 6 
}) {
  const [selectedSeats, setSelectedSeats] = useState([])

  // Generar estado mock de asientos ocupados aleatoriamente (estable por renderizado inicial)
  const occupiedSeats = useMemo(() => {
    const occupied = new Set()
    for (let i = 0; i < 25; i++) {
      const r = ROWS[Math.floor(Math.random() * ROWS.length)]
      const c = Math.floor(Math.random() * COLS) + 1
      occupied.add(`${r}${c}`)
    }
    return occupied
  }, [])

  const toggleSeat = (seatId) => {
    if (occupiedSeats.has(seatId)) return

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId))
    } else {
      if (selectedSeats.length >= maxSeats) {
        alert(`Puedes seleccionar máximo ${maxSeats} sillas por compra.`)
        return
      }
      setSelectedSeats(prev => [...prev, seatId])
    }
  }

  const isPreferential = (seatId) => {
    // Filas E y F son Preferenciales (20 sillas), A-D son Generales (40 sillas) = 60 sillas total
    return seatId.startsWith('E') || seatId.startsWith('F')
  }

  const getSeatClass = (seatId) => {
    const pref = isPreferential(seatId)
    if (occupiedSeats.has(seatId)) return 'bg-red-500/10 border-red-500/20 text-transparent cursor-not-allowed opacity-50'
    if (selectedSeats.includes(seatId)) return 'bg-gradient-to-t from-magenta to-vinotinto border-magenta shadow-[0_0_15px_rgba(200,22,122,0.5)] text-white'
    
    // Estilos distintos para Preferencial (borde dorado) vs General (borde blanco)
    if (pref) {
      return 'bg-gold/5 border-gold/40 text-gold/60 hover:bg-gold/20 hover:border-gold hover:text-gold transition-all cursor-pointer'
    }
    return 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white transition-all cursor-pointer'
  }

  const numericPrice = parseInt(formatPrice.replace(/[^0-9]/g, ''), 10) || 11000
  // Sillas preferenciales tienen un recargo de $4.000
  const total = selectedSeats.reduce((acc, seatId) => {
    return acc + numericPrice + (isPreferential(seatId) ? 4000 : 0)
  }, 0)

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-bold tracking-wide"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="text-right">
          <h3 className="font-display text-white text-xl tracking-widest uppercase">Selecciona tus sillas</h3>
          <p className="text-xs text-text-secondary">Máximo {maxSeats} sillas por transacción</p>
        </div>
      </div>

      {/* Screen */}
      <div className="mb-10 text-center relative px-8">
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-magenta to-transparent opacity-50 rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-magenta/10 blur-xl rounded-[100%]" />
        <p className="text-[10px] font-bold text-magenta tracking-widest uppercase mt-3 flex items-center justify-center gap-1.5">
          <Monitor size={12} /> Pantalla
        </p>
      </div>

      {/* Seat Grid */}
      <div className="flex-1 overflow-x-auto pb-6">
        <div className="min-w-fit mx-auto flex flex-col items-center gap-3">
          {ROWS.map(row => (
            <div key={row} className="flex items-center gap-4">
              <span className="w-4 text-xs font-bold text-text-secondary text-right">{row}</span>
              <div className="flex gap-2">
                {Array.from({ length: COLS }).map((_, i) => {
                  const col = i + 1
                  const seatId = `${row}${col}`
                  // Crear pasillo en el medio
                  const isAisle = col === Math.floor(COLS / 2)
                  
                  return (
                    <React.Fragment key={seatId}>
                      <button
                        onClick={() => toggleSeat(seatId)}
                        disabled={occupiedSeats.has(seatId)}
                        className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-t-xl rounded-b-md border flex items-center justify-center text-xs font-bold transition-all overflow-hidden ${getSeatClass(seatId)}`}
                        title={`Silla ${seatId} ${isPreferential(seatId) ? '(Preferencial)' : '(General)'}`}
                      >
                        {isPreferential(seatId) && !selectedSeats.includes(seatId) && !occupiedSeats.has(seatId) && (
                          <Star size={8} className="absolute top-1 text-gold/40" />
                        )}
                        {selectedSeats.includes(seatId) ? col : ''}
                      </button>
                      {isAisle && <div className="w-4 sm:w-8" />}
                    </React.Fragment>
                  )
                })}
              </div>
              <span className="w-4 text-xs font-bold text-text-secondary">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-4 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-white/5 border border-white/20" /> General
        </div>
        <div className="flex items-center gap-2 text-xs text-gold font-bold">
          <div className="relative w-5 h-5 rounded-t-lg bg-gold/5 border border-gold/40 flex items-center justify-center">
            <Star size={8} className="absolute top-1 text-gold/60" />
          </div> Preferencial
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-gradient-to-t from-magenta to-vinotinto border border-magenta" /> Seleccionada
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary font-bold">
          <div className="w-5 h-5 rounded-t-lg bg-red-500/10 border border-red-500/20 opacity-50" /> Ocupada
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-2 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">
            {selectedSeats.length} Silla{selectedSeats.length !== 1 ? 's' : ''} seleccionada{selectedSeats.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguna'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {selectedSeats.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Total a pagar</p>
              <p className="text-gold font-display text-xl tracking-wider">
                ${total.toLocaleString('es-CO')}
              </p>
            </div>
          )}
          <Button
            onClick={() => onConfirm(selectedSeats, total)}
            variant="primary"
            size="md"
            disabled={selectedSeats.length === 0}
            className={`w-full sm:w-auto px-8 rounded-xl shadow-[0_0_20px_rgba(200,22,122,0.3)] hover:shadow-[0_0_30px_rgba(200,22,122,0.5)] ${
              selectedSeats.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Armchair size={16} />
            Confirmar Sillas
          </Button>
        </div>
      </div>
    </div>
  )
}
