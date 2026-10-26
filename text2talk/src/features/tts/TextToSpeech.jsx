import { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Copy,
  Save,
  Trash2,
  FileAudio,
  Download,
} from 'lucide-react';
import DownloadMenu from '../../components/DownloadMenu';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../../lib/profile';
import { LANGS } from '../stt/SpeechToText';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export default function TextToSpeech() {
  const { user } = useAuth();
  const profile = useProfile();
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  const [audioLang, setAudioLang] = useState('en-US');
  const [gender, setGender] = useState('FEMALE');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioErr, setAudioErr] = useState('');

  useEffect(() => {
    if (!synth) return;
    const load = () => {
      const v = synth.getVoices();
      setVoices(v);
      setVoiceName(
        (n) => n || v.find((x) => x.default)?.name || v[0]?.name || ''
      );
    };
    load();
    synth.addEventListener('voiceschanged', load);
    return () => {
      synth.removeEventListener('voiceschanged', load);
      synth.cancel();
    };
  }, []);
  // Apply the settings saved in the user's profile
  useEffect(() => {
    if (!profile) return;
    if (profile.default_rate) setRate(Number(profile.default_rate));
    if (profile.preferred_language) setAudioLang(profile.preferred_language);
    if (
      profile.default_voice &&
      voices.some((v) => v.name === profile.default_voice)
    )
      setVoiceName(profile.default_voice);
  }, [profile, voices]);
  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    [audioUrl]
  );

  const play = () => {
    if (!synth || !text.trim()) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voiceName);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    Object.assign(u, { rate, pitch, volume });
    u.onend = () => setState('idle');
    u.onerror = () => setState('idle');
    synth.speak(u);
    setState('playing');
  };
  const save = async () => {
    const v = voices.find((x) => x.name === voiceName);
    const { error } = await supabase.from('audio_generations').insert({
      user_id: user.id,
      title: text.trim().slice(0, 50),
      input_text: text,
      language: v?.lang || 'en-US',
      voice: voiceName,
      speech_rate: rate,
    });
    setMsg(error ? 'Could not save.' : 'Text and voice settings saved.');
  };
  const makeAudio = async () => {
    setAudioErr('');
    setAudioUrl('');
    if (import.meta.env.DEV)
      return setAudioErr(
        'Audio files are created by a server function, so this works on the live site (or with vercel dev).'
      );
    setAudioBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          text,
          language: audioLang,
          gender,
          rate,
          pitch: (pitch - 1) * 10,
          volume,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.audio)
        throw new Error(d.error || 'Could not create the audio file.');
      setAudioUrl(
        URL.createObjectURL(
          new Blob([Uint8Array.from(atob(d.audio), (c) => c.charCodeAt(0))], {
            type: 'audio/mpeg',
          })
        )
      );
    } catch (e) {
      setAudioErr(e.message);
    } finally {
      setAudioBusy(false);
    }
  };
  const slider = (label, val, set, min, max, step) => (
    <label className="text-sm">
      {label}: {val}
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => set(+e.target.value)}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Text-to-Speech</h1>
      {!synth && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Speech synthesis is not supported in this browser.
        </p>
      )}
      <div className="card space-y-4">
        <textarea
          aria-label="Text to speak"
          className="input min-h-[200px]"
          maxLength={5000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text…"
        />
        <div className="text-right text-xs text-slate-500">
          {text.length} / 5000
        </div>
        <select
          aria-label="Voice"
          className="input"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
        >
          {voices.map((v) => (
            <option
              key={v.name}
              value={v.name}
            >
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        <div className="grid gap-4 sm:grid-cols-3">
          {slider('Speed', rate, setRate, 0.5, 2, 0.1)}
          {slider('Pitch', pitch, setPitch, 0, 2, 0.1)}
          {slider('Volume', volume, setVolume, 0, 1, 0.1)}
        </div>
        <div className="flex flex-wrap gap-2">
          {state === 'playing' ? (
            <button
              className="btn-primary"
              onClick={() => {
                synth.pause();
                setState('paused');
              }}
            >
              <Pause size={16} /> Pause
            </button>
          ) : state === 'paused' ? (
            <button
              className="btn-primary"
              onClick={() => {
                synth.resume();
                setState('playing');
              }}
            >
              <Play size={16} /> Resume
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={play}
              disabled={!text.trim()}
            >
              <Play size={16} /> Play
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={() => {
              synth.cancel();
              setState('idle');
            }}
          >
            <Square size={16} /> Stop
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigator.clipboard.writeText(text)}
          >
            <Copy size={16} /> Copy
          </button>
          <DownloadMenu
            text={text}
            title="speech-text"
            disabled={!text.trim()}
          />
          <button
            className="btn-ghost"
            onClick={save}
            disabled={!text.trim()}
          >
            <Save size={16} /> Save
          </button>
          <button
            className="btn-ghost"
            onClick={() => setText('')}
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
        {msg && (
          <p
            role="status"
            className="text-sm text-green-700"
          >
            {msg}
          </p>
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-bold">Download as an audio file</h2>
        <p className="text-sm text-slate-600">
          The player above plays through your browser. To keep the speech,
          create an MP3 file here. It uses your speed, pitch, and volume
          settings.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Audio language"
            className="input w-auto"
            value={audioLang}
            onChange={(e) => setAudioLang(e.target.value)}
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
          <select
            aria-label="Voice type"
            className="input w-auto"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="FEMALE">Female voice</option>
            <option value="MALE">Male voice</option>
          </select>
          <button
            className="btn-primary"
            disabled={audioBusy || !text.trim()}
            onClick={makeAudio}
          >
            <FileAudio size={16} />{' '}
            {audioBusy ? 'Creating…' : 'Create audio file'}
          </button>
        </div>
        {audioErr && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {audioErr}
          </p>
        )}
        {audioUrl && (
          <div className="space-y-3">
            <audio
              controls
              src={audioUrl}
              className="w-full"
            />
            <a
              className="btn-primary"
              href={audioUrl}
              download="text2talk-speech.mp3"
            >
              <Download size={16} /> Download MP3
            </a>
          </div>
        )}
        <p className="text-xs text-slate-500">
          The text is sent to Google Cloud Text-to-Speech to create the file.
          Don’t use sensitive information.
        </p>
      </div>
    </div>
  );
}
