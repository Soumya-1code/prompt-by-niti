import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, BookOpen, Brain, Briefcase, Code, Copy, FileText, GraduationCap, LayoutGrid, Menu, Moon, PenLine, Plus, Search, Sparkles, Star, Sun, User, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './App.css'
import { Logo, Mascot } from './Brand'

type Cat = 'Study' | 'Coding' | 'Writing' | 'AI' | 'Career'
interface Prompt { id: string; title: string; content: string; category: Cat; tags: string[]; fav: boolean }
interface Template { id: string; title: string; description: string; category: Cat; body: string }
type View = 'all' | 'fav' | 'templates' | Cat
type Modal =
  | { t: 'new' } | { t: 'detail'; id: string } | { t: 'improve'; text: string } | { t: 'dna'; text: string }
  | { t: 'account' } | { t: 'tpl'; id: string } | { t: 'guide' } | null
interface ToastState { id: number; msg: string; leaving: boolean }

const CATS: Cat[] = ['Study', 'Coding', 'Writing', 'AI', 'Career']
const ICONS: Record<Cat, LucideIcon> = { Study: GraduationCap, Coding: Code, Writing: PenLine, AI: Brain, Career: Briefcase }
const TONE: Record<Cat, string> = { Study: 'yellow', Coding: 'mint', Writing: 'peach', AI: 'lav', Career: 'blue' }
const KEY = 'pbn.prompts', THEME_KEY = 'pbn.theme', NAME_KEY = 'pbn.name'
const TOAST_MS = 1900, TOAST_EXIT_MS = 220
const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

const DEFAULTS: Prompt[] = [
  { id: 'd1', title: 'Explain Machine Learning Simply', category: 'Study', tags: ['ml', 'beginner'], fav: true, content: 'Explain machine learning to a first-year engineering student with no prior experience. Define the core idea, describe how a model learns from data, give 2 everyday examples, and end with a 5-point bullet summary. Keep it under 300 words and avoid heavy math.' },
  { id: 'd2', title: 'Generate Clean Python Code', category: 'Coding', tags: ['python', 'clean-code'], fav: false, content: 'Write a Python function that reads a CSV file and returns the average of a numeric column. Use type hints, handle missing files and empty values, add a short docstring, and include one usage example. Do not use external libraries.' },
  { id: 'd3', title: 'Improve My Resume', category: 'Career', tags: ['resume', 'internship'], fav: false, content: 'Review my resume bullet points for a software engineering internship application. Rewrite each bullet to start with a strong action verb and show measurable impact. Return a before and after table and list 3 further improvements.' },
  { id: 'd4', title: 'Generate YouTube Ideas', category: 'Writing', tags: ['youtube', 'ideas'], fav: true, content: 'Suggest 10 video ideas for a YouTube channel about strange and fascinating facts from around the world. For each idea give a catchy title, a one-line hook, and the visuals needed. Avoid topics that are already overused.' },
  { id: 'd5', title: 'Summarize a Research Paper', category: 'AI', tags: ['research', 'summary'], fav: false, content: 'Summarize the research paper below for a final-year student. Cover the problem, method, results and limitations in separate sections, explain difficult terms simply, and suggest 3 follow-up questions.' },
  { id: 'd6', title: 'Create a DSA Study Plan', category: 'Study', tags: ['dsa', 'planning'], fav: false, content: 'Create an 8-week study plan for data structures and algorithms for a student who can study 2 hours per day. List weekly topics, 3 practice problems per topic, and a revision day every week. Present it as a table.' },
  { id: 'd7', title: "Explain a Complex Topic Like I'm a Beginner", category: 'Study', tags: ['explain', 'simple'], fav: false, content: 'Explain [topic] as if I am a complete beginner. Use plain language, one analogy from daily life, a short step-by-step breakdown, and finish with 3 questions I can use to test my understanding.' },
  { id: 'd8', title: 'Generate Interview Questions', category: 'Career', tags: ['interview', 'practice'], fav: false, content: 'Generate 10 interview questions for a junior frontend developer role. Include 4 technical, 3 behavioral and 3 problem-solving questions. For each, add what a strong answer should include in one sentence.' },
]

