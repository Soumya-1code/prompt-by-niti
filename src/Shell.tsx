import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import App from './App'
import { Logo, Mascot } from './Brand'
import './Shell.css'

interface Account { id: string; name: string; email: string; salt: string; hash: string }
interface AuthScreenProps { accounts: Account[]; onRegister: (a: Account) => void; onLogin: (a: Account) => void }

const ACCOUNTS_KEY = 'pbn.accounts'
const SESSION_KEY = 'pbn.session'
const PROMPTS_KEY = 'pbn.prompts'
const NAME_KEY = 'pbn.name'
const userKey = (id: string) => `pbn.u.${id}.prompts`

const FLOATERS = [
  { e: '✨', x: 8, y: 12 }, { e: '📝', x: 82, y: 18 }, { e: '💡', x: 14, y: 70 },
  { e: '🧬', x: 76, y: 74 }, { e: '🚀', x: 46, y: 6 }, { e: '🎯', x: 90, y: 46 },
]
const TIPS = [
  'Start prompts with an action verb, like "Explain" or "Compare".',
  'Say who the answer is for. "For a beginner" changes everything.',
  'Ask for a format: bullets, a table, or numbered steps.',
  'Add one limit, such as "under 200 words", to keep answers focused.',
  'Run Prompt DNA on your favorite prompt to find its weakest spot.',
]

function store(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function put(key: string, value: string | null) {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}
function loadAccounts(): Account[] {
  try {
    const raw: unknown = JSON.parse(store(ACCOUNTS_KEY) || '[]')
    if (Array.isArray(raw)) {
      return raw.filter((a): a is Account => !!a && typeof a.id === 'string' && typeof a.name === 'string' && typeof a.email === 'string' && typeof a.salt === 'string' && typeof a.hash === 'string')
    }
  } catch { /* malformed data: start with no accounts */ }
  return []
}
function randomHex(bytes = 16): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), b => b.toString(16).padStart(2, '0')).join('')
}
async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

function Floaters({ ambient }: { ambient?: boolean }) {
  return (
    <div className={'floaters' + (ambient ? ' ambient' : '')} aria-hidden="true">
      {FLOATERS.map((f, i) => <span key={f.e} className="floater" style={{ left: f.x + '%', top: f.y + '%', animationDelay: i * 0.7 + 's' }}>{f.e}</span>)}
    </div>
  )
}

function AuthScreen({ accounts, onRegister, onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(accounts.length ? 'login' : 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const switchMode = (m: 'login' | 'signup') => { setMode(m); setError('') }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const mail = email.trim().toLowerCase()
    if (mode === 'signup' && !name.trim()) { setError('Enter a display name.'); return }
    if (!/^\S+@\S+\.\S+$/.test(mail)) { setError('Enter a valid email address.'); return }
    if (pw.length < 6) { setError('Password must be at least 6 characters.'); return }
    setBusy(true)
    try {
      if (mode === 'signup') {
        if (accounts.some(a => a.email === mail)) { setError('An account with this email exists. Log in instead.'); return }
        const salt = randomHex()
        onRegister({ id: randomHex(8), name: name.trim(), email: mail, salt, hash: await sha256(salt + pw) })
      } else {
        const acc = accounts.find(a => a.email === mail)
        if (!acc || acc.hash !== (await sha256(acc.salt + pw))) { setError('Email or password is incorrect.'); return }
        onLogin(acc)
      }
    } catch {
      setError('Your browser blocked secure hashing. Open the site on localhost or https.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <section className="auth-show">
        <Floaters />
        <div className="auth-brand"><Logo size={44} /><b>Prompt by Niti</b></div>
        <Mascot size={170} />
        <h1>Your prompts, organized. Your ideas, improved.</h1>
        <ul className="auth-points">
          <li>🧬 Prompt DNA scores every prompt</li>
          <li>✨ One-click prompt improver</li>
          <li>📝 Reusable templates</li>
        </ul>
      </section>
      <section className="auth-pane">
        <form className="auth-card" onSubmit={submit} noValidate>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mute">{mode === 'login' ? 'Log in to open your prompt library.' : 'Start your personal library of better prompts.'}</p>
          {mode === 'signup' && <label className="field"><span>Display name</span><input value={name} maxLength={30} autoComplete="name" onChange={e => setName(e.target.value)} /></label>}
          <label className="field"><span>Email</span><input type="email" value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} /></label>
          <label className="field"><span>Password</span><input type="password" value={pw} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} onChange={e => setPw(e.target.value)} /></label>
          {error && <p className="err" role="alert">{error}</p>}
          <button className="btn primary wide-btn" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</button>
          <p className="switch">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" className="text-btn" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Sign up' : 'Log in'}</button>
          </p>
          <p className="demo-note">Demo accounts are stored only in this browser. This is not secure sign-in, so don't use a real password.</p>
        </form>
      </section>
    </div>
  )
}

function Buddy({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(0)
  return (
    <div className="buddy">
      {open && (
        <div className="buddy-panel" role="dialog" aria-label="Niti helper">
          <b>Hi {name}! 👋</b>
          <p>{TIPS[tip]}</p>
          <div className="buddy-actions">
            <button className="btn ghost small" onClick={() => setTip((tip + 1) % TIPS.length)}>Another tip</button>
            <button className="btn small" onClick={onLogout}>Log out</button>
          </div>
        </div>
      )}
      <button className="buddy-btn" aria-label={open ? 'Close Niti helper' : 'Open Niti helper'} aria-expanded={open} onClick={() => setOpen(o => !o)}><Mascot size={64} /></button>
    </div>
  )
}

export default function Shell() {
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts)
  const [uid, setUid] = useState<string | null>(() => {
    const id = store(SESSION_KEY)
    return id && loadAccounts().some(a => a.id === id) ? id : null
  })
  const user = accounts.find(a => a.id === uid) ?? null

  useEffect(() => { document.title = user ? 'Prompt by Niti' : 'Log in · Prompt by Niti' }, [user])

  const enter = (acc: Account, keepCurrent: boolean) => {
    if (!keepCurrent) put(PROMPTS_KEY, store(userKey(acc.id)))
    put(NAME_KEY, acc.name)
    put(SESSION_KEY, acc.id)
    setUid(acc.id)
  }
  const register = (acc: Account) => {
    const next = [...accounts, acc]
    put(ACCOUNTS_KEY, JSON.stringify(next))
    setAccounts(next)
    enter(acc, accounts.length === 0)
  }
  const logout = () => {
    if (!user) return
    const current = store(PROMPTS_KEY)
    if (current) put(userKey(user.id), current)
    put(PROMPTS_KEY, null)
    put(SESSION_KEY, null)
    setUid(null)
  }

  if (!user) return <AuthScreen accounts={accounts} onRegister={register} onLogin={acc => enter(acc, false)} />
  return (
    <>
      <Floaters ambient />
      <App key={user.id} />
      <Buddy name={user.name} onLogout={logout} />
    </>
  )
}