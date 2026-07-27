import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Building, 
  User, 
  Globe, 
  Key,
  Copy,
  Check,
  ArrowLeft
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
  
  // Auto-generate a dummy cryptographic wallet address for the node
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Generate a mock hex address
    const randomHex = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setWalletAddress(randomHex);
  }, [role]);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !agencyName.trim() || !password.trim()) {
      alert('Please fill out all sandbox parameters.');
      return;
    }

    setIsLoading(true);
    
    // Simulate smart contract node verification phases
    const phases = [
      "Generating Secp256k1 Keypair...",
      "Registering Liaison Node on chain...",
      "Signing consensus manifest...",
      "Node successfully broadcasted!"
    ];

    let currentPhase = 0;
    setLoadingPhase(phases[0]);

    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < phases.length) {
        setLoadingPhase(phases[currentPhase]);
      } else {
        clearInterval(interval);
        setIsLoading(false);
        setIsSuccess(true);
        
        // Save to Zustand store
        registerUser({
          fullName,
          email,
          role,
          agencyName,
          state: stateName,
          walletAddress
        });

        // Redirect after a brief moment
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-green-200/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6 relative z-10">
        <button 
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </button>

        <div className="flex justify-center items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-base tracking-tighter">
            AS
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            AapdaSetu
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Register Agency Node
        </h2>
        <p className="text-center text-xs text-slate-400 font-medium">
          Deploy and authenticate your official state liaison node on the AapdaSetu network.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 border border-slate-200/80 rounded-2xl shadow-sm sm:px-10 space-y-6">
          
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 animate-bounce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Node Successfully Registered!</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Liaison node is now live and signed on the blockchain ledger. Redirecting to Login...
                </p>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 space-y-4"
              >
                <div className="mx-auto h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono font-bold text-green-700">{loadingPhase}</p>
                <p className="text-[10px] text-slate-400 font-medium">Deploying node consensus variables to sandbox mainnet...</p>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                {/* Role Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setFormRole('government')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      role === 'government'
                        ? 'bg-white text-green-700 shadow-sm border border-slate-200/30'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Gov Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole('ngo')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      role === 'ngo'
                        ? 'bg-white text-green-700 shadow-sm border border-slate-200/30'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    NGO Responder
                  </button>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Liaison Officer Name</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rajesh@aapdasetu.gov.in"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Organization Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {role === 'government' ? 'Agency Name' : 'NGO Organization Name'}
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder={role === 'government' ? 'e.g. Bihar State Disaster Authority' : 'e.g. SEEDS India Corps'}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Liaison State Jurisdiction</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer"
                    >
                      {["Assam", "Sikkim", "Bihar", "Gujarat", "Delhi", "Odisha", "Kerala"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keypair Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Node Blockchain Public Address</label>
                  <div className="relative rounded-xl shadow-xs flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={walletAddress}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[10px] text-slate-500 font-mono font-bold select-all focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="px-3 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-500 transition-colors"
                      title="Copy public address"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Access PIN / Password</label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-green-600/10 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                    Register Liaison Node
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
};

export default Register;
