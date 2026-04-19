import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { sendContact } from '../../services/api'

const initialForm = {
  name: '',
  email: '',
  message: '',
}

function validateContactForm(formData) {
  const errors = {}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!formData.name.trim()) {
    errors.name = 'Name is required.'
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailRegex.test(formData.email.trim())) {
    errors.email = 'Please provide a valid email address.'
  }

  if (!formData.message.trim()) {
    errors.message = 'Message is required.'
  } else if (formData.message.trim().length < 10) {
    errors.message = 'Message should be at least 10 characters.'
  }

  return errors
}

export function ContactSection() {
  const [formData, setFormData] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const onChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    const errors = validateContactForm(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setStatus({
        type: 'error',
        message: 'Please fix the highlighted fields and try again.',
      })
      return
    }

    try {
      setSending(true)
      setFieldErrors({})
      setStatus({ type: '', message: '' })
      await sendContact(formData)
      setStatus({
        type: 'success',
        message: 'Message sent successfully. I will get back to you soon.',
      })
      setFormData(initialForm)
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error.message ?? 'Failed to send message. Please retry or contact me on social links.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="section-shell">
      <SectionHeader
        eyebrow="Contact"
        title="Let's Build Something Exceptional"
        description="Send a message directly through the API-backed form endpoint and I will reply as soon as possible."
      />

      <motion.form
        onSubmit={onSubmit}
        className="mx-auto grid max-w-3xl gap-4 rounded-2xl border border-white/12 bg-slate-950/42 p-5 shadow-[0_12px_34px_rgba(4,12,32,0.35)] sm:p-7"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Input
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Your Name"
              required
              aria-label="Name"
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name ? <p className="text-xs text-rose-300">{fieldErrors.name}</p> : null}
          </div>

          <div className="space-y-1">
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="Your Email"
              required
              aria-label="Email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? <p className="text-xs text-rose-300">{fieldErrors.email}</p> : null}
          </div>
        </div>

        <div className="space-y-1">
          <Textarea
            name="message"
            value={formData.message}
            onChange={onChange}
            placeholder="Tell me about your project..."
            required
            aria-label="Message"
            aria-invalid={Boolean(fieldErrors.message)}
          />
          {fieldErrors.message ? <p className="text-xs text-rose-300">{fieldErrors.message}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" size="lg" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </Button>

          {status.message ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm ${
                status.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
              }`}
              role="status"
            >
              {status.message}
            </motion.p>
          ) : null}
        </div>
      </motion.form>
    </section>
  )
}
