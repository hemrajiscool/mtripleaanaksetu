import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { PERSONA_PROFILES, type PersonaProfile } from './PersonaGatewayModal';
import { type Language } from '../i18n';

interface LoginScreenProps {
  onLogin: (persona: PersonaProfile) => void;
  onCancel?: () => void;
  canCancel?: boolean;
  currentPersona?: PersonaProfile;
  language: Language;
}

interface DemoCredential {
  roleId: string;
  roleName: string;
  username: string;
  defaultPass: string;
  badge: string;
  department: string;
}

const DEMO_CREDENTIALS: Record<string, DemoCredential> = {
  civil_procurement_officer: {
    roleId: 'civil_procurement_officer',
    roleName: 'Procurement Officer',
    username: 'procurement.officer',
    defaultPass: 'MaanakSetu@2026',
    badge: 'MoRTH / CPWD Civil Works',
    department: 'Ministry of Road Transport and Highways',
  },
  gem_electrical_evaluator: {
    roleId: 'gem_electrical_evaluator',
    roleName: 'Technical Evaluator',
    username: 'gem.evaluator',
    defaultPass: 'GeMStandards#2026',
    badge: 'GeM Electrotechnical QCO',
    department: 'Government e-Marketplace / CEA',
  },
  chief_vigilance_auditor: {
    roleId: 'chief_vigilance_auditor',
    roleName: 'Auditor',
    username: 'vigilance.auditor',
    defaultPass: 'CVCVigilance!2026',
    badge: 'CVC & CAG Vigilance Audit',
    department: 'Central Vigilance Commission / CAG Directorate',
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onCancel,
  canCancel = false,
  currentPersona,
  language,
}) => {
  const initialRoleId = currentPersona?.id || 'civil_procurement_officer';
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);
  const [username, setUsername] = useState<string>(
    DEMO_CREDENTIALS[initialRoleId]?.username || 'procurement.officer'
  );
  const [password, setPassword] = useState<string>(
    DEMO_CREDENTIALS[initialRoleId]?.defaultPass || '••••••••'
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeCred = DEMO_CREDENTIALS[selectedRoleId] || DEMO_CREDENTIALS.civil_procurement_officer;
  const activeProfile =
    PERSONA_PROFILES.find((p) => p.id === selectedRoleId) || PERSONA_PROFILES[0];

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const cred = DEMO_CREDENTIALS[roleId];
    if (cred) {
      setUsername(cred.username);
      setPassword(cred.defaultPass);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(activeProfile);
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#07130e] text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. Official Government Header */}
      <header className="border-b border-emerald-950/80 bg-[#07130e]/95 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Logo & Emblem matching reference */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white font-serif tracking-tight">
                Maanak<span className="text-emerald-400">Setu</span>
              </span>
              <span className="text-xs text-slate-400 border-l border-slate-700 pl-2 font-mono">
                मानक सेतु
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded text-[11px] text-slate-300 font-mono">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bureau of Indian Standards · Dept. of Consumer Affairs</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-[11px] font-mono text-emerald-400/90 font-semibold flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Central Public Procurement Portal • GeM Standards Cell
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              National Autonomous Verification Gateway
            </div>
          </div>

          {canCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कार्यक्षेत्र पर लौटें' : 'Return to Workstation'}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Login Form matching maanaksetu_reference.png */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#0d1d16] border border-emerald-900/60 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Centered Institutional Seal & Titles */}
          <div className="text-center relative z-10 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner mb-3">
              <Shield className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
              MaanakSetu
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Public Procurement Standards Intelligence
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold tracking-wider text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DEMO ENVIRONMENT
            </div>
          </div>

          <div className="h-px bg-slate-800/80 mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Field 1: Role Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role:
              </label>
              <div className="relative">
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full bg-[#13271e] border border-emerald-800/60 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans cursor-pointer transition-colors appearance-none pr-8"
                >
                  <option value="civil_procurement_officer">
                    Procurement Officer (MoRTH / CPWD Civil Works)
                  </option>
                  <option value="gem_electrical_evaluator">
                    Technical Evaluator (GeM / CEA Electrotechnical)
                  </option>
                  <option value="chief_vigilance_auditor">
                    Auditor (CVC / CAG Principal Auditor)
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Field 2: Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username:
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. procurement.officer"
                  required
                  className="w-full bg-[#13271e] border border-emerald-800/60 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Field 3: Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password:
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#13271e] border border-emerald-800/60 rounded-lg pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Selected Profile Context Box */}
            <div className="bg-[#10221a] border border-emerald-900/80 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white">{activeProfile.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  {activeCred.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                {activeCred.department}
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                Focus: <span className="text-emerald-300">{activeProfile.focusArea}</span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
            >
              <span>Sign in as {activeCred.roleName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector Pills */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
              Quick Switch Demo Accounts
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(DEMO_CREDENTIALS).map((cred) => {
                const isSelected = cred.roleId === selectedRoleId;
                return (
                  <button
                    key={cred.roleId}
                    type="button"
                    onClick={() => handleRoleChange(cred.roleId)}
                    className={`px-2 py-1.5 text-[10px] font-mono rounded border transition-colors cursor-pointer truncate ${
                      isSelected
                        ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    title={`Load ${cred.roleName} credentials`}
                  >
                    {cred.roleName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Return to Workstation Option */}
          {canCancel && onCancel && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-white underline font-mono cursor-pointer transition-colors"
              >
                ← Return to Active Workstation without changes
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-emerald-950/60 bg-[#07130e] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Bureau of Indian Standards Act 2016 · GFR 2017 Rule 144(i)</span>
          <span className="text-emerald-500/80">Tamper-Evident SHA-256 Non-Repudiation</span>
        </div>
      </footer>
    </div>
  );
};
