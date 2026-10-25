import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Play, Pause, Square, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, canSpeak } from '../lib/speak'
import { LANGS } from '../features/stt/SpeechToText'

const MAX_MB = 10
export default function Listen() {
  const [name, setName] = useState(''); const [text, setText] = useState(''); const [audio, setAudio] = useState('')
  const [err, setErr] = useState(''); const [drag, setDrag] = useState(false); const [state, setState] = useState('idle')
  const [lang, setLang] = useState('en-US'); const [rate, setRate] = useState(1); const urlRef = useRef('')
  const { user } = useAuth(); const fileRef = useRef(null); const [msg, setMsg] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => () => { stopSpeaking(); URL.revokeObjectURL(urlRef.current) }, [])

  const load = async f => {
    setErr(''); setMsg(''); stopSpeaking(); setState('idle'); setText(''); setAudio(''); URL.revokeObjectURL(urlRef.current)
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`File is too large. Maximum is ${MAX_MB} MB.`)
    setName(f.name); fileRef.current = f
    try {
      if (f.type.startsWith('audio/')) { urlRef.current = URL.createObjectURL(f); setAudio(urlRef.current) }
      else if (/\.docx$/i.test(f.name)) {
        const mammoth = (await import('mammoth/mammoth.browser')).default
        setText((await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value)
      } else if (f.type.startsWith('text/') || /\.(txt|md|csv|json|rtf)$/i.test(f.name)) setText(await f.text())
      else setErr('Unsupported file. Use .txt, .md, .docx or an audio file (mp3, wav, m4a).')
    } catch { setErr('Could not read that file.') }
  }
  // Text files are saved to Audio History; audio files go to private storage.
  const save = async () => {
    if (!user || saving) return
    setSaving(true); setMsg('')
    try {
      if (audio) {
        const f = fileRef.current
        const path = `${user.id}/${crypto.randomUUID()}-${f.name.replace(/[^\w.\- ]+/g, '_')}`
        const up = await supabase.storage.from('audio-files').upload(path, f, { contentType: f.type })
        if (up.error) throw up.error
        const { error } = await supabase.from('audio_generations').insert({ user_id: user.id, title: name.slice(0, 200), input_text: `Audio file: ${name}`.slice(0, 500), language: lang, audio_storage_path: path })
        if (error) { await supabase.storage.from('audio-files').remove([path]); throw error }
      } else {
        if (text.length > 20000) throw new Error('This file is too long to save (limit 20,000 characters).')
        const { error } = await supabase.from('audio_generations').insert({ user_id: user.id, title: name.slice(0, 200), input_text: text, language: lang, speech_rate: rate })
        if (error) throw error
      }
      setMsg('Saved to Audio History.')
    } catch (e) { setMsg(`Could not save: ${e.message || 'unknown error'}`) } finally { setSaving(false) }
  }
  const onDrop = e => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files?.[0]) }
  const play = () => { setState('playing'); speak(text, { lang, rate, onEnd: () => setState('idle') }) }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Listen to a File</h1>
      <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-10 text-center transition ${drag ? 'border-night bg-[#8fa1c2]' : 'border-night/40 bg-[#7288ae] hover:bg-[#8fa1c2]'} text-ink`}>
        <UploadCloud className="text-ink" size={32} />
        <span className="font-semibold">Drag and drop a file here, or click to choose</span>
        <span className="text-xs text-ink/75">.txt, .md, .docx (read aloud) · mp3, wav, m4a (played) · up to {MAX_MB} MB</span>
        <input type="file" className="sr-only" accept=".txt,.md,.csv,.json,.rtf,.docx,audio/*" onChange={e => load(e.target.files?.[0])} />
      </label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {audio && <div className="card"><p className="mb-2 text-sm font-medium">{name}</p><audio controls src={audio} className="w-full" />
        <div className="mt-3 flex items-center gap-3"><button className="btn-primary" disabled={saving} onClick={save}><Save size={16} /> {saving ? 'Saving…' : 'Save file'}</button>{msg && <span role="status" className="text-sm">{msg}</span>}</div></div>}
      {text && (
        <div className="card space-y-4">
          <p className="text-sm font-medium">{name}</p>
          {!canSpeak && <p role="alert" className="text-sm text-red-600">Speech synthesis is not supported in this browser.</p>}
          <textarea aria-label="File text" className="input min-h-[200px]" value={text} onChange={e => setText(e.target.value)} />
          <div className="flex flex-wrap items-center gap-3">
            <select aria-label="Reading language" className="input w-auto" value={lang} onChange={e => setLang(e.target.value)}>{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <label className="text-sm">Speed {rate}<input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} className="ml-2 align-middle" /></label>
          </div>
          <div className="flex gap-2">
            {state === 'playing' ? <button className="btn-primary" onClick={() => { pauseSpeaking(); setState('paused') }}><Pause size={16} /> Pause</button>
              : state === 'paused' ? <button className="btn-primary" onClick={() => { resumeSpeaking(); setState('playing') }}><Play size={16} /> Resume</button>
              : <button className="btn-primary" onClick={play} disabled={!canSpeak}><Play size={16} /> Read aloud</button>}
            <button className="btn-ghost" onClick={() => { stopSpeaking(); setState('idle') }}><Square size={16} /> Stop</button>
            <button className="btn-ghost" disabled={saving || !text.trim()} onClick={save}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
          </div>
          {msg && <p role="status" className="text-sm">{msg}</p>}
          <p className="text-xs text-slate-500">Files are read in your browser. Nothing is uploaded or stored unless you press Save.</p>
        </div>)}
    </div>)
}
