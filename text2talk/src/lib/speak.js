const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
export const canSpeak = Boolean(synth);

export function speak(text, { lang, rate = 1, onEnd } = {}) {
  if (!synth || !text?.trim()) return false;
  synth.cancel();
  const chunks = text.match(/[^.!?\n।]+[.!?।]*\s*/g) || [text];
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    if (lang) u.lang = lang;
    u.rate = rate;
    if (i === chunks.length - 1) {
      u.onend = () => onEnd?.();
      u.onerror = () => onEnd?.();
    }
    synth.speak(u);
  });
  return true;
}
export const stopSpeaking = () => synth?.cancel();
export const pauseSpeaking = () => synth?.pause();
export const resumeSpeaking = () => synth?.resume();
