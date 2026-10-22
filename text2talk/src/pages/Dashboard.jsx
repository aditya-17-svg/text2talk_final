import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mic, Volume2, FileText, Headphones, Star, Settings, LogOut, Menu, LayoutDashboard, X, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

const nav = [['/app', 'Overview', LayoutDashboard, true], ['/app/speech-to-text', 'Speech-to-Text', Mic], ['/app/text-to-speech', 'Text-to-Speech', Volume2],
  ['/app/transcripts', 'My Transcripts', FileText], ['/app/audio', 'Audio History', Headphones], ['/app/favorites', 'Favorites', Star], ['/app/settings', 'Settings', Settings]]

export function Layout() {
  const [open, setOpen] = useState(false); const navigate = useNavigate()
  const logout = async () => { await supabase.auth.signOut(); navigate('/login') }
  const links = (
    <nav className="space-y-1" aria-label="Main">
      {nav.map(([to, label, Icon, end]) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon size={18} />{label}</NavLink>))}
      <a href="mailto:support@example.com" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600">Help and Support</a>
      <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"><LogOut size={18} />Logout</button>
    </nav>)
  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between border-b bg-white p-4 md:hidden dark:bg-slate-900">
        <Link to="/app" className="font-semibold">Text2Talk</Link>
        <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white p-4 transition dark:bg-slate-900 md:static md:translate-x-0 md:border-r ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between"><span className="flex items-center gap-2 font-semibold"><Mic className="text-brand-600" />Text2Talk</span><button className="md:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
        {links}
      </aside>
      <main className="flex-1 p-4 md:p-8"><div className="mx-auto max-w-4xl"><Outlet /></div></main>
    </div>)
}

export function Overview() {
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {name} 👋</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/app/speech-to-text" className="card hover:border-brand-500"><Mic className="mb-2 text-brand-600" /><h2 className="font-semibold">Speech-to-Text</h2><p className="text-sm text-slate-500">Dictate and transcribe in real time.</p></Link>
        <Link to="/app/text-to-speech" className="card hover:border-brand-500"><Volume2 className="mb-2 text-brand-600" /><h2 className="font-semibold">Text-to-Speech</h2><p className="text-sm text-slate-500">Hear your text read aloud.</p></Link>
      </div>
    </div>)
}

export function Settings_() {
  const { user } = useAuth()
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  const toggle = () => { document.documentElement.classList.toggle('dark'); setDark(!dark) }
  return (
    <div className="space-y-4"><h1 className="text-2xl font-bold">Settings</h1>
      <div className="card space-y-3"><p className="text-sm">Email: <b>{user?.email}</b></p>
        <button className="btn-ghost" onClick={toggle}><Moon size={16} /> {dark ? 'Light' : 'Dark'} theme</button>
        <button className="btn-ghost" onClick={() => supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${location.origin}/app/settings` })}>Send password reset email</button>
        <p className="text-xs text-slate-500">Profile editing, default voice/rate and account deletion (needs a server function with the service role key) are the next things to add.</p>
      </div></div>)
}
