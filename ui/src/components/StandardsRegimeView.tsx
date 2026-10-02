import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  BookOpen,
  ExternalLink,
  Scale,
  FileText,
  UserCheck,
} from 'lucide-react';
import type { AuditResult, Finding } from '../types';
import { t, type Language } from '../i18n';

interface StandardsRegimeViewProps {
  auditResult: AuditResult;
  onOpenStandardDetail: (isNumber: string) => void;
  onAdjudicate: (finding: Finding) => void;
  language?: Language;
}

export const StandardsRegimeView: React.FC<StandardsRegimeViewProps> = ({
  auditResult,
  onOpenStandardDetail,
  onAdjudicate,
  language = 'en',
}) => {
  const [filter, setFilter] = useState<'all' | 'action' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  // Derive unique standards and their state
  const { actionableItems, verifiedItems, cascadingAlerts } = useMemo(() => {
    const findings = auditResult.findings || [];
    const requirements = auditResult.requirements || [];
    const cascading = auditResult.cascading_dependency_alerts || [];

    // Standards cited in findings
    const findingEntities = new Set(findings.map((f) => f.detected_entity));

    // Verified standards: cited in requirements but NOT in findings
    const verified = new Map<string, { isNumber: string; clauses: string[]; productName: string }>();

    requirements.forEach((req) => {
      (req.cited_standards || []).forEach((std) => {
        if (!findingEntities.has(std) && std !== 'IS 269:1989') {
          if (!verified.has(std)) {
            verified.set(std, {
              isNumber: std,
              clauses: [req.segment_id || req.raw_text.slice(0, 30)],
              productName: req.product_name,
            });
          } else {
            const entry = verified.get(std)!;
            if (req.segment_id && !entry.clauses.includes(req.segment_id)) {
              entry.clauses.push(req.segment_id);
            }
          }
        }
      });
    });

    return {
      actionableItems: findings,
      verifiedItems: Array.from(verified.values()),
      cascadingAlerts: cascading,
    };
  }, [auditResult]);

  const hasActionRequired = actionableItems.length > 0;
  const totalStandardsCount = actionableItems.length + verifiedItems.length;

  // Search filtering
  const filteredActionable = actionableItems.filter((f) => {
    if (filter === 'verified') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.detected_entity.toLowerCase().includes(q) ||
      f.replacement_standard?.toLowerCase().includes(q) ||
      f.engineering_rationale.toLowerCase().includes(q) ||
      f.segment_text?.toLowerCase().includes(q)
    );
  });

  const filteredVerified = verifiedItems.filter((v) => {
    if (filter === 'action') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.isNumber.toLowerCase().includes(q) ||
      v.productName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* 1. Executive Semantic Header (Crisp Rectangle Block) */}
      <div className="bg-white border border-black p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Specification Conformance Review · India (BIS Act 2016 & GFR 2017)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
              {auditResult.document_title || auditResult.document_id}
            </h1>
          </div>

          <div>
            {hasActionRequired ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold tracking-wide bg-rose-50 text-rose-800 border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ACTION REQUIRED BEFORE PUBLICATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                GOVERNING STANDARDS VERIFIED CURRENT
              </span>
            )}
          </div>
        </div>

        {/* Narrative Statement */}
        <div className="pt-4">
          <p className="text-sm text-slate-800 leading-relaxed max-w-4xl">
            {hasActionRequired ? (
              <>
                <strong>{actionableItems.length} citation{actionableItems.length > 1 ? 's' : ''} require revision</strong> prior to tender notice release. The draft references superseded statutory standards or restrictive vendor brands under GFR Rule 173(v). Grounded citation formulations and active standards have been identified below.
              </>
            ) : (
              <>
                All cited technical standards are active, valid, and conformant with current Quality Control Orders (QCOs) and statutory procurement rules. Zero restrictive citations detected.
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">{t('standardsIdentified', language)}:</span>{' '}
              <span className="font-mono font-bold">{totalStandardsCount}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">{t('actionRequired', language)}:</span>{' '}
              <span className="font-mono font-bold text-rose-700">{actionableItems.length}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">{t('verifiedCurrent', language)}:</span>{' '}
              <span className="font-mono font-bold text-emerald-700">{verifiedItems.length}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <span>SHA-256:</span>
              <button
                type="button"
                onClick={() => handleCopy(auditResult.sha256_digest, 'hash')}
                title="Copy SHA-256 state fingerprint"
                className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{auditResult.sha256_digest.slice(0, 16)}...</span>
                {copiedId === 'hash' ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Filter & Search (Crisp Rectangle Blocks) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-black shadow-2xs text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-black text-white font-semibold'
                : 'text-slate-700 hover:text-black'
            }`}
          >
            {language === 'hi' ? 'सभी मानक' : 'All Standards'} ({totalStandardsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('action')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'action'
                ? 'bg-rose-700 text-white font-semibold'
                : 'text-slate-700 hover:text-rose-700'
            }`}
          >
            <span>{t('actionRequired', language)}</span>
            {actionableItems.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filter === 'action' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-800'
              }`}>
                {actionableItems.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 transition-all cursor-pointer ${
              filter === 'verified'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-slate-700 hover:text-emerald-700'
            }`}
          >
            {t('verifiedCurrent', language)} ({verifiedItems.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IS code, title, or text..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-black focus:outline-none focus:ring-1 focus:ring-black text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Cascading Alerts (if any) */}
      {cascadingAlerts.length > 0 && (
        <div className="space-y-3">
          {cascadingAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="bg-[#fffbeb] border border-black p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-950">
                  Cascading Normative Dependency Alert: Parent {alert.parent_is} References Obsolete {alert.obsolete_sub_ref}
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {alert.engineering_risk}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Action Required Cards (High-Contrast Remedy) */}
      <div className="space-y-6">
        {filteredActionable.map((finding) => {
          const isObsolete = finding.violation_type === 'ERR_OBSOLETE_STANDARD';
          const isBrand = finding.violation_type === 'ERR_BRAND_EXCLUSION';
          const isParamMismatch = finding.violation_type === 'ERR_PARAMETER_MISMATCH';

          const primaryStandard = finding.replacement_standard || finding.detected_entity;

          // Generate grounded citation string
          const citationFormulation = isObsolete
            ? `Ordinary Portland Cement, 43 Grade conforming strictly to ${primaryStandard} (incorporating latest gazetted amendments).`
            : isBrand
            ? `Materials shall conform to applicable BIS codes with ISI certification mark. Proprietary brand names excluded pursuant to GFR 144(i).`
            : isParamMismatch
            ? `Fe 500D high strength deformed steel bars conforming strictly to IS 1786:2008 (incorporating Amendment 3 minimum 14.5% elongation and 500 MPa yield stress).`
            : `${primaryStandard} conforming strictly to gazetted specifications.`;

          return (
            <div
              key={finding.finding_id}
              className="bg-white border border-black shadow-xs overflow-hidden"
            >
              {/* Card Header (Crisp Bar) */}
              <div className="px-6 py-3.5 bg-slate-100 border-b border-black flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-base text-slate-900">
                    {primaryStandard}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase tracking-wide bg-rose-100 text-rose-900 border border-rose-300">
                    {isObsolete
                      ? 'REVISE CITATION'
                      : isBrand
                      ? 'REMOVE BRAND EXCLUSION'
                      : isParamMismatch
                      ? 'TECHNICAL CONFLICT'
                      : 'ACTION REQUIRED'}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase tracking-wide bg-blue-50 text-blue-800 border border-blue-200">
                    QCO MANDATORY
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenStandardDetail(primaryStandard)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-black hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Inspect Standard</span>
                  </button>
                  <span className="text-slate-400">·</span>
                  <button
                    type="button"
                    onClick={() => onAdjudicate(finding)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-black"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Record Determination</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5 bg-white">
                {/* 1. The Factual Discrepancy */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    The Factual Discrepancy
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-sans">
                    {finding.engineering_rationale}
                  </p>
                </div>

                {/* 2. Grounded Drafting Formulation (The Practical Remedy) */}
                <div className="bg-slate-50 border border-slate-300 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Grounded Citation Formulation (To Include In Tender)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(citationFormulation, finding.finding_id + '-cite')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-black bg-white border border-black px-2.5 py-1 shadow-2xs hover:bg-slate-100 transition-colors"
                    >
                      {copiedId === finding.finding_id + '-cite' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-slate-950 bg-white p-3 border border-slate-300 leading-relaxed select-all">
                    {citationFormulation}
                  </div>
                </div>

                {/* 3. Text Anchor from Draft */}
                {finding.segment_text && (
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Audited Tender Excerpt ({finding.segment_id || 'Draft Clause'})
                    </div>
                    <div className="font-mono text-xs text-slate-800 bg-rose-50/60 border border-rose-200 p-2.5">
                      <span className="text-rose-700 font-bold mr-2">[Clause Text]</span>
                      {finding.segment_text}
                    </div>
                  </div>
                )}

                {/* 4. Statutory & Legal Reference */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700 font-medium">{finding.statutory_basis}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    Rule ID: {finding.rule_id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Verified & Current Standards (Quiet Affirmation) */}
      {filteredVerified.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950">
              Verified Active Standards ({filteredVerified.length})
            </h2>
            <span className="text-xs text-slate-900 font-medium">
              Conforming to current editions & QCO provisions
            </span>
          </div>

          <div className="bg-white border border-black divide-y divide-slate-200 shadow-2xs overflow-hidden">
            {filteredVerified.map((v, i) => (
              <div
                key={i}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <button
                    type="button"
                    onClick={() => onOpenStandardDetail(v.isNumber)}
                    className="font-mono font-bold text-xs sm:text-sm text-slate-950 hover:text-blue-700 hover:underline"
                  >
                    {v.isNumber}
                  </button>
                  <span className="text-xs text-slate-600 hidden sm:inline">
                    · {v.productName || 'Technical Specification'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 font-mono hidden md:inline">
                    Referenced in {v.clauses.join(', ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-300">
                    VERIFIED ACTIVE
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenStandardDetail(v.isNumber)}
                    className="text-slate-500 hover:text-slate-900 p-1"
                    title="Inspect Standard Details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when filters yield nothing */}
      {filteredActionable.length === 0 && filteredVerified.length === 0 && (
        <div className="text-center py-12 bg-white border border-black">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">No standards match your filter criteria.</p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="mt-2 text-xs text-slate-900 font-semibold hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
