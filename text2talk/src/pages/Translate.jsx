import { useState } from 'react'
import { ArrowLeftRight, Copy, Languages, Square, Volume2 } from 'lucide-react'
import DownloadMenu from '../components/DownloadMenu'
import { speak, stopSpeaking } from '../lib/speak'

const LANGS = [['en', 'English'], ['hi', 'Hindi'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['it', 'Italian'], ['pt', 'Portuguese'], ['ja', 'Japanese'],
  ['ko', 'Korean'], ['zh-CN', 'Chinese (Simplified)'], ['ar', 'Arabic'], ['ru', 'Russian'], ['bn', 'Bengali'], ['ta', 'Tamil'], ['te', 'Telugu'], ['mr', 'Marathi'], ['gu', 'Gujarati'], ['ur', 'Urdu']]
const MAX = 5000

// The free API accepts about 500 bytes per request, so text is sent in sentence-sized chunks.
function chunk(text) {
  const enc = new TextEncoder(); const out = []; let buf = ''
  for (const s of text.match(/[^.!?\n।]+[.!?।]*\s*/g) || [text]) {
    if (enc.encode(buf + s).length > 450 && buf) { out.push(buf); buf = '' }
    if (enc.encode(s).length > 450) { for (let i = 0; i < s.length; i += 120) out.push(s.slice(i, i + 120)) } else buf += s
  }
  if (buf) out.push(buf); return out
}
async function translate(text, from, to) {
  const parts = []
  for (const c of chunk(text)) {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(c)}&langpair=${from}|${to}`)
    if (!r.ok) throw new Error('The translation service is unavailable. Try again later.')
    const d = await r.json(); const t = d?.responseData?.translatedText || ''
    if (/MYMEMORY WARNING/i.test(t) || d.responseStatus === 429) throw new Error('Daily free translation limit reached. Try again tomorrow.')
    if (d.responseStatus !== 200) throw new Error('Could not translate this text.')
    parts.push(t)
  }
  return parts.join(' ')
}

export default function Translate() {
  const [from, setFrom] = useState('en'); const [to, setTo] = useState('hi')
  const [src, setSrc] = useState(''); const [out, setOut] = useState('')
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [talking, setTalking] = useState(false)
  const run = async () => {
    setErr(''); setOut('')
    if (from === to) return setErr('Choose two different languages.')
    setBusy(true)
    try { setOut(await translate(src.trim(), from, to)) } catch (e) { setErr(e.message || 'Translation failed. Check your connection.') } finally { setBusy(false) }
  }
  const swap = () => { setFrom(to); setTo(from); setSrc(out || src); setOut('') }
  const play = () => { if (talking) { stopSpeaking(); setTalking(false) } else { setTalking(true); speak(out, { lang: to, onEnd: () => setTalking(false) }) } }
  const sel = (v, set, label) => <select aria-label={label} className="input" value={v} onChange={e => set(e.target.value)}>{LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Translate</h1>
      <div className="card space-y-4">
        <div className="flex items-center gap-2">{sel(from, setFrom, 'From language')}<button className="btn-ghost shrink-0 px-3" aria-label="Swap languages" onClick={swap}><ArrowLeftRight size={16} /></button>{sel(to, setTo, 'To language')}</div>
        <textarea aria-label="Text to translate" className="input min-h-[160px]" maxLength={MAX} value={src} onChange={e => setSrc(e.target.value)} placeholder="Type or paste text to translate…" />
        <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{src.length} / {MAX}</span><button className="btn-primary" disabled={busy || !src.trim()} onClick={run}><Languages size={16} /> {busy ? 'Translating…' : 'Translate'}</button></div>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        {out && <>
          <textarea aria-label="Translation" readOnly className="input min-h-[160px] bg-brand-50" value={out} />
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(out)}><Copy size={16} /> Copy</button>
            <button className="btn-ghost" onClick={play}>{talking ? <><Square size={16} /> Stop</> : <><Volume2 size={16} /> Listen</>}</button>
            <DownloadMenu text={out} title="translation" />
          </div></>}
        <p className="text-xs text-slate-500">Text you translate is sent to the free MyMemory translation service. Don’t translate sensitive information. Machine translation can contain mistakes.</p>
      </div>
    </div>)
}
