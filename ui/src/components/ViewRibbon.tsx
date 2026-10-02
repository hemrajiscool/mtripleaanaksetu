import React from 'react';
import {
  LayoutDashboard,
  ListTree,
  BookOpen,
  Network,
  ShieldCheck,
  FileDiff,
  FileCheck2,
} from 'lucide-react';
import type { WorkstationView, AuditResult } from '../types';

interface ViewRibbonProps {
  activeView: WorkstationView;
  onSelectView: (view: WorkstationView) => void;
  auditResult: AuditResult | null;
}

export const ViewRibbon: React.FC<ViewRibbonProps> = ({
  activeView,
  onSelectView,
  auditResult,
}) => {
  const views: { id: WorkstationView; num: string; label: string; icon: any; count?: number; alert?: boolean }[] = [
    {
      id: 'overview',
      num: '01',
      label: 'OVERVIEW & GATE',
      icon: LayoutDashboard,
    },
    {
      id: 'triage',
      num: '02',
      label: 'CLAUSE TRIAGE',
      icon: ListTree,
      count: auditResult ? auditResult.requirements.length : undefined,
    },
    {
      id: 'standards',
      num: '03',
      label: 'STANDARDS CATALOG',
      icon: BookOpen,
    },
    {
      id: 'graph',
      num: '04',
      label: 'NORMATIVE DAG',
      icon: Network,
      alert: Boolean(auditResult && auditResult.cascading_dependency_alerts.length > 0),
    },
    {
      id: 'invariants',
      num: '05',
      label: 'RULES & INVARIANTS',
      icon: ShieldCheck,
      count: auditResult ? auditResult.summary.critical_violations + auditResult.summary.high_violations : undefined,
    },
    {
      id: 'corrigenda',
      num: '06',
      label: 'CORRIGENDA & PROOF',
      icon: FileDiff,
      count: auditResult ? auditResult.findings.length : undefined,
      alert: Boolean(auditResult && auditResult.findings.length > 0),
    },
    {
      id: 'dossier',
      num: '07',
      label: 'AUDIT DOSSIER',
      icon: FileCheck2,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 min-w-max h-11">
          {views.map((v) => {
            const isActive = activeView === v.id;
            const Icon = v.icon;

            return (
              <button
                key={v.id}
                data-testid={`view-tab-${v.id}`}
                onClick={() => onSelectView(v.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-medium transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-slate-900 text-slate-900 bg-slate-100/70 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {v.num}
                </span>
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{v.label}</span>

                {typeof v.count !== 'undefined' && v.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      v.alert
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {v.count}
                  </span>
                )}

                {v.alert && typeof v.count === 'undefined' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