const TEMPLATES: Template[] = [
  { id: 't1', title: 'Study Notes Generator', category: 'Study', description: 'Turn any topic into structured revision notes.', body: 'You are a helpful tutor.\n\nExplain {{TOPIC}} for a {{AUDIENCE}} in a {{STYLE}} style.\n\nInclude:\n- simple explanation\n- key concepts\n- examples\n- common mistakes' },
  { id: 't2', title: 'Code Reviewer', category: 'Coding', description: 'Get a careful review of your code with fixes.', body: 'Review the following {{LANGUAGE}} code for bugs, readability and performance.\n\n{{CODE}}\n\nList problems by severity, explain each briefly, and show a corrected version. Keep the tone {{STYLE}}.' },
  { id: 't3', title: 'Resume Improver', category: 'Career', description: 'Sharpen resume bullets for a target role.', body: 'Improve these resume bullets for a {{ROLE}} position:\n\n{{BULLETS}}\n\nStart each bullet with an action verb, add measurable results where possible, and keep each under 20 words.' },
  { id: 't4', title: 'YouTube Idea Generator', category: 'Writing', description: 'Brainstorm video ideas for a niche.', body: 'Suggest {{COUNT}} YouTube video ideas about {{NICHE}} for {{AUDIENCE}}. For each, give a title, a hook for the first 10 seconds, and a thumbnail concept. Style: {{STYLE}}.' },
  { id: 't5', title: 'Research Summarizer', category: 'AI', description: 'Summarize papers into clear sections.', body: 'Summarize the following text for a {{AUDIENCE}}:\n\n{{TEXT}}\n\nUse these sections: Problem, Method, Results, Limitations. Keep the whole summary under {{WORDS}} words.' },
]

function loadPrompts(): Prompt[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (Array.isArray(raw) && raw.every(p => p && typeof p.id === 'string' && typeof p.title === 'string' && typeof p.content === 'string' && CATS.includes(p.category) && Array.isArray(p.tags))) {
      return raw.map((p: Prompt) => ({ ...p, tags: p.tags.map(String), fav: p.fav === true }))
    }
  } catch { /* malformed data: use defaults */ }
  return DEFAULTS
}
function readStore(key: string, fallback: string): string {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}
function writeStore(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}

// ---------- Local rule-based analysis ----------
interface Dim { name: string; score: number; note: string; tip: string }
interface Rule { name: string; re: string; weight: number; base: (words: number) => number; good: string; bad: string; tip: string }
const STRONG = 70, WEAK = 50
const RULES: Rule[] = [
  { name: 'Goal Clarity', re: '\\b(explain|write|generate|create|analy[sz]e|summari[sz]e|review|improve|list|compare|build|design|draft|plan|teach|describe|suggest|rewrite|translate)\\b', weight: 55, base: w => Math.min(45, w * 4), good: 'Your prompt clearly describes the desired task.', bad: 'The task is vague. Start with a clear action verb and a specific subject.', tip: 'State the exact task with an action verb' },
  { name: 'Context', re: "\\b(because|background|context|currently|working on|project|so that|in order to|i am|i'm|my)\\b", weight: 30, base: w => Math.min(40, w * 1.5), good: 'Useful background is provided.', bad: 'Needs more context about the situation or purpose.', tip: 'Add background: why you need this and what you already know' },
  { name: 'Audience', re: '\\b(beginner|student|expert|audience|for an? |kids?|child|professional|manager|developer|recruiter|teacher|reader|non-technical|simple terms)\\b', weight: 50, base: () => 0, good: 'The target audience is clear.', bad: 'Needs more context about the target audience.', tip: 'Specify who the response is for' },
  { name: 'Output Definition', re: '\\b(bullet|list|table|steps?|format|json|paragraphs?|summary|words|sections?|outline|code|headings?|markdown)\\b', weight: 40, base: () => 0, good: 'The expected output format is defined.', bad: 'The desired format of the answer is not defined.', tip: 'Define the desired format, such as bullets, a table or sections' },
  { name: 'Constraints', re: "\\b(must|only|avoid|don't|do not|without|limit|at most|at least|maximum|under|exactly|no more than|within|tone)\\b", weight: 35, base: () => 0, good: 'Helpful limits guide the response.', bad: 'No constraints such as length, tone or things to avoid.', tip: 'Add relevant constraints like length, tone or exclusions' },
  { name: 'Examples', re: '\\b(example|examples|e\\.g\\.|for instance|such as|sample|like this)\\b', weight: 50, base: () => 0, good: 'Examples are requested or provided.', bad: 'No examples are requested or provided.', tip: 'Include an example when useful' },
]

