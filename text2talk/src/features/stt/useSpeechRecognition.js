import { useCallback, useEffect, useRef, useState } from 'react'

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
const MESSAGES = {
  'not-allowed': 'Microphone permission was denied. Allow access in your browser settings.',
  'service-not-allowed': 'Microphone permission was denied. Allow access in your browser settings.',
  'audio-capture': 'No microphone was found.',
  network: 'Network error: speech recognition needs an internet connection.',
}
const FATAL = ['not-allowed', 'service-not-allowed', 'audio-capture', 'network']
const RESTART_MS = 250 // short pause before re-opening the microphone session
const MAX_FAILS = 5

// Browsers end a speech session after a few seconds of silence, even in continuous mode.
// This hook keeps listening by quietly starting a fresh session each time one ends,
// and keeps any half-recognised words instead of dropping them.
export function useSpeechRecognition(lang = 'en-US') {
  const rec = useRef(null); const want = useRef(false); const active = useRef(false)
  const timer = useRef(null); const retry = useRef(null)
  const langRef = useRef(lang); langRef.current = lang
  const interimRef = useRef(''); const fails = useRef(0); const quiet = useRef(0)
  const [final, setFinal] = useState(''); const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false); const [seconds, setSeconds] = useState(0); const [error, setError] = useState('')
  const supported = Boolean(SR)

  const tick = () => { clearInterval(timer.current); timer.current = setInterval(() => setSeconds(s => s + 1), 1000) }
  const stopTick = () => clearInterval(timer.current)
  const commitInterim = () => { const t = interimRef.current.trim(); interimRef.current = ''; setInterim(''); if (t) setFinal(p => p + t + ' ') }
  const giveUp = () => { want.current = false; clearTimeout(retry.current); setListening(false); stopTick() }

  const create = useCallback(() => {
    if (!SR || !want.current) return
    if (rec.current) { const o = rec.current; o.onresult = o.onerror = o.onend = null; try { o.abort() } catch { /* already stopped */ } }
    const r = new SR()
    r.lang = langRef.current; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1
    r.onstart = () => { active.current = true }
    r.onresult = e => {
      fails.current = 0; quiet.current = 0; setError('')
      let f = '', i = ''
      for (let k = e.resultIndex; k < e.results.length; k++) { const res = e.results[k]; if (res.isFinal) f += res[0].transcript + ' '; else i += res[0].transcript }
      if (f) setFinal(p => p + f)
      interimRef.current = i; setInterim(i)
    }
    r.onerror = e => {
      if (e.error === 'aborted') return
      if (e.error === 'no-speech') { if (++quiet.current >= 3) setError('No speech detected yet. Still listening, so speak whenever you are ready.'); return }
      if (FATAL.includes(e.error)) { setError(MESSAGES[e.error]); giveUp(); return }
      fails.current++; setError('Speech recognition hiccup. Reconnecting…')
    }
    r.onend = () => {
      active.current = false; commitInterim()
      if (!want.current) { setListening(false); stopTick(); return }
      if (fails.current >= MAX_FAILS) { setError('Listening stopped after repeated errors. Press Start to try again.'); giveUp(); return }
      clearTimeout(retry.current); retry.current = setTimeout(create, RESTART_MS)
    }
    rec.current = r
    try { r.start() } catch { fails.current++; active.current = false; if (want.current) retry.current = setTimeout(create, 500) }
  }, [])

  const start = useCallback(() => {
    if (!SR) return setError('Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.')
    setError(''); fails.current = 0; quiet.current = 0
    if (want.current) return
    want.current = true; setListening(true); tick(); create()
  }, [create])

  const stop = useCallback(() => { want.current = false; clearTimeout(retry.current); try { rec.current?.stop() } catch { /* not running */ } setListening(false); stopTick() }, [])
  const reset = useCallback(() => { setFinal(''); setInterim(''); interimRef.current = ''; setSeconds(0) }, [])

  useEffect(() => {
    // Coming back to the tab: make sure listening is still alive.
    const onVisible = () => { if (document.visibilityState === 'visible' && want.current && !active.current) { clearTimeout(retry.current); retry.current = setTimeout(create, 100) } }
    document.addEventListener('visibilitychange', onVisible)
    return () => { document.removeEventListener('visibilitychange', onVisible); want.current = false; clearTimeout(retry.current); try { rec.current?.abort() } catch { /* ignore */ } stopTick() }
  }, [create])

  return { supported, listening, final, setFinal, interim, seconds, error, start, stop, pause: stop, reset }
}
