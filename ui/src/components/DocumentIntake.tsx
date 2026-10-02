import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Building2,
  Zap,
  HeartPulse,
  HardHat,
  Loader2,
} from 'lucide-react';
import { DEMO_TENDERS, type DemoTender } from '../data/demos';
import { t, type Language } from '../i18n';

interface DocumentIntakeProps {
  onAnalyze: (text: string, title?: string) => Promise<void>;
  isLoading: boolean;
  language?: Language;
}

export const DocumentIntake: React.FC<DocumentIntakeProps> = ({
  onAnalyze,
  isLoading,
  language = 'en',
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    await onAnalyze(text.trim(), title.trim() || undefined);
  };

  const handleSelectSample = async (demo: DemoTender) => {
    setText(demo.text);
    setTitle(demo.title);
    await onAnalyze(demo.text, demo.title);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in duration-200">
      {/* Editorial Intro */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-slate-900 border border-black mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-slate-700" />
          <span>{t('intakeBadge', language)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-3 font-serif">
          {t('intakeHeadline', language)}
        </h1>
        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
          {t('intakeSubhead', language)}
        </p>
      </div>

      {/* Main Intake Card (Crisp Rectangle Block) */}
      <div className="bg-white border border-black shadow-xs p-6 sm:p-8 mb-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="document-title"
              className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5"
            >
              {t('documentTitleLabel', language)}
            </label>
            <input
              id="document-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 4-Lane River Crossing Bridge Deck Works — Civil Package 02"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors placeholder:text-slate-400 text-slate-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="specification-text"
                className="block text-xs font-bold text-slate-900 uppercase tracking-wider"
              >
                {t('specificationTextLabel', language)}
              </label>
              <span className="text-[11px] text-slate-600 font-medium">
                {language === 'hi' ? 'कच्चे खंड, बीओक्यू विवरण या प्रारूप पाठ दर्ज करें' : 'Paste raw clauses, BOQ descriptions, or unformatted text'}
              </span>
            </div>
            <textarea
              id="specification-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste technical requirements here... For example:
Clause 4.1: Ordinary Portland Cement 43 Grade for high-stress rigid pavement slabs shall strictly conform to IS 269:1989.
Clause 4.2: Cement shall be procured exclusively from UltraTech or ACC brand to ensure structural durability.
Clause 4.3: All concrete design mixes shall adhere to the overarching provisions of IS 456:2000."
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors placeholder:text-slate-400 text-slate-900 leading-relaxed resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-600 font-medium">
              {language === 'hi' ? 'बीआईएस संहिता, राजपत्र क्यूसीओ और जीएफआर 2017 से मिलान।' : 'Evaluated against BIS Codes, Gazette QCOs, and GFR 2017 rules.'}
            </div>
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors border border-black font-semibold text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'hi' ? 'मानक मूल्यांकन जारी...' : 'Evaluating Standards...'}</span>
                </>
              ) : (
                <>
                  <span>{t('identifyStandardsBtn', language)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Benchmark Samples */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-950">
            {t('orExploreCurated', language)}
          </div>
          <span className="text-xs text-slate-900 font-medium">{t('instantAnalysis', language)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {DEMO_TENDERS.map((demo) => {
            const isCement = demo.id.includes('CEMENT');
            const isRebar = demo.id.includes('REBAR');
            const isTransformer = demo.id.includes('TRANSFORMER');

            const Icon = isCement
              ? HardHat
              : isRebar
              ? Building2
              : isTransformer
              ? Zap
              : HeartPulse;

            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectSample(demo)}
                disabled={isLoading}
                className="text-left p-4 bg-white border border-black hover:border-black hover:shadow-md transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 bg-slate-100 text-slate-900 border border-slate-200 group-hover:bg-black group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                      {demo.domain.split('/')[0].trim()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-950 group-hover:text-black line-clamp-2 mb-1.5">
                    {demo.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                    {demo.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-800 font-semibold">
                  <span>{language === 'hi' ? 'विश्लेषण प्रारंभ करें' : 'Analyze Scope'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
