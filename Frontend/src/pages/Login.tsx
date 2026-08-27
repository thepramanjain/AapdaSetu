import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import InteractiveCharacter from '../components/ui/InteractiveCharacter';

const MOUNTAIN_IMG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const setRole = useStore((state) => state.setRole);
  const registerUser = useStore((state) => state.registerUser);

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setFormRole] = useState<'government' | 'ngo'>('ngo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  // 3D Parallax Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 12;
    const y = (clientY / innerHeight - 0.5) * 12;
    rotateX.set(-y);
    rotateY.set(x);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  useEffect(() => {
    const q = new URLSearchParams(routerLocation.search);
    const r = q.get('role');
    if (r === 'government' || r === 'govt') setFormRole('government');
    else if (r === 'ngo') setFormRole('ngo');
  }, [routerLocation.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (mode === 'login') {
      if (!email || !password) { setError('Please enter your email and password.'); return; }
      setLoading(true);
      setTimeout(() => { setLoading(false); setRole(role); navigate(role === 'ngo' ? '/ngo/dashboard' : '/gov/dashboard'); }, 850);
    } else if (mode === 'signup') {
      if (!fullName || !email || !password) { setError('Please fill in all fields.'); return; }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        registerUser({ id: `user-${Date.now()}`, name: fullName, email, role, agency: agencyName || 'Registered Unit' });
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => setMode('login'), 1100);
      }, 950);
    } else {
      if (!email) { setError('Please enter your email.'); return; }
      setLoading(true);
      setTimeout(() => { setLoading(false); setSuccess('Reset link sent to your registered email.'); }, 750);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full flex items-center justify-center font-sans overflow-hidden relative select-none"
      style={{
        paddingTop: '80px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 50%, #dcfce7 100%)',
        perspective: '1200px',
      }}
    >
      {/* Background Animated Atmosphere & Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.25) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Floating Particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={`part-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 6 + 3,
            height: Math.random() * 6 + 3,
            left: `${(i * 7.5) % 100}%`,
            top: `${(i * 13) % 90}%`,
            background: 'rgba(16, 185, 129, 0.4)',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
          }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: (i * 0.4) }}
        />
      ))}

      {/* ─── Centered macOS Window Card ─── */}
      <motion.div
        className="relative z-10 w-full max-w-[980px] mx-4 rounded-[2rem] overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          boxShadow: '0 35px 80px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
          backgroundColor: '#0F172A',
        }}
        initial={{ opacity: 0, scale: 0.92, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.25 }}
      >
        {/* macOS Title Bar */}
        <div
          className="h-11 flex items-center px-5 gap-2.5 relative z-30"
          style={{
            background: 'rgba(20, 30, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <motion.div whileHover={{ scale: 1.25 }} className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] cursor-pointer shadow-sm" />
          <motion.div whileHover={{ scale: 1.25 }} className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] cursor-pointer shadow-sm" />
          <motion.div whileHover={{ scale: 1.25 }} className="w-3.5 h-3.5 rounded-full bg-[#27c93f] cursor-pointer shadow-sm" />
          
          <div className="flex-1 flex justify-center">
            <div className="px-6 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] text-emerald-200/80 font-mono flex items-center gap-1.5 shadow-inner">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>aapdasetu.org/auth</span>
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Window Content with Green Mountain Landscape Backdrop */}
        <div className="relative min-h-[580px] w-full overflow-hidden flex items-center p-6 sm:p-10">
          
          {/* Landscape Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{
              backgroundImage: `url(${MOUNTAIN_IMG})`,
            }}
          >
            {/* Ambient Lighting & Mist Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          {/* Birds in Sky */}
          <div className="absolute top-16 right-36 opacity-70 pointer-events-none">
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 Q15 14 20 20 Q25 14 30 20" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M45 10 Q50 4 55 10 Q60 4 65 10" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M75 22 Q80 16 85 22 Q90 16 95 22" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Live Telemetry Badge Floating on Right */}
          <motion.div
            className="absolute top-8 right-8 hidden md:flex items-center gap-2 px-4 py-2 rounded-full z-20"
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-white text-xs font-mono font-bold tracking-wider">36 STATES CONNECTED</span>
          </motion.div>

          {/* ─── Frosted Glass Form Card Overlay (Left-Centered) ─── */}
          <motion.div
            className="w-full sm:w-[420px] rounded-[1.75rem] p-7 sm:p-8 relative z-20 overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 1)',
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header with Interactive Character Mascot */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                        Welcome
                      </h1>
                      <motion.span
                        className="text-2xl inline-block"
                        animate={{ rotate: [0, 20, -10, 20, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                      >
                        👋
                      </motion.span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-[210px]">
                      {mode === 'login' && 'Login to access your AapdaSetu account'}
                      {mode === 'signup' && 'Create your AapdaSetu profile'}
                      {mode === 'forgot' && 'Reset link sent to your email'}
                    </p>
                  </div>

                  {/* 3D Animated Sentinel Mascot */}
                  <div className="shrink-0 -mt-2">
                    <InteractiveCharacter
                      isTypingPassword={isPasswordFocused}
                      isTypingEmail={isEmailFocused}
                      isTypingName={isNameFocused}
                      isSuccess={!!success}
                    />
                  </div>
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {success}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  {mode === 'signup' && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh Varma"
                        value={fullName}
                        onFocus={() => setIsNameFocused(true)}
                        onBlur={() => setIsNameFocused(false)}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all placeholder-slate-400 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="mail@abc.com"
                      value={email}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all placeholder-slate-400 font-medium"
                    />
                  </div>

                  {mode !== 'forgot' && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1 ml-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all placeholder-slate-400 font-medium"
                      />
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="flex justify-between items-center px-1">
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none font-medium">
                        <input type="checkbox" className="rounded accent-emerald-600 w-3.5 h-3.5" />
                        Remember Me
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Role Selector Pill */}
                  {mode !== 'forgot' && (
                    <div className="flex p-1 rounded-xl gap-1 bg-slate-100/90 border border-slate-200 mt-1">
                      {(['ngo', 'government'] as const).map((r) => (
                        <motion.button
                          key={r}
                          type="button"
                          onClick={() => setFormRole(r)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            role === r
                              ? 'bg-white text-emerald-800 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          {r === 'ngo' ? 'NGO Portal' : 'Gov Portal'}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-display font-black text-sm text-white mt-2 flex items-center justify-center gap-2 overflow-hidden relative shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #10B981 100%)',
                      boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Google Sign-in Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px flex-1 bg-slate-200/80" />
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">or sign in google</span>
                  <div className="h-px flex-1 bg-slate-200/80" />
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-slate-200 bg-white/90 hover:bg-white text-slate-700 font-bold text-xs rounded-xl py-3 flex items-center justify-center gap-2.5 transition shadow-xs"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
                  <span>Continue with Google</span>
                </motion.button>

                {/* Footer Switch */}
                <p className="text-center text-xs text-slate-600 mt-4 font-medium">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-emerald-700 font-bold hover:underline ml-1"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
                {mode === 'forgot' && (
                  <p className="text-center text-xs text-slate-500 mt-2">
                    <button onClick={() => setMode('login')} className="text-emerald-700 font-bold hover:underline">
                      ← Back to Login
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
