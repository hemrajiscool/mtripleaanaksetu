import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldCheck,
  ExternalLink,
  Scale,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { StandardEdition } from '../types';
import { getStandardsCatalog, getStandardDetail } from '../services/api';

interface StandardsCatalogProps {
  onSelectStandard: (isNumber: string) => void;
}

export const StandardsCatalog: React.FC<StandardsCatalogProps> = ({ onSelectStandard }) => {
  const [standards, setStandards] = useState<StandardEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Standard State for 40/60 Right Inspector
  const [selectedIsNumber, setSelectedIsNumber] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<StandardEdition | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getStandardsCatalog()
      .then((data) => {
        setStandards(data);
        if (data.length > 0) {
          const first = data[0].is_number;
          setSelectedIsNumber(first);
          loadDetail(first);
        }
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load standards catalog.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadDetail = async (isNumber: string) => {
    setInspectorLoading(true);
    try {
      const detail = await getStandardDetail(isNumber);
      setSelectedStandard(detail);
    } catch {
      // Fallback to local catalog item if detail fetch fails
      const fallback = standards.find((s) => s.is_number === isNumber) || null;
      setSelectedStandard(fallback);
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleSelect = (isNumber: string) => {
    setSelectedIsNumber(isNumber);
    loadDetail(isNumber);
  };

  const filteredStandards = standards.filter((std) => {
    const matchesSearch =
      std.is_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.family_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || std.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUPERSEDED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WITHDRAWN':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 font-mono uppercase tracking-wider">
            <BookOpen className="h-4 w-4 text-slate-700" />
            Authoritative Standards Knowledge Base
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            40/60 Asymmetric Master-Detail: Bureau of Indian Standards (BIS) gazetted codes, mandatory QCOs, and quantitative constraint rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IS code, title..."
              className="bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 w-56 font-mono shadow-2xs"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded p-1 text-xs font-mono">
            <Filter className="h-3 w-3 text-slate-400 ml-1 mr-0.5" />
            {['ALL', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-2xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-800 border-t-transparent mb-3" />
          <p className="text-xs text-slate-500 font-mono">Loading Authoritative Standards Registry...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-xs text-red-700 shadow-2xs">
          {error}
        </div>
      ) : (
        /* 40/60 Asymmetric Master-Detail Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Master List (40% width): Standards Selector */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center justify-between">
              <span>REGISTRY STANDARDS ({filteredStandards.length})</span>
              <span className="text-[10px] text-slate-400">Select to Inspect</span>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
              {filteredStandards.map((std) => {
                const isSelected = selectedIsNumber === std.is_number;

                return (
                  <div
                    key={std.is_number}
                    data-testid="catalog-row"
                    data-is-number={std.is_number}
                    data-is-id={std.is_number.replace(/[^a-zA-Z0-9]/g, '_')}
                    onClick={() => handleSelect(std.is_number)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {std.is_number}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getStatusBadge(
                            std.status
                          )}`}
                        >
                          {std.status}
                        </span>
                        {std.is_qco_mandatory && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            QCO
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-sans text-xs text-slate-700 line-clamp-1 font-medium">
                      {std.title}
                    </div>

                    <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 mt-1.5">
                      <span>Family: {std.family_code}</span>
                      <span>•</span>
                      <span>Year: {std.year}</span>
                      {std.superseded_by && (
                        <>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold truncate">
                            → {std.superseded_by}
                          </span>
                        </>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:block">
                        <ChevronRight className="h-4 w-4 text-slate-900" />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredStandards.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-sans text-xs bg-white border border-slate-200 rounded-lg">
                  No standards match your filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (60% width): Sticky Standard Specification Inspector */}
          <div className="lg:col-span-7 sticky top-20">
            {inspectorLoading ? (
              <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-800 border-t-transparent mb-2" />
                <p className="text-xs text-slate-500 font-mono">Loading specification details...</p>
              </div>
            ) : selectedStandard ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                {/* Inspector Header */}
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-bold text-slate-900">
                        {selectedStandard.is_number}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusBadge(
                          selectedStandard.status
                        )}`}
                      >
                        {selectedStandard.status}
                      </span>
                      {selectedStandard.is_qco_mandatory && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-blue-600" />
                          MANDATORY QCO
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans text-xs font-semibold text-slate-800 mt-1 max-w-xl">
                      {selectedStandard.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onSelectStandard(selectedStandard.is_number)}
                    className="flex items-center space-x-1 text-xs font-mono px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 transition-colors shadow-2xs cursor-pointer"
                    title="Open Fullscreen Slide-over Drawer"
                  >
                    <span>Full Drawer</span>
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </button>
                </div>

                {/* Inspector Scrollable Body */}
                <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {/* Registry Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Family Code</div>
                      <div className="font-bold text-slate-900 mt-0.5">{selectedStandard.family_code}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Effective Year</div>
                      <div className="font-bold text-slate-900 mt-0.5">{selectedStandard.year}</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Gazette Date</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {selectedStandard.gazette_date || 'Enacted'}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-400 uppercase">Enforcement</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {selectedStandard.is_qco_mandatory ? 'Statutory QCO' : 'Voluntary'}
                      </div>
                    </div>
                  </div>

                  {/* Supersession Notice */}
                  {selectedStandard.superseded_by && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs font-mono text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">SUPERSEDED SPECIFICATION: </span>
                        <span>This edition is superseded by </span>
                        <strong className="underline cursor-pointer" onClick={() => handleSelect(selectedStandard.superseded_by!)}>
                          {selectedStandard.superseded_by}
                        </strong>
                        . Use in new public tenders violates GFR 173(v).
                      </div>
                    </div>
                  )}

                  {/* Gazetted Scope & Mandatory Boundaries */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                      <Scale className="h-3.5 w-3.5 text-slate-600" />
                      <span>Gazetted Scope & Application Boundaries</span>
                    </div>

                    <p className="text-xs font-sans text-slate-700 leading-relaxed">
                      {selectedStandard.scope_text ||
                        'Specifies mandatory technical requirements, sampling criteria, compliance tolerances, and verification procedures.'}
                    </p>

                    {selectedStandard.scope_boundary && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Included */}
                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded space-y-1">
                          <div className="text-[10px] font-mono text-emerald-800 font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Permitted Applications</span>
                          </div>
                          <ul className="text-xs font-sans text-slate-700 space-y-1 pl-4 list-disc">
                            {selectedStandard.scope_boundary.included_applications.map((app, i) => (
                              <li key={i}>{app}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Excluded */}
                        <div className="p-3 bg-red-50/50 border border-red-200 rounded space-y-1">
                          <div className="text-[10px] font-mono text-red-800 font-bold uppercase flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span>Prohibited / Excluded Uses</span>
                          </div>
                          <ul className="text-xs font-sans text-slate-700 space-y-1 pl-4 list-disc">
                            {selectedStandard.scope_boundary.excluded_applications.map((app, i) => (
                              <li key={i}>{app}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Constraints & Quantitative Parameters */}
                  {selectedStandard.constraints && selectedStandard.constraints.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                        <Layers className="h-3.5 w-3.5 text-slate-600" />
                        <span>Quantitative Constraints ({selectedStandard.constraints.length})</span>
                      </div>

                      <div className="border border-slate-200 rounded overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Parameter</th>
                              <th className="py-2 px-3">Grade</th>
                              <th className="py-2 px-3">Constraint</th>
                              <th className="py-2 px-3">Test Method</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {selectedStandard.constraints.map((c, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-semibold text-slate-900">{c.parameter_name}</td>
                                <td className="py-2 px-3 text-slate-600">{c.grade || 'ALL'}</td>
                                <td className="py-2 px-3 text-slate-800">
                                  {c.condition_type} {c.min_value ?? c.max_value ?? c.exact_value} {c.unit || ''}
                                </td>
                                <td className="py-2 px-3 text-slate-500">{c.test_method_is || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Amendments Ledger */}
                  {selectedStandard.amendments && selectedStandard.amendments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        <span>Gazetted Amendments ({selectedStandard.amendments.length})</span>
                      </div>

                      <div className="space-y-2">
                        {selectedStandard.amendments.map((am, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-slate-900">
                                Amendment No. {am.amendment_number}
                              </span>
                              <span className="text-slate-500">{am.publication_year}</span>
                            </div>
                            <p className="text-slate-700 font-sans text-[11px]">
                              {am.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-slate-400 font-mono text-xs">
                Select a standard from the catalog to inspect specification details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
