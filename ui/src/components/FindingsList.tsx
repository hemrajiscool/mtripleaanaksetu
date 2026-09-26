import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileCheck,
  Scale,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import type { Finding } from '../types';

interface FindingsListProps {
  findings: Finding[];
  onOpenStandardDetail: (isNumber: string) => void;
  onAdjudicate: (finding: Finding) => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({
  findings,
  onOpenStandardDetail,
  onAdjudicate,
}) => {
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});

  const toggleEvidence = (findingId: string) => {
    setExpandedEvidence((prev) => ({
      ...prev,
      [findingId]: !prev[findingId],
    }));
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-300 border-red-700/80';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/80';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-gov-900 border border-slate-800 rounded-lg p-10 text-center">
        <FileCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-base font-medium text-slate-200">No Defects or Violations Emitted</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          All evaluated specification clauses and technical parameters fully conform to authoritative Indian Standards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((f) => {
        const isEvidenceOpen = expandedEvidence[f.finding_id] || false;

        return (
          <div
            key={f.finding_id}
            className="bg-gov-900 border border-slate-800 rounded-lg overflow-hidden transition-colors hover:border-slate-700/80"
          >
            {/* Header Strip */}
            <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
              <div className="flex items-center space-x-2.5">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(f.severity)}`}>
                  {f.severity}
                </span>
                <span className="text-xs font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded bg-slate-950">
                  {f.violation_type}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {f.rule_id}
                </span>
              </div>

              {/* Action: Adjudicate / Record Sovereign Ruling */}
              <div className="flex items-center space-x-2">
                {f.review_state === 'EXCEPTION_RECORDED' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/80 font-semibold">
                    EXCEPTION RECORDED
                  </span>
                )}
                {f.review_state === 'DISMISSED_CONFORMANT' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 font-semibold">
                    DISMISSED CONFORMANT
                  </span>
                )}
                {f.review_state === 'CONFIRMED_DEFECT' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/80 font-semibold">
                    CONFIRMED DEFECT
                  </span>
                )}
                <button
                  data-testid="btn-adjudicate"
                  data-finding-id={f.finding_id}
                  onClick={() => onAdjudicate(f)}
                  className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                    f.decision_state === 'UNCERTAIN' || f.review_state === 'PENDING_REVIEW'
                      ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border-amber-600/70 font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span>
                    {f.decision_state === 'UNCERTAIN' || f.review_state === 'PENDING_REVIEW'
                      ? 'Adjudicate Ruling'
                      : 'Record Exception / Ruling'}
                  </span>
                </button>
              </div>
            </div>

            {/* Finding Body */}
            <div className="p-5 space-y-4">
              {/* Detected Entity & Clause Text */}
              <div>
                <div className="flex items-baseline space-x-2 mb-1.5">
                  <span className="text-xs font-mono text-slate-500">DETECTED ENTITY:</span>
                  <span className="text-sm font-semibold font-mono text-white">
                    {f.detected_entity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    (Segment {f.segment_id})
                  </span>
                </div>
                {f.segment_text && (
                  <div className="bg-slate-950 border border-slate-800/80 rounded p-3 text-xs font-mono text-slate-300 leading-relaxed">
                    <span className="text-slate-500 select-none mr-2">SOURCE:</span>
                    {f.segment_text}
                  </div>
                )}
              </div>

              {/* Redline Delta: Tender Specified vs Authoritative Replacement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-red-950/20 border border-red-900/40 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-red-400 font-medium">TENDER DEFECT SPECIFICATION</span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {f.engineering_rationale}
                  </p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">MANDATORY REMEDIATION ACTION</span>
                    {f.replacement_standard && (
                      <button
                        data-testid="btn-open-standard-card"
                        onClick={() => onOpenStandardDetail(f.replacement_standard!)}
                        className="text-[11px] font-mono text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Card: {f.replacement_standard}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {f.recommended_remediation}
                  </p>
                </div>
              </div>

              {/* Statutory Basis */}
              <div className="flex items-start space-x-2 text-xs pt-1">
                <Scale className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 font-sans">
                  <strong className="text-slate-300 font-mono">Statutory Basis:</strong> {f.statutory_basis}
                </span>
              </div>

              {/* Progressive Disclosure: 5-Node Evidence Tuple */}
              {f.evidence && (
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    data-testid="toggle-provenance"
                    data-finding-id={f.finding_id}
                    onClick={() => toggleEvidence(f.finding_id)}
                    className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {isEvidenceOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {isEvidenceOpen ? 'Hide Provenance Evidence Tuple' : 'Inspect 5-Node Provenance Evidence Tuple'}
                    </span>
                  </button>

                  {isEvidenceOpen && (
                    <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3.5 space-y-2 text-xs font-mono text-slate-300">
                      <div className="text-[11px] text-slate-500 font-bold mb-2">
                        EVIDENCE PROVENANCE TUPLE: E = &lt;FindingId, RuleId, KnowledgeFactRef, RequirementRef, SourceSegmentRef&gt;
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">FindingId:</span> {f.evidence.finding_id}
                        </div>
                        <div>
                          <span className="text-slate-500">RuleId:</span> {f.evidence.rule_id}
                        </div>
                        <div>
                          <span className="text-slate-500">KnowledgeFactRef:</span>{' '}
                          <span className="text-blue-400">{f.evidence.knowledge_fact_ref}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">RequirementRef:</span> {f.evidence.requirement_ref}
                        </div>
                        <div>
                          <span className="text-slate-500">SourceSegmentRef:</span> {f.evidence.source_segment_ref}
                        </div>
                        <div>
                          <span className="text-slate-500">StatutoryBasis:</span> {f.evidence.statutory_or_technical_basis}
                        </div>
                      </div>
                      {Object.keys(f.evidence.fact_payload || {}).length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60">
                          <span className="text-slate-500 block mb-1">Authoritative Fact Payload:</span>
                          <pre className="bg-slate-900 p-2 rounded text-[11px] overflow-x-auto text-slate-300">
                            {JSON.stringify(f.evidence.fact_payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
