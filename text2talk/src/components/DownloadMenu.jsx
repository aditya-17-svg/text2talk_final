import { useState } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { FORMATS, exportText } from '../lib/exportText'

export default function DownloadMenu({ text, title, disabled }) {
  const [open, setOpen] = useState(false); const [err, setErr] = useState('')
  const go = async f => { setOpen(false); setErr(''); try { await exportText(text, title, f) } catch { setErr('Could not create that file.') } }
  return (
    <div className="relative inline-block">
      <button type="button" className="btn-ghost" disabled={disabled} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Download size={16} /> Download <ChevronDown size={14} /></button>
      {open && (
        <div role="menu" className="absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-brand-100 bg-cream-100 p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {FORMATS.map(([f, l]) => <button key={f} role="menuitem" className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-50 dark:hover:bg-slate-800" onClick={() => go(f)}>{l}</button>)}
          <p className="px-3 py-1 text-[11px] text-slate-500">PDF supports Latin text. Use Word for other scripts.</p>
        </div>)}
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
    </div>)
}
