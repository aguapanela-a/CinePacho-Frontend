import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/useLanguage'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-[fadeUp_0.5s_ease-out_forwards]">
        
        <div className="w-24 h-24 bg-gradient-to-br from-magenta to-vinotinto rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(200,22,122,0.5)]">
          <AlertTriangle size={48} className="text-white" />
        </div>

        <h1 className="text-8xl font-display text-white mb-2 tracking-widest uppercase">
          4<span className="gradient-brand">0</span>4
        </h1>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {t('notfound.title')}
        </h2>
        
        <p className="text-text-secondary font-medium mb-8">
          {t('notfound.subtitle')}
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta to-vinotinto text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-magenta/20"
        >
          <Home size={18} /> {t('auth.backToHome')}
        </Link>
      </div>
    </div>
  )
}

