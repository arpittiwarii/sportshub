import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiKey, FiAlertCircle, FiArrowLeft, FiMail, FiShield, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AlertBox from '../components/AlertBox';
import PasswordInput from '../components/PasswordInput';

const STEPS = [
  { id: 1, label: 'Email', icon: FiMail, title: 'Forgot Password', hint: 'Enter your account email and we will send you a reset code' },
  { id: 2, label: 'Code', icon: FiShield, title: 'Enter Reset Code', hint: 'Check your inbox for the 6-digit code' },
  { id: 3, label: 'Password', icon: FiLock, title: 'Set New Password', hint: 'Choose a password you have not used before' },
];

// Mirrors validatePasswordStrength() on the server so the user gets immediate
// feedback; the server still enforces it.
const isStrongPassword = (value) =>
  typeof value === 'string' && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

const inputClass =
  'w-full bg-surface-2 border border-border focus:border-primary outline-none text-content rounded-lg px-4 py-2';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const current = STEPS.find((s) => s.id === step) || STEPS[0];

  // Step 1 — ask the server to email a code. The response is deliberately the
  // same whether or not the address is registered, so we always advance.
  const requestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.info(res.data?.message || 'If an account exists for that email, a reset code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send a reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Issues a fresh code, which invalidates the previous one server-side.
  const resendCode = async () => {
    setError('');
    setResending(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.info(res.data?.message || 'A new reset code has been sent.');
      setOtp('');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the reset code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Step 2 — the code is only checked server-side (in step 3) so a wrong guess
  // here costs nothing; we just make sure it is well formed first.
  const confirmCode = (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setStep(3);
  };

  // Step 3 — verify the code and set the new password in a single request.
  const submitNewPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp,
        password,
      });
      toast.success(res.data?.message || 'Password reset successfully.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not reset your password. Please try again.';
      const fields = err.response?.data?.errors?.map((item) => item.field) || [];

      // Send the user back to the code step when the code itself was the
      // problem, so they are not stuck retyping a password that was fine.
      if (fields.includes('otp') || /reset code|expired|attempts/i.test(message)) {
        setOtp('');
        setStep(2);
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-shell pb-16 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiKey className="text-primary text-2xl" />
            </div>
            <h2 className="text-2xl font-display font-bold text-content mb-2">{current.title}</h2>
            <p className="text-content-muted text-sm">{current.hint}</p>
          </div>

          {/* Progress indicator */}
          <ol className="flex items-center justify-center gap-2 mb-6" aria-label="Reset progress">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex items-center gap-2">
                  <span
                    aria-current={active ? 'step' : undefined}
                    title={s.label}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                      ${active || done
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-surface-2 border-border text-content-muted'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  {s.id !== STEPS.length && (
                    <span className={`w-6 h-px ${done ? 'bg-primary/40' : 'bg-border'}`} />
                  )}
                </li>
              );
            })}
          </ol>

          {error && (
            <AlertBox variant="danger" icon={FiAlertCircle} className="mb-6">
              <span className="text-sm">{error}</span>
            </AlertBox>
          )}

          {step === 1 && (
            <form onSubmit={requestCode} className="space-y-5">
              <div>
                <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={confirmCode} className="space-y-5">
              <div>
                <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="otp">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`${inputClass} tracking-[0.4em] text-center text-lg`}
                />
                <p className="text-content-muted text-xs mt-1">
                  Sent to {email}. The code expires in 10 minutes.
                </p>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                Continue
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resending}
                className="w-full text-sm text-primary hover:underline disabled:opacity-60"
              >
                {resending ? 'Resending...' : 'Resend code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={submitNewPassword} className="space-y-5">
              <div>
                <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="new-password">
                  New Password
                </label>
                <PasswordInput
                  id="new-password"
                  name="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
                <p className="text-content-muted text-xs mt-1">
                  At least 8 characters, including a letter and a number.
                </p>
              </div>
              <div>
                <label className="block text-content-muted text-sm font-medium mb-1" htmlFor="confirm-new-password">
                  Confirm New Password
                </label>
                <PasswordInput
                  id="confirm-new-password"
                  name="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => { setError(''); setStep(2); }}
                className="w-full text-sm text-content-muted hover:text-content"
              >
                Use a different code
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-content-muted hover:text-content transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
