import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowLeft, Star, Gift, CheckCircle, AlertCircle } from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useLanguage } from '../context/useLanguage'
import { register as registerService } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()
  const navigate = useNavigate()

  const benefits = [
    { icon: Star, textKey: 'auth.benefit1' },
    { icon: Gift, textKey: 'auth.benefit2' },
    { icon: CheckCircle, textKey: 'auth.benefit3' },
  ]

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    if (serverError) setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.nombre.trim()) newErrors.nombre = t('auth.nameRequired')
    else if (form.nombre.length < 2 || form.nombre.length > 30) newErrors.nombre = t('auth.nameLength')
    if (!form.email.trim()) newErrors.email = t('auth.emailRequired')
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = t('auth.emailInvalid')
    if (!form.password) newErrors.password = t('auth.passwordRequired')
    else if (form.password.length < 8) newErrors.password = t('auth.passwordMin')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    let error = ''
    if (name === 'nombre') {
      if (!value.trim()) error = t('auth.nameRequired')
      else if (value.length < 2 || value.length > 30) error = t('auth.nameLength')
    } else if (name === 'email') {
      if (!value.trim()) error = t('auth.emailRequired')
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = t('auth.emailInvalid')
    } else if (name === 'password') {
      if (!value) error = t('auth.passwordRequired')
      else if (value.length < 8) error = t('auth.passwordMin')
    }
    if (error) setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setServerError('')
    try {
      await registerService({
        email: form.email,
        name: form.nombre,
        password: form.password,
        userType: 'BUYER',
      })
      setIsSuccess(true)
    } catch (err) {
      setServerError(err.message || t('common.error'))
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
            {t('auth.registerSuccess')}
          </h2>
          <p className="text-text-secondary text-center mb-8">{t('auth.verifyAccount')}</p>
          <Button onClick={() => navigate('/login')} className="w-full">
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl animate-[fadeUp_0.6s_ease-out_forwards]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('auth.backToHome')}
        </Link>

        <div className="bg-surface/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display tracking-widest text-white uppercase">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-sm font-medium text-text-secondary mt-2">{t('auth.registerSubtitle')}</p>
          </div>

          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-5 mb-8 shadow-inner glow-gold">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-gold" fill="currentColor" />
              <span className="text-sm font-bold tracking-wider text-gold uppercase">
                {t('auth.benefits')}
              </span>
            </div>
            <div className="space-y-3">
              {benefits.map(({ icon: Icon, textKey }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                  <Icon size={16} className="text-gold flex-shrink-0" />
                  <span>{t(textKey)}</span>
                </div>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-xl px-4 py-3 mb-6 text-center flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.fullName')}
              name="nombre"
              icon={User}
              placeholder="Juan Pérez"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombre}
            />
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              icon={Mail}
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
            />
            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              icon={Lock}
              placeholder="Min 8 caracteres"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
            />
            <div className="flex items-start gap-3 pt-3">
              <input
                type="checkbox"
                required
                className="w-5 h-5 mt-0.5 rounded bg-carbon border-2 border-border accent-magenta cursor-pointer"
              />
              <span className="text-xs font-medium text-text-secondary leading-snug">
                {t('auth.termsAgree')}{' '}
                <a href="#" className="text-magenta hover:text-gold transition-colors font-bold tracking-wide">
                  {t('auth.terms')}
                </a>{' '}
                {t('common.and')}{' '}
                <a href="#" className="text-magenta hover:text-gold transition-colors font-bold tracking-wide">
                  {t('auth.privacy')}
                </a>
              </span>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? t('common.processing') : t('auth.registerBtn')}
            </Button>
          </form>

          <p className="text-center text-sm font-bold text-text-secondary mt-8">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-magenta hover:text-white transition-colors">
              {t('auth.loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

