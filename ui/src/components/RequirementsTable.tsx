import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { Requirement, Finding } from '../types';

interface RequirementsTableProps {
  requirements: Requirement[];
  findings?: Finding[];
  onOpenStandardDetail: (isNumber: string) => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  findings = [],
  onOpenStandardDetail,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>('INV-01');

  // Evaluate the 5 Invariant Rules against findings
  const lifecycleViolations = findings.filter(
    (f) => f.violation_type === 'ERR_OBSOLETE_STANDARD' || f.rule_id.includes('LIFECYCLE')
  );
  const parameterViolations = findings.filter(
    (f) =>
      f.violation_type === 'ERR_PARAM_MISMATCH' ||
      f.violation_type === 'ERR_AMENDMENT_MISMATCH' ||
      f.rule_id.includes('PARAMETER') ||
      f.rule_id.includes('AMENDMENT')
  );
  const brandViolations = findings.filter(
    (f) => f.violation_type === 'ERR_PROPRIETARY_BRAND' || f.rule_id.includes('BRAND')
  );
  const cascadingViolations = findings.filter(
    (f) => f.rule_id.includes('CASCADING') || f.rule_id.includes('DEPENDENCY')
  );
  const scopeViolations = findings.filter(
    (f) => f.rule_id.includes('SCOPE') || f.rule_id.includes('APPLICATION')
  );

  const invariantRules = [
    {
      id: 'INV-01',
      code: 'RULE-LIFECYCLE-OBSOLETE',
      title: 'Standard Lifecycle & Supersession Invariant',
      authority: 'BIS Act 2016 Section 16 & GFR 2017 Rule 173(v)',
      description:
        'Verifies that every cited standard is active and valid under current Quality Control Orders (QCO). Withdrawn or superseded standards constitute an illegal tender under GFR.',
      status: lifecycleViolations.length > 0 ? 'FAIL' : 'PASS',
      violationsCount: lifecycleViolations.length,
      severity: 'CRITICAL',
      findings: lifecycleViolations,
    },
    {
      id: 'INV-02',
      code: 'RULE-TECHNICAL-PARAMETER-BOUND',
      title: 'Quantitative Technical Parameter Invariant',
      authority: 'Authoritative BIS Standard Schedules & Gazette Amendments',
      description:
        'Evaluates physical, mechanical, and chemical tolerances against statutory limits (e.g. minimum yield strength, elongation, compressive strength, setting times).',
      status: parameterViolations.length > 0 ? 'FAIL' : 'PASS',
      violationsCount: parameterViolations.length,
      severity: 'CRITICAL',
      findings: parameterViolations,
    },
    {
      id: 'INV-03',
      code: 'RULE-COMMERCIAL-BRAND-EXCLUSION',
      title: 'Brand Neutrality & Non-Discriminatory Specification Invariant',
      authority: 'GFR 2017 Rule 144(i) & CVC Circular No. 002/ENG/2',
      description:
        'Prohibits specification of proprietary trade names, trademarks, or restrictive manufacturer brands without formal technical dispensation.',
      status: brandViolations.length > 0 ? 'FAIL' : 'PASS',
      violationsCount: brandViolations.length,
      severity: 'HIGH',
      findings: brandViolations,
    },
    {
      id: 'INV-04',
      code: 'RULE-NORMATIVE-DAG-OBSOLESCENCE',
      title: 'Normative Cascading Obsolescence Invariant',
      authority: '2-Hop Normative Directed Acyclic Graph (DAG) Resolution',
      description:
        'Detects indirect supply-chain non-compliance where an active governing standard normatively references a withdrawn or superseded sub-standard.',
      status: cascadingViolations.length > 0 ? 'ALERT' : 'PASS',
      violationsCount: cascadingViolations.length,
      severity: 'HIGH',
      findings: cascadingViolations,
    },
    {
      id: 'INV-05',
      code: 'RULE-SCOPE-APPLICATION-BOUNDARY',
      title: 'Scope Boundary & Application Constraint Invariant',
      authority: 'BIS Gazette Scope Definitions & Mandatory Exclusions',
      description:
        'Ensures specified product applications strictly conform to the gazetted scope and do not breach prohibited application boundaries.',
      status: scopeViolations.length > 0 ? 'FAIL' : 'PASS',
      violationsCount: scopeViolations.length,
      severity: 'MEDIUM',
      findings: scopeViolations,
    },
  ];

  const selectedRule =
    invariantRules.find((r) => r.id === selectedRuleId) || invariantRules[0];

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
            Statutory Rules & Invariant Verification Suite
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Deterministic evaluation of public procurement invariants (INV-01 to INV-05) against the BIS Act 2016 and GFR 2017.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700">
            RULES: <strong className="text-slate-900">5 ACTIVE</strong>
          </span>
          <span className="px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 font-bold">
            BREACHED: {invariantRules.filter((r) => r.status === 'FAIL').length}
          </span>
          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 font-bold">
            CONFORMANT: {invariantRules.filter((r) => r.status === 'PASS').length}
          </span>
        </div>
      </div>

