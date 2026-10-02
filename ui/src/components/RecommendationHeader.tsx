import React from 'react';
import { FileDown, PlusCircle } from 'lucide-react';
import type { AuditResult } from '../types';

interface RecommendationHeaderProps {
  auditResult: AuditResult | null;
  onAuditNew: () => void;
  onExportDossier: () => void;
}

export const RecommendationHeader: React.FC<RecommendationHeaderProps> = ({
  auditResult,
  onAuditNew,
  onExportDossier,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#f386a1]/90 backdrop-blur-xs border-b border-black/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Identity (Crisp Rectangle Block) */}
        <div className="bg-white border border-black px-3 py-1.5 flex items-center gap-3 shadow-2xs">
          <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs font-mono">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight font-serif">
                MAANAKSETU
              </span>
              <span className="text-[11px] font-sans text-slate-600 font-normal">
                मानक सेतु
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              National Standards Recommendation & Verification Engine · BIS Act 2016
            </p>
          </div>
        </div>

        {/* Right: Contextual Controls (Crisp Rectangle Blocks) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {auditResult ? (
            <>
              <button
                type="button"
                onClick={onAuditNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-black hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
                <span>Audit New Document</span>
              </button>

              <button
                type="button"
                onClick={onExportDossier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black border border-black hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-300" />
                <span>Export Dossier (PDF)</span>
              </button>
            </>
          ) : (
            <div className="bg-white border border-black px-3 py-1.5 flex items-center gap-2 text-xs text-slate-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="hidden sm:inline font-mono text-[11px]">Authoritative Standards KB Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
