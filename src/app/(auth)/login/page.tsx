'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Sparkles, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

/**
 * Login + Register page with explicit tab switching.
 * - Login tab: sign in with existing account
 * - Register tab: create a new account with email + password + confirm password
 */
export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError(null);
    setSuccessMessage(null);
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  /**
   * Handle login
   */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn(email.trim(), password);
      if (!result.error) {
        toast.success('登录成功，欢迎回来！🎉');
        router.push('/dashboard');
      } else {
        setError(result.error === 'Invalid login credentials'
          ? '邮箱或密码错误，请重试。如果还没有账号，请切换到注册。'
          : result.error);
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle register
   */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(email.trim(), password);
      if (!result.error) {
        setSuccessMessage('注册成功！请登录你的账号。');
        toast.success('注册成功！', { icon: '🎉' });
        setTimeout(() => {
          switchTab('login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch {
      setError('注册失败，请稍后重试');
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
          我想活出怎样的人生
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          记录成长，不负时光
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex mb-4 p-1 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
        <button
          onClick={() => switchTab('login')}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
          style={{
            background: activeTab === 'login' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'login' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <LogIn className="h-4 w-4" />
          登录
        </button>
        <button
          onClick={() => switchTab('register')}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
          style={{
            background: activeTab === 'register' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'register' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <UserPlus className="h-4 w-4" />
          注册
        </button>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
        {/* Error */}
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

        {/* Success */}
        {successMessage && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm animate-slide-down flex items-center gap-2"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {activeTab === 'login' ? (
          /* ========== LOGIN FORM ========== */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
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
              <span>登录</span>
            </button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
              还没有账号？
              <button type="button" onClick={() => switchTab('register')}
                className="ml-1 font-medium underline" style={{ color: '#6366f1' }}>
                立即注册
              </button>
            </p>
          </form>
        ) : (
          /* ========== REGISTER FORM ========== */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                一个邮箱只能注册一个账号
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置密码（至少6位）"
                  className="input-field pl-10 pr-10"
                  autoComplete="new-password"
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

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="input-field pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>注册</span>
            </button>

            <p className="text-center text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
              已有账号？
              <button type="button" onClick={() => switchTab('login')}
                className="ml-1 font-medium underline" style={{ color: '#6366f1' }}>
                立即登录
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
        &copy; {new Date().getFullYear()} 向上思考
      </p>
    </div>
  );
}
