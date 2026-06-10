'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

/**
 * Unified Login / Register page.
 * - If the email is not registered, automatically creates an account.
 * - Supports email + password authentication via Supabase.
 */
export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, signUp } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle login: try sign in first, if it fails (user doesn't exist), try sign up.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError(t('auth.errorEmailRequired'));
      return;
    }
    if (!password.trim()) {
      setError(t('auth.errorPasswordRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Try signing in
      const signInResult = await signIn(email, password);

      if (!signInResult.error) {
        toast.success(t('auth.loginSuccess'));
        router.push('/dashboard');
        return;
      }

      // If sign in fails (likely user doesn't exist), try sign up
      if (signInResult.error) {
        const signUpResult = await signUp(email, password);

        if (!signUpResult.error) {
          toast.success(t('auth.registerSuccess'));
          router.push('/dashboard');
          return;
        }

        setError(signUpResult.error);
      }
    } catch {
      setError(t('auth.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {t('app.name')}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {t('app.tagline')}
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm animate-slide-down"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="input-field pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="input-field pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            <span>{t('auth.loginButton')}</span>
          </button>
        </form>

        {/* Hint */}
        <p
          className="text-center text-xs mt-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {t('auth.newUserAutoRegister')}
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
        &copy; {new Date().getFullYear()} {t('app.shortName')}
      </p>
    </div>
  );
}
