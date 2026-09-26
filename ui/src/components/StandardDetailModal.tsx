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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="h-full w-full max-w-2xl bg-gov-900 border-l border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gov-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-950/70 border border-blue-800/80 rounded">
              <BookOpen className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide font-mono text-slate-100">
                  {isNumber}
                </h2>
                {standard && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                      standard.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                        : standard.status === 'SUPERSEDED'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                        : 'bg-red-950/80 text-red-300 border-red-700/80'
                    }`}
                  >
                    {standard.status}
                  </span>
                )}
                {standard?.is_qco_mandatory && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-700/80 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    QCO MANDATORY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Bureau of Indian Standards (BIS) Authoritative Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="Close Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-xs text-slate-400 font-mono">
                Querying BIS Knowledge Base for {isNumber}...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
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
              <div className="bg-gov-950/60 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-200 font-sans">
                  {standard.title}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    Edition Year: <span className="text-slate-200">{standard.year}</span>
                  </div>
                  {standard.gazette_date && (
                    <div className="font-mono">
                      Gazette Date: <span className="text-slate-200">{standard.gazette_date}</span>
                    </div>
                  )}
                  {standard.superseded_by && (
                    <div className="col-span-2 flex items-center gap-1.5 text-amber-300 font-mono text-[11px] bg-amber-950/30 p-2 rounded border border-amber-800/60">
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
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Layers className="h-3 w-3 text-blue-400" />
                    Jurisdictional & Scope Boundary
                  </div>
                  <div className="bg-gov-950/60 border border-slate-800 rounded-lg p-3.5 space-y-3 text-xs">
                    {standard.scope_boundary.included_applications.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                          Permitted / Included Applications
                        </span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                          {standard.scope_boundary.included_applications.map((app, idx) => (
                            <li key={idx}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {standard.scope_boundary.excluded_applications.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block mb-1">
                          Prohibited / Excluded Applications
                        </span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                          {standard.scope_boundary.excluded_applications.map((app, idx) => (
                            <li key={idx}>{app}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {standard.scope_boundary.governing_alternatives &&
                      Object.keys(standard.scope_boundary.governing_alternatives).length > 0 && (
                        <div className="pt-2 border-t border-slate-800/60">
                          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                            Governing Alternative Standards
                          </span>
                          <div className="space-y-1">
                            {Object.entries(standard.scope_boundary.governing_alternatives).map(
                              ([useCase, std]) => (
                                <div
                                  key={useCase}
                                  className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2 py-1 rounded border border-slate-800"
                                >
                                  <span className="text-slate-400">{useCase}</span>
                                  <span className="font-mono text-blue-300 font-medium">
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
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Scale className="h-3 w-3 text-purple-400" />
                    Authoritative Technical Constraints ({standard.constraints.length})
                  </div>
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900/80 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3">Parameter</th>
                          <th className="py-2 px-3">Threshold / Condition</th>
                          <th className="py-2 px-3">Grade</th>
                          <th className="py-2 px-3">Test Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-[11px]">
                        {standard.constraints.map((c) => (
                          <tr key={c.constraint_id} className="hover:bg-slate-800/30">
                            <td className="py-2 px-3 font-semibold text-slate-200">
                              {c.parameter_name}
                            </td>
                            <td className="py-2 px-3 text-blue-300">
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
                            <td className="py-2 px-3 text-slate-400">{c.grade || '—'}</td>
                            <td className="py-2 px-3 text-slate-500">{c.test_method_is || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Amendments List */}
              {standard.amendments && standard.amendments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <FileText className="h-3 w-3 text-emerald-400" />
                    Gazetted Amendments ({standard.amendments.length})
                  </div>
                  <div className="space-y-2">
                    {standard.amendments.map((am) => (
                      <div
                        key={am.amendment_number}
                        className="bg-gov-950/60 border border-slate-800 rounded p-2.5 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-400">
                            Amendment No. {am.amendment_number} ({am.publication_year})
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans text-[11px]">{am.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-gov-950 flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono text-[10px]">Source: SpecGuard Knowledge Registry</div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
