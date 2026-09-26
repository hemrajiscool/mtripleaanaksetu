import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import type { StandardEdition } from '../types';
import { getStandardsCatalog } from '../services/api';

interface StandardsCatalogProps {
  onSelectStandard: (isNumber: string) => void;
}

export const StandardsCatalog: React.FC<StandardsCatalogProps> = ({ onSelectStandard }) => {
  const [standards, setStandards] = useState<StandardEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    getStandardsCatalog()
      .then((data) => {
        setStandards(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load standards catalog.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredStandards = standards.filter((std) => {
    const matchesSearch =
      std.is_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.family_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || std.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-gov-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 font-mono">
            <BookOpen className="h-4 w-4 text-blue-400" />
            SpecGuard Authoritative Standards Registry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic Knowledge Base of Bureau of Indian Standards (BIS) gazetted codes, QCOs, and amendments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search IS number, title..."
              className="bg-gov-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-600 outline-hidden w-64 font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gov-950 border border-slate-800 rounded p-1 text-xs font-mono">
            {['ALL', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-800 text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Standards List / Table */}
      {loading ? (
        <div className="bg-gov-900 border border-slate-800 rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3" />
          <p className="text-xs text-slate-400 font-mono">Loading BIS Knowledge Registry...</p>
        </div>
      ) : error ? (
        <div className="bg-red-950/60 border border-red-800 rounded-lg p-6 text-center text-xs text-red-300">
          {error}
        </div>
      ) : (
        <div className="bg-gov-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gov-950 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Standard Code</th>
                  <th className="py-3 px-4">Specification Title</th>
                  <th className="py-3 px-3">Family</th>
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3">Legal Status</th>
                  <th className="py-3 px-3">QCO Order</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                {filteredStandards.map((std) => (
                  <tr
                    key={std.is_number}
                    data-testid="catalog-row"
                    data-is-number={std.is_number}
                    data-is-id={std.is_number.replace(/[^a-zA-Z0-9]/g, '_')}
                    onClick={() => onSelectStandard(std.is_number)}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-semibold text-blue-300 whitespace-nowrap">
                      {std.is_number}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-md">
                      <div className="line-clamp-1">{std.title}</div>
                      {std.superseded_by && (
                        <div className="text-[10px] font-mono text-amber-400/90 mt-0.5">
                          Superseded by {std.superseded_by}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {std.family_code}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {std.year}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${
                          std.status === 'ACTIVE'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                            : std.status === 'SUPERSEDED'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                            : 'bg-red-950/80 text-red-300 border-red-700/80'
                        }`}
                      >
                        {std.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {std.is_qco_mandatory ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700/80 flex items-center gap-1 w-max font-semibold">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          MANDATORY
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Voluntary</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="text-slate-500 group-hover:text-blue-400 transition-colors inline-flex items-center gap-1 text-[10px]">
                        Inspect <ExternalLink className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredStandards.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                      No standards match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
