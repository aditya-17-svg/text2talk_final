import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Copy, Volume2, Trash2, Radio } from 'lucide-react'
import { useSpeechRecognition } from '../features/stt/useSpeechRecognition'
import { LANGS as TARGETS, translate } from '../pages/Translate'
import { speak, stopSpeaking } from '../lib/speak'

const SPOKEN = [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['en-IN', 'English (India)'], ['hi-IN', 'Hindi'], ['es-ES', 'Spanish'], ['fr-FR', 'French'], ['de-DE', 'German']]

// Live translation: every phrase you finish speaking is sent to the Python
// function (/api/translate) and appears on the right while you keep talking.
export default function LiveTranslate() {
  const [spoken, setSpoken] = useState('en-US'); const [to, setTo] = useState('hi'); const [consent, setConsent] = useState(false)
  const [segs, setSegs] = useState([]); const [err, setErr] = useState(''); const [talking, setTalking] = useState(false)
  const s = useSpeechRecognition(spoken)
  const sent = useRef(0); const nextId = useRef(0)

  useEffect(() => {
    if (s.final.length < sent.current) sent.current = s.final.length
    const piece = s.final.slice(sent.current).trim()
    if (!piece) return
    sent.current = s.final.length
    const id = nextId.current++
    setSegs(v => [...v, { id, out: null }])
    translate(piece, spoken.split('-')[0], to)
      .then(out => setSegs(v => v.map(x => (x.id === id ? { ...x, out } : x))))
      .catch(e => { setErr(e.message || 'Translation failed.'); setSegs(v => v.map(x => (x.id === id ? { ...x, out: '⚠' } : x))) })
  }, [s.final])
  useEffect(() => () => stopSpeaking(), [])

  const translated = segs.map(x => x.out ?? '…').join(' ')
  const start = () => {
    if (spoken.split('-')[0] === to) return setErr('Choose a target language that is different from the language you speak.')
    setErr(''); sent.current = 0; setSegs([]); s.reset(); s.start()
  }
  const clear = () => { stopSpeaking(); setTalking(false); sent.current = 0; setSegs([]); setErr(''); s.reset() }
  const play = () => { if (talking) { stopSpeaking(); setTalking(false) } else { setTalking(true); speak(translated, { lang: to, onEnd: () => setTalking(false) }) } }
  const sel = (v, set, list, label, disabled) => <select aria-label={label} className="input w-auto" value={v} onChange={e => set(e.target.value)} disabled={disabled}>{list.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>

  return (
    <div className="card space-y-4">
      {!s.supported && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.</p>}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>I speak</span>{sel(spoken, setSpoken, SPOKEN, 'Spoken language', s.listening)}
        <span>Translate to</span>{sel(to, setTo, TARGETS, 'Target language')}
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />
        I consent to using my microphone. Browser speech recognition may send audio to your browser vendor’s speech service, and each finished phrase is sent to a free translation service.</label>
      <div className="flex flex-wrap items-center gap-3">
        {s.listening ? <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={s.stop}><Square size={16} /> Stop</button>
          : <button className="btn-primary" disabled={!s.supported || !consent} onClick={start}><Radio size={16} /> Start live translation</button>}
        {s.listening && <span className="flex items-center gap-2 text-sm" aria-live="polite"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />Live</span>}
      </div>
      {s.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">You said</p>
          <div className="min-h-[200px] whitespace-pre-wrap rounded-2xl border border-brand-100 bg-white p-4 text-sm">
            {s.final}<span className="text-slate-400">{s.interim}</span>{!s.final && !s.interim && <span className="text-slate-400">Your words appear here as you speak…</span>}</div></div>
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">Translation</p>
          <div aria-live="polite" className="min-h-[200px] whitespace-pre-wrap rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm">
            {translated || <span className="text-slate-400">The translation appears here, phrase by phrase.</span>}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" disabled={!translated} onClick={() => navigator.clipboard.writeText(translated)}><Copy size={16} /> Copy</button>
        <button className="btn-ghost" disabled={!translated} onClick={play}>{talking ? <><Square size={16} /> Stop</> : <><Volume2 size={16} /> Listen</>}</button>
        <button className="btn-ghost" onClick={clear}><Trash2 size={16} /> Clear</button>
      </div>
      <p className="text-xs text-slate-500">Each phrase is translated once you pause. Free translation has daily limits, and machine translation can contain mistakes. Don’t translate sensitive information.</p>
    </div>)
}
