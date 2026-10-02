import React, { useState, useEffect, useCallback } from 'react';
import type { AuditResult, Finding } from './types';
import { DEMO_TENDERS } from './data/demos';
import { auditTender } from './services/api';
import { RecommendationHeader } from './components/RecommendationHeader';
import { DocumentIntake } from './components/DocumentIntake';
import { StandardsRegimeView } from './components/StandardsRegimeView';
import { StandardDetailModal } from './components/StandardDetailModal';
import { AdjudicationModal } from './components/AdjudicationModal';
import { DossierModal } from './components/DossierModal';
import { PersonaGatewayModal, PERSONA_PROFILES, type PersonaProfile } from './components/PersonaGatewayModal';
import { TelemetryStepper } from './components/TelemetryStepper';
import { ProcurementAssistant } from './components/ProcurementAssistant';
import { VerificationModal } from './components/VerificationModal';
import { AlertCircle } from 'lucide-react';
import { type Language } from './i18n';

export const App: React.FC = () => {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Internationalization & Persona Gateway
  const [language, setLanguage] = useState<Language>('en');
  const [currentPersona, setCurrentPersona] = useState<PersonaProfile>(() => {
    const saved = localStorage.getItem('maanaksetu_persona_id');
    if (saved) {
      const match = PERSONA_PROFILES.find((p) => p.id === saved);
      if (match) return match;
    }
    return PERSONA_PROFILES[0];
  });
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Modals & In-situ inspection state
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [adjudicatingFinding, setAdjudicatingFinding] = useState<Finding | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Audit execution
  const executeAudit = useCallback(async (text: string, title?: string, docId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditTender(
        text,
        docId || undefined,
        title || undefined
      );
      setAuditResult(result);
    } catch (err: any) {
      setError(err.message || 'Audit execution encountered an unexpected system error.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: pre-load the default rich benchmark tender
  useEffect(() => {
    const defaultDemo = DEMO_TENDERS[0];
    executeAudit(defaultDemo.text, defaultDemo.title, defaultDemo.id);
  }, [executeAudit]);

  // Handler for custom analysis from DocumentIntake
  const handleAnalyze = async (text: string, title?: string) => {
    await executeAudit(text, title);
  };

  // Reset to intake
  const handleAuditNew = () => {
    setAuditResult(null);
    setError(null);
  };

  // Optimistic update after adjudication
  const handleAdjudicated = (updatedResult: AuditResult) => {
    setAuditResult(updatedResult);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleSelectPersona = (p: PersonaProfile) => {
    setCurrentPersona(p);
    localStorage.setItem('maanaksetu_persona_id', p.id);
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. Clean, Quiet Institutional Header */}
      <RecommendationHeader
        auditResult={auditResult}
        onAuditNew={handleAuditNew}
        onExportDossier={() => setIsDossierOpen(true)}
        language={language}
        onToggleLanguage={toggleLanguage}
        persona={currentPersona}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
      />

      {/* 2. Error Display */}
      {error && (
        <div className="max-w-5xl mx-auto mt-4 px-4 w-full">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold text-rose-900 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace */}
      <main className="flex-1 pb-16">
        {loading ? (
          <TelemetryStepper language={language} />
        ) : auditResult ? (
          <StandardsRegimeView
            auditResult={auditResult}
            onOpenStandardDetail={(isNumber) => setSelectedStandard(isNumber)}
            onAdjudicate={(finding) => setAdjudicatingFinding(finding)}
            language={language}
          />
        ) : (
          <DocumentIntake
            onAnalyze={handleAnalyze}
            isLoading={loading}
            language={language}
          />
        )}
      </main>

      {/* 4. In-Situ Standard Inspector Slide-Over */}
      {selectedStandard && (
        <StandardDetailModal
          isNumber={selectedStandard}
          onClose={() => setSelectedStandard(null)}
        />
      )}

      {/* 5. Human Sovereign Adjudication Dialog */}
      {adjudicatingFinding && auditResult && (
        <AdjudicationModal
          documentId={auditResult.document_id}
          finding={adjudicatingFinding}
          onClose={() => setAdjudicatingFinding(null)}
          onAdjudicated={handleAdjudicated}
        />
      )}

      {/* 6. Conformance Dossier Modal (Print / Export) */}
      {isDossierOpen && auditResult && (
        <DossierModal
          auditResult={auditResult}
          onClose={() => setIsDossierOpen(false)}
          onOpenStandardDetail={(isNumber) => setSelectedStandard(isNumber)}
        />
      )}

      {/* 7. Institutional Persona Gateway Modal */}
      <PersonaGatewayModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        onSelectPersona={handleSelectPersona}
        currentPersonaId={currentPersona.id}
        language={language}
      />

      {/* 8. Public Cryptographic Verification Modal */}
      <VerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        language={language}
        prefillDigest={auditResult?.sha256_digest}
      />

      {/* 9. Floating Procurement Assistant Copilot */}
      <ProcurementAssistant
        documentId={auditResult?.document_id}
        language={language}
      />

      {/* 10. Restrained Footer */}
      <footer className="border-t border-black/20 bg-transparent py-5 text-center text-xs text-slate-900 font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Bureau of Indian Standards Act 2016 & General Financial Rules 2017
          </div>
          <div className="text-[11px] text-slate-800 font-mono font-semibold">
            MaanakSetu Sovereign Standards Engine
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
