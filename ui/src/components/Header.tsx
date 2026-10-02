import React from 'react';
import { Shield, FileDown, RotateCcw } from 'lucide-react';
import type { AuditResult, GateStatus } from '../types';
import { getDossierPdfUrl } from '../services/api';

interface HeaderProps {
  auditResult: AuditResult | null;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ auditResult, onReset }) => {
  const getGateBadge = (status: GateStatus) => {
    switch (status) {
      case 'STATUTORY_NON_COMPLIANT':
        return {
          label: 'STATUTORY NON-COMPLIANT',
          classes: 'bg-red-50 text-red-700 border-red-200',
        };
      case 'TECHNICAL_DEFECT':
        return {
          label: 'TECHNICAL DEFECT',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'ACTION_REQUIRED_REVIEW':
        return {
          label: 'ACTION REQUIRED: REVIEW',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'VERIFIED_CONFORMANT':
      default:
        return {
          label: 'VERIFIED CONFORMANT',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
    }
  };

  const gateBadge = auditResult ? getGateBadge(auditResult.gate_status) : null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Statutory Authority */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
            <div className="h-9 w-9 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
              <Shield className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base font-display">
                  MAANAKSETU
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  मानक सेतु
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans tracking-wide">
                National Standards Verification Workstation · BIS Act 2016 & GFR 2017
              </p>
            </div>
          </div>

          {/* Active Tender & Status Context (When Audit Active) */}
          {auditResult ? (
            <div className="hidden md:flex items-center space-x-3 font-mono text-xs">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500">TENDER:</span>
                <span className="font-semibold text-slate-800 max-w-[200px] truncate" title={auditResult.document_id}>
                  {auditResult.document_id}
                </span>
              </div>

              {gateBadge && (
                <span
                  data-testid="header-gate-badge"
                  className={`px-2.5 py-1 rounded border font-semibold tracking-wider text-[11px] ${gateBadge.classes}`}
                >
                  {gateBadge.label}
                </span>
              )}

              <div className="flex items-center space-x-2 text-slate-600">
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                  FINDINGS: <strong className="text-slate-900">{auditResult.findings.length}</strong>
                </span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                  CLAUSES: <strong className="text-slate-900">{auditResult.summary.total_requirements_evaluated}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <span>STANDARDS VERIFICATION ACTIVE · DETERMINISTIC</span>
            </div>
          )}

          {/* Actions: Export & Reset */}
          <div className="flex items-center space-x-2">
            {auditResult && (
              <a
                href={getDossierPdfUrl(auditResult.document_id)}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="header-export-pdf"
                className="flex items-center space-x-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded border border-slate-300 font-medium transition-colors shadow-2xs cursor-pointer"
                title="Download official publication-grade Typst PDF dossier"
              >
                <FileDown className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export Dossier (PDF)</span>
              </a>
            )}

            <button
              onClick={onReset}
              data-testid="header-btn-reset"
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-200 transition-colors cursor-pointer"
              title="Reset Workstation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
