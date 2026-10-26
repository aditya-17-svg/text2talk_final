import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Save, Trash2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SITE_URL } from '../lib/site';
import { useAuth } from '../features/auth/AuthContext';
import { useProfile } from '../lib/profile';
import { LANGS } from '../features/stt/SpeechToText';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const Section = ({ title, children }) => (
  <section className="card space-y-4">
    <h2 className="text-lg font-bold">{title}</h2>
    {children}
  </section>
);

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = useProfile();
  const [f, setF] = useState(null);
  const [voices, setVoices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [mail, setMail] = useState('');
  const [confirm, setConfirm] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState('');

  useEffect(() => {
    if (!profile) return;
    setF({
      full_name: profile.full_name ?? user.user_metadata?.full_name ?? '',
      preferred_language: profile.preferred_language || 'en-US',
      default_rate: Number(profile.default_rate) || 1,
      default_voice: profile.default_voice || '',
      notify_updates: profile.notify_updates ?? true,
      notify_tips: profile.notify_tips ?? false,
    });
  }, [profile]);
  useEffect(() => {
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg('');
    const name = f.full_name.trim().slice(0, 120);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...f,
      full_name: name,
      default_voice: f.default_voice || null,
    });
    if (!error) await supabase.auth.updateUser({ data: { full_name: name } });
    setMsg(error ? `Could not save: ${error.message}` : 'Settings saved.');
    setBusy(false);
  };
  const reset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${SITE_URL}/app/settings`,
    });
    setMail(
      error
        ? 'Could not send the email. Try again later.'
        : `A reset link was sent to ${user.email}.`
    );
  };
  const remove = async () => {
    setDelBusy(true);
    setDelErr('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const r = await fetch('/api/delete_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
      if (!r.ok)
        throw new Error(
          (await r.json().catch(() => ({}))).error ||
            'Could not delete the account.'
        );
      await supabase.auth.signOut({ scope: 'local' });
      navigate('/');
    } catch (e) {
      setDelErr(e.message);
      setDelBusy(false);
    }
  };
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDark(!dark);
  };

  if (!f)
    return <div className="h-40 animate-pulse rounded-3xl bg-brand-100" />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const check = (k) => (e) => setF({ ...f, [k]: e.target.checked });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Section title="Profile">
        <label className="block text-sm font-medium">
          Full name
          <input
            className="input mt-1"
            maxLength={120}
            value={f.full_name}
            onChange={set('full_name')}
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            className="input mt-1 opacity-70"
            value={user.email}
            readOnly
          />
        </label>
      </Section>
      <Section title="Speech preferences">
        <label className="block text-sm font-medium">
          Preferred language
          <select
            className="input mt-1"
            value={f.preferred_language}
            onChange={set('preferred_language')}
          >
            {LANGS.map(([c, n]) => (
              <option
                key={c}
                value={c}
              >
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Default speech speed: {f.default_rate}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            className="mt-1 w-full"
            value={f.default_rate}
            onChange={(e) => setF({ ...f, default_rate: +e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Default voice
          <select
            className="input mt-1"
            value={f.default_voice}
            onChange={set('default_voice')}
          >
            <option value="">Browser default</option>
            {voices.map((v) => (
              <option
                key={v.name}
                value={v.name}
              >
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-500">
          Voices come from your device, so a saved voice only applies where it
          is installed.
        </p>
      </Section>
      <Section title="Notifications">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={f.notify_updates}
            onChange={check('notify_updates')}
          />{' '}
          Email me about important product updates
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={f.notify_tips}
            onChange={check('notify_tips')}
          />{' '}
          Email me tips and new features
        </label>
        <p className="text-xs text-slate-500">
          Your choices are saved now and will be used when email updates are
          introduced.
        </p>
      </Section>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn-primary"
          disabled={busy}
          onClick={save}
        >
          <Save size={16} /> {busy ? 'Saving…' : 'Save settings'}
        </button>
        {msg && (
          <span
            role="status"
            className="text-sm"
          >
            {msg}
          </span>
        )}
      </div>
      <Section title="Appearance and security">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-ghost"
            onClick={toggleTheme}
          >
            <Moon size={16} /> {dark ? 'Light' : 'Dark'} theme
          </button>
          <button
            className="btn-ghost"
            onClick={reset}
          >
            <KeyRound size={16} /> Send password reset email
          </button>
        </div>
        {mail && (
          <p
            role="status"
            className="text-sm"
          >
            {mail}
          </p>
        )}
      </Section>
      <Section title="Delete account">
        <p className="text-sm text-slate-600">
          This permanently deletes your account, saved transcripts, audio items,
          and uploaded audio files. It cannot be undone.
        </p>
        <label className="block text-sm font-medium">
          Type <b>DELETE</b> to confirm
          <input
            className="input mt-1"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button
          className="btn-primary bg-red-600 hover:bg-red-700"
          disabled={confirm !== 'DELETE' || delBusy}
          onClick={remove}
        >
          <Trash2 size={16} /> {delBusy ? 'Deleting…' : 'Delete my account'}
        </button>
        {delErr && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {delErr}
          </p>
        )}
      </Section>
    </div>
  );
}
