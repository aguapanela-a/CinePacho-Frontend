import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  Star,
  Gift,
  CheckCircle,
} from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'

const benefits = [
  { icon: Star, text: '10 puntos por cada boleta comprada' },
  { icon: Gift, text: '5 puntos por cada snack' },
  { icon: CheckCircle, text: 'Acceso a preventas exclusivas' },
]

export default function Register() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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
    
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    else if (form.nombre.length < 2 || form.nombre.length > 30) newErrors.nombre = 'El nombre debe tener entre 2 y 30 caracteres'
    
    // Email
    if (!form.email.trim()) newErrors.email = 'El correo es requerido'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Ingresa un correo válido'
    
    // Password: mínimo 8 caracteres
    if (!form.password) newErrors.password = 'La contraseña es requerida'
    else if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setServerError('')

    // Payload que espera el backend (RegisterRequestDTO)
    const payload = {
      email: form.email,
      name: form.nombre,
      password: form.password,
      userType: 'BUYER',
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || `Error ${res.status}: No se pudo registrar la cuenta. Es posible que el correo ya esté en uso.`)
      }

      // Respuesta exitosa: { userType, username, message }
      const data = await res.json()
      setSuccessMessage(data.message || 'Por favor, revisa tu correo electrónico para verificar tu cuenta.')
      setIsSuccess(true)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-2xl border border-gold/30 rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(212,146,42,0.2)] animate-[fadeUp_0.5s_ease-out_forwards]">
          <div className="w-24 h-24 bg-gradient-to-br from-magenta to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(200,22,122,0.5)]">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="text-4xl font-display text-white mb-2 tracking-widest uppercase">
            ¡Registro <span className="gradient-brand">Exitoso!</span>
          </h2>
          <p className="text-text-secondary font-medium mb-8">
            {successMessage}
          </p>
          <Link to="/login" className="block">
            <Button variant="primary" className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl animate-[fadeUp_0.6s_ease-out_forwards]">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        {/* Card */}
        <div className="bg-surface/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display tracking-widest text-white uppercase">
              Crear <span className="gradient-brand">Cuenta</span>
            </h1>
            <p className="text-sm font-medium text-text-secondary mt-2">
              Únete al programa de fidelización de Cine Pacho
            </p>
          </div>

          {/* Benefits banner dorado fiel al logo */}
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 mb-8 shadow-inner glow-gold">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-gold" fill="currentColor" />
              <span className="text-sm font-bold tracking-wider text-gold uppercase">
                Beneficios del programa
              </span>
            </div>
            <div className="space-y-3">
              {benefits.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                  <Icon size={16} className="text-gold flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error del servidor */}
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-xl px-4 py-3 mb-6 text-center">
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="NOMBRE COMPLETO"
              name="nombre"
              icon={User}
              placeholder="Juan Pérez"
              value={form.nombre}
              onChange={handleChange}
              error={errors.nombre}
            />

            <Input
              label="CORREO ELECTRÓNICO"
              name="email"
              type="email"
              icon={Mail}
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="CONTRASEÑA"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Min 8 caracteres"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-start gap-3 pt-3">
              <input
                type="checkbox"
                required
                className="w-5 h-5 mt-0.5 rounded bg-carbon border-2 border-border accent-magenta cursor-pointer"
              />
              <span className="text-xs font-medium text-text-secondary leading-snug">
                Acepto los{' '}
                <a href="#" className="text-magenta hover:text-gold transition-colors font-bold tracking-wide">
                  TÉRMINOS Y CONDICIONES
                </a>{' '}
                y la{' '}
                <a href="#" className="text-magenta hover:text-gold transition-colors font-bold tracking-wide">
                  POLÍTICA DE PRIVACIDAD
                </a>
              </span>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'CREAR CUENTA'}
            </Button>
          </form>

          <p className="text-center text-sm font-bold text-text-secondary mt-8">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-magenta hover:text-white transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
