# Talk2Text | Premium AI Transcription & Speech-to-Talk Studio

A modern, responsive, client-side web application for **Speech-to-Text** (live voice transcription & audio file transcribing) and **Speech-to-Talk** (AI voice reading aloud & speech synthesis) with smart NLP editing tools.

---

## ✨ Key Features

1. **🎙️ Real-time Speech-to-Text (STT) Studio**
   - High-accuracy real-time speech recognition via the Web Speech API.
   - Live streaming interim preview words with visual distinction.
   - Real-time Audio Frequency Visualizer using HTML5 Canvas & Web Audio API (`AnalyserNode`).
   - Live metrics: Elapsed timer, word count, character count, and Words-Per-Minute (WPM).
   - Audio capture with `MediaRecorder` so you can listen back to your actual voice recordings.

2. **🔊 Speech-to-Talk (Text-to-Speech / Talk Back)**
   - Speak out any transcript or custom written text out loud via `speechSynthesis`.
   - Choose from system voices with customizable speech speed (0.5x to 2.0x) and pitch.
   - Quick one-click "Talk / Listen" button directly from the recent transcriptions list with animated wave bars.

3. **📁 Audio File Upload & Transcriber**
   - Drag-and-drop or browse audio files (`.mp3`, `.wav`, `.m4a`, `.webm`, `.ogg`).
   - Integrated HTML5 audio playback player with waveform animation.

4. **✨ Smart AI Transcription Tools (Client-Side)**
   - **AI Executive Summary**: Generates concise bullet-point summaries of long speeches.
   - **Action Items Extractor**: Automatically detects tasks, deadlines, and follow-ups.
   - **Grammar & Disfluency Polish**: Removes filler words (`um`, `uh`, `like`, `you know`), fixes capitalization and sentence punctuation.
   - **Multilingual Translation Preview**: Supports multi-language translation.

5. **💾 Persistent Storage & Export Suite**
   - Local storage persistence (`localStorage`) — recordings, transcripts, and preferences are preserved across browser refreshes.
   - Export individual notes as `.txt`, `.json`, or `.srt` (timestamped subtitles).
   - Backup all saved transcriptions as a single JSON file.

6. **🎨 Modern UI & Dark Mode**
   - Minimalist SaaS design with Inter typography and Remix Icons.
   - Instant Light / Dark mode toggle with persistent preferences.
   - Fully responsive on mobile, tablet, and desktop with a slide-out drawer menu.

---

## 🚀 How to Run

### Method 1: Direct File Opening
Double-click `index.html` or open it directly in Google Chrome or Microsoft Edge.

### Method 2: Local HTTP Server (Recommended)
Open a terminal in this folder and start Python's built-in HTTP server:
```bash
python -m http.server 8000
```
Then navigate to:
```
http://localhost:8000
```

---

## 🌐 Browser Compatibility

| Feature | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| **Speech-to-Text (Mic)** | ✅ Supported | ✅ Supported | ⚠️ Requires flags / fallback |
| **Speech-to-Talk (TTS)** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Audio File Playback** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Canvas Visualizer** | ✅ Supported | ✅ Supported | ✅ Supported |

*Google Chrome or Microsoft Edge is recommended for the best real-time microphone dictation experience.*
The 6 Technical Stages of the Speech-to-Text Flow

When presenting, break the flow down into these 6 chronological stages:

Stage 1: Audio Ingestion & Capture
What happens: The system captures raw acoustic analog pressure waves from the user's microphone or uploaded audio container (.mp3, .wav, .m4a).
Implementation: Uses the browser's navigator.mediaDevices.getUserMedia({ audio: true }) API and routes the stream concurrently into a recording pipeline (MediaRecorder) and an audio analysis pipeline.

Stage 2: Signal Preprocessing & Feature Extraction
What happens: Raw continuous waveforms cannot be processed by neural networks directly.
Sampling & Quantization: Converts analog sound into discrete digital samples (typically 16 kHz, 16-bit PCM).
Framing & Windowing: Splits audio into short 20–30 ms overlapping frames.
Fast Fourier Transform (FFT): Converts time-domain waves into frequency-domain representations.
Mel-Spectrogram / MFCC Generation: Maps frequencies onto the human ear's non-linear perception (Mel scale).

Stage 3: Acoustic Modeling (Audio 
→
→ Phonemes)
What happens: The Acoustic Model (e.g., Conformer, CTC, or Whisper Transformer encoder) maps spectral audio frames into probability distributions over phonemes (the smallest phonetic units of human speech, such as /k/, /æ/, /t/).

Stage 4: Language Modeling & Decoding (Phonemes 
→
→ Words)
What happens: The Decoder uses a Language Model (N-gram or Transformer decoder) combined with beam search to resolve homophones and predict the most likely word sequence given context (e.g., distinguishing "recognize speech" from "wreck a nice beach").

Stage 5: Streaming Decoding (Interim vs. Final Results)
What happens:
Interim Results: Real-time hypotheses rendered with zero latency while the speaker is still talking (grey/italic preview words).
Final Results: Locked-in sentences once a pause or complete syntactic phrase boundary is detected.

Stage 6: Post-Processing & Smart NLP
What happens:
Punctuation & Capitalization Restoration: Adds periods, commas, and capitalizes sentence starts.
Disfluency Removal: Cleans filler words ("um", "uh", "you know").
Value-add NLP: Extracts action items, generates executive summaries, and formats subtitles (.srt).
