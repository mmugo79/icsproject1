import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ShieldCheck, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { login, verifyUserEmail, sendResetEmail, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ? (location.state.from.pathname + (location.state.from.search || '')) : '';

  const handleAuthRedirect = (userEmail: string) => {
    const isUserAdmin = userEmail.toLowerCase().includes('admin') || userEmail.toLowerCase().endsWith('.go.ke');
    if (isUserAdmin) {
      navigate('/admin');
    } else {
      const destination = from && from !== '/login' && from !== '/register' ? from : '/dashboard';
      navigate(destination);
    }
  };

  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        handleAuthRedirect(email);
      } else if (res.message === 'EMAIL_VERIFICATION_PENDING') {
        setIsVerifying(true);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      const verified = await verifyUserEmail(email, verificationCode);
      if (verified) {
        setInfo('Email verified successfully! Opening your dashboard...');
        setTimeout(() => {
          handleAuthRedirect(email);
        }, 1500);
      } else {
        setError('Invalid verification code. Please check and try again.');
      }
    } catch (err) {
      setError('Error completing account activation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address to receive reset link');
      return;
    }
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      const res = await sendResetEmail(resetEmail);
      if (res.success) {
        setInfo(res.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setInfo('');
        }, 4000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Error processing password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setInfo('Successfully authenticated with Google!');
        setTimeout(() => {
          const destination = from && from !== '/login' && from !== '/register' ? from : '/dashboard';
          navigate(destination);
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Google authenticating error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const res = await loginWithApple();
      if (res.success) {
        setInfo('Successfully authenticated with Apple!');
        setTimeout(() => {
          const destination = from && from !== '/login' && from !== '/register' ? from : '/dashboard';
          navigate(destination);
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Apple sign-in is not fully configured or supported in this environment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf9] flex flex-col justify-between pt-16 font-sans text-slate-900">
      <div className="flex-grow container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl">
        
        {/* Left Column Description */}
        <div className="flex-grow flex-1 space-y-8 max-w-xl pr-4">
          <div className="w-16 h-16 bg-[#004d2c]/5 rounded-3xl flex items-center justify-center border-2 border-[#004d2c]/10">
            <ShieldCheck className="w-8 h-8 text-[#004d2c]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#004d2c] leading-tight font-display">
            Welcome Back to <br />
            <span className="text-[#055a36]">RaiaVoice</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
            Continue reporting community issues, prioritizing urgent repairs, and monitoring administrative actions across Kenya.
          </p>

          {/* Styled Issue Preview Card in Welcome panel */}
          <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-[2.5rem] shadow-sm max-w-md relative group hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#004d2c]/5 flex items-center justify-center text-[#004d2c] border border-[#004d2c]/10">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                <div className="h-6 bg-slate-100 rounded-md w-4/5" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest bg-[#004d2c]/10 text-[#004d2c]">
                Active Grid
              </span>
              <div className="flex items-center gap-1.5 text-[#004d2c]">
                <span className="text-xs font-bold leading-none">Verified Citizen Network</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Auth Form Card */}
        <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-150 shadow-sm relative">
          
          {isVerifying ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">Verify your email</h2>
                <p className="text-sm font-semibold text-slate-400">
                  Please verify your activation code to complete logging into <span className="text-[#004d2c] font-black">{email}</span>.
                </p>
              </div>

              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-2 text-left">
                <p className="text-xs font-semibold text-emerald-800 leading-relaxed">
                  A verification code has been successfully sent to your registered email address. Please enter the 6-digit code below to activate and complete your login.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {info && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {info}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">6-Digit Activation Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="6-digit OTP" 
                    className="w-full h-14 px-5 text-center text-2xl font-black tracking-[0.4em] bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-2xl placeholder-slate-300 font-mono transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsVerifying(false)}
                    className="flex-1 h-14 font-extrabold text-xs uppercase rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] h-14 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold shadow-lg rounded-2xl border-none uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Verify & Proceed
                  </Button>
                </div>
              </form>
            </div>
          ) : isForgotPassword ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">Reset Password</h2>
                <p className="text-sm font-semibold text-slate-400">
                  Enter your registered email address and we will send you a secure link to reset your account credentials natively.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {info && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {info}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Email address</label>
                  <input 
                    type="email" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. name@raiavoice.org" 
                    className="w-full h-14 px-5 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-2xl text-sm font-bold placeholder-slate-300 transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(false)}
                    className="flex-1 h-14 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs uppercase rounded-2xl"
                  >
                    Return to Login
                  </button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-[2] h-14 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold shadow-lg rounded-2xl border-none uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Email Reset Link
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">Sign In</h2>
                <p className="text-sm font-medium text-slate-400">
                  Citizens and authorized administrators can sign in securely.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {info && (
                  <div className="p-4 bg-emerald-50 border border-[#004d2c]/10 rounded-2xl text-xs font-bold text-[#004d2c] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {info}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Email address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@raiavoice.org" 
                    className="w-full h-14 px-5 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none focus:ring-1 focus:ring-[#004d2c]/20 rounded-2xl text-sm font-bold placeholder-slate-300 transition-colors"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-400">Password</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPassword(true);
                        setResetEmail(email);
                        setError('');
                        setInfo('');
                      }}
                      className="text-xs font-semibold text-[#004d2c] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-14 px-5 bg-[#fafbfa] border border-slate-200 focus:border-[#004d2c] focus:outline-none focus:ring-1 focus:ring-[#004d2c]/20 rounded-2xl text-sm font-bold placeholder-slate-300 transition-colors"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold shadow-lg shadow-[#004d2c]/10 text-sm tracking-widest uppercase rounded-2xl border-none flex items-center justify-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Login
                </Button>
              </form>

              {/* Social authentication buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-slate-150"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or Continue With</span>
                  <div className="flex-grow border-t border-slate-150"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="h-14 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wide text-[10px] rounded-2xl"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.67 0 3.14.58 4.31 1.71l3.22-3.22C17.58 1.63 15 .75 12 .75 7.37.75 3.4 3.4 1.5 7.23l3.83 2.97C6.27 7.03 8.92 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.46-1.1 2.69-2.33 3.51l3.63 2.82c2.12-1.95 3.75-4.83 3.75-8.46z" />
                      <path fill="#FBBC05" d="M5.33 14.8c-.24-.71-.38-1.48-.38-2.28s.14-1.57.38-2.28L1.5 7.27C.54 9.17 0 11.23 0 13.4c0 2.17.54 4.23 1.5 6.13l3.83-2.73z" />
                      <path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.08 7.96-2.92l-3.63-2.82c-1.12.75-2.55 1.21-4.33 1.21-3.08 0-5.73-1.99-6.67-5.16L1.5 16.53c1.9 3.83 5.87 6.72 10.5 6.72z" />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAppleSignIn}
                    className="h-14 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wide text-[10px] rounded-2xl"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.38.08.49.08.88 0 1.96-.54 2.33-1.41z" />
                    </svg>
                    Apple
                  </Button>
                </div>
              </div>

              <p className="mt-8 text-center text-sm font-semibold text-slate-400">
                Don't have an account? <Link to="/register" className="text-[#004d2c] font-black hover:underline">Create Account</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
