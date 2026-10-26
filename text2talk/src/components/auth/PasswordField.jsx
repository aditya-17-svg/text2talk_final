import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FieldError from './FieldError';

export default function PasswordField({ reg, error, label = 'Password' }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="relative mt-1">
        <input
          type={show ? 'text' : 'password'}
          className="input pr-10"
          autoComplete="current-password"
          {...reg}
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-slate-400"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <FieldError e={error} />
    </label>
  );
}