function analyze(text: string): { overall: number; dims: Dim[] } {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const dims = RULES.map(r => {
    const hits = (text.match(new RegExp(r.re, 'gi')) || []).length
    const score = Math.round(Math.min(100, r.base(words) + hits * r.weight))
    return { name: r.name, score, note: score >= 60 ? r.good : r.bad, tip: r.tip }
  })
  return { overall: Math.round(dims.reduce((sum, d) => sum + d.score, 0) / dims.length), dims }
}

function improve(text: string): { issues: string[]; result: string } {
  const { dims } = analyze(text)
  const isWeak = (name: string) => (dims.find(d => d.name === name)?.score ?? 0) < WEAK
  let base = text.trim().replace(/[.?!\s]+$/, '')
  if (isWeak('Goal Clarity')) base = 'Explain ' + base.charAt(0).toLowerCase() + base.slice(1)
  base = base.charAt(0).toUpperCase() + base.slice(1)
  const parts = [base + (isWeak('Audience') ? ' in simple terms for a beginner student' : '') + '.']
  if (isWeak('Context')) parts.push('Assume I am new to this topic and want to understand the core idea first.')
  if (isWeak('Output Definition')) parts.push('Define the core concept, explain how it works at a high level, and summarize the key ideas in bullet points.')
  if (isWeak('Examples')) parts.push('Provide 2 practical real-world examples.')
  if (isWeak('Constraints')) parts.push('Keep it under 300 words and avoid unnecessary jargon.')
  return { issues: dims.filter(d => d.score < WEAK).map(d => d.tip), result: parts.join(' ') }
}

// ---------- UI primitives ----------
function ModalShell({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeRef.current(); return }
      if (e.key !== 'Tab' || !ref.current) return
      const items = ref.current.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,select,[href]')
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.() }
  }, [])
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <header className="modal-head">
          <div><h2>{title}</h2>{subtitle && <p className="mute">{subtitle}</p>}</div>
          <button className="icon-btn" aria-label="Close dialog" title="Close" onClick={onClose}><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

function Ring({ score, size = 132 }: { score: number; size?: number }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <circle cx="60" cy="60" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 60 60)" />
      </svg>
      <div className="ring-num"><strong>{score}</strong><span>/ 100</span></div>
    </div>
  )
}

function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="empty"><div className="empty-icon"><Sparkles size={26} /></div><h3>{title}</h3><p className="mute">{text}</p>{action}</div>
}

