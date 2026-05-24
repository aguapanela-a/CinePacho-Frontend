import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useApp } from '../context/useApp'
import { useLanguage } from '../context/useLanguage'

// Local: /api/auth/login (proxy de Vite lo redirige al backend)
// Producción: https://backend.railway.app/api/auth/login
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Login Unificado: Formulario único de inicio de sesión para todos los roles.
 *
 * Diseño limpio sin tabs visibles — el sistema detecta automáticamente el tipo
 * de usuario (BUYER, EMPLOYEE, ADMIN) por las credenciales y redirige a la
 * vista correspondiente. Los clientes solo ven un formulario estándar de cine,
 * sin saber que empleados y admins también inician sesión aquí.
 *
 * Flujo:
 *   1. Usuario ingresa email + contraseña
 *   2. Backend valida y responde con { token, userType, name }
 *   3. Frontend almacena sesión y redirige según userType:
 *      - BUYER    → / (cartelera)
 *      - EMPLOYEE → /cajero (punto de venta)
 *      - ADMIN    → /admin/dashboard (panel administrativo)
 */
export default function Login() {
  const navigate = useNavigate()
  const { loginUser } = useApp()
  const { t } = useLanguage()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
    if (serverError) setServerError('')
  }

  const validate = () => {
    const newErrors = {}

    if (!form.email.trim()) newErrors.email = t('auth.emailRequired')
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = t('auth.emailInvalid')

    if (!form.password) {
      newErrors.password = t('auth.passwordRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Mapa de redirección según el tipo de usuario.
   * El backend devuelve el userType en la respuesta de login
   * y el frontend lo usa para navegar a la vista correcta.
   */
  const getRedirectPath = (userType) => {
    const routes = {
      ADMIN: '/admin/dashboard',
      MANAGER: '/manager/dashboard',
      EMPLOYEE: '/cajero',
      BUYER: '/',
    }
    return routes[userType] || '/'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setServerError('')

    // Payload que espera el backend (LoginRequestDTO): { email, password }
    const payload = {
      email: form.email,
      password: form.password,
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || t('common.error'))
      }

      // Respuesta exitosa del backend (AuthResponseDTO): { token, userType, name }
      const data = await res.json()
      loginUser(data)

      // Redirección inteligente según el rol detectado por el backend
      navigate(getRedirectPath(data.userType))
    } catch (err) {
      setServerError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      {/* Background orbs are handled in App.jsx now, global layout */}

      <div className="w-full max-w-md animate-[fadeUp_0.6s_ease-out_forwards]">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('auth.backToHome')}
        </Link>

        {/* Dynamic Card */}
        <div className="bg-surface/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header con ícono del cine */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display text-white mb-2 tracking-widest uppercase">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-text-secondary">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-xl px-4 py-3 mb-6 text-center">
              {serverError}
            </div>
          )}

          {/* Formulario unificado — email + contraseña para todos los roles */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              icon={Mail}
              placeholder="usuario@correo.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between text-sm font-bold">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-carbon border-border accent-magenta"
                />
                {t('auth.rememberMe')}
              </label>
              <button type="button" className="text-magenta hover:text-gold transition-colors">
                {t('auth.forgotPassword')}
              </button>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? t('auth.verifying') : t('auth.loginBtn')}
            </Button>
          </form>

          {/* Enlace de registro — visible para todos (solo clientes pueden registrarse) */}
          <p className="text-center text-sm font-bold text-text-secondary mt-8">
            {t('auth.noAccount')}{' '}
            <Link to="/registro" className="text-magenta hover:text-white transition-colors">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
