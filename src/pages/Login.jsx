import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, BadgeCheck, User, KeyRound, ArrowLeft } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'

const tabs = [
  { id: 'cliente', label: 'Cliente', icon: User },
  { id: 'empleado', label: 'Cajero', icon: BadgeCheck },
  { id: 'admin', label: 'Admin', icon: KeyRound },
]

export default function Login() {
  const [activeTab, setActiveTab] = useState('cliente')
  const [form, setForm] = useState({ email: '', password: '', codigo: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (activeTab === 'empleado') {
      if (!form.codigo.trim()) newErrors.codigo = 'El código de empleado es requerido'
      else if (form.codigo.length < 5) newErrors.codigo = 'Debe tener al menos 5 caracteres'
    } else {
      if (!form.email.trim()) newErrors.email = 'El correo es requerido'
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'El formato de correo es inválido'
    }

    if (!form.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitting(true)
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)
        alert(`Inicio de sesión exitoso como ${activeTab}`)
      }, 1500)
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display tracking-widest text-white">
              INICIAR <span className="gradient-brand">SESIÓN</span>
            </h1>
            <p className="text-sm font-medium text-text-secondary mt-2">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-carbon rounded-2xl p-1 mb-8 border border-border/30">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id)
                  setErrors({})
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-magenta to-vinotinto text-white shadow-lg shadow-magenta/20'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'empleado' ? (
              <Input
                label="CÓDIGO DE EMPLEADO"
                name="codigo"
                icon={BadgeCheck}
                placeholder="Ej: EMP-1234"
                value={form.codigo}
                onChange={handleChange}
                error={errors.codigo}
              />
            ) : (
              <Input
                label={activeTab === 'admin' ? "CORREO DE ADMINISTRADOR" : "CORREO ELECTRÓNICO"}
                name="email"
                type="email"
                icon={Mail}
                placeholder="usuario@correo.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
            )}

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

          {/* Register link (only for clients) */}
          {activeTab === 'cliente' && (
            <p className="text-center text-sm font-bold text-text-secondary mt-8">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-magenta hover:text-white transition-colors">
                Regístrate aquí
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
