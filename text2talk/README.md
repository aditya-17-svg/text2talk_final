# Text2Talk

**Your Voice. Your Words. Your World.**

Text2Talk is a web app that turns speech into text and text into speech, and translates between languages. It runs in the browser, uses Supabase for accounts and data, and uses small Python functions on Vercel for translation and the contact form.

**Live site:** https://text2talk-final.vercel.app

---

## Features

| Area | What it does |
|---|---|
| **Speech-to-Text** | Continuous dictation with live text, a timer, language choice, editing, copy, save, and download. Listening restarts automatically after pauses. |
| **Text-to-Speech** | Reads text aloud using the browser's voices, with speed, pitch, and volume controls. Play, pause, resume, stop, save. |
| **Translate** | Translates text between 18 languages. Copy, listen, or download the result. |
| **Live Translation** | Speak into the microphone and see each finished phrase translated while you keep talking. |
| **Listen to File** | Drag and drop a `.txt`, `.md`, or `.docx` file to hear it read aloud, or an audio file to play it. Save either to your account. |
| **History** | Saved transcripts and audio items, with search, rename, favorites, delete, listen, play, and download. |
| **Downloads** | Export any text as TXT, Word (.docx), PDF, Markdown, HTML, RTF, or JSON. |
| **Accounts** | Email sign-up with verification, sign-in, password reset, optional Google sign-in, protected pages. |
| **Legal and contact** | Privacy Policy, Terms of Service, and a contact form that stores messages in the database. |
| **Design** | Responsive layout, light theme with a navy, indigo, steel, and beige palette, keyboard-friendly controls, reduced-motion support. |

## Tech stack

- **Front end:** React 18, Vite 5, Tailwind CSS 3, React Router 6, React Hook Form + Zod, Lucide icons
- **Back end:** Supabase (Auth, PostgreSQL with Row Level Security, Storage)
- **Serverless:** Python 3 functions on Vercel (standard library only)
- **Speech:** Web Speech API (recognition) and Speech Synthesis API (voices), both built into the browser
- **Files:** `docx`, `jspdf`, `mammoth`
- **Tests:** Vitest
- **Hosting:** Vercel

## Browser support

- **Speech-to-Text and Live Translation:** Chrome, Edge, Safari. Firefox does not support speech recognition. An internet connection is required.
- **Text-to-Speech and Listen to File:** most modern browsers. Available voices depend on the device.
- The microphone only works on **HTTPS** or `localhost`.

## Project structure

```
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
```

## Getting started

### 1. Requirements
- Node.js 18 or newer (LTS recommended)
- A free Supabase account
- A Vercel account (only for deployment)

### 2. Install
```bash
npm install
```

### 3. Create the database
In your Supabase project, open **SQL Editor**, and run these files **once**, in order:

1. `supabase/schema.sql`
2. The permissions below (they let signed-in users reach the tables; Row Level Security still limits each person to their own rows):
   ```sql
   grant usage on schema public to authenticated;
   grant select, insert, update, delete on public.profiles, public.transcripts, public.audio_generations to authenticated;
   ```
3. `supabase/contact_messages.sql` (for the contact form)
4. `supabase/audio_storage.sql` (only if you want to save audio files)

