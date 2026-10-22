import { useEffect, useState } from 'react'
import { Play, Pause, Square, Copy, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

export default function TextToSpeech() {
  const { user } = useAuth()
  const [text, setText] = useState(''); const [voices, setVoices] = useState([]); const [voiceName, setVoiceName] = useState('')
  const [rate, setRate] = useState(1); const [pitch, setPitch] = useState(1); const [volume, setVolume] = useState(1)
  const [state, setState] = useState('idle'); const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!synth) return
    const load = () => { const v = synth.getVoices(); setVoices(v); setVoiceName(n => n || v.find(x => x.default)?.name || v[0]?.name || '') }
    load(); synth.addEventListener('voiceschanged', load)
    return () => { synth.removeEventListener('voiceschanged', load); synth.cancel() }
  }, [])

  const play = () => {
    if (!synth || !text.trim()) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text); const v = voices.find(x => x.name === voiceName)
    if (v) { u.voice = v; u.lang = v.lang }
    Object.assign(u, { rate, pitch, volume })
    u.onend = () => setState('idle'); u.onerror = () => setState('idle')
    synth.speak(u); setState('playing')
  }
  const pause = () => { synth.pause(); setState('paused') }
  const resume = () => { synth.resume(); setState('playing') }
  const stop = () => { synth.cancel(); setState('idle') }
  const save = async () => {
    const v = voices.find(x => x.name === voiceName)
    const { error } = await supabase.from('audio_generations').insert({ user_id: user.id, title: text.trim().slice(0, 50), input_text: text, language: v?.lang || 'en-US', voice: voiceName, speech_rate: rate })
    setMsg(error ? 'Could not save.' : 'Text and voice settings saved.')
  }
  const slider = (label, val, set, min, max, step) => (
    <label className="text-sm">{label}: {val}<input type="range" className="w-full" min={min} max={max} step={step} value={val} onChange={e => set(+e.target.value)} /></label>)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Text-to-Speech</h1>
      {!synth && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Speech synthesis is not supported in this browser.</p>}
      <div className="card space-y-4">
        <textarea aria-label="Text to speak" className="input min-h-[200px]" maxLength={5000} value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text…" />
        <div className="text-right text-xs text-slate-500">{text.length} / 5000</div>
        <select aria-label="Voice" className="input" value={voiceName} onChange={e => setVoiceName(e.target.value)}>{voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}</select>
        <div className="grid gap-4 sm:grid-cols-3">{slider('Speed', rate, setRate, 0.5, 2, 0.1)}{slider('Pitch', pitch, setPitch, 0, 2, 0.1)}{slider('Volume', volume, setVolume, 0, 1, 0.1)}</div>
        <div className="flex flex-wrap gap-2">
          {state === 'playing' ? <button className="btn-primary" onClick={pause}><Pause size={16} /> Pause</button>
            : state === 'paused' ? <button className="btn-primary" onClick={resume}><Play size={16} /> Resume</button>
            : <button className="btn-primary" onClick={play} disabled={!text.trim()}><Play size={16} /> Play</button>}
          <button className="btn-ghost" onClick={stop}><Square size={16} /> Stop</button>
          <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(text)}><Copy size={16} /> Copy</button>
          <button className="btn-ghost" onClick={save} disabled={!text.trim()}><Save size={16} /> Save</button>
          <button className="btn-ghost" onClick={() => setText('')}><Trash2 size={16} /> Clear</button>
        </div>
        <p className="text-xs text-slate-500">This is browser playback only. Downloadable audio requires a cloud voice provider called from a server endpoint (not included yet).</p>
        {msg && <p role="status" className="text-sm text-green-700">{msg}</p>}
      </div>
    </div>
  )
}
