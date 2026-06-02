import { Film, Globe, MessageCircle, Share2 } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'


export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-surface/50 border-t border-border/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-magenta to-vinotinto flex items-center justify-center">
                <Film size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Cine Pacho</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="w-full max-w-[322px] h-[126px] flex items-center justify-center overflow-hidden">
              <img
                src="/themoviebd.svg"
                alt="The Movie DB API"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Nuestras Sedes */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">{t('footer.locations')}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="hover:text-magenta transition-colors cursor-pointer">Titán Plaza</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">Unicentro</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">Plaza Central</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">Gran Estación</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">Embajador</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">Las Américas</li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">{t('footer.info')}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="hover:text-magenta transition-colors cursor-pointer">{t('footer.fidelity')}</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">{t('footer.terms')}</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">{t('footer.privacy')}</li>
              <li className="hover:text-magenta transition-colors cursor-pointer">{t('footer.workWithUs')}</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">{t('footer.followUs')}</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-magenta hover:bg-magenta/10 transition-all duration-300">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-magenta hover:bg-magenta/10 transition-all duration-300">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-text-secondary hover:text-magenta hover:bg-magenta/10 transition-all duration-300">
                <Share2 size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-8 pt-6 text-center text-xs text-text-secondary">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}

