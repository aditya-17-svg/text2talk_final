import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SpeakTranslate from '../components/SpeakTranslate';
import Logo from '../components/Logo';
import {
  Mic,
  Volume2,
  Globe,
  UserRound,
  FileText,
  History,
  Accessibility,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const PHRASE =
  "Let's make a little room for the big idea. Coffee tomorrow at 10?";
const FEATURES = [
  {
    icon: Mic,
    title: 'Real-Time Speech-to-Text',
    description: 'Watch your words appear as you speak.',
  },
  {
    icon: Volume2,
    title: 'Natural Text-to-Speech',
    description: 'Hear any text read aloud.',
  },
  {
    icon: Globe,
    title: 'Multiple Languages',
    description: 'Choose from the languages your browser supports.',
  },
  {
    icon: UserRound,
    title: 'Voice Selection',
    description: 'Pick the voice, speed, and pitch you like.',
  },
  {
    icon: FileText,
    title: 'Transcript Editing and Export',
    description: 'Edit, copy, and download in many formats.',
  },
  {
    icon: History,
    title: 'Speech History',
    description: 'Saved transcripts, searchable any time.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility-Friendly',
    description: 'Keyboard friendly with clear contrast.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Accounts',
    description: 'Your data is private to your account.',
  },
];
const STEPS = [
  {
    title: 'Choose your mode',
    description: 'Speech-to-text or text-to-speech.',
  },
  {
    title: 'Speak or type',
    description: 'Talk into your microphone or enter your text.',
  },
  {
    title: 'Use the result',
    description: 'Edit, copy, download, or play it back.',
  },
];
const USES = [
  { title: 'Students', description: 'Capture lectures and read notes aloud.' },
  {
    title: 'Professionals',
    description: 'Draft emails and meeting notes by voice.',
  },
  {
    title: 'Content creators',
    description: 'Turn ideas into scripts quickly.',
  },
  {
    title: 'Accessibility users',
    description: 'Hands-free writing and listening.',
  },
];
const FAQ = [
  {
    question: 'What is Text2Talk?',
    answer:
      'A web app that turns your speech into editable text and your text into spoken audio.',
  },
  {
    question: 'Which browsers work?',
    answer:
      'Speech-to-text works in Chrome, Edge and Safari. Text-to-speech works in most modern browsers.',
  },
  {
    question: 'What happens to my voice?',
    answer:
      'Text2Talk does not store raw audio. Browser speech recognition may send audio to your browser vendor’s service. Only transcripts you choose to save are stored.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes, Text2Talk is free during early access.',
  },
];

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];
const COMPANY_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
];

