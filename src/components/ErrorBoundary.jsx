import { Component } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Se puede enviar a un servicio de monitoreo si se integra más adelante
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-carbon text-text-primary flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl bg-surface/95 border border-border/50 rounded-3xl p-10 shadow-2xl shadow-black/40 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-magenta/10 flex items-center justify-center mb-6">
              <AlertTriangle size={34} className="text-magenta" />
            </div>
            <h1 className="text-4xl font-display text-white mb-4">Oops</h1>
            <p className="text-text-secondary mb-6">
              Ha ocurrido un error inesperado. Recarga la página o vuelve al inicio para continuar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-magenta via-vinotinto to-gold text-white font-bold shadow-lg shadow-magenta/30"
              >
                <RefreshCcw size={18} /> Recargar
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border/50 text-text-secondary hover:text-white hover:bg-surface transition-all"
              >
                <Home size={18} /> Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
