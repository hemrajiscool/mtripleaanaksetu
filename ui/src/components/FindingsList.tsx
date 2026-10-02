import React, { useState, useEffect, useRef } from 'react';
import {
  FileCheck,
  Scale,
  ExternalLink,
  UserCheck,
  Copy,
  Check,
  Shield,
  FileDiff,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { Finding } from '../types';

interface FindingsListProps {
  findings: Finding[];
  onOpenStandardDetail: (isNumber: string) => void;
  onAdjudicate: (finding: Finding) => void;
  targetFindingId?: string;
}

export const FindingsList: React.FC<FindingsListProps> = ({
  findings,
  onOpenStandardDetail,
  onAdjudicate,
  targetFindingId,
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    targetFindingId || findings[0]?.finding_id || ''
  );
  const [activeTab, setActiveTab] = useState<'defect' | 'provenance' | 'amendment'>('defect');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copiedRemediation, setCopiedRemediation] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync selected finding with targetFindingId if passed from outside
  useEffect(() => {
    if (targetFindingId && findings.some((f) => f.finding_id === targetFindingId)) {
      setSelectedFindingId(targetFindingId);
      const el = itemRefs.current[targetFindingId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else if (!selectedFindingId && findings.length > 0) {
      setSelectedFindingId(findings[0].finding_id);
    }
  }, [targetFindingId, findings]);

  const selectedFinding =
    findings.find((f) => f.finding_id === selectedFindingId) || findings[0] || null;

  const handleCopyRemediation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRemediation(true);
    setTimeout(() => setCopiedRemediation(false), 2000);
  };

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredFindings = findings.filter((f) => {
    if (severityFilter === 'ALL') return true;
    return f.severity === severityFilter;
  });

  if (findings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-2xs">
        <FileCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 font-sans">No Statutory Defects Emitted</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-sans">
          All evaluated tender clauses and technical parameters conform to authoritative Indian Standards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-700" />
            Statutory Defect Triage & Verification Ledger
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            40/60 Asymmetric Master-Detail: Select an item from the clause ledger to inspect legal grounds, 5-node provenance, and gazetted corrigenda.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded p-1 text-xs font-mono">
          <Filter className="h-3 w-3 text-slate-400 ml-1 mr-0.5" />
          {['ALL', 'CRITICAL', 'HIGH'].map((sev) => {
            const count =
              sev === 'ALL'
                ? findings.length
                : findings.filter((f) => f.severity === sev).length;

            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 40/60 Asymmetric Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (40%): Master Item Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>EVALUATED CLAUSES ({filteredFindings.length})</span>
            <span className="text-[10px] text-slate-400">Click to Inspect</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {filteredFindings.map((f, idx) => {
              const isSelected = selectedFinding?.finding_id === f.finding_id;

              return (
                <div
                  key={f.finding_id}
                  ref={(el) => {
                    itemRefs.current[f.finding_id] = el;
                  }}
                  id={`finding-${f.finding_id}`}
                  data-testid={`finding-item-${f.finding_id}`}
                  onClick={() => {
                    setSelectedFindingId(f.finding_id);
                  }}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  {/* Top line: Index, Severity, Rule ID */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                          f.severity
                        )}`}
                      >
                        {f.severity}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-blue-700">
                        {f.rule_id}
                      </span>
                    </div>

                    {/* Status badge */}
                    {f.review_state && f.review_state !== 'NOT_APPLICABLE' ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                        {f.review_state.replace('_', ' ')}
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                          f.decision_state === 'VIOLATION'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {f.decision_state}
                      </span>
                    )}
                  </div>

                  {/* Standard & Clause ref */}
                  <div className="font-mono text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{f.detected_entity}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {f.segment_id}
                    </span>
                  </div>

                  {/* Rationale snippet */}
                  <p className="text-[11px] text-slate-600 font-sans line-clamp-2 mt-1 leading-snug">
                    {f.engineering_rationale}
                  </p>

                  {/* Indicator arrow on selection */}
                  {isSelected && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:block">
                      <ChevronRight className="h-4 w-4 text-slate-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (60%): Sticky Multi-Tab Inspector */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedFinding ? (
            <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
              {/* Inspector Header */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    FINDING: {selectedFinding.finding_id}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                      selectedFinding.severity
                    )}`}
                  >
                    {selectedFinding.severity}
                  </span>
                  <span className="text-xs font-mono text-blue-700 font-semibold">
                    {selectedFinding.rule_id}
                  </span>
                </div>

                {/* Adjudication trigger button */}
                <button
                  data-testid="btn-adjudicate"
                  data-finding-id={selectedFinding.finding_id}
                  onClick={() => onAdjudicate(selectedFinding)}
                  className="flex items-center space-x-1.5 text-xs font-mono px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>
                    {selectedFinding.review_state && selectedFinding.review_state !== 'NOT_APPLICABLE'
                      ? 'Amend Ruling'
                      : 'Record Sovereign Ruling'}
                  </span>
                </button>
              </div>

              {/* Inspector Tab Switcher */}
              <div className="flex border-b border-slate-200 bg-white font-mono text-xs">
                <button
                  data-testid="tab-inspector-defect"
                  onClick={() => setActiveTab('defect')}
                  className={`flex-1 py-2.5 px-3 text-center font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                    activeTab === 'defect'
                      ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>1. DEFECT & STATUTE</span>
                </button>

                <button
                  data-testid="tab-inspector-provenance"
                  onClick={() => setActiveTab('provenance')}
                  className={`flex-1 py-2.5 px-3 text-center font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                    activeTab === 'provenance'
                      ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>2. 5-NODE PROVENANCE</span>
                </button>

                <button
                  data-testid="tab-inspector-amendment"
                  onClick={() => setActiveTab('amendment')}
                  className={`flex-1 py-2.5 px-3 text-center font-bold border-b-2 transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                    activeTab === 'amendment'
                      ? 'border-slate-900 text-slate-900 bg-slate-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileDiff className="h-3.5 w-3.5" />
                  <span>3. GAZETTED AMENDMENT</span>
                </button>
              </div>

              {/* Tab Content Canvas */}
              <div className="p-5 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                {/* TAB 1: DEFECT & STATUTORY GROUNDS */}
                {activeTab === 'defect' && (
                  <div className="space-y-4">
                    {/* Detected Entity header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          NON-COMPLIANT DETECTED REFERENCE
                        </div>
                        <div className="font-mono text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                          <span>{selectedFinding.detected_entity}</span>
                          <button
                            onClick={() => onOpenStandardDetail(selectedFinding.detected_entity)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-mono underline font-normal flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Specification</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          VIOLATION CLASSIFICATION
                        </div>
                        <div className="font-mono text-xs font-bold text-red-700 mt-0.5">
                          {selectedFinding.violation_type}
                        </div>
                      </div>
                    </div>

                    {/* Source Tender Prose */}
                    {selectedFinding.segment_text && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-slate-600 font-bold uppercase tracking-wider flex items-center justify-between">
                          <span>Audited Tender Clause Prose ({selectedFinding.segment_id})</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-800 leading-relaxed">
                          {selectedFinding.segment_text}
                        </div>
                      </div>
                    )}

                    {/* Technical & Legal Rationale */}
                    <div className="space-y-2 bg-red-50/50 border border-red-200 rounded p-4">
                      <div className="text-[11px] font-mono text-red-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                        <span>Statutory & Engineering Rationale</span>
                      </div>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {selectedFinding.engineering_rationale}
                      </p>
                    </div>

                    {/* Statutory Legal Basis */}
                    <div className="flex items-start space-x-2 text-xs pt-1 border-t border-slate-100">
                      <Scale className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      <div className="font-sans text-slate-600">
                        <strong className="text-slate-800 font-mono">Statutory Authority: </strong>
                        {selectedFinding.statutory_basis}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: 5-NODE PROVENANCE TUPLE */}
                {activeTab === 'provenance' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 leading-relaxed">
                      <div className="font-bold text-slate-900 mb-1">
                        Mathematical Provenance Tuple Definition:
                      </div>
                      <div>
                        E = &lt;FindingId, RuleId, KnowledgeFactRef, RequirementRef, SourceSegmentRef&gt;
                      </div>
                    </div>

                    {selectedFinding.evidence ? (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Node 1: Finding ID</span>
                            <span className="font-bold text-slate-900 text-[11px] break-all">
                              {selectedFinding.evidence.finding_id}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Node 2: Statutory Rule ID</span>
                            <span className="font-bold text-blue-700 text-[11px]">
                              {selectedFinding.evidence.rule_id}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Node 3: Knowledge Fact Ref</span>
                            <span className="font-bold text-slate-900 text-[11px]">
                              {selectedFinding.evidence.knowledge_fact_ref}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase block">Node 4: Requirement Ref</span>
                            <span className="font-bold text-slate-900 text-[11px]">
                              {selectedFinding.evidence.requirement_ref}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase block">Node 5: Source Segment Ref</span>
                          <span className="font-bold text-slate-900 text-[11px]">
                            {selectedFinding.evidence.source_segment_ref}
                          </span>
                          <div className="text-[10px] text-slate-500 font-sans mt-1">
                            Basis: {selectedFinding.evidence.statutory_or_technical_basis}
                          </div>
                        </div>

                        {/* Authoritative Fact Payload */}
                        {selectedFinding.evidence.fact_payload && (
                          <div className="space-y-1 pt-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                              <span>Authoritative Fact Payload (Deterministic)</span>
                              <button
                                onClick={() => handleCopyPayload(selectedFinding.evidence?.fact_payload)}
                                className="text-[10px] text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer font-normal underline"
                              >
                                {copiedPayload ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                <span>{copiedPayload ? 'COPIED JSON' : 'COPY JSON'}</span>
                              </button>
                            </div>
                            <pre className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] overflow-x-auto text-slate-800 font-mono">
                              {JSON.stringify(selectedFinding.evidence.fact_payload, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 font-mono">
                        No secondary evidence tuple attached to this finding.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: GAZETTED AMENDMENT & REDLINE */}
                {activeTab === 'amendment' && (
                  <div className="space-y-4">
                    {/* Withdrawn vs Substituted Redline Stack */}
                    <div className="space-y-3">
                      {/* Original Withdrawn */}
                      <div className="bg-red-50/50 border border-red-200 rounded-lg p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-red-800 font-semibold">
                          <span className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span>ORIGINAL TENDER PROSE (WITHDRAWN)</span>
                          </span>
                          <span className="text-[10px] text-red-600 uppercase">Non-Compliant</span>
                        </div>
                        <p className="text-xs text-slate-700 font-sans bg-white p-3 rounded border border-red-100 line-through decoration-red-500 text-slate-600 leading-relaxed">
                          {selectedFinding.segment_text ||
                            selectedFinding.evidence?.source_segment_text ||
                            'Original clause text unspecified.'}
                        </p>
                      </div>

                      {/* Substituted Statute */}
                      <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 font-semibold">
                          <span className="flex items-center space-x-1">
                            <Shield className="h-3 w-3 text-emerald-600" />
                            <span>STATUTORY REPLACEMENT CLAUSE (SUBSTITUTED)</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 uppercase font-bold">Gazette Verified</span>
                        </div>
                        <p className="text-xs text-slate-900 font-sans bg-white p-3 rounded border border-emerald-200 font-medium leading-relaxed">
                          {selectedFinding.recommended_remediation}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
                          {selectedFinding.replacement_standard ? (
                            <button
                              onClick={() => onOpenStandardDetail(selectedFinding.replacement_standard!)}
                              className="text-[11px] text-slate-700 hover:text-black flex items-center space-x-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-emerald-200"
                            >
                              <span>Standard: {selectedFinding.replacement_standard}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {selectedFinding.statutory_basis}
                            </span>
                          )}

                          <button
                            data-testid="btn-copy-replacement"
                            onClick={() => handleCopyRemediation(selectedFinding.recommended_remediation)}
                            className="flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 rounded text-emerald-800 font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            {copiedRemediation ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-emerald-700" />
                            )}
                            <span>{copiedRemediation ? 'COPIED TO CLIPBOARD' : 'COPY REPLACEMENT'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Inspector Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                <div className="text-slate-500 text-[11px]">
                  State: <strong className="text-slate-800">{selectedFinding.decision_state}</strong>
                  {selectedFinding.review_state && selectedFinding.review_state !== 'NOT_APPLICABLE' && (
                    <span className="ml-2 text-purple-700 font-semibold">
                      · {selectedFinding.review_state}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAdjudicate(selectedFinding)}
                  className="text-xs font-mono font-bold text-slate-900 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Commit Official Sovereign Ruling</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 font-mono text-xs">
              Select a clause from the left list to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
