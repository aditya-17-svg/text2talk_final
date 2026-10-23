import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Volume2, Globe, UserRound, FileText, History, Accessibility, ShieldCheck, ChevronDown, Menu, X } from 'lucide-react'

const PHRASE = "Let's make a little room for the big idea. Coffee tomorrow at 10?"
const NAV = [['Home', '#home'], ['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing'], ['About', '#about']]
const FEATURES = [[Mic, 'Real-Time Speech-to-Text', 'Watch your words appear as you speak.'], [Volume2, 'Natural Text-to-Speech', 'Hear any text read aloud.'],
  [Globe, 'Multiple Languages', 'Choose from the languages your browser supports.'], [UserRound, 'Voice Selection', 'Pick the voice, speed, and pitch you like.'],
  [FileText, 'Transcript Editing and Export', 'Edit, copy, and download as TXT.'], [History, 'Speech History', 'Saved transcripts, searchable any time.'],
  [Accessibility, 'Accessibility-Friendly', 'Keyboard friendly with clear contrast.'], [ShieldCheck, 'Secure Accounts', 'Your data is private to your account.']]
const STEPS = [['Choose your mode', 'Speech-to-text or text-to-speech.'], ['Speak or type', 'Talk into your microphone or enter your text.'], ['Use the result', 'Edit, copy, download, or play it back.']]
const USES = [['Students', 'Capture lectures and read notes aloud.'], ['Professionals', 'Draft emails and meeting notes by voice.'], ['Content creators', 'Turn ideas into scripts quickly.'], ['Accessibility users', 'Hands-free writing and listening.']]
const FAQ = [['What is Text2Talk?', 'A web app that turns your speech into editable text and your text into spoken audio.'],
  ['Which browsers work?', 'Speech-to-text works in Chrome, Edge and Safari. Text-to-speech works in most modern browsers.'],
  ['What happens to my voice?', 'Text2Talk does not store raw audio. Browser speech recognition may send audio to your browser vendor’s service. Only transcripts you choose to save are stored.'],
  ['Is it free?', 'Yes, Text2Talk is free during early access.']]

function Wave({ n = 26 }) {
  return <div className="flex h-10 items-center gap-[3px]" aria-hidden="true">{Array.from({ length: n }, (_, i) =>
    <span key={i} className="bar w-[3px] rounded-full bg-brand-500" style={{ height: `${30 + ((i * 53) % 70)}%`, animationDelay: `${(i % 9) * 90}ms` }} />)}</div>
}

function Demo() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN(v => (v > PHRASE.length + 30 ? 0 : v + 1)), 55)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="mx-auto mt-14 max-w-2xl rounded-3xl bg-brand-50 p-4 sm:p-6">
      <div className="card text-left">
        <p className="text-xs text-slate-500">Message to Alex</p>
        <p className="mt-2 min-h-[56px] text-lg font-medium" aria-live="off">{PHRASE.slice(0, n)}<span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-brand-500" /></p>
        <div className="mt-4 flex items-center gap-3 rounded-full bg-night px-4 py-2 text-white">
          <Wave n={22} /><span className="text-xs text-white/80">Listening…</span>
          <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-brand-500"><Mic size={14} /></span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Illustrative demo. The real tool runs in your workspace.</p>
    </div>)
}

function Faq({ q, a }) {
  return <details className="group border-b border-brand-100 py-4"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold">{q}<ChevronDown size={18} className="transition group-open:rotate-180" /></summary><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{a}</p></details>
}

