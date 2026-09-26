import React, { useState } from 'react';
import {
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileDown,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import type { AuditResult, GateStatus } from '../types';
import { getDossierPdfUrl } from '../services/api';

interface GateClearanceCardProps {
  audit: AuditResult;
}

export const GateClearanceCard: React.FC<GateClearanceCardProps> = ({ audit }) => {
  const [copied, setCopied] = useState(false);

  const copyDigest = () => {
    navigator.clipboard.writeText(audit.sha256_digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGateConfig = (status: GateStatus) => {
    switch (status) {
      case 'STATUTORY_NON_COMPLIANT':
        return {
          title: 'STATUTORY NON-COMPLIANT',
          subtitle: 'Tender specification violates mandatory regulatory requirements or Quality Control Orders.',
          border: 'border-red-500/80',
          bg: 'bg-red-950/30',
          badgeBg: 'bg-red-900/60 text-red-200 border-red-500/60',
          icon: ShieldAlert,
          iconColor: 'text-red-400',
        };
      case 'TECHNICAL_DEFECT':
        return {
          title: 'TECHNICAL DEFECT DETECTED',
          subtitle: 'Specification contains parameter bounds or amendment deltas conflicting with active standards.',
          border: 'border-amber-500/80',
          bg: 'bg-amber-950/30',
          badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-500/60',
          icon: AlertCircle,
          iconColor: 'text-amber-400',
        };
      case 'ACTION_REQUIRED_REVIEW':
        return {
          title: 'ACTION REQUIRED: REVIEW PENDING',
          subtitle: 'Specification contains citations ungrounded in the authoritative catalog requiring manual adjudication.',
          border: 'border-purple-500/80',
          bg: 'bg-purple-950/30',
          badgeBg: 'bg-purple-900/60 text-purple-200 border-purple-500/60',
          icon: HelpCircle,
          iconColor: 'text-purple-400',
        };
      case 'VERIFIED_CONFORMANT':
      default:
        return {
          title: 'VERIFIED CONFORMANT',
          subtitle: 'All evaluated specification requirements strictly conform to active Indian Standards.',
          border: 'border-emerald-500/80',
          bg: 'bg-emerald-950/30',
          badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/60',
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
        };
    }
  };

  const cfg = getGateConfig(audit.gate_status);
  const StatusIcon = cfg.icon;

  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-6 shadow-sm`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Gate Status Verdict */}
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <StatusIcon className={`h-8 w-8 ${cfg.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className={`text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded border ${cfg.badgeBg}`}>
                GATE STATUS: {cfg.title}
              </span>
              <span className="text-xs font-mono text-slate-400">
                DOC: {audit.document_id}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              {audit.document_title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {audit.narrative_summary || cfg.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={getDossierPdfUrl(audit.document_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-4 py-2 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition-colors shadow-sm"
          >
            <FileDown className="h-4 w-4 text-blue-400" />
            <span>Download Official Dossier (PDF)</span>
          </a>
        </div>
      </div>

      {/* Discrete Defect Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-slate-400">TOTAL EVALUATED</span>
          <span className="text-lg font-semibold font-mono text-white">
            {audit.summary.total_requirements_evaluated}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-emerald-400">CONFORMANT</span>
          <span className="text-lg font-semibold font-mono text-emerald-300">
            {audit.summary.conformant_requirements}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-red-400">CRITICAL VIOLATIONS</span>
          <span className="text-lg font-semibold font-mono text-red-300">
            {audit.summary.critical_violations}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-amber-400">HIGH DEFECTS</span>
          <span className="text-lg font-semibold font-mono text-amber-300">
            {audit.summary.high_violations}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-blue-400">MEDIUM / MINOR</span>
          <span className="text-lg font-semibold font-mono text-blue-300">
            {audit.summary.medium_violations}
          </span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5">
          <span className="block text-[11px] font-mono text-purple-400">PENDING REVIEW</span>
          <span className="text-lg font-semibold font-mono text-purple-300">
            {audit.summary.pending_reviews}
          </span>
        </div>
      </div>

      {/* Cryptographic SHA-256 Seal Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-slate-500 font-bold shrink-0">SHA-256 REPRODUCIBILITY SEAL:</span>
          <span className="text-slate-300 truncate select-all">{audit.sha256_digest}</span>
          <button
            onClick={copyDigest}
            className="shrink-0 p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Copy digest"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="shrink-0 text-slate-500">
          Generated: {new Date(audit.generated_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
