import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AuthShell from '../../components/auth/AuthShell';
import FieldError from '../../components/auth/FieldError';
import PasswordField from '../../components/auth/PasswordField';
import { SITE_URL } from '../../lib/site';
import { supabase, isConfigured } from '../../lib/supabase';

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/[0-9]/, 'Add a number');
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    password,
    confirm: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the Terms and Privacy Policy',
      }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const onSubmit = async ({ email, password }) => {
    setErr('');
    if (!isConfigured) return setErr('Authentication is not configured.');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      return setErr(
        error.message.includes('not confirmed')
          ? 'Please verify your email first.'
          : 'Invalid email or password.'
      );
    nav('/app');
  };
  const google = () =>
    supabase?.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}/app` },
    });
  return (
    <AuthShell
      title="Welcome back"
      footer={
        <>
          No account?{' '}
          <Link
            className="text-brand-600"
            to="/register"
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            autoComplete="email"
            className="input mt-1"
            {...register('email')}
          />
          <FieldError e={errors.email} />
        </label>
        <PasswordField
          reg={register('password')}
          error={errors.password}
        />
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">
            Sessions persist securely via Supabase.
          </span>
          <Link
            className="text-brand-600"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        {err && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {err}
          </p>
        )}
        <button
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
        <button
          type="button"
          className="btn-ghost w-full"
          onClick={google}
        >
          Continue with Google
        </button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });
  const onSubmit = async ({ fullName, email, password }) => {
    setErr('');
    if (!isConfigured) return setErr('Authentication is not configured.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${SITE_URL}/app`,
      },
    });
    if (error)
      return setErr(
        'Could not create the account. Try a different email or try again later.'
      );
    setDone(email);
  };
  if (done)
    return (
      <AuthShell
        title="Check your email"
        footer={
          <Link
            className="text-brand-600"
            to="/login"
          >
            Back to Sign In
          </Link>
        }
      >
        <p className="text-sm">
          We sent a verification link to <b>{done}</b>. Open it to activate your
          account.
        </p>
        <button
          className="btn-ghost mt-4 w-full"
          onClick={() => supabase.auth.resend({ type: 'signup', email: done })}
        >
          Resend verification email
        </button>
      </AuthShell>
    );
  return (
    <AuthShell
      title="Create your account"
      footer={
        <>
          Already registered?{' '}
          <Link
            className="text-brand-600"
            to="/login"
          >
            Sign In
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <label className="block text-sm font-medium">
          Full name
          <input
            autoComplete="name"
            className="input mt-1"
            {...register('fullName')}
          />
          <FieldError e={errors.fullName} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            autoComplete="email"
            className="input mt-1"
            {...register('email')}
          />
          <FieldError e={errors.email} />
        </label>
        <PasswordField
          reg={register('password')}
          error={errors.password}
        />
        <PasswordField
          label="Confirm password"
          reg={register('confirm')}
          error={errors.confirm}
        />
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            {...register('terms')}
          />{' '}
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <FieldError e={errors.terms} />
        {err && (
          <p
            role="alert"
            className="text-sm text-red-600"
          >
            {err}
          </p>
        )}
        <button
          className="btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
      z.object({ email: z.string().email('Enter a valid email') })
    ),
  });
  const onSubmit = async ({ email }) => {
    await supabase?.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/app/settings`,
    });
    setSent(true);
  };
  return (
    <AuthShell
      title="Reset password"
      footer={
        <Link
          className="text-brand-600"
          to="/login"
        >
          Back to Sign In
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              className="input mt-1"
              {...register('email')}
            />
            <FieldError e={errors.email} />
          </label>
          <button
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
