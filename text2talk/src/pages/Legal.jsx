import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, ArrowLeft } from 'lucide-react'

// TODO: replace with your real support address
export const CONTACT_EMAIL = 'hello@your-domain.com'
const UPDATED = 'October 23, 2026'

function Page({ title, children }) {
  return (
    <div className="min-h-screen bg-brand-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-600"><ArrowLeft size={16} /> Back to home</Link>
        <article className="card space-y-5 p-8">
          <p className="flex items-center gap-2 font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white"><Mic size={16} /></span>text2talk</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {children}
        </article>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link> · <Link to="/contact">Contact</Link>
        </p>
      </div>
    </div>)
}
const H = ({ children }) => <h2 className="pt-2 text-lg font-bold">{children}</h2>
const P = ({ children }) => <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</p>
const L = ({ items }) => <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{items.map(i => <li key={i}>{i}</li>)}</ul>

export function Privacy() {
  return (
    <Page title="Privacy Policy">
      <P>Last updated: {UPDATED}. This policy explains what Text2Talk collects and how it is used.</P>
      <H>What we collect</H>
      <L items={['Account details: your name, email address, and a securely hashed password (handled by our authentication provider, Supabase).',
        'Content you choose to save: transcripts, text you save for text-to-speech, and related settings such as language, voice, and speed.',
        'Basic technical data processed by our hosting provider (Vercel) and database provider (Supabase), such as IP address and request logs.']} />
      <H>Your voice and audio</H>
      <P>Text2Talk does not record or store your raw audio. Speech-to-text uses your browser’s built-in speech recognition. Depending on your browser, your audio may be sent to the browser vendor’s speech service (for example Google for Chrome) to produce text. That processing is governed by the vendor’s own privacy policy. We ask for your consent before you use the microphone.</P>
      <H>Translation</H>
      <P>When you use the Translate tool, the text you enter is sent to a third-party translation service (MyMemory) and the translation is returned to you. Text2Talk does not store translated text unless you save it elsewhere. Please do not translate sensitive information.</P>
      <H>How we use data</H>
      <L items={['To run the service: sign you in and show your saved items.', 'To keep your account secure and prevent abuse.', 'To reply to your messages.']} />
      <P>We do not sell your personal data and we do not show ads.</P>
      <H>Storage and security</H>
      <P>Saved items are stored in a Supabase database with row-level security, so each account can only read and change its own records. Your sign-in session is stored in your browser by the authentication library. No system is perfectly secure, but we use reasonable safeguards.</P>
      <H>Your choices</H>
      <L items={['You can edit or delete saved transcripts and audio items at any time in the app.', `To delete your account or request a copy of your data, email ${CONTACT_EMAIL}.`, 'You can block microphone access in your browser settings at any time.']} />
      <H>Changes</H>
      <P>We may update this policy and will change the date above when we do.</P>
    </Page>)
}

export function Terms() {
  return (
    <Page title="Terms of Service">
      <P>Last updated: {UPDATED}. By creating an account or using Text2Talk, you agree to these terms.</P>
      <H>The service</H>
      <P>Text2Talk lets you convert speech to text and text to speech in your browser. Features depend on your browser and device, and recognition accuracy is not guaranteed. The service is currently free during early access, and we may add paid plans later.</P>
      <H>Your account</H>
      <L items={['Provide accurate information and keep your password confidential.', 'You are responsible for activity under your account.', 'You must be old enough to enter a binding agreement where you live.']} />
      <H>Acceptable use</H>
      <L items={['Do not use Text2Talk for unlawful, harmful, or abusive purposes.', 'Do not record or transcribe other people without any consent the law requires.', 'Do not attempt to disrupt, overload, or gain unauthorized access to the service.']} />
      <H>Your content</H>
      <P>You keep ownership of the text and transcripts you create. You give us permission to store and display them to you so the service can work. You are responsible for what you save.</P>
      <H>Paid plans</H>
      <P>If paid plans such as Pro are introduced, pricing, billing, and cancellation terms will be shown before you buy.</P>
      <H>Availability and liability</H>
      <P>The service is provided “as is” without warranties. We may change, suspend, or end features at any time. To the extent permitted by law, we are not liable for indirect or consequential losses, or for loss of data, so please keep your own copies of important transcripts.</P>
      <H>Termination</H>
      <P>You may stop using the service at any time. We may suspend accounts that break these terms.</P>
      <H>Contact</H>
      <P>Questions about these terms: {CONTACT_EMAIL}.</P>
      <P><i>This page is a general template and not legal advice. Have it reviewed by a qualified lawyer before launching commercially.</i></P>
    </Page>)
}

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = e => {
    e.preventDefault()
    const body = `${f.message}\n\nFrom: ${f.name} <${f.email}>`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Text2Talk message from ' + f.name)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }
  return (
    <Page title="Contact us">
      <P>Questions, feedback, or interest in Pro? Send us a message and we’ll reply by email. You can also write to {CONTACT_EMAIL} directly.</P>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Name<input required className="input mt-1" value={f.name} onChange={set('name')} /></label>
        <label className="block text-sm font-medium">Email<input required type="email" className="input mt-1" value={f.email} onChange={set('email')} /></label>
        <label className="block text-sm font-medium">Message<textarea required minLength={10} className="input mt-1 min-h-[140px]" value={f.message} onChange={set('message')} /></label>
        <button className="btn-primary">Send message</button>
        {sent && <p role="status" className="text-sm text-slate-600">Your email app should open with the message ready to send. If it didn’t, email {CONTACT_EMAIL}.</p>}
      </form>
    </Page>)
}
