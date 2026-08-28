'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthLoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setMessage('')
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`, data: { full_name: name } } })
    setBusy(false)
    if (result.error) { setMessage(result.error.message.toLowerCase().includes('confirm') ? 'Please confirm your email before continuing.' : 'Invalid email or password.'); return }
    if (mode === 'signup' && !result.data.session) { setMessage('Check your inbox to confirm your email.'); return }
    router.push('/')
    router.refresh()
  }

  return <main className="auth-page"><div className="auth-card"><p className="section-kicker">LAYER / {'Account access — buy or sell'}</p><h1>{mode === 'login' ? 'Welcome back.' : 'Join the loop.'}</h1><p className="auth-intro">{'One account for your wardrobe and your storefront. Buy pre-loved pieces, save favorites, or list your own.'}</p><form onSubmit={submit}>{mode === 'signup' && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-label="Full name" required />}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-label="Password" minLength={6} required />{message && <p className="auth-message">{message}</p>}<button className="button button-dark full-button" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button><a className="auth-back" href="/">Back to LAYER</a></div></main>
}
