import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Key, 
  Shield, 
  User, 
  Bell, 
  Sun,
  Moon,
  Laptop,
  CheckCircle,
  Save
} from 'lucide-react';
import { useStore } from '../hooks/useStore';

export const Settings: React.FC = () => {
  const role = useStore((state) => state.role);
  const registeredUser = useStore((state) => state.registeredUser);
  const isGov = role === 'government';

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'theme' | 'system'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(registeredUser?.fullName || (isGov ? 'NDMA Coordinator' : 'SEEDS Coordinator'));
  const [email, setEmail] = useState(registeredUser?.email || (isGov ? 'coordinator@ndma.gov.in' : 'seeds_lead@seedsindia.org'));
  const [agencyName, setAgencyName] = useState(registeredUser?.agencyName || (isGov ? 'National Disaster Management Authority' : 'SEEDS India Relief'));
  const [stateName, setStateName] = useState(registeredUser?.state || 'Assam');
  const [wallet, setWallet] = useState(registeredUser?.walletAddress || (isGov ? '0x2C45def789a9c8b824150df789a9cfb82415' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'));

  // Notification Toggle State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [blockchainLogs, setBlockchainLogs] = useState(true);
  const [autoAnalysisAlerts, setAutoAnalysisAlerts] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  // Success Save Toast State
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 font-sans max-w-3xl mx-auto relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-slide-in border border-slate-800 text-xs font-bold">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-[#1A7151]" />
          Portal Settings
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure profile details, notification preferences, themes, and blockchain node credentials.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Tabs Sidebar */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-200/80 pb-4 md:pb-0 pr-0 md:pr-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'profile' 
                ? 'bg-emerald-50 text-emerald-700 border-l-2 md:border-l-4 border-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            General Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'notifications' 
                ? 'bg-emerald-50 text-emerald-700 border-l-2 md:border-l-4 border-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>

          <button 
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'theme' 
                ? 'bg-emerald-50 text-emerald-700 border-l-2 md:border-l-4 border-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sun className="h-4 w-4" />
            Appearance
          </button>

          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'system' 
                ? 'bg-emerald-50 text-emerald-700 border-l-2 md:border-l-4 border-emerald-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Database className="h-4 w-4" />
            System & Node
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-xl shadow-xs p-6 min-h-[400px] flex flex-col justify-between">
          
          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Profile Credentials</h3>
                <p className="text-slate-400 text-[10.5px] mt-1 font-medium">Update account names, organizational agencies, and wallet connections.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div className="space-y-1.5">
                  <label>Full Representative Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-600 focus:bg-white px-4 py-2.5 text-slate-800 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Official Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-600 focus:bg-white px-4 py-2.5 text-slate-800 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Agency Name</label>
                  <input 
                    type="text" 
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-600 focus:bg-white px-4 py-2.5 text-slate-800 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label>Jurisdiction State</label>
                  <input 
                    type="text" 
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-600 focus:bg-white px-4 py-2.5 text-slate-800 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label>Blockchain Wallet Payout Key (Disbursement)</label>
                  <input 
                    type="text" 
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full rounded-xl bg-slate-50/50 border border-slate-200 focus:border-emerald-600 focus:bg-white px-4 py-2.5 text-slate-800 focus:outline-none font-mono transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A7151] hover:bg-[#0B3321] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-[#1A7151]/10 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* NOTIFICATION PREFERENCES */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Alert Toggles</h3>
                <p className="text-slate-400 text-[10.5px] mt-1 font-medium">Control which automated event triggers send notifications to your command center.</p>
              </div>

              <div className="space-y-4">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-800">Critical Flood & Earthquakes</p>
                    <p className="text-[10px] text-slate-400 font-medium">Send real-time alerts immediately when natural disasters trigger active verification states.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={emailAlerts}
                      onChange={() => setEmailAlerts(!emailAlerts)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-800">SDRF Field SMS Relays</p>
                    <p className="text-[10px] text-slate-400 font-medium">Trigger instant SMS broadcasts to active first responder task forces.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={smsAlerts}
                      onChange={() => setSmsAlerts(!smsAlerts)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-800">Ledger Contract Release Logs</p>
                    <p className="text-[10px] text-slate-400 font-medium">Alert when smart contract disbursals are signed and verified on the consensus chain.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={blockchainLogs}
                      onChange={() => setBlockchainLogs(!blockchainLogs)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Toggle 4 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-800">Auto-analysis Telemetry Reports</p>
                    <p className="text-[10px] text-slate-400 font-medium">Receive weekly summarized reports on GloFAS, IMD satellite geocodes, and risk models.</p>
                  </div>
                  <label className="relative inline-flex inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoAnalysisAlerts}
                      onChange={() => setAutoAnalysisAlerts(!autoAnalysisAlerts)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A7151] hover:bg-[#0B3321] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-[#1A7151]/10 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* APPEARANCE / THEME */}
          {activeTab === 'theme' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Appearance Settings</h3>
                <p className="text-slate-400 text-[10.5px] mt-1 font-medium">Configure color displays, themes, and dashboard graphic states.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                    theme === 'light'
                      ? 'border-[#1A7151] bg-[#1A7151]/[0.03] text-[#1A7151]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Sun className="h-6 w-6" />
                  Light Theme
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                    theme === 'dark'
                      ? 'border-[#1A7151] bg-[#1A7151]/[0.03] text-[#1A7151]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Moon className="h-6 w-6" />
                  Dark Theme
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                    theme === 'system'
                      ? 'border-[#1A7151] bg-[#1A7151]/[0.03] text-[#1A7151]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Laptop className="h-6 w-6" />
                  System Default
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A7151] hover:bg-[#0B3321] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-[#1A7151]/10 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* SYSTEM & NODE CREDENTIALS */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Blockchain Node Configuration</h3>
                <p className="text-slate-400 text-[10.5px] mt-1 font-medium">Verify system-level connection addresses, satellite geocode links, and compliance authorities.</p>
              </div>

              <div className="space-y-5">
                {/* Node details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Rpc Endpoint</label>
                    <input type="text" readOnly value="https://node-1.aapdasetu.gov.in:8545" className="w-full rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5 text-slate-500 font-mono focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Chain ID</label>
                    <input type="text" readOnly value="42901 (AapdaSetu Mainnet)" className="w-full rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5 text-slate-500 focus:outline-none" />
                  </div>
                </div>

                {/* API Hooks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">IMD Satellite Key</label>
                    <input type="text" readOnly value="••••••••••••••••••••" className="w-full rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5 text-slate-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">USGS Feeds Hook</label>
                    <input type="text" readOnly value="https://earthquake.usgs.gov/fdsnws/event/1/" className="w-full rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5 text-slate-500 focus:outline-none" />
                  </div>
                </div>

                {/* Authority */}
                <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                  <label className="text-[10px] text-slate-400 uppercase font-bold">Authority Parameters & HSM Hardware</label>
                  <div className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-1.5">
                    <p><span className="font-bold text-slate-800">Signing Node HSM:</span> Hardware Security Module connected and active (Level-3 FIPS 140-2).</p>
                    <p><span className="font-bold text-slate-800">Lead Registry:</span> National Disaster Response Ledger (NDRL).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
