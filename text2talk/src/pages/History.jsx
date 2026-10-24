import { useEffect, useState } from 'react'
import { Star, Trash2, Volume2, Square } from 'lucide-react'
import { supabase } from '../lib/supabase'
import DownloadMenu from '../components/DownloadMenu'
import { speak, stopSpeaking, canSpeak } from '../lib/speak'

export default function History({ table, field, title, favoritesOnly = false }) {
  const [rows, setRows] = useState(null); const [q, setQ] = useState(''); const [err, setErr] = useState(''); const [playing, setPlaying] = useState(null)
  const load = async () => {
    let query = supabase.from(table).select('*').order('created_at', { ascending: false })
    if (favoritesOnly) query = query.eq('is_favorite', true)
    const { data, error } = await query; if (error) setErr('Could not load items.'); setRows(data || [])
  }
  useEffect(() => { load(); return () => stopSpeaking() }, [table])
  const fav = async r => { await supabase.from(table).update({ is_favorite: !r.is_favorite }).eq('id', r.id); load() }
  const rename = async (r, t) => { if (t.trim() && t !== r.title) { await supabase.from(table).update({ title: t.trim() }).eq('id', r.id); load() } }
  const del = async r => { if (confirm('Delete this item permanently?')) { await supabase.from(table).delete().eq('id', r.id); load() } }
  const toggle = r => {
    if (playing === r.id) { stopSpeaking(); setPlaying(null); return }
    setPlaying(r.id); speak(r[field], { lang: r.language, rate: Number(r.speech_rate) || 1, onEnd: () => setPlaying(p => (p === r.id ? null : p)) })
  }
  const shown = (rows || []).filter(r => (r.title + r[field]).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <input className="input" placeholder="Search…" aria-label="Search" value={q} onChange={e => setQ(e.target.value)} />
      {err && <p role="alert" className="text-red-600">{err}</p>}
      {rows === null ? <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        : shown.length === 0 ? <p className="card text-center text-slate-500">Nothing here yet.</p>
        : shown.map(r => (
          <div key={r.id} className="card space-y-3">
            <div className="flex items-center gap-2">
              <input className="flex-1 bg-transparent font-medium" defaultValue={r.title} aria-label="Title" onBlur={e => rename(r, e.target.value)} />
              <button aria-label="Favorite" onClick={() => fav(r)}><Star size={18} className={r.is_favorite ? 'fill-yellow-400 text-yellow-500' : 'text-slate-400'} /></button>
              <button aria-label="Delete" onClick={() => del(r)}><Trash2 size={18} className="text-slate-400" /></button>
            </div>
            <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{r[field]}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-ghost" disabled={!canSpeak} onClick={() => toggle(r)}>{playing === r.id ? <><Square size={16} /> Stop</> : <><Volume2 size={16} /> Listen</>}</button>
              <DownloadMenu text={r[field]} title={r.title} />
              <span className="ml-auto text-xs text-slate-400">{new Date(r.created_at).toLocaleString()} · {r.language}</span>
            </div>
          </div>))}
    </div>)
}
