import { useCallback, useEffect, useRef, useState } from 'react'

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
const MESSAGES = {
  'not-allowed': 'Microphone permission was denied. Allow access in your browser settings.',
  'service-not-allowed': 'Microphone permission was denied. Allow access in your browser settings.',
  'audio-capture': 'No microphone was found.',
  network: 'Network error: speech recognition needs an internet connection.',
  'no-speech': 'No speech detected. Try again closer to the microphone.',
}

export function useSpeechRecognition(lang = 'en-US') {
  const rec = useRef(null); const want = useRef(false); const timer = useRef(null)
  const [final, setFinal] = useState(''); const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false); const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const supported = Boolean(SR)

  const tick = () => { clearInterval(timer.current); timer.current = setInterval(() => setSeconds(s => s + 1), 1000) }
  const stopTick = () => clearInterval(timer.current)

  const start = useCallback(() => {
    if (!SR) return setError('Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.')
    setError(''); want.current = true
    const r = new SR(); r.lang = lang; r.continuous = true; r.interimResults = true
    r.onresult = e => {
      let f = '', i = ''
      for (let k = e.resultIndex; k < e.results.length; k++) (e.results[k].isFinal ? (f += e.results[k][0].transcript + ' ') : (i += e.results[k][0].transcript))
      if (f) setFinal(p => p + f); setInterim(i)
    }
    r.onerror = e => { if (e.error === 'aborted') return; setError(MESSAGES[e.error] || 'Speech recognition error.'); if (e.error !== 'no-speech') { want.current = false } }
    r.onend = () => { if (want.current) { try { r.start() } catch {} } else { setListening(false); stopTick(); setInterim('') } }
    rec.current = r
    try { r.start(); setListening(true); tick() } catch { setError('Could not start recording.') }
  }, [lang])

  const stop = useCallback(() => { want.current = false; rec.current?.stop(); setListening(false); stopTick() }, [])
  const pause = stop
  const reset = useCallback(() => { setFinal(''); setInterim(''); setSeconds(0) }, [])
  useEffect(() => () => { want.current = false; rec.current?.abort(); stopTick() }, [])
  return { supported, listening, final, setFinal, interim, seconds, error, start, stop, pause, reset }
}
