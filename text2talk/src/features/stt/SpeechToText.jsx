import { useState } from 'react'
import { Mic, Square, Copy, Download, Save, Trash2 } from 'lucide-react'
import { useSpeechRecognition } from './useSpeechRecognition'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'

export const LANGS = [['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['en-IN', 'English (India)'], ['hi-IN', 'Hindi'], ['es-ES', 'Spanish'], ['fr-FR', 'French'], ['de-DE', 'German']]

export default function SpeechToText() {
  const { user } = useAuth()
  const [lang, setLang] = useState('en-US'); const [consent, setConsent] = useState(false); const [msg, setMsg] = useState('')
  const s = useSpeechRecognition(lang)
  const mm = String(Math.floor(s.seconds / 60)).padStart(2, '0'), ss = String(s.seconds % 60).padStart(2, '0')

  const save = async () => {
    if (!s.final.trim()) return
    const { error } = await supabase.from('transcripts').insert({ user_id: user.id, title: s.final.trim().slice(0, 50), content: s.final, language: lang, duration_seconds: s.seconds })
    setMsg(error ? 'Could not save the transcript.' : 'Transcript saved.')
  }
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s.final], { type: 'text/plain' })); a.download = 'transcript.txt'; a.click() }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Speech-to-Text</h1>
      {!s.supported && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.</p>}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Language" className="input w-auto" value={lang} onChange={e => setLang(e.target.value)} disabled={s.listening}>{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          {s.listening ? <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={s.stop}><Square size={16} /> Stop</button>
            : <button className="btn-primary" disabled={!s.supported || !consent} onClick={s.start}><Mic size={16} /> Start Recording</button>}
          <span className="flex items-center gap-2 text-sm tabular-nums" aria-live="polite">{s.listening && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />}{mm}:{ss}</span>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />
          I consent to using my microphone. In most browsers, audio is sent to the browser vendor's speech service for recognition. Only the text you choose to save is stored in your account.</label>
        {s.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
        <textarea aria-label="Transcript" className="input min-h-[240px]" placeholder="Your transcript will appear here…" value={s.final + s.interim} onChange={e => s.setFinal(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(s.final)}><Copy size={16} /> Copy</button>
          <button className="btn-ghost" onClick={download} disabled={!s.final}><Download size={16} /> TXT</button>
          <button className="btn-primary" onClick={save} disabled={!s.final}><Save size={16} /> Save</button>
          <button className="btn-ghost" onClick={s.reset}><Trash2 size={16} /> Clear</button>
        </div>
        {msg && <p role="status" className="text-sm text-green-700">{msg}</p>}
      </div>
    </div>
  )
}
