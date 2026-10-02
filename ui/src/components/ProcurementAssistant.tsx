import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  BookOpen,
  Minimize2,
} from 'lucide-react';
import { askAssistant, type AssistantChatResponse } from '../services/api';
import { t, type Language } from '../i18n';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp: string;
}

interface ProcurementAssistantProps {
  documentId?: string;
  language: Language;
}

const QUICK_PROMPTS_EN = [
  'What defects were detected in this active tender?',
  'Why is UltraTech/ACC brand prohibited under GFR 144(i)?',
  'Explain difference between IS 269:1989 and IS 269:2015',
  'Explain MaanakSetu system architecture & codebase',
  'How do I draft a statutory corrigendum notice for GeM?',
  'What is the significance of the SHA-256 audit digest?',
];

const QUICK_PROMPTS_HI = [
  'इस सक्रिय निविदा में कौन सी वैधानिक कमियां पाई गईं?',
  'जीएफआर 144(i) के तहत अल्ट्राटेक/एसीसी ब्रांड क्यों प्रतिबंधित है?',
  'IS 269:1989 और IS 269:2015 के बीच अंतर स्पष्ट करें',
  'मानक सेतु प्रणाली वास्तुकला (Architecture) और कोडबेस स्पष्ट करें',
  'GeM के लिए आधिकारिक शुद्धिपत्र (Corrigendum) कैसे तैयार करें?',
  'SHA-256 ऑडिट डाइजेस्ट का वैधानिक महत्व क्या है?',
];

export const ProcurementAssistant: React.FC<ProcurementAssistantProps> = ({
  documentId,
  language,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting =
    language === 'hi'
      ? 'नमस्ते! मैं मानक सेतु खरीद सहायक (Procurement Assistant) हूँ। मैं सामान्य वित्तीय नियम (GFR 2017), बीआईएस अधिनियम २०१६, सीवीसी सतर्कता दिशा-निर्देशों तथा शुद्धिपत्र प्रारूपण में आपकी सहायता कर सकता हूँ। आप मुझसे निविदा शर्तों, ब्रांड प्रतिबंधों अथवा मानकों के संबंध में कोई भी प्रश्न पूछ सकते हैं।'
      : 'Hello! I am your MaanakSetu Procurement Assistant. I provide statutory guidance grounded in the General Financial Rules (GFR 2017), BIS Act 2016, CVC Vigilance directives, and GeM tender procedures. How can I assist with your procurement evaluation?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: initialGreeting,
      citations: ['GFR 2017 Rule 144(i)', 'BIS Act 2016', 'CVC Directives'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: AssistantChatResponse = await askAssistant(historyPayload, documentId);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'hi'
            ? 'क्षमा करें, खरीद सहायक से संपर्क करने में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Sorry, encountered a communication issue with the regulatory service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = language === 'hi' ? QUICK_PROMPTS_HI : QUICK_PROMPTS_EN;

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-black text-white hover:bg-slate-800 transition-all px-4 py-2.5 rounded-full shadow-xl border-2 border-white flex items-center gap-2.5 group cursor-pointer"
          title="Open Procurement Assistant"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-bold font-sans tracking-wide">
            {t('procurementAssistant', language)}
          </span>
          <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-emerald-300">
            ONLINE
          </span>
        </button>
      )}

      {/* Expanded Floating Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[440px] h-[580px] bg-white border-2 border-black shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b border-black">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white text-black font-bold flex items-center justify-center font-mono text-xs">
                PA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs tracking-tight font-serif">
                    {t('procurementAssistant', language)}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-300 font-sans">
                  GFR 2017 & BIS Act 2016 Sovereign Copilot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {documentId && (
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 text-[10px] font-mono text-slate-700 flex items-center justify-between">
              <span className="truncate max-w-[280px]">
                TENDER CONTEXT: <strong>{documentId}</strong>
              </span>
              <span className="text-emerald-700 font-semibold">Grounded</span>
            </div>
          )}

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-black text-white border border-black shadow-2xs'
                        : 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Citations Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {msg.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-200 rounded"
                          >
                            <BookOpen className="w-2.5 h-2.5 text-slate-500" />
                            <span>{cite}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 text-xs text-slate-600 max-w-[85%]">
                <Loader2 className="w-3.5 h-3.5 text-slate-800 animate-spin" />
                <span>
                  {language === 'hi'
                    ? 'जीएफआर 144(i) एवं बीआईएस ज्ञानकोश से उत्तर तैयार हो रहा है...'
                    : 'Querying GFR 2017 & BIS standards knowledge base...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="bg-white border-t border-slate-200 p-2 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 transition-colors text-left truncate max-w-[220px]"
                title={prompt}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-white border-t border-black p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'खरीद नियम अथवा मानक से संबंधित प्रश्न पूछें...'
                  : 'Ask about GFR rules, IS codes, or corrigenda...'
              }
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-300 text-xs text-slate-900 px-3 py-2 focus:outline-none focus:border-black font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-black text-white hover:bg-slate-800 disabled:opacity-50 p-2 border border-black transition-colors"
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