export default function Landing() {
  const [open, setOpen] = useState(false)
  return (
    <div>
     <header className="sticky top-0 z-30 border-b border-white/10 bg-night text-white shadow-lg shadow-black/10">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <Link to="/" className="flex items-center gap-2 text-lg font-bold">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white"><Mic size={16} /></span>
      text2talk
    </Link>

    <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
      {NAV.map(([l, h]) => (
        <a key={l} href={h}
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
          {l}
        </a>
      ))}
    </nav>

    <div className="flex items-center gap-2">
      <Link to="/login"
        className="hidden rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 sm:block">
        Sign In
      </Link>
      <Link to="/register"
        className="group rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-brand-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
        Get Started <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
      <button className="rounded-full p-2 hover:bg-white/15 md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </div>
  </div>

  {open && (
    <nav className="space-y-2 border-t border-white/10 bg-night p-4 md:hidden">
      {[...NAV, ['Sign In', '/login']].map(([l, h]) => (
        <a key={l} href={h} onClick={() => setOpen(false)}
          className="block rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night">
          {l}
        </a>
      ))}
    </nav>
  )}
</header>

      <section id="home" className="px-4 pb-20 pt-20 text-center">
        <p className="eyebrow">Your voice. A little more possibility.</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">Your Voice. Your Words. <span className="text-brand-500">Your World.</span></h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">Turn conversations into text and written words into natural speech. Text2Talk makes communication faster, easier, and more accessible.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/register" className="btn-primary px-7 py-3">Start Converting</Link><Link to="/login" className="btn-ghost px-7 py-3">Try It Free</Link></div>
        <p className="mt-3 text-xs text-slate-500">Free to start · Works in your browser</p>
        <Demo />
      </section>

      <section className="bg-brand-50 px-4 py-24"><div className="mx-auto max-w-5xl">
        <p className="eyebrow">Two tools, one workspace</p>
        <h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight">Speak it. Type it. Hear it back.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="card"><p className="eyebrow">You say</p><p className="mt-3">“Hey Maya, the first draft is ready. Can you take a look before Thursday?”</p>
            <p className="eyebrow mt-6">Text2Talk writes</p><p className="mt-3 rounded-2xl bg-brand-50 p-4">Hey Maya, the first draft is ready. Can you take a look before Thursday?</p></div>
          <div className="card"><p className="eyebrow">You type</p><p className="mt-3">Quick update: the new homepage is ready for review.</p>
            <p className="eyebrow mt-6">Text2Talk speaks</p><div className="mt-3 flex items-center gap-4 rounded-2xl bg-night p-4 text-white"><Volume2 /><Wave n={30} /></div></div>
        </div>
      </div></section>

      <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-24">
        <p className="eyebrow">How it works</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">Three simple steps.</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">{STEPS.map(([t, d], i) => <li key={t}><span className="text-sm font-bold text-brand-500">0{i + 1}</span><h3 className="mt-2 text-xl font-bold">{t}</h3><p className="mt-1 text-slate-600">{d}</p></li>)}</ol>
      </section>

      <section id="features" className="bg-brand-50 px-4 py-24"><div className="mx-auto max-w-6xl">
        <p className="eyebrow">Features</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">Keep the thought. Lose the friction.</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map(([Icon, t, d]) =>
          <div key={t} className="card"><span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"><Icon size={20} /></span><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      </div></section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="eyebrow">Made for your day</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">For everything you meant to write today.</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{USES.map(([t, d]) => <div key={t} className="card"><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      </section>

      <section id="about" className="bg-night px-4 py-24 text-white"><div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-brand-100/70">Privacy first</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">Your thoughts are yours.</h2>
          <p className="mt-4 text-white/70">Text2Talk does not store raw audio. Browser recognition may use your browser vendor’s speech service.</p></div>
        <ul className="space-y-3">{['Transcripts are saved only when you choose', 'Each account can only access its own records', 'Secure sign-in with email verification', 'Delete your items any time'].map(t =>
          <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"><ShieldCheck size={18} className="shrink-0 text-brand-100" />{t}</li>)}</ul>
      </div></section>

      <section id="pricing" className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="eyebrow">Simple by design</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">Free while we’re growing.</h2>
        <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
          <div className="card"><h3 className="font-bold">Free</h3><p className="mt-2 text-4xl font-extrabold">$0</p><p className="mt-2 text-sm text-slate-600">Speech-to-text, browser text-to-speech, and saved transcripts.</p><Link to="/register" className="btn-primary mt-6 w-full">Get started free</Link></div>
          <div className="card bg-brand-50"><h3 className="font-bold">Pro <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-600">Coming soon</span></h3><p className="mt-2 text-4xl font-extrabold">$10<span className="text-base font-medium text-slate-500"> / month</span></p><p className="mt-2 text-sm text-slate-600">Planned: cloud voices and downloadable audio. Not available yet.</p><Link to="/contact" className="btn-ghost mt-6 w-full">Ask about Pro</Link></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-24 md:grid-cols-2">
        <div><p className="eyebrow">Good to know</p><h2 className="mt-3 text-4xl font-extrabold tracking-tight">A few things you might ask.</h2></div>
        <div>{FAQ.map(([q, a]) => <Faq key={q} q={q} a={a} />)}</div>
      </section>

      <section className="px-4 pb-24 text-center"><div className="mx-auto max-w-3xl rounded-[2rem] bg-brand-50 px-6 py-16">
        <div className="flex justify-center"><Wave n={32} /></div>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight">Your next good thought is one click away.</h2>
        <Link to="/register" className="btn-primary mt-8 px-8 py-3">Create your free account</Link></div></section>

      <footer className="bg-gradient-to-b from-night to-brand-500 px-4 pb-8 pt-14 text-white">
  <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
    <div className="md:col-span-2">
      <p className="text-lg font-bold">text2talk</p>
      <p className="mt-2 max-w-xs text-sm text-white/75">A little less between you and what you mean to say.</p>
    </div>

    <div>
      <p className="mb-3 text-sm font-bold">Product</p>
      <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
        {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing']].map(([l, h]) => (
          <a key={l} href={h}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
            {l}
            
          </a>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-3 text-sm font-bold">Company</p>
      <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
        {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact', '/contact']].map(([l, h]) => (
          <Link key={l} to={h}
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[#ff9a8b] hover:bg-[#ff9a8b] hover:text-night hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0">
            {l}
            
          </Link>
        ))}
      </div>
    </div>
  </div>
  <p className="mx-auto mt-10 max-w-6xl border-t border-white/20 pt-6 text-xs text-white/70">© 2026 Text2Talk</p>
</footer>
      
    </div>)
}
