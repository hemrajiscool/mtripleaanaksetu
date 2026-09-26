import React from 'react';
import type { Requirement } from '../types';

interface RequirementsTableProps {
  requirements: Requirement[];
  onOpenStandardDetail: (isNumber: string) => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  onOpenStandardDetail,
}) => {
  if (requirements.length === 0) {
    return (
      <div className="bg-gov-900 border border-slate-800 rounded-lg p-8 text-center text-xs text-slate-400">
        No structured requirements extracted.
      </div>
    );
  }

  return (
    <div className="bg-gov-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">REQ ID</th>
              <th className="py-3 px-4">PRODUCT / SCOPE</th>
              <th className="py-3 px-4">QUANTITATIVE PARAMETERS</th>
              <th className="py-3 px-4">CITED STANDARDS</th>
              <th className="py-3 px-4">BRANDS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {requirements.map((req) => (
              <tr key={req.requirement_id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-200 whitespace-nowrap">
                  {req.requirement_id}
                </td>
                <td className="py-3 px-4 font-sans max-w-xs">
                  <div className="font-medium text-white">{req.product_name || 'Unspecified Product'}</div>
                  {req.application && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Application: {req.application}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {req.parameters && req.parameters.length > 0 ? (
                    <div className="space-y-1">
                      {req.parameters.map((p, i) => (
                        <div key={i} className="text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block mr-1">
                          <span className="text-slate-400">{p.name}: </span>
                          <span className="text-blue-300 font-bold">{p.value} {p.unit || ''}</span>{' '}
                          <span className="text-slate-500">({p.condition})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {req.cited_standards && req.cited_standards.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {req.cited_standards.map((std, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenStandardDetail(std)}
                          className="text-[11px] bg-blue-950/60 text-blue-300 hover:text-blue-200 border border-blue-800/80 px-2 py-0.5 rounded transition-colors"
                        >
                          {std}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600">None cited</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {req.cited_brands && req.cited_brands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {req.cited_brands.map((b, i) => (
                        <span key={i} className="text-[11px] bg-red-950/60 text-red-300 border border-red-800/80 px-2 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-600">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