function PromptCard({ p, onFav, onCopy, onOpen }: { p: Prompt; onFav: () => void; onCopy: () => void; onOpen: () => void }) {
  const Icon = ICONS[p.category]
  return (
    <article className="card prompt-card">
      <div className="card-top">
        <span className={'badge ' + TONE[p.category]}><Icon size={13} /> {p.category}</span>
        <button className={'icon-btn' + (p.fav ? ' on' : '')} aria-label={p.fav ? `Remove ${p.title} from favorites` : `Add ${p.title} to favorites`} aria-pressed={p.fav} title={p.fav ? 'Unfavorite' : 'Favorite'} onClick={onFav}>
          <Star size={17} fill={p.fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3>{p.title}</h3>
      <p className="preview mute">{p.content}</p>
      <p className="tags">{p.tags.slice(0, 3).join(' · ')}</p>
      <div className="card-actions">
        <button className="btn ghost small" onClick={onCopy}><Copy size={14} /> Copy</button>
        <button className="btn link small" onClick={onOpen} aria-label={'Open ' + p.title}>Open <ArrowRight size={14} /></button>
      </div>
    </article>
  )
}

// ---------- Modals ----------
function DnaModal({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [text, setText] = useState(initial)
  const [res, setRes] = useState<ReturnType<typeof analyze> | null>(() => (initial.trim() ? analyze(initial) : null))
  const strengths = res ? res.dims.filter(d => d.score >= STRONG) : []
  const weak = res ? res.dims.filter(d => d.score < WEAK) : []
  return (
    <ModalShell title="Prompt DNA" subtitle="Understand what makes your prompt strong." onClose={onClose} wide>
      <label className="field"><span>Your prompt</span>
        <textarea rows={5} value={text} placeholder="Paste or type a prompt to analyze…" onChange={e => { setText(e.target.value); setRes(null) }} />
      </label>
      <p className="mute small-text">Local Prompt Quality Analysis. Rule-based and run in your browser; no AI service is used.</p>
      {res && (
        <div className="analysis">
          <div className="score-head">
            <Ring score={res.overall} />
            <div>
              <h3>Prompt Quality</h3>
              <p className="mute">{res.overall >= STRONG ? 'A strong prompt. Small tweaks can make it better.' : res.overall >= WEAK ? 'A decent start with clear room to improve.' : 'This prompt needs more detail to give reliable answers.'}</p>
            </div>
          </div>
          <div className="dims">
            {res.dims.map(d => (
              <div key={d.name} className="dim">
                <div className="dim-top"><b>{d.name}</b><span>{d.score}/100</span></div>
                <div className="bar"><i style={{ width: d.score + '%' }} /></div>
                <p className="mute small-text">{d.note}</p>
              </div>
            ))}
          </div>
          <div className="insights">
            <div className="insight good"><h4>Strengths</h4>{strengths.length ? <ul>{strengths.map(d => <li key={d.name}>{d.name}: {d.note}</li>)}</ul> : <p className="mute">No standout strengths yet.</p>}</div>
            <div className="insight bad"><h4>Weak areas</h4>{weak.length ? <ul>{weak.map(d => <li key={d.name}>{d.name}: {d.note}</li>)}</ul> : <p className="mute">No weak areas found.</p>}</div>
          </div>
          <div className="insight sug"><h4>Suggestions</h4>{weak.length ? <ul>{weak.map(d => <li key={d.name}>{d.tip}</li>)}</ul> : <p className="mute">Test the prompt with your AI tool and refine from the results.</p>}</div>
        </div>
      )}
      <footer className="modal-foot">
        {res ? (<>
          <button className="btn ghost" onClick={() => { setText(''); setRes(null) }}>Analyze Another</button>
          <button className="btn ghost" onClick={() => setRes(analyze(text))}>Recalculate</button>
          <button className="btn primary" onClick={onClose}>Close</button>
        </>) : (<>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn primary" disabled={!text.trim()} onClick={() => setRes(analyze(text))}><Sparkles size={16} /> Analyze Prompt</button>
        </>)}
      </footer>
    </ModalShell>
  )
}

function ImproverModal({ initial, onClose, onCopy, onDna }: { initial: string; onClose: () => void; onCopy: (t: string) => void; onDna: (t: string) => void }) {
  const [text, setText] = useState(initial)
  const [out, setOut] = useState<ReturnType<typeof improve> | null>(() => (initial.trim() ? improve(initial) : null))
  return (
    <ModalShell title="Prompt Improver" subtitle="Local rule-based improvement" onClose={onClose} wide>
      <label className="field"><span>Original prompt</span>
        <textarea rows={3} value={text} placeholder="e.g. explain machine learning" onChange={e => { setText(e.target.value); setOut(null) }} />
      </label>
      {out && (
        <div className="analysis">
          <h4>What could be improved</h4>
          {out.issues.length ? <ul>{out.issues.map(i => <li key={i}>{i}</li>)}</ul> : <p className="mute">Your prompt already covers the basics. The version below adds polish.</p>}
          <h4>Improved prompt</h4>
          <div className="improved">{out.result}</div>
        </div>
      )}
      <footer className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Close</button>
        {out ? (<>
          <button className="btn ghost" onClick={() => onDna(out.result)}>Analyze with Prompt DNA</button>
          <button className="btn primary" onClick={() => onCopy(out.result)}><Copy size={16} /> Copy Improved Prompt</button>
        </>) : <button className="btn primary" disabled={!text.trim()} onClick={() => setOut(improve(text))}><Sparkles size={16} /> Improve Prompt</button>}
      </footer>
    </ModalShell>
  )
}

function NewModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Omit<Prompt, 'id' | 'fav'>) => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Cat>('Study')
  const [tags, setTags] = useState('')
  const [err, setErr] = useState<{ title?: string; content?: string }>({})
  const submit = () => {
    const e: { title?: string; content?: string } = {}
    if (!title.trim()) e.title = 'Give your prompt a title.'
    if (!content.trim()) e.content = 'Write the prompt text.'
    setErr(e)
    if (e.title || e.content) return
    onCreate({ title: title.trim(), content: content.trim(), category, tags: tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) })
  }
  return (
    <ModalShell title="New prompt" subtitle="Save a prompt to your library." onClose={onClose}>
      <label className="field"><span>Title</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summarize lecture notes" aria-invalid={!!err.title} />{err.title && <em className="err">{err.title}</em>}</label>
      <label className="field"><span>Prompt</span><textarea rows={5} value={content} onChange={e => setContent(e.target.value)} placeholder="Write the full prompt here" aria-invalid={!!err.content} />{err.content && <em className="err">{err.content}</em>}</label>
      <div className="two">
        <label className="field"><span>Category</span><select value={category} onChange={e => setCategory(e.target.value as Cat)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Tags (comma separated)</span><input value={tags} onChange={e => setTags(e.target.value)} placeholder="python, notes" /></label>
      </div>
      <footer className="modal-foot"><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit}>Create Prompt</button></footer>
    </ModalShell>
  )
}

