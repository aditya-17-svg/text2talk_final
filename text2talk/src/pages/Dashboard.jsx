import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Mic, Volume2, FileText, Headphones, Star, Settings, LogOut, Menu, LayoutDashboard, X, Moon, Languages, Upload, LifeBuoy } from 'lucide-react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

const nav = [['/app', 'Overview', LayoutDashboard, true], ['/app/speech-to-text', 'Speech-to-Text', Mic], ['/app/text-to-speech', 'Text-to-Speech', Volume2],
  ['/app/translate', 'Translate', Languages], ['/app/listen', 'Listen to File', Upload],
  ['/app/transcripts', 'My Transcripts', FileText], ['/app/audio', 'Audio History', Headphones], ['/app/favorites', 'Favorites', Star], ['/app/settings', 'Settings', Settings]]

// Sidebar buttons: soft white pills on peach, dark purple for the current page
const pill = 'flex w-full items-center gap-3 rounded-full border border-white/40 bg-white/30 px-4 py-2.5 text-sm font-medium text-ink transition duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night active:translate-y-0'
const pillActive = 'flex w-full items-center gap-3 rounded-full border border-night bg-night px-4 py-2.5 text-sm font-semibold text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night'

export function Layout() {
  const [open, setOpen] = useState(false); const navigate = useNavigate()
  const logout = async () => { await supabase.auth.signOut(); navigate('/login') }
  const links = (
    <nav className="space-y-2" aria-label="Main">
      {nav.map(([to, label, Icon, end]) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? pillActive : pill)}><Icon size={18} />{label}</NavLink>))}
      <Link to="/contact" onClick={() => setOpen(false)} className={pill}><LifeBuoy size={18} />Help and Support</Link>
      <button onClick={logout} className={pill}><LogOut size={18} />Logout</button>
    </nav>)
  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between border-b border-[#8fa1c2] bg-[#7288ae] p-4 text-ink md:hidden">
        <Logo to="/app" box="#111844" glyph="#eae0cf" bars="#7288ae" two="text-white" textClass="text-ink" />
        <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-[#7288ae] p-4 text-ink transition md:static md:translate-x-0 md:border-r md:border-[#8fa1c2] ${open ? '' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between"><Logo to="/app" box="#111844" glyph="#eae0cf" bars="#7288ae" two="text-white" textClass="text-ink" /><button className="md:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
        {links}
      </aside>
      <main className="flex-1 p-4 md:p-8"><div className="mx-auto max-w-5xl"><Outlet /></div></main>
    </div>)
}

const widgets = [['/app/speech-to-text', 'Speech-to-Text', 'Dictate and transcribe in real time.', Mic], ['/app/text-to-speech', 'Text-to-Speech', 'Hear your text read aloud.', Volume2],
  ['/app/translate', 'Language Conversion', 'Translate text from one language to another.', Languages]]

export function Overview() {
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {name} 👋</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map(([to, t, d, Icon]) => (
          <Link key={to} to={to} className="rounded-3xl border border-[#7288ae] bg-[#7288ae] p-6 text-ink shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#8fa1c2] hover:bg-[#8fa1c2] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50"><Icon size={20} /></span>
            <h2 className="font-bold">{t}</h2><p className="mt-1 text-sm text-ink/75">{d}</p>
          </Link>))}
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
