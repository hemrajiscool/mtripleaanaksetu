import React from 'react';
import {
  FileDown,
  PlusCircle,
  Lock,
  Globe,
  LogIn,
} from 'lucide-react';
import type { AuditResult } from '../types';
import type { PersonaProfile } from './PersonaGatewayModal';
import { t, type Language } from '../i18n';

interface RecommendationHeaderProps {
  auditResult: AuditResult | null;
  onAuditNew: () => void;
  onExportDossier: () => void;
  language: Language;
  onToggleLanguage: () => void;
  persona: PersonaProfile;
  onOpenPersonaModal: () => void;
  onOpenVerifyModal: () => void;
  onOpenLoginScreen?: () => void;
}

export const RecommendationHeader: React.FC<RecommendationHeaderProps> = ({
  auditResult,
  onAuditNew,
  onExportDossier,
  language,
  onToggleLanguage,
  persona,
  onOpenPersonaModal,
  onOpenVerifyModal,
  onOpenLoginScreen,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#f386a1]/90 backdrop-blur-xs border-b border-black/20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand & Institutional Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white border border-black px-3 py-1 flex items-center gap-2.5 shadow-2xs">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
              MS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight font-serif">
                  {t('appTitle', language)}
                </span>
                <span className="text-[11px] font-sans text-slate-600 font-normal">
                  {language === 'hi' ? 'MAANAKSETU' : 'मानक सेतु'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                {t('appSubtitle', language)}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Persona Pill & Public Verification */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Persona Account Pill */}
          <button
            type="button"
            onClick={onOpenPersonaModal}
            className="bg-white hover:bg-slate-50 border border-black px-2.5 py-1 flex items-center gap-2 text-xs text-slate-800 shadow-2xs transition-colors cursor-pointer group"
            title="Switch Institutional Demo Role"
          >
            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
              {persona.avatarInitials}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono text-slate-500 uppercase leading-none">
                {t('demoAccount', language)}
              </div>
              <div className="font-bold text-[11px] text-slate-900 leading-tight max-w-[170px] truncate">
                {persona.name}
              </div>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 border border-slate-300 px-1 py-0.2 rounded text-slate-600 group-hover:bg-black group-hover:text-white transition-colors">
              Switch
            </span>
          </button>

          {/* Public Verification Trigger */}
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className="bg-white hover:bg-slate-50 border border-black px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono text-slate-800 shadow-2xs transition-colors cursor-pointer"
            title="Verify SHA-256 Audit Digest"
          >
            <Lock className="w-3.5 h-3.5 text-slate-700" />
            <span className="font-semibold">{t('verifyDigestBtn', language)}</span>
          </button>

          {/* Official Login Screen Trigger */}
          {onOpenLoginScreen && (
            <button
              type="button"
              onClick={onOpenLoginScreen}
              className="bg-white hover:bg-slate-50 border border-black px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono text-slate-800 shadow-2xs transition-colors cursor-pointer"
              title="Official Institutional Login Portal (Credentials & Roles)"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-700" />
              <span className="font-semibold">{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
            </button>
          )}
        </div>

        {/* Right: Actions, Language Switcher & Audit Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="bg-white hover:bg-slate-50 border border-black px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-900 shadow-2xs transition-colors cursor-pointer"
            title="Toggle Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-slate-700" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {auditResult ? (
            <>
              <button
                type="button"
                onClick={onAuditNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-black hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">{t('auditNewDocument', language)}</span>
              </button>

              <button
                type="button"
                onClick={onExportDossier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black border border-black hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">{t('exportDossierPdf', language)}</span>
              </button>
            </>
          ) : (
            <div className="bg-white border border-black px-2.5 py-1.5 hidden sm:flex items-center gap-2 text-xs text-slate-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="font-mono text-[11px]">Authoritative Standards KB Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
