import React, { useState } from 'react';
import {
  FileDiff,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Shield,
  ExternalLink,
  ChevronRight,
  FileText,
} from 'lucide-react';
import type { AuditResult } from '../types';

interface CorrigendaStudioProps {
  auditResult: AuditResult;
  onOpenStandardDetail: (isNumber: string) => void;
}

export const CorrigendaStudio: React.FC<CorrigendaStudioProps> = ({
  auditResult,
  onOpenStandardDetail,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);

  const findings = auditResult.findings;

  // Generate full formal Corrigendum text
  const generateFullCorrigendumText = () => {
    const lines = [
      `================================================================================`,
      `FORMAL CORRIGENDUM & TECHNICAL AMENDMENT NOTICE`,
      `================================================================================`,
      `DOCUMENT ID:       ${auditResult.document_id}`,
      `ISSUED UNDER:      Statutory Procurement Standards Conformance Review`,
      `DATE OF AUDIT:     ${new Date(auditResult.generated_at).toUTCString()}`,
      `SPECIFICATION HASH:${auditResult.sha256_digest}`,
      `TOTAL AMENDMENTS:  ${findings.length}`,
      `--------------------------------------------------------------------------------`,
      ``,
      `Preamble:`,
      `In accordance with mandatory Quality Control Orders (QCO) and statutory`,
      `regulations gazetted by the Bureau of Indian Standards (BIS), the following`,
      `clauses of Tender Specification ${auditResult.document_id} are hereby amended:`,
      ``,
    ];

    findings.forEach((finding, idx) => {
      lines.push(`--------------------------------------------------------------------------------`);
      lines.push(`AMENDMENT ITEM #${idx + 1} | RULE: ${finding.rule_id} [${finding.severity}]`);
      lines.push(`TARGET ENTITY:      ${finding.detected_entity}`);
      lines.push(`MANDATORY BASIS:    ${finding.statutory_basis || 'BIS Standard'}`);
      lines.push(``);
      lines.push(`[ORIGINAL TENDER PROSE (WITHDRAWN)]:`);
      lines.push(finding.segment_text || finding.evidence?.source_segment_text || 'Original text unspecified');
      lines.push(``);
      lines.push(`[STATUTORY REPLACEMENT CLAUSE (SUBSTITUTED)]:`);
      lines.push(finding.recommended_remediation || 'Statutory replacement required per normative specification.');
      lines.push(``);
      lines.push(`RATIONALE / STATUTORY BASIS:`);
      lines.push(finding.engineering_rationale);
      lines.push(``);
    });

    lines.push(`================================================================================`);
    lines.push(`END OF CORRIGENDUM NOTICE`);
    lines.push(`================================================================================`);

    return lines.join('\n');
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(generateFullCorrigendumText());
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyItem = async (fix: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(fix);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateFullCorrigendumText()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `CORRIGENDUM_${auditResult.document_id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (findings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="h-6 w-6 text-emerald-700" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 font-mono">NO CORRIGENDA REQUIRED</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto font-sans">
          The verified tender specification contains zero statutory non-compliances requiring corrigendum drafting.
        </p>
      </div>
    );
  }

  const selectedFinding = findings[selectedItemIdx] || findings[0];

  return (
    <div className="space-y-4">
      {/* Studio Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <FileDiff className="h-4 w-4 text-slate-700" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
              Corrigenda & Statutory Amendment Drafting Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            40/60 Asymmetric Master-Detail: Publication-ready procurement amendment notices generated from deterministic statutory findings.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={handleCopyAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium border border-slate-300 transition-colors cursor-pointer"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-600" />}
            <span>{copiedAll ? 'COPIED TO CLIPBOARD' : 'COPY FULL CORRIGENDUM'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>EXPORT .TXT</span>
          </button>
        </div>
      </div>

      {/* 40/60 Asymmetric Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (40% width): Master Amendment Clause Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>AMENDMENT CLAUSES ({findings.length})</span>
            <span className="text-[10px] text-slate-400">Select to Draft</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {findings.map((finding, idx) => {
              const isSelected = selectedItemIdx === idx;
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={finding.finding_id}
                  onClick={() => setSelectedItemIdx(idx)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        ITEM 0{idx + 1}
                      </span>
                      <span className="font-mono text-xs text-blue-700 font-semibold">
                        {finding.rule_id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                        finding.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{finding.detected_entity}</span>
                    {finding.replacement_standard && (
                      <span className="text-emerald-700 text-[11px]">
                        → {finding.replacement_standard}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 font-sans line-clamp-2 mt-1 leading-snug">
                    {finding.engineering_rationale}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {finding.finding_id}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyItem(finding.recommended_remediation || '', idx);
                      }}
                      className="text-[10px] font-mono text-slate-700 hover:text-black flex items-center space-x-1 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-500" />}
                      <span>{isCopied ? 'COPIED' : 'QUICK COPY'}</span>
                    </button>
                  </div>

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

        {/* Right Column (60% width): Sticky Redline & Drafting Inspector */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Inspector Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  AMENDMENT ITEM #{selectedItemIdx + 1}
                </span>
                <span className="font-mono text-xs text-blue-700 font-semibold">
                  {selectedFinding.rule_id}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    selectedFinding.severity === 'CRITICAL'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedFinding.severity}
                </span>
              </div>

              <button
                data-testid="btn-copy-inspector-replacement"
                onClick={() =>
                  handleCopyItem(
                    selectedFinding.recommended_remediation || '',
                    selectedItemIdx
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-mono font-medium transition-colors shadow-2xs cursor-pointer"
              >
                {copiedIndex === selectedItemIdx ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>
                  {copiedIndex === selectedItemIdx ? 'COPIED TO CLIPBOARD' : 'COPY REPLACEMENT'}
                </span>
              </button>
            </div>

            {/* Inspector Redline Comparison Body */}
            <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
              {/* Withdrawn Prose (Original Specification) */}
              <div className="bg-red-50/50 border border-red-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-red-800 font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <span>ORIGINAL TENDER PROSE (WITHDRAWN)</span>
                  </span>
                  <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
                    Non-Compliant Under Law
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-mono bg-white p-3 rounded border border-red-200 line-through decoration-red-500 decoration-1 text-slate-600 leading-relaxed">
                  {selectedFinding.segment_text ||
                    selectedFinding.evidence?.source_segment_text ||
                    'Original clause text unspecified.'}
                </div>
                <p className="text-[11px] text-red-800 font-sans italic">
                  <strong>Defect Ground: </strong>
                  {selectedFinding.engineering_rationale}
                </p>
              </div>

              {/* Substituted Statute (Gazetted Formulation) */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    <span>STATUTORY REPLACEMENT CLAUSE (SUBSTITUTED)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                    Gazette Verified Formulation
                  </span>
                </div>
                <div className="text-xs text-slate-900 font-sans bg-white p-3.5 rounded border border-emerald-300 font-medium leading-relaxed">
                  {selectedFinding.recommended_remediation}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px]">Mandatory Standard:</span>
                    <button
                      onClick={() =>
                        onOpenStandardDetail(
                          selectedFinding.replacement_standard || selectedFinding.detected_entity
                        )
                      }
                      className="text-[11px] text-blue-700 hover:text-blue-900 underline flex items-center space-x-1 cursor-pointer font-bold"
                    >
                      <span>
                        {selectedFinding.replacement_standard || selectedFinding.detected_entity}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Ready for CPPP / GeM Publication
                  </span>
                </div>
              </div>

              {/* Legal Rationale & Statutory Citation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Statutory Basis</div>
                <div className="text-slate-800 font-medium">
                  {selectedFinding.statutory_basis || 'Bureau of Indian Standards Act, 2016'}
                </div>
                <div className="text-[10px] text-slate-500 font-sans pt-1">
                  Amendment notice complies with General Financial Rules (GFR) 2017 Rule 173(v) mandatory standard conformity requirement.
                </div>
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 text-[11px]">
                Clause ID: <strong className="text-slate-800">{selectedFinding.segment_id}</strong>
              </span>

              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const singleText = `AMENDMENT CLAUSE ${selectedFinding.rule_id}\n\nWITHDRAWN:\n${selectedFinding.segment_text || ''}\n\nSUBSTITUTED:\n${selectedFinding.recommended_remediation}\n`;
                  const file = new Blob([singleText], { type: 'text/plain;charset=utf-8' });
                  element.href = URL.createObjectURL(file);
                  element.download = `AMENDMENT_${selectedFinding.finding_id}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="text-xs text-slate-700 hover:text-slate-950 flex items-center space-x-1 cursor-pointer underline"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export Single Clause Notice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
