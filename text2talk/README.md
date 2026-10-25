Text2Talk

Your Voice. Your Words. Your World.

Text2Talk is a web app that turns speech into text and text into speech, and translates between languages. It runs in the browser, uses Supabase for accounts and data, and uses small Python functions on Vercel for translation and the contact form.

Live site: https://text2talk-final.vercel.app

Features
Area	What it does
Speech-to-Text	Continuous dictation with live text, a timer, language choice, editing, copy, save, and download. Listening restarts automatically after pauses.
Text-to-Speech	Reads text aloud using the browser's voices, with speed, pitch, and volume controls. Play, pause, resume, stop, save.
Translate	Translates text between 18 languages. Copy, listen, or download the result.
Live Translation	Speak into the microphone and see each finished phrase translated while you keep talking.
Listen to File	Drag and drop a .txt, .md, or .docx file to hear it read aloud, or an audio file to play it. Save either to your account.
History	Saved transcripts and audio items, with search, rename, favorites, delete, listen, play, and download.
Downloads	Export any text as TXT, Word (.docx), PDF, Markdown, HTML, RTF, or JSON.
Accounts	Email sign-up with verification, sign-in, password reset, optional Google sign-in, protected pages.
Legal and contact	Privacy Policy, Terms of Service, and a contact form that stores messages in the database.
Design	Responsive layout, light theme with a navy, indigo, steel, and beige palette, keyboard-friendly controls, reduced-motion support.
Tech stack
Front end: React 18, Vite 5, Tailwind CSS 3, React Router 6, React Hook Form + Zod, Lucide icons
Back end: Supabase (Auth, PostgreSQL with Row Level Security, Storage)
Serverless: Python 3 functions on Vercel (standard library only)
Speech: Web Speech API (recognition) and Speech Synthesis API (voices), both built into the browser
Files: docx, jspdf, mammoth
Tests: Vitest
Hosting: Vercel
Browser support
Speech-to-Text and Live Translation: Chrome, Edge, Safari. Firefox does not support speech recognition. An internet connection is required.
Text-to-Speech and Listen to File: most modern browsers. Available voices depend on the device.
The microphone only works on HTTPS or localhost.
Project structure
text2talk/
├── api/                        Python serverless functions
│   ├── translate.py            POST /api/translate
│   └── contact.py              POST /api/contact
├── public/                     favicon.svg, logo.png
├── supabase/                   SQL setup scripts
│   ├── schema.sql              profiles, transcripts, audio_generations + security rules
│   ├── contact_messages.sql    contact form table
│   └── audio_storage.sql       private bucket for saved audio files
├── tools/
│   └── security_check.py       basic security checker (optional)
├── src/
│   ├── components/             Logo, DownloadMenu, SpeakTranslate, LiveTranslate
│   ├── features/
│   │   ├── auth/               AuthContext, sign-in/register/reset pages, tests
│   │   ├── stt/                SpeechToText page and useSpeechRecognition hook
│   │   └── tts/                TextToSpeech page
│   ├── lib/                    supabase.js, site.js, speak.js, exportText.js
│   ├── pages/                  Landing, Dashboard, History, Translate, Live, Listen, Legal
│   ├── App.jsx                 routes
│   ├── main.jsx
│   └── index.css
├── index.html
├── tailwind.config.js          color palette and fonts
├── vercel.json                 rewrites and security headers
├── package.json
└── .env.example
