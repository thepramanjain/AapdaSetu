import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  MapPin, 
  Zap, 
  Database, 
  Globe, 
  Shield, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Login: React.FC = () => {
  const setRole = useStore((state) => state.setRole);
  const registerUser = useStore((state) => state.registerUser);
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // Mode: 'login' | 'register' | 'forgot-password'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Role: 'ngo' | 'government'
  const [role, setFormRole] = useState<'ngo' | 'government'>('ngo');

  // Sync role state with URL query parameter changes
  useEffect(() => {
    const queryParams = new URLSearchParams(routerLocation.search);
    const urlRole = queryParams.get('role');
    if (urlRole === 'government' || urlRole === 'govt') {
      setFormRole('government');
    } else if (urlRole === 'ngo') {
      setFormRole('ngo');
    }
  }, [routerLocation.search]);

  // Input states
  const [email, setEmail] = useState('ngo@aapdasetu.org');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [ngoLicense, setNgoLicense] = useState('');
  const [govDept, setGovDept] = useState('National Disaster Management Authority');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus and pre-fill handling on mode or role change
  useEffect(() => {
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    if (mode === 'login') {
      setEmail(role === 'ngo' ? 'ngo@aapdasetu.org' : 'govt@aapdasetu.org');
      setPassword('password123');
    }

    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [mode, role]);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleRoleSelect = (selectedRole: 'ngo' | 'government') => {
    setFormRole(selectedRole);
    if (mode === 'login') {
      setEmail(selectedRole === 'ngo' ? 'ngo@aapdasetu.org' : 'govt@aapdasetu.org');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'forgot-password') {
      if (!email.trim()) {
        triggerShake('Please enter your email address');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess('Password reset link sent to your registered email address.');
      }, 800);
      return;
    }

    if (mode === 'register') {
      if (!username.trim() || !email.trim() || !phone.trim() || !location.trim() || !password || !confirmPassword) {
        triggerShake('All fields are required for registration');
        return;
      }
      if (password.length < 6) {
        triggerShake('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        triggerShake('Passwords do not match');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        registerUser({
          fullName: username,
          email,
          role,
          agencyName: username,
          state: location,
          walletAddress: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
        });
        setRole(role);
        if (role === 'government') {
          navigate('/gov/dashboard');
        } else {
          navigate('/ngo/dashboard');
        }
      }, 600);
      return;
    } else if (mode === 'login') {
      if (!email.trim() || !password) {
        triggerShake('Email and password are required');
        return;
      }
      if (password.length < 6) {
        triggerShake('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRole(role);
      if (role === 'government') {
        navigate('/gov/dashboard');
      } else {
        navigate('/ngo/dashboard');
      }
    }, 600);
  };

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-emerald-600" />,
      title: 'Smart AI Assistance',
      desc: 'Automatically calculates disaster damage and recommends relief funds.',
    },
    {
      icon: <Database className="h-5 w-5 text-emerald-600" />,
      title: 'Transparent Fund Tracking',
      desc: 'Clear, trackable history of every relief donation and government approval.',
    },
    {
      icon: <Globe className="h-5 w-5 text-emerald-600" />,
      title: 'Real-Time Live Map',
      desc: 'Interactive disaster map and live volunteer team coordination.',
    },
    {
      icon: <Shield className="h-5 w-5 text-emerald-600" />,
      title: 'Simple & Secure Portals',
      desc: 'Easy role-based login for Government Officials, NGOs & Volunteers.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
        
        {/* Left Column: Hero & Features */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-mono font-bold text-emerald-800 mb-4 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>✦ AapdaSetu Relief Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              AapdaSetu Disaster <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Response Platform
              </span>
            </h1>

            <p className="mt-4 text-base text-slate-600 leading-relaxed font-medium">
              Smart relief platform connecting Government Authorities, accredited NGOs, ground volunteers, and citizens in real time to save lives during disasters.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-card hover:shadow-card-hover transition-all duration-300 flex items-start gap-3.5"
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Auth Box Form */}
        <div className="lg:col-span-6 flex justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-elevated relative overflow-hidden"
          >
            {/* Logo & Header */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <img src="/favicon.png" alt="AapdaSetu Logo" className="h-12 w-12 object-contain animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                {mode === 'login' && 'Sign in to access your AapdaSetu portal.'}
                {mode === 'register' && 'Create an account to join the relief network.'}
                {mode === 'forgot-password' && 'Enter your email to receive a password reset link.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot-password' && (
              <div className="mt-6 flex bg-slate-100 p-1 rounded-full border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Account Role Selector */}
            {mode !== 'forgot-password' && (
              <div className="mt-5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ngo')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      role === 'ngo'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>NGO Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('government')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                      role === 'government'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Govt Official</span>
                  </button>
                </div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>

              {/* Username (Register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      Full Name / Org Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        ref={firstInputRef}
                        type="text"
                        placeholder="e.g. Relief India Foundation"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  Email Address / Credentials
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    ref={mode === 'login' ? firstInputRef : undefined}
                    type="email"
                    placeholder="name@aapdasetu.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Phone & Location (Register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        Contact Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        Base Operational Region
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Guwahati, Assam"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {role === 'ngo' ? (
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                          NGO Registration / License ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. NGO-IND-2026-X"
                          value={ngoLicense}
                          onChange={(e) => setNgoLicense(e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                          Government Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Ministry of Home Affairs"
                          value={govDept}
                          onChange={(e) => setGovDept(e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password */}
              <AnimatePresence>
                {mode !== 'forgot-password' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                        Password
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">min. 6 characters</span>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {mode === 'login' && (
                      <div className="text-right mt-1.5">
                        <button
                          type="button"
                          onClick={() => setMode('forgot-password')}
                          className="text-xs font-medium text-slate-500 hover:text-emerald-600 underline transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Password (Register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Global Error Banner with Shake Animation */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={
                      shakeError
                        ? { height: 'auto', opacity: 1, x: [-6, 6, -6, 6, 0] }
                        : { height: 'auto', opacity: 1, x: 0 }
                    }
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium flex items-center gap-2 font-mono"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? 'Signing in…'
                  : mode === 'login'
                  ? 'Sign In →'
                  : mode === 'register'
                  ? 'Create Account →'
                  : 'Send Reset Link'}
              </button>

              {mode === 'forgot-password' && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Login;
