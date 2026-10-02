import React, { useState } from 'react';
import { Shield, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { t, type Language } from '../i18n';

export interface PersonaProfile {
  id: string;
  name: string;
  designation: string;
  department: string;
  focusArea: string;
  clearanceLevel: string;
  badge: string;
  avatarInitials: string;
}

export const PERSONA_PROFILES: PersonaProfile[] = [
  {
    id: 'civil_procurement_officer',
    name: 'Er. Rajesh Kumar Sharma',
    designation: 'Senior Procurement Officer (Civil Works)',
    department: 'Ministry of Road Transport and Highways (MoRTH) / CPWD',
    focusArea: 'GFR 144(i) Anti-Monopoly & IS 269 / IS 456 Structural Invariants',
    clearanceLevel: 'Statutory Tender Approver (Level 3)',
    badge: 'Civil & Highway Infrastructure',
    avatarInitials: 'RS',
  },
  {
    id: 'gem_electrical_evaluator',
    name: 'Smt. Priya Sundaram',
    designation: 'GeM Technical Bid Evaluator (Electrotechnical)',
    department: 'Government e-Marketplace (GeM) / Central Electricity Authority',
    focusArea: 'Ministry of Power QCO Mandates & IS 1180 / IS 335 Conformance',
    clearanceLevel: 'Technical Evaluation Committee (TEC)',
    badge: 'GeM Electrotechnical QCO',
    avatarInitials: 'PS',
  },
  {
    id: 'chief_vigilance_auditor',
    name: 'Dr. Anandvardhan Rao, IA&AS',
    designation: 'Chief Vigilance Officer / CAG Principal Auditor',
    department: 'Central Vigilance Commission (CVC) / CAG Audit Directorate',
    focusArea: 'SHA-256 Non-Repudiation, Forensic Proof DAG & Corrigenda Ledger',
    clearanceLevel: 'Sovereign Audit Inspector',
    badge: 'CVC Vigilance & Audit Defense',
    avatarInitials: 'AR',
  },
];

interface PersonaGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (persona: PersonaProfile) => void;
  currentPersonaId?: string;
  language: Language;
}

export const PersonaGatewayModal: React.FC<PersonaGatewayModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
  currentPersonaId,
  language,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    currentPersonaId || PERSONA_PROFILES[0].id
  );

  if (!isOpen) return null;

  const currentProfile =
    PERSONA_PROFILES.find((p) => p.id === selectedId) || PERSONA_PROFILES[0];

  const handleLaunch = () => {
    onSelectPersona(currentProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-black max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Institutional Top Bar */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center font-mono text-sm">
              BIS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight font-serif">
                  MAANAKSETU · {t('personaGateway', language)}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-white/20 rounded text-slate-100">
                  Govt. of India
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {t('statutoryMandate', language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {t('selectPersona', language)}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select an institutional demo account to experience role-specific regulatory scrutiny, audit defense, and corrigenda workflows.
            </p>
          </div>

          {/* Persona Card Selector */}
          <div className="grid grid-cols-1 gap-3">
            {PERSONA_PROFILES.map((persona) => {
              const isSelected = persona.id === selectedId;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedId(persona.id)}
                  className={`p-4 border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'border-black bg-slate-50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {persona.avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {persona.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-300 text-slate-700">
                          {persona.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {persona.designation}
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {persona.department}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-700 bg-white p-2 border border-slate-200 font-mono">
                      <span className="font-semibold text-slate-900">Audit Focus:</span>{' '}
                      {persona.focusArea}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Credentials Banner */}
          <div className="bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Demo Session Mode:</strong> Pre-authenticated for Smart India Hackathon jury evaluation. Full access to GFR 144(i) verifier, Typst PDF generation, and SHA-256 seals.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 border-t border-black px-6 py-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-mono">
            Active: <strong>{currentProfile.designation}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-black hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>{t('launchDemo', language)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