function TemplateModal({ t, onClose, onCopy, onSave }: { t: Template; onClose: () => void; onCopy: (s: string) => void; onSave: (s: string) => void }) {
  const vars = useMemo(() => Array.from(new Set(Array.from(t.body.matchAll(/\{\{([A-Z_]+)\}\}/g), m => m[1]))), [t])
  const [vals, setVals] = useState<Record<string, string>>({})
  const filled = t.body.replace(/\{\{([A-Z_]+)\}\}/g, (m, k: string) => (vals[k] || '').trim() || m)
  const missing = vars.filter(v => !(vals[v] || '').trim()).length
  return (
    <ModalShell title={t.title} subtitle="Fill in the variables to build your prompt." onClose={onClose} wide>
      <div className="two">
        {vars.map(v => (
          <label key={v} className="field"><span>{v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, ' ')}</span>
            <input value={vals[v] || ''} onChange={e => setVals({ ...vals, [v]: e.target.value })} />
          </label>
        ))}
      </div>
      <h4>Preview</h4>
      <pre className="improved">{filled}</pre>
      {missing > 0 && <p className="mute small-text">{missing} variable{missing > 1 ? 's' : ''} still empty. They stay as {'{{PLACEHOLDERS}}'} in the prompt.</p>}
      <footer className="modal-foot">
        <button className="btn ghost" onClick={() => onCopy(filled)}><Copy size={16} /> Copy</button>
        <button className="btn primary" onClick={() => onSave(filled)}>Save to library</button>
      </footer>
    </ModalShell>
  )
}

