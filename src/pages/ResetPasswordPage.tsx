import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength, evaluatePasswordStrength } from '@/components/ui/PasswordStrength';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!token || !email) {
      setError('Invalid or expired password reset parameters.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const strength = evaluatePasswordStrength(password);
    if (strength.score === 'weak') {
      setError('Password is too weak. It must be at least 8 characters and satisfy the security requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfo('Your password has been reset successfully! Redirecting you to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please request a new link.');
      }
    } catch (err) {
      setError('An error occurred during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#f8faf8] py-20 px-4 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden"
      >
        <div className="bg-[#004d2c] text-white py-8 px-8 text-center relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8 blur-sm" />
          <div className="inline-flex p-3 rounded-full bg-white/10 mb-3 backdrop-blur-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight font-sans">Set New Password</h1>
          <p className="text-white/80 text-xs mt-1">Please configure your new secure account password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-4 rounded-xl flex items-start gap-2.5 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-xl flex items-start gap-2.5 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{info}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password (min 8 chars)</label>
              <PasswordInput
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004d2c]/20 focus:border-[#004d2c] transition bg-[#fafcfa] text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength password={password} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
              <PasswordInput
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#004d2c]/20 focus:border-[#004d2c] transition bg-[#fafcfa] text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#004d2c] hover:bg-[#003c22] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition text-xs uppercase tracking-wider shadow-lg shadow-[#004d2c]/10"
          >
            {isSubmitting ? 'Updating Account...' : 'Reset Secure Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
export default ResetPasswordPage;
