import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Mic,
  Volume2,
  FileText,
  Headphones,
  Star,
  Settings,
  LogOut,
  Menu,
  LayoutDashboard,
  X,
  Moon,
  Languages,
  Upload,
  LifeBuoy,
  Radio,
} from 'lucide-react';
import Logo from '../components/Logo';
import { SITE_URL } from '../lib/site';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';

const nav = [
  { path: '/app', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/app/speech-to-text', label: 'Speech-to-Text', icon: Mic },
  { path: '/app/text-to-speech', label: 'Text-to-Speech', icon: Volume2 },
  { path: '/app/translate', label: 'Translate', icon: Languages },
  { path: '/app/live', label: 'Live Translation', icon: Radio },
  { path: '/app/listen', label: 'Listen to File', icon: Upload },
  { path: '/app/transcripts', label: 'My Transcripts', icon: FileText },
  { path: '/app/audio', label: 'Audio History', icon: Headphones },
  { path: '/app/favorites', label: 'Favorites', icon: Star },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

const widgets = [
  {
    path: '/app/speech-to-text',
    title: 'Speech-to-Text',
    description: 'Dictate and transcribe in real time.',
    icon: Mic,
  },
  {
    path: '/app/text-to-speech',
    title: 'Text-to-Speech',
    description: 'Hear your text read aloud.',
    icon: Volume2,
  },
  {
    path: '/app/translate',
    title: 'Language Conversion',
    description: 'Translate text from one language to another.',
    icon: Languages,
  },
  {
    path: '/app/live',
    title: 'Live Translation',
    description: 'Speak and watch the translation appear live.',
    icon: Radio,
  },
];

const sidebarLogo = {
  to: '/app',
  box: '#111844',
  glyph: '#eae0cf',
  bars: '#7288ae',
  two: 'text-white',
  textClass: 'text-ink',
};

export function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setOpen(false);
  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  const links = (
    <nav
      className="space-y-2"
      aria-label="Main"
    >
      {nav.map(({ path, label, icon: Icon, exact }) => (
        <NavLink
          key={path}
          to={path}
          end={exact}
          onClick={closeMenu}
          className={({ isActive }) =>
            isActive ? 'nav-pill-active' : 'nav-pill'
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <Link
        to="/contact"
        onClick={closeMenu}
        className="nav-pill"
      >
        <LifeBuoy size={18} />
        Help and Support
      </Link>
      <button
        onClick={logout}
        className="nav-pill"
      >
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between border-b border-[#8fa1c2] bg-[#7288ae] p-4 text-ink md:hidden">
        <Logo {...sidebarLogo} />
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </header>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMenu}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-[#7288ae] p-4 text-ink transition md:static md:translate-x-0 md:border-r md:border-[#8fa1c2] ${open ? '' : '-translate-x-full'}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Logo {...sidebarLogo} />
          <button
            className="md:hidden"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X />
          </button>
        </div>
        {links}
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function Overview() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there';
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {name} 👋</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {widgets.map(({ path, title, description, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="widget-card"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/50">
              <Icon size={20} />
            </span>
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-sm text-ink/75">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Settings_() {
  const { user } = useAuth();
  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark')
  );
  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="card space-y-3">
        <p className="text-sm">
          Email: <b>{user?.email}</b>
        </p>
        <button
          className="btn-ghost"
          onClick={toggle}
        >
          <Moon size={16} /> {dark ? 'Light' : 'Dark'} theme
        </button>
        <button
          className="btn-ghost"
          onClick={() =>
            supabase.auth.resetPasswordForEmail(user.email, {
              redirectTo: `${SITE_URL}/app/settings`,
            })
          }
        >
          Send password reset email
        </button>
        <p className="text-xs text-slate-500">
          Profile editing, default voice/rate and account deletion (needs a
          server function with the service role key) are the next things to add.
        </p>
      </div>
    </div>
  );
}