// ---------- App ----------
export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>(loadPrompts)
  const [view, setView] = useState<View>('all')
  const [q, setQ] = useState('')
  const [modal, setModal] = useState<Modal>(null)
  const [drawer, setDrawer] = useState(false)
  const [dark, setDark] = useState(() => readStore(THEME_KEY, 'light') === 'dark')
  const [name, setName] = useState(() => readStore(NAME_KEY, 'Guest'))
  const [draftName, setDraftName] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const toastId = useRef(0)

  useEffect(() => { writeStore(KEY, JSON.stringify(prompts)) }, [prompts])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; writeStore(THEME_KEY, dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { writeStore(NAME_KEY, name) }, [name])

  const showToast = useCallback((msg: string) => { toastId.current += 1; setToast({ id: toastId.current, msg, leaving: false }) }, [])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(t => (t ? (t.leaving ? null : { ...t, leaving: true }) : null)), toast.leaving ? TOAST_EXIT_MS : TOAST_MS)
    return () => clearTimeout(id)
  }, [toast])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'Escape') setDrawer(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); showToast('Copied!') } catch { showToast('Copy failed. Select the text and copy it manually.') }
  }
  const toggleFav = (id: string) => setPrompts(ps => ps.map(p => (p.id === id ? { ...p, fav: !p.fav } : p)))
  const addPrompt = (p: Omit<Prompt, 'id' | 'fav'>) => {
    setPrompts(ps => [{ ...p, id: 'p' + Date.now(), fav: false }, ...ps])
    setView('all'); setQ(''); setModal(null); showToast('Prompt created')
  }
  const go = (v: View) => { setView(v); setDrawer(false) }
  const openAccount = () => { setDraftName(name); setModal({ t: 'account' }); setDrawer(false) }
  const close = () => setModal(null)

  const s = q.trim().toLowerCase()
  const list = useMemo(() => prompts.filter(p => (view === 'all' || view === 'templates' || (view === 'fav' ? p.fav : p.category === view)) && (!s || [p.title, p.content, p.category, ...p.tags].join(' ').toLowerCase().includes(s))), [prompts, view, s])
  const templates = TEMPLATES.filter(t => !s || (t.title + ' ' + t.description + ' ' + t.category).toLowerCase().includes(s))
  const count = (c: Cat) => prompts.filter(p => p.category === c).length
  const favCount = prompts.filter(p => p.fav).length
  const detail = modal && modal.t === 'detail' ? prompts.find(p => p.id === modal.id) : undefined
  const template = modal && modal.t === 'tpl' ? TEMPLATES.find(t => t.id === modal.id) : undefined
  const pageTitle = view === 'all' ? 'All Prompts' : view === 'fav' ? 'Favorites' : view === 'templates' ? 'Templates' : view

  const navItem = (v: View, label: string, Icon: LucideIcon, n?: number) => (
    <button key={v} className={'nav-item' + (view === v ? ' active' : '')} aria-current={view === v ? 'page' : undefined} onClick={() => go(v)}>
      <Icon size={17} /><span>{label}</span>{n !== undefined && <small>{n}</small>}
    </button>
  )

  return (
    <div className="app">
      {drawer && <button className="backdrop" aria-label="Close menu" onClick={() => setDrawer(false)} />}
      <aside className={'sidebar' + (drawer ? ' open' : '')} aria-label="Sidebar">
        <div className="brand"><Logo /><b>Prompt by Niti</b></div>
        <nav className="nav" aria-label="Main">
          <p className="nav-label">Workspace</p>
          {navItem('all', 'All Prompts', LayoutGrid, prompts.length)}
          {navItem('fav', 'Favorites', Star, favCount)}
          {navItem('templates', 'Templates', FileText, TEMPLATES.length)}
          <p className="nav-label">Collections</p>
          {CATS.map(c => navItem(c, c, ICONS[c], count(c)))}
        </nav>
        <div className="side-bottom">
          <button className="nav-item" onClick={() => go('templates')}><FileText size={17} /><span>Prompt Templates</span></button>
          <button className="nav-item" onClick={() => { setModal({ t: 'guide' }); setDrawer(false) }}><BookOpen size={17} /><span>Quick Guide</span></button>
          <button className="nav-item" onClick={() => setDark(d => !d)}>{dark ? <Sun size={17} /> : <Moon size={17} />}<span>{dark ? 'Light theme' : 'Dark theme'}</span></button>
          <button className="nav-item" onClick={openAccount}><span className="avatar">{name.charAt(0).toUpperCase()}</span><span>{name}</span></button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <button className="icon-btn menu-btn" aria-label="Open menu" title="Menu" onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <span className="page-title">{pageTitle}</span>
          <label className="search"><Search size={17} />
            <input ref={searchRef} aria-label="Search prompts" placeholder="Search title, content, category or tag" value={q} onChange={e => setQ(e.target.value)} />
            <kbd>{IS_MAC ? '⌘ K' : 'Ctrl K'}</kbd>
          </label>
          <button className="btn primary" onClick={() => setModal({ t: 'new' })}><Plus size={16} /> New Prompt</button>
          <button className="icon-btn round" aria-label="Account" title="Account" onClick={openAccount}><User size={18} /></button>
        </div>

        <div className="page" key={view}>
          {view === 'all' && !s && (
            <section className="hero">
              <div className="hero-copy">
                <h1>Your prompts, organized.</h1>
                <p>Save the prompts that work. Improve the ones that don't. Reuse them whenever you need.</p>
                <button className="btn ghost" onClick={() => setModal({ t: 'improve', text: '' })}>Improve a Prompt</button>
              </div>
              <div className="dna-card">
                <div className="dna-mascot" aria-hidden="true"><Mascot size={104} /></div>
<span className="sticker s1" aria-hidden="true">✨</span>
<span className="sticker s2" aria-hidden="true">🧬</span>
<span className="sticker s3" aria-hidden="true">💡</span>
<span className="badge lav">Prompt DNA</span>
                <h2>Know why your prompt works.</h2>
                <p>Analyze clarity, context, audience, output definition, constraints and examples.</p>
                <div className="row wrap"><Ring score={72} size={88} /><button className="btn primary" onClick={() => setModal({ t: 'dna', text: '' })}>Analyze a Prompt</button></div>
              </div>
            </section>
          )}

          {view !== 'templates' && (
            <div className="filters" role="group" aria-label="Filter prompts">
              {([['all', 'All', LayoutGrid, prompts.length], ['fav', 'Favorites', Star, favCount]] as [View, string, LucideIcon, number][]).concat(CATS.map(c => [c, c, ICONS[c], count(c)] as [View, string, LucideIcon, number])).map(([v, label, Icon, n]) => (
                <button key={v} className={'pill' + (view === v ? ' active' : '')} aria-pressed={view === v} onClick={() => setView(v)}><Icon size={14} /> {label} <small>{n}</small></button>
              ))}
            </div>
          )}

          <h2 className="section-title">{view === 'all' ? 'Your library' : view === 'templates' ? 'Templates' : pageTitle}</h2>

          {view === 'templates' ? (
            templates.length ? (
              <div className="grid">{templates.map(t => (
                <article key={t.id} className="card tpl-card">
                  <span className={'badge ' + TONE[t.category]}>Template · {t.category}</span>
                  <h3>{t.title}</h3>
                  <p className="mute">{t.description}</p>
                  <pre className="tpl-body">{t.body}</pre>
                  <button className="btn primary small" onClick={() => setModal({ t: 'tpl', id: t.id })}>Use Template</button>
                </article>
              ))}</div>
            ) : <Empty title="No templates found" text="Try a different search term." action={<button className="btn ghost" onClick={() => setQ('')}>Clear search</button>} />
          ) : list.length ? (
            <div className="grid">{list.map(p => <PromptCard key={p.id} p={p} onFav={() => toggleFav(p.id)} onCopy={() => copy(p.content)} onOpen={() => setModal({ t: 'detail', id: p.id })} />)}</div>
          ) : s ? <Empty title="No prompts found" text="Check the spelling, try a broader keyword, or search by tag or category." action={<button className="btn ghost" onClick={() => setQ('')}>Clear search</button>} />
            : view === 'fav' ? <Empty title="No favorites yet" text="Save your most useful prompts here so you can find them quickly." />
            : prompts.length === 0 ? <Empty title="No prompts yet" text="Create your first prompt to start your library." action={<button className="btn primary" onClick={() => setModal({ t: 'new' })}>New Prompt</button>} />
            : <Empty title={'No ' + view + ' prompts yet'} text="Create a prompt in this category and it will appear here." action={<button className="btn primary" onClick={() => setModal({ t: 'new' })}>New Prompt</button>} />}
        </div>
      </main>

      {modal?.t === 'new' && <NewModal onClose={close} onCreate={addPrompt} />}
      {modal?.t === 'improve' && <ImproverModal initial={modal.text} onClose={close} onCopy={copy} onDna={t => setModal({ t: 'dna', text: t })} />}
      {modal?.t === 'dna' && <DnaModal initial={modal.text} onClose={close} />}
      {detail && (
        <ModalShell title={detail.title} onClose={close} wide>
          <div className="row wrap"><span className={'badge ' + TONE[detail.category]}>{detail.category}</span><span className="tags">{detail.tags.join(' · ')}</span></div>
          <pre className="improved">{detail.content}</pre>
          <footer className="modal-foot">
            <button className={'btn ghost' + (detail.fav ? ' on' : '')} aria-pressed={detail.fav} onClick={() => toggleFav(detail.id)}><Star size={16} fill={detail.fav ? 'currentColor' : 'none'} /> {detail.fav ? 'Favorited' : 'Favorite'}</button>
            <button className="btn ghost" onClick={() => copy(detail.content)}><Copy size={16} /> Copy</button>
            <button className="btn ghost" onClick={() => setModal({ t: 'improve', text: detail.content })}>Improve Prompt</button>
            <button className="btn primary" onClick={() => setModal({ t: 'dna', text: detail.content })}>Analyze with Prompt DNA</button>
          </footer>
        </ModalShell>
      )}
      {template && (
        <TemplateModal t={template} onClose={close} onCopy={copy} onSave={body => {
          setPrompts(ps => [{ id: 'p' + Date.now(), title: template.title, content: body, category: template.category, tags: ['template'], fav: false }, ...ps])
          setView('all'); setModal(null); showToast('Saved to your library')
        }} />
      )}
      {modal?.t === 'account' && (
        <ModalShell title="Demo account" subtitle="This is a local profile, not secure sign-in. Your name is stored only in this browser." onClose={close}>
          <label className="field"><span>Display name</span><input value={draftName} maxLength={30} onChange={e => setDraftName(e.target.value)} /></label>
          <footer className="modal-foot"><button className="btn ghost" onClick={close}>Cancel</button><button className="btn primary" onClick={() => { setName(draftName.trim() || 'Guest'); close(); showToast('Name updated') }}>Save name</button></footer>
        </ModalShell>
      )}
      {modal?.t === 'guide' && (
        <ModalShell title="Quick guide" subtitle="Get the most from your library." onClose={close}>
          <ol className="guide">
            <li>Create or save a prompt with New Prompt.</li>
            <li>Star the ones you reuse to find them under Favorites.</li>
            <li>Use Prompt Improver to strengthen a vague prompt.</li>
            <li>Run Prompt DNA to see which parts need work.</li>
            <li>Start from a template when you want a proven structure.</li>
          </ol>
          <footer className="modal-foot"><button className="btn primary" onClick={close}>Got it</button></footer>
        </ModalShell>
      )}
      {toast && <div className={'toast' + (toast.leaving ? ' leaving' : '')} role="status">{toast.msg}</div>}
    </div>
  )
}