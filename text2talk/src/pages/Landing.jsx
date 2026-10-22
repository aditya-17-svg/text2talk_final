import { Link } from 'react-router-dom'
import { Mic, Volume2, Globe, UserRound, FileText, History, Accessibility, ShieldCheck } from 'lucide-react'

const features = [[Mic, 'Real-Time Speech-to-Text'], [Volume2, 'Natural Text-to-Speech'], [Globe, 'Multiple Languages'], [UserRound, 'Voice Selection'],
  [FileText, 'Transcript Editing and Export'], [History, 'Speech History'], [Accessibility, 'Accessibility-Friendly Design'], [ShieldCheck, 'Secure User Accounts']]
const steps = ['Choose speech-to-text or text-to-speech.', 'Speak into the microphone or enter your text.', 'Edit, copy, download, or play the result.']
const faqs = [['Is my audio stored?', 'Text2Talk does not store raw audio. Browser speech recognition may send audio to your browser vendor’s service. Only transcripts you save are stored in your account.'],
  ['Which browsers work?', 'Speech-to-text works in Chrome, Edge and Safari. Text-to-speech works in most modern browsers.']]

export default function Landing() {
  return (
    <div>
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 font-bold"><Mic className="text-brand-600" /> Text2Talk</Link>
          <nav className="hidden gap-6 text-sm md:flex" aria-label="Primary">{['Home', 'Features', 'How It Works', 'Pricing', 'About'].map(l => <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}>{l}</a>)}</nav>
          <div className="flex gap-2"><Link to="/login" className="btn-ghost">Sign In</Link><Link to="/register" className="btn-primary">Get Started</Link></div>
        </div>
      </header>
      <section id="home" className="bg-gradient-to-b from-brand-50 to-white px-4 py-24 text-center dark:from-slate-900 dark:to-slate-950">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">Your Voice. Your Words. Your World.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">Turn conversations into text and written words into natural speech. Text2Talk makes communication faster, easier, and more accessible.</p>
        <div className="mt-8 flex justify-center gap-3"><Link to="/register" className="btn-primary px-6 py-3">Start Converting</Link><Link to="/login" className="btn-ghost px-6 py-3">Try It Free</Link></div>
        <div className="mx-auto mt-12 flex h-16 max-w-md items-end justify-center gap-1" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <span key={i} className="w-1.5 animate-pulse rounded bg-brand-500" style={{ height: `${20 + ((i * 37) % 80)}%`, animationDelay: `${i * 60}ms` }} />)}</div>
      </section>
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(([Icon, t]) => <div key={t} className="card"><Icon className="mb-3 text-brand-600" /><h3 className="font-semibold">{t}</h3></div>)}</div>
      </section>
      <section id="how-it-works" className="bg-white px-4 py-20 dark:bg-slate-900"><div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-3xl font-bold">How It Works</h2>
        <ol className="grid gap-6 md:grid-cols-3">{steps.map((s, i) => <li key={s} className="card"><span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white">{i + 1}</span><p>{s}</p></li>)}</ol></div></section>
      <section className="mx-auto max-w-4xl px-4 py-20"><h2 className="mb-6 text-center text-3xl font-bold">Built for</h2>
        <p className="text-center text-slate-600">Students · Professionals · Content creators · Accessibility users</p></section>
      <section id="about" className="mx-auto max-w-3xl px-4 pb-20"><h2 className="mb-6 text-center text-3xl font-bold">FAQ</h2>
        {faqs.map(([q, a]) => <details key={q} className="card mb-3"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-2 text-sm text-slate-600">{a}</p></details>)}</section>
      <section id="pricing" className="bg-brand-600 px-4 py-16 text-center text-white"><h2 className="text-3xl font-bold">Ready to start?</h2><Link to="/register" className="btn mt-6 bg-white text-brand-700">Create your free account</Link></section>
      <footer className="p-8 text-center text-sm text-slate-500">© Text2Talk · <a href="#">Privacy Policy</a> · <a href="#">Terms of Service</a> · <a href="#">Contact</a></footer>
    </div>)
}
