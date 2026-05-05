import React from 'react'
import { Film, Globe, MessageCircle, Share2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface/50 border-t border-border/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-purple flex items-center justify-center">
                <Film size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Cine Pacho</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              La mejor experiencia cinematográfica de Colombia. Disfruta de las
              últimas películas con la mejor tecnología.
            </p>
          </div>

          {/* Nuestras Sedes */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Nuestras Sedes</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Titán Plaza</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Unicentro</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Plaza Central</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Gran Estación</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Embajador</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Las Américas</li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Información</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Programa de Fidelización</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Términos y Condiciones</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Política de Privacidad</li>
              <li className="hover:text-neon-pink transition-colors cursor-pointer">Trabaja con Nosotros</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Síguenos</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-neon-pink hover:bg-neon-pink/10 transition-all duration-300">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-neon-pink hover:bg-neon-pink/10 transition-all duration-300">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-neon-pink hover:bg-neon-pink/10 transition-all duration-300">
                <Share2 size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-6 text-center text-xs text-text-secondary">
          © 2026 Cine Pacho. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
