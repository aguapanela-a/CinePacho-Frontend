import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft, Film } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'

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

    if (!form.email.trim()) newErrors.email = 'El correo es requerido'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'El formato de correo es inválido'

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida'
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
        throw new Error(errorData?.message || `Error ${res.status}: Credenciales inválidas`)
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
          Volver al inicio
        </Link>

        {/* Dynamic Card */}
        <div className="bg-surface/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header con ícono del cine */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-magenta to-vinotinto rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_rgba(200,22,122,0.4)]">
              <Film size={30} className="text-white" />
            </div>

            <h1 className="text-4xl font-display tracking-widest text-white">
              INICIAR <span className="gradient-brand">SESIÓN</span>
            </h1>
            <p className="text-sm font-medium text-text-secondary mt-2">
              Ingresa a tu cuenta para continuar
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
              label="CORREO ELECTRÓNICO"
              name="email"
              type="email"
              icon={Mail}
              placeholder="usuario@correo.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="CONTRASEÑA"
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
                Recordarme
              </label>
              <button type="button" className="text-magenta hover:text-gold transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'INGRESAR'}
            </Button>
          </form>

          {/* Enlace de registro — visible para todos (solo clientes pueden registrarse) */}
          <p className="text-center text-sm font-bold text-text-secondary mt-8">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-magenta hover:text-white transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
