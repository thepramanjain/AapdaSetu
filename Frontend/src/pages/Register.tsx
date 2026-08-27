import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as THREE from 'three';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Building2, 
  User, 
  Globe, 
  Key,
  Copy,
  Check,
  ArrowLeft,
  HeartHandshake,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const registerUser = useStore((state) => state.registerUser);

  const [role, setFormRole] = useState<'government' | 'ngo'>('government');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [stateName, setStateName] = useState('Assam');
  const [password, setPassword] = useState('');
  
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const randomHex = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setWalletAddress(randomHex);
  }, [role]);

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE SETUP
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } catch {
      return;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 1.8, 12);
    pointLight.position.set(-5, -5, 2);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x10b981, 1.5, 12);
    pointLight2.position.set(5, 5, 2);
    scene.add(pointLight2);

    const geometry = new THREE.TorusKnotGeometry(1, 0.35, 128, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.25,
      metalness: 0.15,
      wireframe: false,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.scale.set(1.4, 1.4, 1.4);
    scene.add(torusKnot);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let clock = new THREE.Clock();
    let raf = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      torusKnot.rotation.x = elapsedTime * 0.25;
      torusKnot.rotation.y = elapsedTime * 0.35;
      torusKnot.rotation.x += (mouseY * 0.4 - torusKnot.rotation.x) * 0.05;
      torusKnot.rotation.y += (mouseX * 0.4 - torusKnot.rotation.y) * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !agencyName.trim() || !password.trim()) {
      alert('Please fill out all required parameters.');
      return;
    }

    setIsLoading(true);
    
    const phases = [
      "Generating Secp256k1 Keypair...",
      "Registering Liaison Node on chain...",
      "Assigning Smart Contract Access Token...",
      "Finalizing Cryptographic Registration..."
    ];

    let current = 0;
    setLoadingPhase(phases[0]);

    const interval = setInterval(() => {
      current++;
      if (current < phases.length) {
        setLoadingPhase(phases[current]);
      } else {
        clearInterval(interval);
        setIsLoading(false);
        setIsSuccess(true);
        
        registerUser({
          id: `node-${Date.now()}`,
          name: fullName,
          email,
          role,
          agency: agencyName
        });
      }
    }, 600);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-emerald-50/40 flex items-center justify-center p-4 overflow-hidden font-sans">
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      <div className="relative z-10 mx-auto max-w-2xl w-full">
        
        <motion.div
          className="backdrop-blur-xl bg-white/80 rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.15)] border border-white/90 relative overflow-hidden transition-all duration-500"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
              style={{
                background: 'linear-gradient(145deg, #FFF0D6, #FFE4B5)',
                border: '1px solid rgba(166,118,60,0.35)',
                color: '#7C3D0A',
              }}
            >
              <Sparkles className="h-3 w-3" />
              Node Onboarding
            </div>
          </div>

          {!isSuccess ? (
            <>
              <div className="space-y-2 mb-8">
                <h2 className="font-display font-black text-3xl" style={{ color: '#0B3321' }}>
                  Register Agency Node
                </h2>
                <p className="text-xs font-medium" style={{ color: '#4B6858' }}>
                  Set up your cryptographic credentials to participate in real-time disaster intelligence and relief distribution.
                </p>
              </div>

              {/* Role Switcher */}
              <div
                className="p-1 rounded-2xl flex items-center gap-1 mb-6"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,248,237,0.9), rgba(255,244,224,0.9))',
                  border: '1px solid rgba(223,189,115,0.3)',
                  boxShadow: 'var(--shadow-deboss)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setFormRole('government')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                  style={{
                    background: role === 'government'
                      ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                      : 'transparent',
                    color: role === 'government' ? '#fff' : '#4B6858',
                    boxShadow: role === 'government' ? 'var(--shadow-button)' : 'none',
                  }}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Government Agency
                </button>
                <button
                  type="button"
                  onClick={() => setFormRole('ngo')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                  style={{
                    background: role === 'ngo'
                      ? 'linear-gradient(135deg, #34D399, #059669)'
                      : 'transparent',
                    color: role === 'ngo' ? '#fff' : '#4B6858',
                    boxShadow: role === 'ngo' ? 'var(--shadow-button)' : 'none',
                  }}
                >
                  <HeartHandshake className="h-3.5 w-3.5" />
                  Relief NGO
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">
                      Full Name / Contact Person
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Rajesh Kumar"
                        className="input-skeu pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">
                      Official Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="official@agency.gov.in"
                        className="input-skeu pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">
                      Agency Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder={role === 'government' ? 'State Disaster Management Authority' : 'Rapid Response India NGO'}
                        className="input-skeu pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">
                      State / Region Jurisdiction
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="input-skeu pl-10 appearance-none cursor-pointer"
                      >
                        {['Assam', 'Odisha', 'Gujarat', 'Himachal Pradesh', 'Kerala', 'Maharashtra', 'Uttarakhand', 'National HQ'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input-skeu pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Auto-generated cryptographic wallet */}
                <div
                  className="p-4 rounded-2xl space-y-2 mt-2"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,248,237,0.9), rgba(255,244,224,0.9))',
                    border: '1px solid rgba(223,189,115,0.3)',
                    boxShadow: 'var(--shadow-deboss)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase text-amber-800">
                      Generated Node Wallet Address
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="text-xs font-mono font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-700 break-all bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                    {walletAddress}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-skeu-primary py-3.5 mt-6 text-base font-black"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {loadingPhase}
                    </div>
                  ) : (
                    'Provision Node & Register Account'
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div
                className="h-20 w-20 rounded-3xl mx-auto flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                  border: '1px solid rgba(16,185,129,0.4)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-black text-2xl" style={{ color: '#0B3321' }}>
                  Node Successfully Registered!
                </h3>
                <p className="text-xs font-medium max-w-md mx-auto" style={{ color: '#4B6858' }}>
                  Your agency node for <span className="font-bold text-slate-900">{agencyName}</span> has been provisioned on-chain. You can now access your dashboard.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => navigate(role === 'government' ? '/gov/dashboard' : '/ngo/dashboard')}
                  className="btn-skeu-primary px-8 py-3 text-sm font-black"
                >
                  Enter Dashboard →
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>

      </div>
    </div>
  );
};

export default Register;
