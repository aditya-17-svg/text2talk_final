import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Play, Pause, Square } from 'lucide-react'
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, canSpeak } from '../lib/speak'
import { LANGS } from '../features/stt/SpeechToText'

const MAX_MB = 10
export default function Listen() {
  const [name, setName] = useState(''); const [text, setText] = useState(''); const [audio, setAudio] = useState('')
  const [err, setErr] = useState(''); const [drag, setDrag] = useState(false); const [state, setState] = useState('idle')
  const [lang, setLang] = useState('en-US'); const [rate, setRate] = useState(1); const urlRef = useRef('')
  useEffect(() => () => { stopSpeaking(); URL.revokeObjectURL(urlRef.current) }, [])

  const load = async f => {
    setErr(''); stopSpeaking(); setState('idle'); setText(''); setAudio(''); URL.revokeObjectURL(urlRef.current)
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) return setErr(`File is too large. Maximum is ${MAX_MB} MB.`)
    setName(f.name)
    try {
      if (f.type.startsWith('audio/')) { urlRef.current = URL.createObjectURL(f); setAudio(urlRef.current) }
      else if (/\.docx$/i.test(f.name)) {
        const mammoth = (await import('mammoth/mammoth.browser')).default
        setText((await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() })).value)
      } else if (f.type.startsWith('text/') || /\.(txt|md|csv|json|rtf)$/i.test(f.name)) setText(await f.text())
      else setErr('Unsupported file. Use .txt, .md, .docx or an audio file (mp3, wav, m4a).')
    } catch { setErr('Could not read that file.') }
  }
  const onDrop = e => { e.preventDefault(); setDrag(false); load(e.dataTransfer.files?.[0]) }
  const play = () => { setState('playing'); speak(text, { lang, rate, onEnd: () => setState('idle') }) }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Listen to a File</h1>
      <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-10 text-center transition ${drag ? 'border-night bg-[#9d8868]' : 'border-night/40 bg-[#b29d7e] hover:bg-[#a69172]'} text-ink`}>
        <UploadCloud className="text-ink" size={32} />
        <span className="font-semibold">Drag and drop a file here, or click to choose</span>
        <span className="text-xs text-ink/75">.txt, .md, .docx (read aloud) · mp3, wav, m4a (played) · up to {MAX_MB} MB</span>
        <input type="file" className="sr-only" accept=".txt,.md,.csv,.json,.rtf,.docx,audio/*" onChange={e => load(e.target.files?.[0])} />
      </label>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {audio && <div className="card"><p className="mb-2 text-sm font-medium">{name}</p><audio controls src={audio} className="w-full" /></div>}
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
          </div>
          <p className="text-xs text-slate-500">Files are read in your browser and are not uploaded or stored.</p>
        </div>)}
    </div>)
}
