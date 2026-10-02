import React, { useEffect, useState } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  AlertOctagon,
  Scale,
  Layers,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import type { StandardEdition } from '../types';
import { getStandardDetail } from '../services/api';

interface StandardDetailModalProps {
  isNumber: string | null;
  onClose: () => void;
}

export const StandardDetailModal: React.FC<StandardDetailModalProps> = ({
  isNumber,
  onClose,
}) => {
  const [standard, setStandard] = useState<StandardEdition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNumber) {
      setStandard(null);
      return;
    }

    setLoading(true);
    setError(null);
    getStandardDetail(isNumber)
      .then((data) => {
        setStandard(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch standard specification details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isNumber]);

  if (!isNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="h-full w-full max-w-2xl bg-white border-l border-slate-300 shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white border border-slate-300 rounded shadow-2xs">
              <BookOpen className="h-4 w-4 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide font-mono text-slate-900">
                  {isNumber}
                </h2>
                {standard && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${
                      standard.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : standard.status === 'SUPERSEDED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {standard.status}
                  </span>
                )}
                {standard?.is_qco_mandatory && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-bold">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    QCO MANDATORY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Bureau of Indian Standards (BIS) Authoritative Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-transparent mb-3" />
              <p className="text-xs text-slate-500 font-mono">
                Querying BIS Knowledge Base for {isNumber}...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertOctagon className="h-4 w-4" />
                Query Failed
              </div>
              <p>{error}</p>
            </div>
          )}

          {!loading && standard && (
            <>
              {/* Title & Gazette Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-900 font-sans">
                  {standard.title}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    Edition Year: <span className="text-slate-900 font-bold">{standard.year}</span>
                  </div>
                  {standard.gazette_date && (
                    <div className="font-mono">
                      Gazette Date: <span className="text-slate-900">{standard.gazette_date}</span>
                    </div>
                  )}
                  {standard.superseded_by && (
                    <div className="col-span-2 flex items-center gap-1.5 text-amber-900 font-mono text-[11px] bg-amber-50 p-2 rounded border border-amber-200">
                      <span>Superseded by:</span>
                      <strong className="underline decoration-amber-500 underline-offset-2">
                        {standard.superseded_by}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Scope Boundary */}
              {standard.scope_boundary && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Layers className="h-3 w-3 text-slate-600" />
                    Jurisdictional & Scope Boundary
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 text-xs shadow-2xs">
                    {standard.scope_boundary.included_applications.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block mb-1 font-bold">
                          Permitted / Included Applications
                        </span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                          {standard.scope_boundary.included_applications.map((app, idx) => (
                            <li key={idx}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {standard.scope_boundary.excluded_applications.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-red-800 uppercase tracking-wider block mb-1 font-bold">
                          Prohibited / Excluded Applications
                        </span>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                          {standard.scope_boundary.excluded_applications.map((app, idx) => (
                            <li key={idx}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {standard.scope_boundary.governing_alternatives &&
                      Object.keys(standard.scope_boundary.governing_alternatives).length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider block mb-1 font-bold">
                            Governing Alternative Standards
                          </span>
                          <div className="space-y-1">
                            {Object.entries(standard.scope_boundary.governing_alternatives).map(
                              ([useCase, std]) => (
                                <div
                                  key={useCase}
                                  className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1 rounded border border-slate-200"
                                >
                                  <span className="text-slate-600">{useCase}</span>
                                  <span className="font-mono text-slate-900 font-bold">
                                    {std}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Technical Constraints */}
              {standard.constraints && standard.constraints.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Scale className="h-3 w-3 text-slate-600" />
                    Authoritative Technical Constraints ({standard.constraints.length})
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Parameter</th>
                          <th className="py-2.5 px-3">Threshold / Condition</th>
                          <th className="py-2.5 px-3">Grade</th>
                          <th className="py-2.5 px-3">Test Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                        {standard.constraints.map((c) => (
                          <tr key={c.constraint_id} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {c.parameter_name}
                            </td>
                            <td className="py-2 px-3 text-blue-700 font-bold">
                              {c.condition_type}{' '}
                              {c.min_value !== undefined && c.min_value !== null
                                ? `>= ${c.min_value}`
                                : ''}
                              {c.max_value !== undefined && c.max_value !== null
                                ? `<= ${c.max_value}`
                                : ''}
                              {c.exact_value ? `== ${c.exact_value}` : ''}
                              {c.unit ? ` ${c.unit}` : ''}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{c.grade || '—'}</td>
                            <td className="py-2 px-3 text-slate-500">{c.test_method_is || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Gazetted Amendments */}
              {standard.amendments && standard.amendments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <FileText className="h-3 w-3 text-slate-600" />
                    Gazetted Revision Deltas (Amendments)
                  </div>
                  <div className="space-y-2">
                    {standard.amendments.map((am) => (
                      <div
                        key={am.amendment_number}
                        className="bg-slate-50 border border-slate-200 rounded p-3 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                          <span className="font-bold text-slate-900">
                            Amendment No. {am.amendment_number}
                          </span>
                          <span className="text-slate-500">Year: {am.publication_year}</span>
                        </div>
                        <p className="text-slate-700 font-sans">{am.description}</p>
                        {Object.keys(am.parameter_deltas || {}).length > 0 && (
                          <div className="mt-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                            <span className="text-slate-500 font-bold block mb-1">Parameter Deltas:</span>
                            {JSON.stringify(am.parameter_deltas)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