### 4. Configure environment variables
```bash
cp .env.example .env
```
Fill in `.env` (the file must sit next to `package.json`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_SITE_URL=https://your-live-site.vercel.app
```

- Use the **publishable** (or legacy **anon**) key. **Never** put the `secret` or `service_role` key in this file.
- `VITE_SITE_URL` makes email links open your live site. It is optional for local work.
- Names must start with `VITE_`, and you must restart `npm run dev` after changing `.env`.

### 5. Configure Supabase Auth
In **Authentication**:

- **URL Configuration:** set **Site URL** to your live address, and add `https://your-live-site.vercel.app/**` and `http://localhost:5173/**` to **Redirect URLs**.
- **Sign In / Providers:** keep Email enabled. Turn on **Confirm email** for production. Google sign-in is optional and needs a Google Cloud OAuth setup.
- **Emails:** Supabase's built-in sender has a very low limit and is meant for testing. Set up your own SMTP provider (Brevo, Resend, SendGrid, or similar) before inviting real users.

### 6. Run it
```bash
npm run dev
```
Open http://localhost:5173 in Chrome or Edge.

> `npm run dev` does not run the Python functions. Locally, Translate and Live Translation call the translation service directly. To run the Python functions on your machine, install the Vercel CLI (`npm i -g vercel`) and use `vercel dev`.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build (run this before every push) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the tests |

## Deployment (Vercel)

1. Push the project to GitHub. `.env` is ignored by `.gitignore` and must never be committed.
2. In Vercel, choose **Add New → Project** and import the repository. If the project sits in a subfolder of the repository, set **Root Directory** to that folder.
3. Vercel detects Vite automatically (build command `npm run build`, output `dist`).
4. Add these under **Settings → Environment Variables**, then **redeploy** (Vite reads them at build time):

   | Variable | Used by | Notes |
   |---|---|---|
   | `VITE_SUPABASE_URL` | Front end | Public |
   | `VITE_SUPABASE_ANON_KEY` | Front end | Public publishable/anon key |
   | `VITE_SITE_URL` | Front end | Your live address, no trailing slash |
   | `SUPABASE_URL` | Python `contact` function | Same project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Python `contact` function | **Secret.** Mark as Sensitive. Never prefix with `VITE_`. |
   | `IP_HASH_SALT` | Python `contact` function | Any long random string |
   | `MYMEMORY_EMAIL` | Python `translate` function | Optional. A real email raises the free translation limit. |

5. In Supabase, add your live address to the Auth URL settings (step 5 above).

Generate a salt with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## How the Python functions work

- **`/api/translate`** checks the text and the two language codes, splits the text into sentences, translates them in parallel through the free MyMemory service, and returns `{ "translation": "..." }`. Errors are returned as short, friendly messages.
- **`/api/contact`** validates and cleans the form fields, ignores bots through a hidden field, limits each visitor to 5 messages per hour using a salted SHA-256 hash of their IP address (the raw address is never stored), and saves the message with the service-role key.

To switch to a different translation provider (for example DeepL or Google Cloud Translate), change the `translate_piece` function in `api/translate.py` and add the provider's key as a Vercel environment variable.

## Security and privacy

- **Passwords** are hashed (bcrypt) and stored by Supabase Auth. The app never sees or stores them.
- **Database access:** Row Level Security makes every person's transcripts, audio items, and files readable only by them. Saved audio lives in a private storage bucket.
- **HTTPS** is provided by Vercel. `vercel.json` adds HTTPS enforcement, a Content Security Policy, and headers that block framing and content sniffing. If something breaks after deploying, check the browser console for CSP messages. To test safely, rename the policy key to `Content-Security-Policy-Report-Only` first.
- **XSS:** React escapes all rendered text, and the code does not inject raw HTML. The CSP blocks unexpected scripts.
- **Secrets:** only public keys reach the browser. The `service_role` key lives only in Vercel's environment variables.
- **Audio and text:** Text2Talk does not record or store raw audio. Browser speech recognition may send audio to the browser vendor's speech service, and translated text is sent to the MyMemory service. Both are explained in the in-app Privacy Policy and next to the consent checkboxes. Only content you choose to save is stored.
- Run `python tools/security_check.py . https://your-live-site.vercel.app` to scan for common mistakes, and run `npm audit` now and then.

The Privacy Policy and Terms are general templates, **not legal advice**. Have them reviewed before a commercial launch, and set your real address in the `CONTACT_EMAIL` constant in `src/pages/Legal.jsx`.

## Customizing the look

All colors are defined in `tailwind.config.js`:

| Role | Color |
|---|---|
| Deep navy (text, header, footer) | `#111844` |
| Indigo (primary buttons, links) | `#4B5694` |
| Steel blue (accent buttons, bands) | `#7288AE` |
| Beige (page background) | `#EAE0CF` |

Change a value there and the whole site follows. The sidebar and the Listen to File drop zone use `#7288ae` directly, so use Find and Replace in `Dashboard.jsx` and `Listen.jsx` if you change the steel color.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Supabase is not configured" | `.env` must be next to `package.json`, named exactly `.env`, with `VITE_` names. Restart the dev server. On Vercel, add the variables and **redeploy**. |
| "permission denied for table ..." | Run the `grant` statements from step 3. |
| Vercel: "Could not resolve ./..." | A file is missing from GitHub or its name differs in capitalization. Names are case-sensitive on Vercel (`components`, not `component`). Run `npm run build` locally first. |
| Vercel: "Rollup failed to resolve import docx" | Run `npm install` so `docx`, `jspdf`, and `mammoth` are in `package.json`, then commit it. |
| Email links open `localhost` | Set the Site URL in Supabase, set `VITE_SITE_URL`, and send a new email (old ones keep the old link). |
| Port 5173 is already in use | Another dev server is running. Stop it, or use the address Vite prints. |
| Microphone does not work | Use Chrome or Edge on HTTPS or `localhost`, allow microphone access, and tick the consent box. |
| Translation says the daily limit was reached | Set `MYMEMORY_EMAIL` in Vercel, or switch providers (see above). |
| Contact form fails locally | The Python functions only run on Vercel or with `vercel dev`. |

## Known limitations and ideas

- Profile editing, saving a default voice and speed, notification preferences, and in-app account deletion are not built yet.
- Text-to-Speech uses browser voices, so downloadable audio from a cloud voice provider is not available.
- Pro ($10 per month) is shown as "coming soon". There is no billing yet.
- Listen to File cannot read PDF files yet.
- Live Translation translates once per finished phrase, not word by word, and free translation has daily limits.
- Possible next steps: multi-factor sign-in, cloud voices, billing, usage statistics, date filters in History, and more tests.

## License

No license has been chosen yet. Add a `LICENSE` file before sharing the code publicly.
