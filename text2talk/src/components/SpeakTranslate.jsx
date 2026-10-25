import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Copy, Volume2, Trash2, Languages } from 'lucide-react'
import { useSpeechRecognition } from '../features/stt/useSpeechRecognition'
import { LANGS as TARGETS, translate } from '../pages/Translate'
import { speak, stopSpeaking } from '../lib/speak'

const SPOKEN = [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['en-IN', 'English (India)'], ['hi-IN', 'Hindi'], ['es-ES', 'Spanish'], ['fr-FR', 'French'], ['de-DE', 'German']]

// Speak into the microphone, then get the text translated into another language.
export default function SpeakTranslate() {
  const [spoken, setSpoken] = useState('en-US'); const [to, setTo] = useState('hi')
  const [consent, setConsent] = useState(false); const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [talking, setTalking] = useState(false)
  const s = useSpeechRecognition(spoken)
  const was = useRef(false); const textRef = useRef(''); textRef.current = s.final

  const run = async text => {
    setErr(''); setOut('')
    if (!text.trim()) return
    const from = spoken.split('-')[0]
    if (from === to) return setErr('Choose a target language that is different from the language you speak.')
    setBusy(true)
    try { setOut(await translate(text.trim(), from, to)) } catch (e) { setErr(e.message || 'Translation failed. Check your connection.') } finally { setBusy(false) }
  }
  // Translate automatically shortly after recording stops (gives the last words time to arrive).
  useEffect(() => {
    if (s.listening) { was.current = true; return }
    if (!was.current) return
    was.current = false
    const t = setTimeout(() => run(textRef.current), 700)
    return () => clearTimeout(t)
  }, [s.listening])
  useEffect(() => () => stopSpeaking(), [])

  const start = () => { s.reset(); setOut(''); setErr(''); s.start() }
  const play = () => { if (talking) { stopSpeaking(); setTalking(false) } else { setTalking(true); speak(out, { lang: to, onEnd: () => setTalking(false) }) } }
  const clear = () => { stopSpeaking(); setTalking(false); s.reset(); setOut(''); setErr('') }
  const sel = (v, set, list, label, disabled) => <select aria-label={label} className="input w-auto" value={v} onChange={e => set(e.target.value)} disabled={disabled}>{list.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>

  return (
    <div className="card space-y-4 text-left">
      <h3 className="flex items-center gap-2 text-lg font-bold"><Languages size={20} className="text-brand-500" /> Speak &amp; Translate</h3>
      {!s.supported && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.</p>}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>I speak</span>{sel(spoken, setSpoken, SPOKEN, 'Spoken language', s.listening)}
        <span>Translate to</span>{sel(to, setTo, TARGETS, 'Target language')}
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />
        I consent to using my microphone. Browser speech recognition may send audio to your browser vendor’s speech service, and the text is sent to a free translation service.</label>
      <div className="flex flex-wrap items-center gap-3">
        {s.listening ? <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={s.stop}><Square size={16} /> Stop &amp; translate</button>
          : <button className="btn-primary" disabled={!s.supported || !consent} onClick={start}><Mic size={16} /> Start speaking</button>}
        {s.listening && <span className="flex items-center gap-2 text-sm" aria-live="polite"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />Listening…</span>}
      </div>
      {s.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
      <textarea aria-label="What you said" className="input min-h-[110px]" placeholder="Your spoken words appear here…" value={s.final + s.interim} onChange={e => s.setFinal(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" disabled={busy || s.listening || !s.final.trim()} onClick={() => run(s.final)}><Languages size={16} /> {busy ? 'Translating…' : 'Translate'}</button>
        <button className="btn-ghost" onClick={clear}><Trash2 size={16} /> Clear</button>
      </div>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {out && <>
        <textarea aria-label="Translation" readOnly className="input min-h-[110px] bg-brand-50" value={out} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(out)}><Copy size={16} /> Copy</button>
          <button className="btn-ghost" onClick={play}>{talking ? <><Square size={16} /> Stop</> : <><Volume2 size={16} /> Listen</>}</button>
        </div></>}
      <p className="text-xs text-slate-500">Machine translation can contain mistakes. Don’t translate sensitive information.</p>
    </div>)
}
