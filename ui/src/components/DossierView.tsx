import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Shield,
  CheckCircle,
  XCircle,
  Hash,
  Clock,
  Building,
  FileCode,
} from 'lucide-react';
import type { AuditResult } from '../types';

interface DossierViewProps {
  auditResult: AuditResult;
  onOpenStandardDetail: (isNumber: string) => void;
}

export const DossierView: React.FC<DossierViewProps> = ({
  auditResult,
  onOpenStandardDetail,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(auditResult.sha256_digest);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AUDIT_DOSSIER_${auditResult.document_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isCompliant = auditResult.gate_status === 'VERIFIED_CONFORMANT';
  const isDefect = auditResult.gate_status === 'STATUTORY_NON_COMPLIANT' || auditResult.gate_status === 'TECHNICAL_DEFECT';

  // Compute unique standards referenced in requirements and findings
  const citedStandards = Array.from(
    new Set([
      ...auditResult.requirements.flatMap((r) => r.cited_standards),
      ...auditResult.findings.map((f) => f.detected_entity),
    ].filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Dossier Action Ribbon */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck2 className="h-4 w-4 text-slate-700" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900">
              Statutory Conformance Dossier & Provenance Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Authoritative, cryptographically bound audit certificate for tender procurement records.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>EXPORT JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PRINT DOSSIER</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-sm p-6 sm:p-8 space-y-8 font-sans">
        {/* Certificate Header */}
        <div className="border-b border-slate-300 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                GOVERNMENT PROCUREMENT COMPLIANCE PORTAL
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-serif tracking-tight">
              STATUTORY CONFORMANCE AUDIT DOSSIER
            </h1>
            <p className="text-xs text-slate-600 max-w-xl">
              Issued pursuant to the Bureau of Indian Standards Act, 2016 and prevailing Quality Control Orders (QCO)
              for mandatory public procurement standards verification under GFR 173(v).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-300 rounded text-right space-y-1 font-mono text-xs shrink-0">
            <div className="text-[11px] text-slate-500 uppercase">Verification Status</div>
            <div
              className={`text-sm font-bold flex items-center justify-end space-x-1.5 ${
                isCompliant ? 'text-emerald-700' : isDefect ? 'text-red-700' : 'text-amber-700'
              }`}
            >
              {isCompliant ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{auditResult.gate_status.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Engine: Deterministic Rule Verification
            </div>
          </div>
        </div>

        {/* Metadata Registry Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
              <Building className="h-3 w-3 text-slate-400" />
              <span>TENDER IDENTIFIER</span>
            </div>
            <div className="font-semibold text-slate-900">{auditResult.document_id}</div>
            <div className="text-[10px] text-slate-500 truncate">{auditResult.document_title || 'Tender Specification'}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>AUDIT TIMESTAMP</span>
            </div>
            <div className="font-semibold text-slate-900">{new Date(auditResult.generated_at).toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-mono">ISO: {auditResult.generated_at}</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Hash className="h-3 w-3 text-slate-400" />
                <span>CRYPTOGRAPHIC FINGERPRINT</span>
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[10px] text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                {copiedHash ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <div className="font-semibold text-slate-800 text-[11px] font-mono break-all">
              {auditResult.sha256_digest}
            </div>
          </div>
        </div>

        {/* 5-Node Provenance Chain Verification Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5 text-slate-700" />
              <span>5-Node Provenance Ledger & Findings Evidence</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {auditResult.findings.length} findings logged
            </span>
          </div>

          {auditResult.findings.length === 0 ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-center text-xs text-emerald-800 font-mono">
              ALL CLAUSES PASSED VERIFICATION WITH ZERO STATUTORY DEFECTS.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 border-b border-slate-200 font-mono text-[11px] text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Node 1: Finding & Clause Ref</th>
                    <th className="py-2.5 px-3">Node 2: Statutory Rule ID</th>
                    <th className="py-2.5 px-3">Node 3: Knowledge Fact Ref</th>
                    <th className="py-2.5 px-3">Node 4: Requirement Ref</th>
                    <th className="py-2.5 px-3">Node 5: Deterministic Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {auditResult.findings.map((finding) => (
                    <tr key={finding.finding_id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 max-w-xs text-slate-800">
                        <div className="font-bold text-slate-900 font-mono">{finding.finding_id}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {finding.evidence?.source_segment_ref || finding.segment_id}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-blue-700 font-semibold">{finding.rule_id}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onOpenStandardDetail(finding.detected_entity || '')}
                          className="text-slate-900 underline hover:text-blue-700 cursor-pointer font-bold font-mono"
                        >
                          {finding.evidence?.knowledge_fact_ref || finding.detected_entity}
                        </button>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {finding.statutory_basis || 'BIS Specification'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs">
                        <div className="font-mono text-slate-900 font-medium">
                          {finding.evidence?.requirement_ref || 'REQ-INV-SPEC'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans line-clamp-1">
                          {finding.engineering_rationale}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            finding.decision_state === 'VIOLATION'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : finding.decision_state === 'UNCERTAIN'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {finding.decision_state || 'VIOLATION'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Regulatory Standards Catalog Verified */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
              <FileCode className="h-3.5 w-3.5 text-slate-700" />
              <span>Standards Referenced in Specification</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {citedStandards.map((stdNumber) => (
              <div
                key={stdNumber}
                onClick={() => onOpenStandardDetail(stdNumber)}
                className="p-3 bg-slate-50 border border-slate-200 rounded hover:border-slate-400 cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-900">{stdNumber}</div>
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">BIS Standard Specification</div>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-blue-700 font-semibold underline">Inspect Statutory Rule</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Audit & Sovereign Adjudication Ledger */}
        <div className="pt-6 border-t border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between text-xs text-slate-600 font-mono gap-4">
          <div>
            <div className="font-semibold text-slate-800">
              STATUTORY AUTHORITY: BUREAU OF INDIAN STANDARDS ACT, 2016 & GFR 173(v)
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Deterministic verification output. Final legal liability rests with the Designated Competent Financial Authority.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-right font-mono text-[11px] min-w-[240px]">
            <div className="text-slate-500 uppercase text-[10px]">Human Sovereign Adjudication</div>
            <div className="text-slate-800 font-semibold mt-0.5">
              {auditResult.findings.some((f) => f.review_state && f.review_state !== 'NOT_APPLICABLE')
                ? 'FORMAL RULINGS COMMITTED'
                : 'PENDING OFFICER ADJUDICATION'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              SHA-256 Digest: {auditResult.sha256_digest.slice(0, 16)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