function Wave({ n = 26, color = 'bg-steel' }) {
  return (
    <div
      className="flex h-10 items-center gap-[3px]"
      aria-hidden="true"
    >
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={`bar w-[3px] rounded-full ${color}`}
          style={{
            height: `${30 + ((i * 53) % 70)}%`,
            animationDelay: `${(i % 9) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

function Demo() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setN((v) => (v > PHRASE.length + 30 ? 0 : v + 1)),
      55
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mx-auto mt-14 max-w-2xl rounded-3xl bg-steel p-4 sm:p-6">
      <div className="feature-card text-left">
        <p className="text-xs text-slate-500">Messteel to Alex</p>
        <p
          className="mt-2 min-h-[56px] text-lg font-medium"
          aria-live="off"
        >
          {PHRASE.slice(0, n)}
          <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-brand-500" />
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-full bg-night px-4 py-2 text-white">
          <Wave n={22} />
          <span className="text-xs text-white/80">Listening…</span>
          <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-steel text-ink">
            <Mic size={14} />
          </span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink/80">
        Illustrative demo. The real tool runs in your workspace.
      </p>
    </div>
  );
}

// Fades and slides content up the first time it scrolls into view.
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setShow(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      {children}
    </div>
  );
}

// Smooth accordion: the answer grows open, fades in, and the arrow turns.
function Faq({ q, a, open, onToggle, index }) {
  const id = `faq-${index}`;
  return (
    <div
      className={`border-b border-brand-100 transition-colors duration-500 motion-reduce:transition-none ${open ? 'bg-white/50' : ''}`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-4 px-2 py-5 text-left font-semibold transition-all duration-300 hover:pl-4 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <span>{q}</span>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-100 transition-all duration-500 ease-out motion-reduce:transition-none ${open ? 'rotate-180 bg-brand-500 text-white' : 'bg-white group-hover:bg-steel'}`}
          >
            <ChevronDown size={16} />
          </span>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p
            className={`px-2 pb-5 text-sm text-slate-600 transition-transform duration-500 ease-out motion-reduce:transition-none ${open ? 'translate-y-0' : '-translate-y-2'}`}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [faqOpen, setFaqOpen] = useState(-1);
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-night text-white shadow-lg shadow-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="btn-accent px-5 py-2 text-sm font-semibold"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="group rounded-full border border-white bg-white px-5 py-2 text-sm font-semibold text-brand-700 shadow-md transition duration-200 hover:-translate-y-0.5 hover:border-steel hover:bg-steel hover:text-ink hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0"
            >
              Get Started{' '}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </header>

      <section
        id="home"
        className="px-4 pb-20 pt-20 text-center"
      >
        <p className="eyebrow">Your voice. A little more possibility.</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          Your Voice. Your Words.{' '}
          <span className="text-brand-500">Your World.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
          Turn conversations into text and written words into natural speech.
          Text2Talk makes communication faster, easier, and more accessible.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="btn-primary px-7 py-3"
          >
            Start Converting
          </Link>
          <Link
            to="/login"
            className="btn-accent px-7 py-3 text-sm font-semibold shadow-md"
          >
            Try It Free
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Free to start · Works in your browser
        </p>
        <Demo />
      </section>

      <section
        id="try-it"
        className="mx-auto max-w-3xl px-4 pb-20"
      >
        <p className="eyebrow">Try it now</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
          Speak, then translate.
        </h2>
        <p className="mb-6 mt-2 text-slate-600">
          Talk into your microphone and get your words translated into another
          language.
        </p>
        <SpeakTranslate />
      </section>

      <section className="band px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow-light">Two tools, one workspace</p>
          <h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight">
            Speak it. Type it. Hear it back.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="feature-card">
              <p className="eyebrow-light">You say</p>
              <p className="mt-3">
                “Hey Maya, the first draft is ready. Can you take a look before
                Thursday?”
              </p>
              <p className="eyebrow-light mt-6">Text2Talk writes</p>
              <p className="mt-3 rounded-2xl bg-cream-200 p-4">
                Hey Maya, the first draft is ready. Can you take a look before
                Thursday?
              </p>
            </div>
            <div className="feature-card">
              <p className="eyebrow-light">You type</p>
              <p className="mt-3">
                Quick update: the new homepage is ready for review.
              </p>
              <p className="eyebrow-light mt-6">Text2Talk speaks</p>
              <div className="mt-3 flex items-center gap-4 rounded-2xl bg-night p-4 text-white">
                <Volume2 />
                <Wave n={30} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-5xl px-4 py-24"
      >
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
          Three simple steps.
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ title, description }, i) => (
            <li key={title}>
              <span className="text-sm font-bold text-brand-500">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold">{title}</h3>
              <p className="mt-1 text-slate-600">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="features"
        className="band px-4 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow-light">Features</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
            Keep the thought. Lose the friction.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="feature-card"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-200 text-brand-500">
                  <Icon size={20} />
                </span>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <p className="eyebrow">Made for your day</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
          For everything you meant to write today.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map(({ title, description }) => (
            <div
              key={title}
              className="feature-card"
            >
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="bg-night px-4 py-24 text-white"
      >
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cream-200/70">
              Privacy first
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
              Your thoughts are yours.
            </h2>
            <p className="mt-4 text-white/70">
              Text2Talk does not store raw audio. Browser recognition may use
              your browser vendor’s speech service.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              'Transcripts are saved only when you choose',
              'Each account can only access its own records',
              'Secure sign-in with email verification',
              'Delete your items any time',
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"
              >
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-brand-100"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="pricing"
        className="mx-auto max-w-4xl px-4 py-24 text-center"
      >
        <p className="eyebrow">Simple by design</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
          Free while we’re growing.
        </h2>
        <div className="mt-10 grid gap-5 text-left md:grid-cols-2">
          <div className="feature-card">
            <h3 className="font-bold">Free</h3>
            <p className="mt-2 text-4xl font-extrabold">$0</p>
            <p className="mt-2 text-sm text-slate-600">
              Speech-to-text, browser text-to-speech, and saved transcripts.
            </p>
            <Link
              to="/register"
              className="btn-primary mt-6 w-full"
            >
              Get started for free
            </Link>
          </div>
          <div className="feature-card">
            <h3 className="font-bold">
              Pro{' '}
              <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs">
                Coming soon
              </span>
            </h3>
            <p className="mt-2 text-4xl font-extrabold">
              $10
              <span className="text-base font-medium text-slate-500">
                {' '}
                / month
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Planned: cloud voices and downloadable audio. Not available yet.
            </p>
            <Link
              to="/contact"
              className="btn-primary mt-6 w-full"
            >
              Ask about Pro
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-24 md:grid-cols-2">
        <Reveal>
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
              A few things you might ask.
            </h2>
          </div>
        </Reveal>
        <div>
          {FAQ.map(({ question, answer }, i) => (
            <Reveal
              key={question}
              delay={i * 90}
            >
              <Faq
                index={i}
                q={question}
                a={answer}
                open={faqOpen === i}
                onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 text-center">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-steel px-6 py-16 text-ink">
          <div className="flex justify-center">
            <Wave
              n={32}
              color="bg-night"
            />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight">
            Your next good thought is one click away.
          </h2>
          <Link
            to="/register"
            className={`mt-8 inline-flex rounded-full bg-night px-8 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-night`}
          >
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-night to-brand-500 px-4 pb-8 pt-14 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-2 max-w-xs text-sm text-white/75">
              A little less between you and what you mean to say.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold">Product</p>
            <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="btn-accent px-4 py-2 text-sm font-medium"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold">Company</p>
            <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
              {COMPANY_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  to={href}
                  className="btn-accent px-4 py-2 text-sm font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-white/20 pt-6 text-xs text-white/70">
          © 2026 Text2Talk
        </p>
      </footer>
    </div>
  );
}
