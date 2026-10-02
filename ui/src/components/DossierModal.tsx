import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import type { AuditResult } from '../types';
import { DossierView } from './DossierView';

interface DossierModalProps {
  auditResult: AuditResult;
  onClose: () => void;
  onOpenStandardDetail: (isNumber: string) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  auditResult,
  onClose,
  onOpenStandardDetail,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-5xl my-auto max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Statutory Conformance Dossier · Due Diligence Report
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Dossier</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dossier Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 sm:p-10 max-w-4xl mx-auto">
            <DossierView
              auditResult={auditResult}
              onOpenStandardDetail={onOpenStandardDetail}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
