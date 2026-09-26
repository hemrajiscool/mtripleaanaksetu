import React, { useState } from 'react';
import {
  FileText,
  ListTree,
  Network,
  BookOpen,
  Shield,
} from 'lucide-react';
import type { AuditResult, Finding } from './types';
import { DEMO_TENDERS } from './data/demos';
import { auditTender } from './services/api';
import { Header } from './components/Header';
import { AuditInput } from './components/AuditInput';
import { GateClearanceCard } from './components/GateClearanceCard';
import { FindingsList } from './components/FindingsList';
import { RequirementsTable } from './components/RequirementsTable';
import { DependencyGraph } from './components/DependencyGraph';
import { StandardsCatalog } from './components/StandardsCatalog';
import { StandardDetailModal } from './components/StandardDetailModal';
import { AdjudicationModal } from './components/AdjudicationModal';

type TabType = 'findings' | 'requirements' | 'graph' | 'catalog';

export const App: React.FC = () => {
  const [selectedDemoId, setSelectedDemoId] = useState<string>(DEMO_TENDERS[0].id);
  const [activeTab, setActiveTab] = useState<TabType>('findings');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Modals state
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [adjudicatingFinding, setAdjudicatingFinding] = useState<Finding | null>(null);

  const handleSelectDemoId = (demoId: string) => {
    setSelectedDemoId(demoId);
    setError(null);
  };

  const handleRunAudit = async (text: string, docId?: string, docTitle?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditTender(
        text,
        docId?.trim() || undefined,
        docTitle?.trim() || undefined
      );
      setAuditResult(result);
      setActiveTab('findings');
    } catch (err: any) {
      setError(err.message || 'Audit execution encountered a system error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAuditResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gov-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Institutional Top Bar */}
      <Header
        onSelectDemo={handleSelectDemoId}
        activeDemoId={selectedDemoId}
        onReset={handleClear}
        onOpenCatalog={() => setActiveTab('catalog')}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Specification Input & Benchmark Demos */}
        <AuditInput
          onRunAudit={handleRunAudit}
          isLoading={loading}
          selectedDemoId={selectedDemoId}
          onClear={handleClear}
        />

        {/* Global Error Notice */}
        {error && (
          <div className="bg-red-950/80 border border-red-800 rounded-lg p-4 text-xs text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold font-mono">[AUDIT_ERROR]</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xs underline font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Audit Results Viewport */}
        {auditResult && (
          <div className="space-y-6">
            {/* Level 1: Sovereign Gate Clearance Barometer */}
            <GateClearanceCard audit={auditResult} />

            {/* Level 2 & 3: Multi-View Navigation Tabs */}
            <div className="border-b border-slate-800 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-1 font-mono text-xs whitespace-nowrap min-w-max">
                <button
                  data-testid="tab-findings"
                  onClick={() => setActiveTab('findings')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                    activeTab === 'findings'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Findings & Redlines</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      auditResult.findings.length > 0
                        ? 'bg-red-950/80 text-red-300 border border-red-800/80 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {auditResult.findings.length}
                  </span>
                </button>

                <button
                  data-testid="tab-requirements"
                  onClick={() => setActiveTab('requirements')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                    activeTab === 'requirements'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                  }`}
                >
                  <ListTree className="h-3.5 w-3.5" />
                  <span>Requirements Breakdown</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {auditResult.requirements?.length || 0}
                  </span>
                </button>

                <button
                  data-testid="tab-graph"
                  onClick={() => setActiveTab('graph')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                    activeTab === 'graph'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  <span>Normative DAG Graph</span>
                </button>

                <button
                  data-testid="tab-catalog"
                  onClick={() => setActiveTab('catalog')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors cursor-pointer ${
                    activeTab === 'catalog'
                      ? 'border-blue-500 text-blue-400 bg-slate-900/40'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>SpecGuard Standards Registry</span>
                </button>
              </div>
            </div>

            {/* Tab Viewport Panels */}
            {activeTab === 'findings' && (
              <FindingsList
                findings={auditResult.findings}
                onOpenStandardDetail={(isNum) => setSelectedStandard(isNum)}
                onAdjudicate={(finding) => setAdjudicatingFinding(finding)}
              />
            )}

            {activeTab === 'requirements' && (
              <RequirementsTable
                requirements={auditResult.requirements || []}
                onOpenStandardDetail={(isNum) => setSelectedStandard(isNum)}
              />
            )}

            {activeTab === 'graph' && (
              <DependencyGraph
                documentId={auditResult.document_id}
                onOpenStandardDetail={(isNum) => setSelectedStandard(isNum)}
              />
            )}

            {activeTab === 'catalog' && (
              <StandardsCatalog
                onSelectStandard={(isNum) => setSelectedStandard(isNum)}
              />
            )}
          </div>
        )}

        {/* Catalog View when no audit has been run */}
        {!auditResult && activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('findings')}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1.5 cursor-pointer"
              >
                ← Return to Tender Specification Audit
              </button>
            </div>
            <StandardsCatalog
              onSelectStandard={(isNum) => setSelectedStandard(isNum)}
            />
          </div>
        )}

        {/* Empty State when no audit is run yet and not viewing catalog */}
        {!auditResult && activeTab !== 'catalog' && !loading && (
          <div className="bg-gov-900/60 border border-slate-800/80 rounded-lg p-10 text-center space-y-4">
            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-full w-max mx-auto text-blue-400">
              <Shield className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-200">
                Awaiting Tender Specification Input
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Paste tender procurement clauses, BoQ extracts, or choose one of the official benchmark tenders above to verify statutory compliance against gazetted Indian Standards.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleSelectDemoId(DEMO_TENDERS[0].id)}
                className="px-3 py-1.5 bg-gov-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded font-mono transition-colors cursor-pointer"
              >
                Load NHAI Bridge (IS 456)
              </button>
              <button
                onClick={() => handleSelectDemoId(DEMO_TENDERS[1].id)}
                className="px-3 py-1.5 bg-gov-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded font-mono transition-colors cursor-pointer"
              >
                Load CPWD Rebar (IS 1786)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <StandardDetailModal
        isNumber={selectedStandard}
        onClose={() => setSelectedStandard(null)}
      />

      {auditResult && adjudicatingFinding && (
        <AdjudicationModal
          documentId={auditResult.document_id}
          finding={adjudicatingFinding}
          onClose={() => setAdjudicatingFinding(null)}
          onAdjudicated={(updated) => setAuditResult(updated)}
        />
      )}

      {/* Sovereign System Telemetry Strip */}
      <footer className="mt-auto border-t border-slate-800 bg-gov-950 py-3 px-6 text-[11px] font-mono text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span>INSTITUTION: Bureau of Indian Standards (BIS)</span>
          <span className="hidden md:inline">•</span>
          <span>ENGINE: SpecGuard Deterministic Rulebook</span>
          <span className="hidden md:inline">•</span>
          <span>INTELLIGENCE: OmniRoute Boundary Isolated</span>
        </div>
        <div className="flex items-center gap-3">
          <span>PORT: 8000 (REST) / 5173 (Vite)</span>
          <span>•</span>
          <span className="text-emerald-500 font-semibold">SOVEREIGNTY SEAL ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
