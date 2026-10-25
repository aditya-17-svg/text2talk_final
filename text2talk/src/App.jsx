import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, ProtectedRoute, PublicOnly } from './features/auth/AuthContext'
import { Login, Register, ForgotPassword } from './features/auth/AuthPages'
import Landing from './pages/Landing'
import { Layout, Overview, Settings_ } from './pages/Dashboard'
import SpeechToText from './features/stt/SpeechToText'
import TextToSpeech from './features/tts/TextToSpeech'
import History from './pages/History'
import Translate from './pages/Translate'
import Listen from './pages/Listen'
import Live from './pages/Live'
import { Privacy, Terms, Contact } from './pages/Legal'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="speech-to-text" element={<SpeechToText />} />
          <Route path="text-to-speech" element={<TextToSpeech />} />
          <Route path="translate" element={<Translate />} />
          <Route path="listen" element={<Listen />} />
          <Route path="live" element={<Live />} />
          <Route path="transcripts" element={<History table="transcripts" field="content" title="My Transcripts" />} />
          <Route path="audio" element={<History table="audio_generations" field="input_text" title="Audio History" />} />
          <Route path="favorites" element={<History table="transcripts" field="content" title="Favorite Transcripts" favoritesOnly />} />
          <Route path="settings" element={<Settings_ />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>)
}
