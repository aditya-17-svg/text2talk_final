import Logo from '../Logo';
import { isConfigured } from '../../lib/supabase';

export default function AuthShell({ title, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4 dark:from-slate-950 dark:to-slate-900">
      <div className="card w-full max-w-md">
        <div className="mb-6">
          <Logo
            textClass="text-ink"
            two="text-brand-500"
          />
        </div>
        <h1 className="mb-4 text-2xl font-bold">{title}</h1>
        {!isConfigured && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
          >
            Supabase is not configured. Copy .env.example to .env and add your
            keys.
          </p>
        )}
        {children}
        <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </main>
  );
}
