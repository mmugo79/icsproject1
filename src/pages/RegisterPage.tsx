import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength, evaluatePasswordStrength } from '@/components/ui/PasswordStrength';
import { ShieldCheck, AlertCircle, MapPin, RefreshCw } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [county, setCounty] = React.useState('Nairobi');
  const [ward, setWard] = React.useState(''); 
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');

  const { register, verifyUserEmail, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!name || !email || !phone || !county || !ward || !password) {
      setError('Please fill in all requested fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const strength = evaluatePasswordStrength(password);
    if (strength.score === 'weak') {
      setError('Password is too weak. It must be at least 8 characters and satisfy the security requirements.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const result = await register(name, email, phone, county, ward, password);
      if (!result.success) {
        setError(result.message);
      } else {
        setIsVerifying(true);
      }
    } catch (err) {
      setError('Error setting up registered account. Please check user inputs.');
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
        setInfo('Your account has been verified and activated! Loading dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Invalid 6-digit confirmation code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setInfo('Successfully registered via Google! Opening dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed registering via Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between pt-16 font-sans text-slate-900">
      <div className="flex-grow flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto bg-white lg:shadow-xl lg:shadow-slate-200/40 lg:rounded-3xl overflow-hidden lg:my-6 border border-slate-100/80">
        
        {/* Left Side (Branding Panel) */}
        <div className="lg:w-[45%] bg-gradient-to-br from-[#ebfaf3] via-[#daeedf] to-[#cbead8] p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#ceeada]/40 min-h-[400px] lg:min-h-[800px]">
          {/* Subtle civic dotted pattern */}
          <div 
            className="absolute inset-0 opacity-[0.11] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#047857 1.5px, transparent 1.5px)', 
              backgroundSize: '24px 24px' 
            }} 
          />
          <div className="absolute top-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#10b981]/15 filter blur-[100px] opacity-70 pointer-events-none" />
          
          {/* Header & Title */}
          <div className="relative z-10 space-y-6 max-w-md">
            <Link to="/" className="flex items-center gap-2.5 text-[#004d2c] group">
              <div className="w-10 h-10 bg-[#004d2c]/10 rounded-xl flex items-center justify-center border border-[#004d2c]/15 group-hover:bg-[#004d2c]/15 transition-colors">
                <svg className="w-5.5 h-5.5 text-[#004d2c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16v0Z" />
                  <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path d="M7.5 17c0-2 2-3 4.5-3s4.5 1 4.5 3" />
                  <path d="M19 8c1.5 1.5 1.5 4.5 0 6" />
                  <path d="M5 8c-1.5 1.5-1.5 4.5 0 6" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#004d2c]">RaiaVoice</span>
            </Link>

            <div className="pt-6 space-y-3">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#003d21]">
                Join RaiaVoice
              </h1>
              <p className="text-sm text-[#0c4424]/85 font-medium leading-relaxed">
                Become part of a community improving accountability and public service delivery across Kenya. Ensure your local county voices are heard directly.
              </p>
            </div>
          </div>

          {/* Correct silhouette map and cities indicator */}
          <div className="relative z-10 my-8 lg:my-10 flex items-center justify-center w-full max-w-sm lg:max-w-md mx-auto aspect-square bg-white/70 border border-white/90 p-6 md:p-8 rounded-[2rem] shadow-lg shadow-emerald-950/5 backdrop-blur-md">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src="/assets/kenya-map.png" 
                alt="Kenya Map" 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* End left column content */}
        </div>

        {/* Right Side (Form Section) */}
        <div className="flex-grow flex-1 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center min-h-[500px]">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {isVerifying ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Verify your email address</h2>
                  <p className="text-sm text-slate-500 font-medium">
                    We have sent a verification code to <span className="text-[#004d2c] font-bold">{email}</span>.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5 text-left">
                  <p className="text-xs font-semibold text-emerald-800 leading-relaxed">
                    A confirmation code has been sent to your registered email address. Please insert the 6-digit code below to activate and complete your RaiaVoice profile.
                  </p>
                </div>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                      {error}
                    </div>
                  )}
                  {info && (
                    <div className="p-4 bg-[#f0fdf4] border border-[#dcf2e6] rounded-xl text-xs font-semibold text-[#004d2c] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                      {info}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">6-Digit Activation Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000 000" 
                      className="w-full h-14 px-5 text-center text-2xl font-black tracking-[0.4em] bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:outline-none focus:ring-2 focus:ring-[#004d2c]/10 rounded-xl placeholder-slate-300 font-mono transition-all duration-250"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsVerifying(false)}
                      className="flex-1 h-12 font-bold text-xs uppercase rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-[2] h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-bold shadow-md rounded-xl border-none uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-250"
                    >
                      {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Activate Account
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
                  <p className="text-sm text-slate-400 font-medium font-sans">
                    Fill in your details to get started. Your voice matters in building a better Kenya.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                      {error}
                    </div>
                  )}
                  {info && (
                    <div className="p-4 bg-[#f0fdf4] border border-[#dcf2e6] rounded-xl text-xs font-semibold text-[#004d2c] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                      {info}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kelvin Ouma" 
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-2 focus:ring-[#004d2c]/10 focus:outline-none rounded-xl text-sm font-medium placeholder-slate-400 transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Email & Phone number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com" 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-2 focus:ring-[#004d2c]/10 focus:outline-none rounded-xl text-sm font-medium placeholder-slate-400 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone number</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712 345 678" 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-2 focus:ring-[#004d2c]/10 focus:outline-none rounded-xl text-sm font-medium placeholder-slate-400 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  {/* Location Area Grid */}
                  <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3.5 animate-fade-in">
                    <div className="flex items-center gap-2 text-[#004d2c]">
                      <MapPin className="w-4 h-4 text-[#004d2c] flex-shrink-0" />
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Regional Coordinates
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">County</label>
                        <select 
                          value={county}
                          onChange={(e) => setCounty(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-semibold uppercase tracking-wider text-[#004d2c] transition-colors"
                        >
                          <option value="Nairobi">Nairobi</option>
                          <option value="Kisumu">Kisumu</option>
                          <option value="Kiambu">Kiambu</option>
                          <option value="Kajiado">Kajiado</option>
                          <option value="Machakos">Machakos</option>
                          <option value="Wajir">Wajir</option>
                          <option value="Mandera">Mandera</option>
                          <option value="Mombasa">Mombasa</option>
                          <option value="Nakuru">Nakuru</option>
                          <option value="Uasin Gishu">Uasin Gishu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">Ward / Area</label>
                        <input 
                          type="text" 
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          placeholder="e.g. Westlands" 
                          className="w-full h-11 px-3 bg-white border border-slate-200 focus:border-[#004d2c] focus:outline-none rounded-xl text-xs font-medium placeholder-slate-400"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                      <PasswordInput 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-2 focus:ring-[#004d2c]/10 focus:outline-none rounded-xl text-sm font-medium placeholder-slate-400 transition-all duration-200"
                        required
                      />
                      <PasswordStrength password={password} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirm password</label>
                      <PasswordInput 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-[#004d2c] focus:ring-2 focus:ring-[#004d2c]/10 focus:outline-none rounded-xl text-sm font-medium placeholder-slate-400 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#004d2c] hover:bg-[#003820] text-white font-extrabold shadow-md shadow-[#004d2c]/10 text-xs tracking-wider uppercase rounded-xl border-none flex items-center justify-center gap-2 pt-0.5 transition-all duration-200"
                  >
                    {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>

                {/* Google Sign-In */}
                <div>
                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or Register With</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleRegister}
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold uppercase tracking-wide text-[11px] rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.67 0 3.14.58 4.31 1.71l3.22-3.22C17.58 1.63 15 .75 12 .75 7.37.75 3.4 3.4 1.5 7.23l3.83 2.97C6.27 7.03 8.92 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.46-1.1 2.69-2.33 3.51l3.63 2.82c2.12-1.95 3.75-4.83 3.75-8.46z" />
                      <path fill="#FBBC05" d="M5.33 14.8c-.24-.71-.38-1.48-.38-2.28s.14-1.57.38-2.28L1.5 7.27C.54 9.17 0 11.23 0 13.4c0 2.17.54 4.23 1.5 6.13l3.83-2.73z" />
                      <path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.08 7.96-2.92l-3.63-2.82c-1.12.75-2.55 1.21-4.33 1.21-3.08 0-5.73-1.99-6.67-5.16L1.5 16.53c1.9 3.83 5.87 6.72 10.5 6.72z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <p className="text-center text-sm font-semibold text-slate-400">
                  Already have an account? <Link to="/login" className="text-[#004d2c] font-black hover:underline">Login</Link>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
