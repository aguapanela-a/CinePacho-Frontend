import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  CreditCard,
  Phone,
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
    cedula: '',
    telefono: '',
    correo: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    
    // Cédula: 7 a 12 dígitos
    if (!form.cedula.trim()) newErrors.cedula = 'La cédula es requerida'
    else if (!/^\d{7,12}$/.test(form.cedula)) newErrors.cedula = 'Debe tener entre 7 y 12 dígitos numéricos'
    
    // Teléfono: exactamente 10 dígitos
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    else if (!/^\d{10}$/.test(form.telefono)) newErrors.telefono = 'Debe tener exactamente 10 dígitos numéricos'
    
    // Correo
    if (!form.correo.trim()) newErrors.correo = 'El correo es requerido'
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) newErrors.correo = 'Ingresa un correo válido'
    
    // Password: minimo 8 caracteres
    if (!form.password) newErrors.password = 'La contraseña es requerida'
    else if (form.password.length < 8) newErrors.password = 'Mínimo 8 caracteres'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitting(true)
      // Simulate API registration call (animating to success)
      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
      }, 1500)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface/80 backdrop-blur-2xl border border-gold/30 rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(212,146,42,0.2)] animate-[fadeUp_0.5s_ease-out_forwards]">
          <div className="w-24 h-24 bg-gradient-to-br from-magenta to-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(200,22,122,0.5)]">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-4xl font-display text-white mb-2 tracking-widest uppercase">
            ¡Registro <span className="gradient-brand">Exitoso!</span>
          </h2>
          <p className="text-text-secondary font-medium mb-8">
            Bienvenido al programa de Fidelización. Ya puedes empezar a disfrutar de tus beneficios y sumar puntos.
          </p>
          <Link to="/login" className="block">
            <Button variant="primary" className="w-full">
              Continuar al Login
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="CÉDULA"
                name="cedula"
                icon={CreditCard}
                placeholder="1234567890"
                value={form.cedula}
                onChange={handleChange}
                error={errors.cedula}
              />
              <Input
                label="TELÉFONO"
                name="telefono"
                icon={Phone}
                placeholder="3001234567"
                value={form.telefono}
                onChange={handleChange}
                error={errors.telefono}
              />
            </div>

            <Input
              label="CORREO ELECTRÓNICO"
              name="correo"
              type="email"
              icon={Mail}
              placeholder="tu@correo.com"
              value={form.correo}
              onChange={handleChange}
              error={errors.correo}
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
