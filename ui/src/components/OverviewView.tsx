import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileDiff,
  Network,
} from 'lucide-react';
import type { AuditResult, GateStatus, WorkstationView } from '../types';

interface OverviewViewProps {
  audit: AuditResult;
  onNavigateView: (view: WorkstationView, targetFindingId?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ audit, onNavigateView }) => {
  const [showRawProse, setShowRawProse] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyDigest = () => {
    if (audit.sha256_digest) {
      navigator.clipboard.writeText(audit.sha256_digest);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const getGateDetails = (status: GateStatus) => {
    switch (status) {
      case 'STATUTORY_NON_COMPLIANT':
        return {
          title: 'STATUTORY NON-COMPLIANT',
          verdictAction: 'REVISION MANDATORY UNDER LAW',
          subtitle:
            'Tender specification violates mandatory statutory regulations under BIS Act 2016 Section 16 or GFR 2017 Rule 173(v).',
          border: 'border-red-500',
          bg: 'bg-red-50/70',
          badgeText: 'bg-red-700 text-white',
          icon: ShieldAlert,
          iconColor: 'text-red-700',
        };
      case 'TECHNICAL_DEFECT':
        return {
          title: 'TECHNICAL DEFECT DETECTED',
          verdictAction: 'TECHNICAL REVISION REQUIRED',
          subtitle:
            'Specification contains technical parameter thresholds or gazetted amendment deltas conflicting with active standards.',
          border: 'border-amber-500',
          bg: 'bg-amber-50/70',
          badgeText: 'bg-amber-700 text-white',
          icon: AlertTriangle,
          iconColor: 'text-amber-700',
        };
      case 'ACTION_REQUIRED_REVIEW':
        return {
          title: 'ACTION REQUIRED: REVIEW PENDING',
          verdictAction: 'HUMAN ADJUDICATION REQUIRED',
          subtitle:
            'Specification contains ungrounded citations or transitional standards halting in UNCERTAIN state requiring officer adjudication.',
          border: 'border-blue-500',
          bg: 'bg-blue-50/70',
          badgeText: 'bg-blue-700 text-white',
          icon: HelpCircle,
          iconColor: 'text-blue-700',
        };
      case 'VERIFIED_CONFORMANT':
      default:
        return {
          title: 'VERIFIED CONFORMANT',
          verdictAction: 'SPECIFICATION CLEARED',
          subtitle:
            'All evaluated specification requirements strictly conform to active, gazetted Indian Standards.',
          border: 'border-emerald-500',
          bg: 'bg-emerald-50/70',
          badgeText: 'bg-emerald-700 text-white',
          icon: CheckCircle2,
          iconColor: 'text-emerald-700',
        };
    }
  };

  const gate = getGateDetails(audit.gate_status);
  const GateIcon = gate.icon;

  return (
    <div className="space-y-6">
      {/* 1. Tender Context & Executive Identification Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              <span>SPECIFICATION CONFORMANCE REVIEW</span>
              <span>·</span>
              <span>LEVEL 1 EXECUTIVE SURFACE</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              {audit.document_title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-mono">
              <span>
                <strong className="text-slate-500">REF:</strong> {audit.document_id}
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-500">STATUTORY JURISDICTION:</strong> India (BIS & GFR 2017)
              </span>
              <span>·</span>
              <span>
                <strong className="text-slate-500">SEGMENTS ANALYZED:</strong> {audit.total_segments_analyzed}
              </span>
            </div>
          </div>

          {/* Auxiliary Triage Priority Weight (Heuristic) */}
          {typeof audit.compliance_score !== 'undefined' && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-right shrink-0">
              <span className="block text-[10px] font-mono text-slate-500 uppercase">
                TRIAGE PRIORITY WEIGHT
              </span>
              <div className="flex items-baseline justify-end space-x-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {audit.compliance_score}
                </span>
                <span className="text-xs font-mono text-slate-500">/ 100</span>
              </div>
              <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                Queue Sorting Heuristic
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Conformance Gate Determination Card */}
      <div className={`rounded-lg border-2 ${gate.border} ${gate.bg} p-6 shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="mt-1 p-2 rounded bg-white border border-slate-200 shadow-2xs">
              <GateIcon className={`h-8 w-8 ${gate.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-600">
                  DOCUMENT GATE STATUS
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${gate.badgeText}`}>
                  {gate.verdictAction}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                {gate.title}
              </h2>
              <p className="text-xs text-slate-700 mt-1 max-w-3xl leading-relaxed">
                {gate.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Discrete Defect Accounting Ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-300/80">
          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">EVALUATED</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {audit.summary.total_requirements_evaluated}
            </span>
            <span className="block text-[9px] text-slate-400">Total Clauses</span>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">CONFORMANT</span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              {audit.summary.conformant_requirements}
            </span>
            <span className="block text-[9px] text-slate-400">Verified Active</span>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">CRITICAL DEFECTS</span>
            <span
              className={`text-xl font-bold font-mono ${
                audit.summary.critical_violations > 0 ? 'text-red-700' : 'text-slate-400'
              }`}
            >
              {audit.summary.critical_violations}
            </span>
            <span className="block text-[9px] text-slate-400">Statutory Breaches</span>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">HIGH DEFECTS</span>
            <span
              className={`text-xl font-bold font-mono ${
                audit.summary.high_violations > 0 ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {audit.summary.high_violations}
            </span>
            <span className="block text-[9px] text-slate-400">Technical Mismatches</span>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">CASCADING ALERTS</span>
            <span
              className={`text-xl font-bold font-mono ${
                audit.cascading_dependency_alerts.length > 0 ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {audit.cascading_dependency_alerts.length}
            </span>
            <span className="block text-[9px] text-slate-400">Normative Risks</span>
          </div>

          <div className="bg-white border border-slate-200 rounded p-3 text-center">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">PENDING REVIEWS</span>
            <span
              className={`text-xl font-bold font-mono ${
                audit.summary.pending_reviews > 0 ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              {audit.summary.pending_reviews}
            </span>
            <span className="block text-[9px] text-slate-400">Uncertain States</span>
          </div>
        </div>
      </div>

      {/* 4. Executive Narrative Summary Box */}
      {audit.narrative_summary && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            EXECUTIVE AUDIT SUMMARY NARRATIVE
          </span>
          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            {audit.narrative_summary}
          </p>
        </div>
      )}

      {/* 5. Cascading Normative Risk Callout (If Any) */}
      {audit.cascading_dependency_alerts.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400/90 rounded-lg p-5 shadow-xs">
          <div className="flex items-start space-x-3">
            <Network className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-900 tracking-wider">
                  CASCADING NORMATIVE OBSOLESCENCE IDENTIFIED
                </span>
                <button
                  onClick={() => onNavigateView('graph')}
                  className="text-xs font-mono font-bold text-amber-900 hover:text-amber-950 underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>EXPLORE DEPENDENCY GRAPH</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {audit.cascading_dependency_alerts.map((alert, idx) => (
                <div key={idx} className="mt-2 text-xs text-amber-900">
                  <p className="font-semibold font-mono">
                    Parent standard {alert.parent_is} normatively references withdrawn sub-standard {alert.obsolete_sub_ref}.
                  </p>
                  <p className="text-amber-800 mt-1">
                    {alert.engineering_risk ||
                      'Even though the parent standard is active, specifying an obsolete sub-standard invalidates test verification and characteristic strength benchmarks.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. "WHAT NEEDS ATTENTION?" Critical Infraction Triage Matrix */}
      {audit.findings.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                WHAT NEEDS ATTENTION? ({audit.findings.length} INFRACTIONS DETECTED)
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Actionable regulatory and technical non-conformances requiring corrigendum publication.
              </p>
            </div>
            <button
              onClick={() => onNavigateView('corrigenda')}
              className="text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
            >
              <span>VIEW ALL CORRIGENDA</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audit.findings.map((f, idx) => {
              const isCritical = f.severity === 'CRITICAL';
              return (
                <div
                  key={f.finding_id}
                  className={`border rounded-lg p-4 flex flex-col justify-between ${
                    isCritical
                      ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                      : 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                  } transition-colors`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        0{idx + 1} // {f.violation_type.replace('ERR_', '')}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>

                    <div className="font-mono text-sm font-bold text-slate-900 mb-1">
                      {f.detected_entity}
                      {f.replacement_standard && (
                        <span className="text-emerald-700"> → {f.replacement_standard}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans mb-3">
                      {f.engineering_rationale || f.recommended_remediation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-slate-500 truncate max-w-[200px]" title={f.statutory_basis}>
                      {f.statutory_basis}
                    </span>
                    <button
                      onClick={() => onNavigateView('corrigenda', f.finding_id)}
                      className="text-xs font-bold text-slate-900 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>EXAMINE PROOF</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-6 text-center shadow-2xs">
          <CheckCircle2 className="h-8 w-8 text-emerald-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-emerald-950 font-display">
            ZERO STATUTORY NON-CONFORMANCES DETECTED
          </h3>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto mt-1">
            All extracted specification requirements strictly conform to the governing standard families.
          </p>
        </div>
      )}

      {/* 7. Collapsible Raw Tender Prose Drawer (Level 5) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowRawProse(!showRawProse)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-mono text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            {showRawProse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="font-bold">
              {showRawProse ? 'HIDE RAW TENDER PROSE' : 'INSPECT RAW TENDER PROSE (LEVEL 5)'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <span>SHA-256: {audit.sha256_digest ? audit.sha256_digest.slice(0, 16) + '...' : 'N/A'}</span>
          </div>
        </button>

        {showRawProse && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase">
                RAW SPECIFICATION CLAUSES AUDITED ({audit.requirements.length} CLAUSES)
              </span>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500">DIGEST: {audit.sha256_digest}</span>
                <button
                  onClick={copyDigest}
                  className="px-2 py-0.5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] flex items-center space-x-1 cursor-pointer"
                  title="Copy SHA-256 Digest"
                >
                  {copiedHash ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {audit.requirements.map((req) => (
                <div key={req.requirement_id} className="p-3 bg-white border border-slate-200 rounded">
                  <span className="font-bold text-slate-900 block mb-1">
                    {req.segment_id} · Product: {req.product_name}
                  </span>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {req.raw_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Primary Forward Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onNavigateView('corrigenda')}
          className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-black text-white font-mono text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <FileDiff className="h-4 w-4" />
          <span>EXAMINE EVIDENCE & CORRIGENDA SCHEDULE</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
