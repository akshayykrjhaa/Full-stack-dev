import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'analyst',
};

export default function AuthScreen() {
  const { signIn, signUp, isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === 'signin' ? 'Access ARTHA' : 'Create ARTHA workspace'),
    [mode],
  );

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    setError('');

    try {
      if (mode === 'signin') {
        await signIn({ email: form.email, password: form.password });
        setStatus('Session opened.');
      } else {
        await signUp(form);
        setStatus(
          isSupabaseConfigured
            ? 'Account created. If email confirmation is enabled, verify your inbox.'
            : 'Local workspace created.',
        );
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const quickStart = async () => {
    const demoUser = {
      fullName: 'Aisha Kapoor',
      email: 'aisha@artha.local',
      password: 'ArthaDemo#2026',
      role: 'admin',
    };
    setForm(demoUser);
    setSubmitting(true);
    setError('');
    setStatus('');
    try {
      await signIn(demoUser);
    } catch {
      await signUp(demoUser);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <motion.section
        className="auth-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="auth-brand">
          <span className="brand-mark">
            <BarChart3 size={22} />
          </span>
          <div>
            <strong>ARTHA</strong>
            <span>AIS sponsorship intelligence</span>
          </div>
        </div>

        <div className="auth-grid">
          <div className="auth-copy">
            <h1>{title}</h1>
            <p>
              Convert sponsorship cost, audience, engagement, and exposure into a
              comparable SVI score with live deal analytics.
            </p>
            <div className="auth-proof">
              <span>
                <Sparkles size={16} />
                AIS scoring engine
              </span>
              <span>
                <ShieldCheck size={16} />
                Role-based access
              </span>
              <span>
                <LockKeyhole size={16} />
                Supabase sessions
              </span>
            </div>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="segmented-control" aria-label="Authentication mode">
              <button
                type="button"
                className={mode === 'signin' ? 'active' : ''}
                onClick={() => setMode('signin')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => setMode('signup')}
              >
                Sign up
              </button>
            </div>

            {mode === 'signup' && (
              <label>
                Full name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={update}
                  minLength={2}
                  required
                  autoComplete="name"
                />
              </label>
            )}

            <label>
              Email
              <input
                name="email"
                value={form.email}
                onChange={update}
                type="email"
                required
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                value={form.password}
                onChange={update}
                type="password"
                minLength={8}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </label>

            {mode === 'signup' && !isSupabaseConfigured && (
              <label>
                Workspace role
                <select name="role" value={form.role} onChange={update}>
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </select>
              </label>
            )}

            {error && <p className="form-error">{error}</p>}
            {status && <p className="form-success">{status}</p>}

            <button className="primary-button" type="submit" disabled={submitting}>
              <LockKeyhole size={16} />
              {submitting ? 'Securing session...' : mode === 'signin' ? 'Login' : 'Create account'}
            </button>

            {!isSupabaseConfigured && (
              <button
                className="secondary-button"
                type="button"
                onClick={quickStart}
                disabled={submitting}
              >
                <Sparkles size={16} />
                Open local demo as Admin
              </button>
            )}
          </form>
        </div>
      </motion.section>
    </main>
  );
}