      {/* 40/60 Asymmetric Split: Left Invariant Rules Suite / Right Rule Evaluation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (40%): Invariant Rules Suite Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>INVARIANT RULES SUITE (5)</span>
            <span className="text-[10px] text-slate-400">Select Rule</span>
          </div>

          <div className="space-y-2">
            {invariantRules.map((rule) => {
              const isSelected = selectedRuleId === rule.id;
              const isFail = rule.status === 'FAIL';
              const isAlert = rule.status === 'ALERT';

              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {rule.id}
                      </span>
                      <span className="font-mono text-[11px] text-blue-700 font-semibold truncate max-w-[170px]">
                        {rule.code}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                        isFail
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isAlert
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isFail
                        ? `FAIL (${rule.violationsCount})`
                        : isAlert
                        ? `ALERT (${rule.violationsCount})`
                        : 'CONFORMANT'}
                    </span>
                  </div>

                  <div className="font-sans text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">
                    {rule.title}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
                    Authority: {rule.authority}
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

        {/* Right Column (60%): Sticky Invariant Rule Inspector */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Inspector Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedRule.id} // {selectedRule.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedRule.status === 'FAIL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : selectedRule.status === 'ALERT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedRule.status === 'FAIL'
                      ? 'Statutory Breach'
                      : selectedRule.status === 'ALERT'
                      ? 'Normative Risk'
                      : 'Verified Conformant'}
                  </span>
                </div>
                <h3 className="font-sans text-xs font-semibold text-slate-800 mt-1">
                  {selectedRule.title}
                </h3>
              </div>

              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                Severity: <strong className="text-slate-900">{selectedRule.severity}</strong>
              </span>
            </div>

            {/* Inspector Content */}
            <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto font-sans text-xs">
              {/* Rule Description & Legal Mandate */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider">
                  Statutory Rule Definition
                </div>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {selectedRule.description}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1 font-mono">
                <div className="text-[10px] text-slate-400 uppercase">Governing Statutory Authority</div>
                <div className="text-slate-900 font-medium">{selectedRule.authority}</div>
              </div>

              {/* Emitted Invariant Violations */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1">
                  <span>Triggered Findings on Audited Specification ({selectedRule.findings.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Deterministic</span>
                </div>

                {selectedRule.findings.length === 0 ? (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>No infractions triggered under this invariant rule. Tender fully conforms.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRule.findings.map((f) => (
                      <div
                        key={f.finding_id}
                        className="p-3 bg-red-50/40 border border-red-200 rounded space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-slate-900">{f.detected_entity}</span>
                          <span className="text-red-700 font-bold">{f.violation_type}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-sans">
                          {f.engineering_rationale}
                        </p>
                        {f.segment_text && (
                          <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 mt-1 line-clamp-2">
                            Source: {f.segment_text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Specifications & Quantitative Constraints Ledger */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-700" />
            <span>Extracted Specification Clauses & Quantitative Parameters ({requirements.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Source Ground Truth
          </span>
        </div>

        {requirements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-sans">
            No structured requirements extracted from active tender.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-bold">REQ ID</th>
                  <th className="py-2.5 px-3 font-bold">PRODUCT / APPLICATION</th>
                  <th className="py-2.5 px-3 font-bold">QUANTITATIVE PARAMETERS</th>
                  <th className="py-2.5 px-3 font-bold">CITED STANDARDS</th>
                  <th className="py-2.5 px-3 font-bold">PROPRIETARY BRANDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
                {requirements.map((req) => (
                  <tr key={req.requirement_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {req.requirement_id}
                    </td>
                    <td className="py-2.5 px-3 font-sans max-w-xs">
                      <div className="font-semibold text-slate-900">{req.product_name || 'Unspecified Product'}</div>
                      {req.application && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Application: {req.application}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {req.parameters && req.parameters.length > 0 ? (
                        <div className="space-y-1">
                          {req.parameters.map((p, i) => (
                            <div key={i} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mr-1">
                              <span className="text-slate-600">{p.name}: </span>
                              <span className="text-slate-900 font-bold">{p.value} {p.unit || ''}</span>{' '}
                              <span className="text-slate-500">({p.condition})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {req.cited_standards && req.cited_standards.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {req.cited_standards.map((std, i) => (
                            <button
                              key={i}
                              onClick={() => onOpenStandardDetail(std)}
                              className="text-[10px] bg-white text-slate-800 hover:text-black hover:border-slate-400 border border-slate-300 px-1.5 py-0.5 rounded transition-colors shadow-2xs font-semibold cursor-pointer"
                            >
                              {std}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans text-[10px]">None cited</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {req.cited_brands && req.cited_brands.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {req.cited_brands.map((b, i) => (
                            <span key={i} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans text-[10px]">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
