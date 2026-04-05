import React, { useState, useRef } from 'react';
import {
  ChevronLeft, X, FileText, BrainCircuit,
  Zap, CheckCircle2, MessageSquare, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BASE_URL = 'http://localhost:3000';

// ── SSE streaming helper ──────────────────────────────────────────────────────
async function streamChatSSE({ message, sessionId, onToken, onDone, onError }) {
  try {
    const res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';
    let   lastEvt = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      const parts = buf.split('\n\n');
      buf = parts.pop();

      for (const block of parts) {
        const lines = block.split('\n');
        let evt = lastEvt, data = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) evt  = line.slice(7).trim();
          if (line.startsWith('data: '))  data = line.slice(6).trim();
        }
        lastEvt = evt;
        if (!data) continue;
        try {
          const json = JSON.parse(data);
          if (evt === 'token') onToken(json.token || '');
          if (evt === 'done')  onDone(json);
          if (evt === 'error') throw new Error(json.message);
        } catch { /* skip parse errors */ }
      }
    }
  } catch (err) {
    onError(err);
  }
}

// ── Build AI prompt based on action ──────────────────────────────────────────
function buildPrompt(action, selectedText, subject, chapter, profile) {
  const aptitude = profile?.aptitude || 'intermediate';
  const levelHint = {
    beginner:     'Use very simple language, short sentences, and relatable everyday examples.',
    intermediate: 'Use clear explanations with some technical detail and practical examples.',
    advanced:     'Be thorough and technical. Include implications and connections to broader concepts.',
  }[aptitude] || '';

  const subjectName  = subject?.name  || 'this subject';
  const chapterTitle = chapter?.title || 'this chapter';

  const base = `The student is studying "${chapterTitle}" in ${subjectName}. ${levelHint}\n\nSelected text: "${selectedText}"\n\n`;

  switch (action) {
    case 'Summary':
      return base + 'Provide a concise summary of the selected text in 3-5 bullet points.';
    case 'Explanation':
      return base + 'Explain this concept clearly. Break it down step by step.';
    case 'Example':
      return base + 'Give 2 real-world examples that illustrate this concept. Make them practical and relatable.';
    default:
      return base + 'Explain this concept.';
  }
}

// ── Action icon + label map ───────────────────────────────────────────────────
const ACTION_META = {
  Summary:     { icon: FileText,    label: 'AI Summary',         color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  Explanation: { icon: BrainCircuit,label: 'AI Explanation',     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  Example:     { icon: Zap,         label: 'Real-world Example', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
};

// ─────────────────────────────────────────────────────────────────────────────
export const TextbookReader = ({ subject, chapter, profile, onBack }) => {
  const [selectedText,  setSelectedText]  = useState('');
  const [showAIAction,  setShowAIAction]  = useState(false);
  const [aiResponse,    setAiResponse]    = useState({ type: '', content: '' });
  const [isStreaming,   setIsStreaming]   = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeAction,  setActiveAction]  = useState('');

  const abortRef = useRef(false); // lets us cancel mid-stream if user clicks X

  // ── Text selection handler ──────────────────────────────────────────────────
  const handleMouseUp = () => {
    const text = window.getSelection()?.toString();
    if (text && text.trim().length > 0) {
      setSelectedText(text.trim());
      setShowAIAction(true);
    } else {
      setShowAIAction(false);
    }
  };

  // ── Trigger streaming AI action ─────────────────────────────────────────────
  const askAI = async (action) => {
    setShowAIAction(false);
    setActiveAction(action);
    setIsStreaming(true);
    setStreamingText('');
    setAiResponse({ type: action, content: '' });
    abortRef.current = false;

    const prompt = buildPrompt(action, selectedText, subject, chapter, profile);

    await streamChatSSE({
      message:   prompt,
      sessionId: `textbook-${subject?.id || 'reader'}`,

      onToken: (token) => {
        if (abortRef.current) return;
        setStreamingText(prev => prev + token);
      },

      onDone: (result) => {
        if (abortRef.current) return;
        setAiResponse({ type: action, content: result.reply });
        setStreamingText('');
        setIsStreaming(false);
      },

      onError: (err) => {
        if (abortRef.current) return;
        setAiResponse({ type: action, content: `Error: ${err.message}` });
        setStreamingText('');
        setIsStreaming(false);
      },
    });
  };

  const clearAIResponse = () => {
    abortRef.current = true;
    setAiResponse({ type: '', content: '' });
    setStreamingText('');
    setIsStreaming(false);
    setActiveAction('');
  };

  // The text to display — streaming in progress or final
  const displayContent = isStreaming ? streamingText : aiResponse.content;
  const showPanel = isStreaming || !!aiResponse.content;
  const meta = ACTION_META[activeAction || aiResponse.type] || ACTION_META.Explanation;
  const Icon = meta.icon;

  // ── Content renderer (unchanged from original) ────────────────────────────
  const renderContent = () => {
    const sections = chapter.content.split('### ');
    return sections.map((section, idx) => {
      if (!section.trim()) return null;

      const lines = section.split('\n');
      const title = lines[0].trim();
      const body  = lines.slice(1).join('\n');

      if (title === "Let's study.") {
        return (
          <div key={idx} className="textbook-box-study group">
            <div className="absolute -top-4 left-6 bg-white px-4 py-1 text-[#e91e63] font-bold text-lg border-2 border-[#e91e63] rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              Let's study.
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 pt-2">
              <ul className="list-disc list-inside space-y-2">
                {body.split('\n').map((p, i) => {
                  const cleanP = p.trim().replace(/^•\s*/, '');
                  return cleanP && <li key={i} className="text-[#e91e63] font-medium"><span className="text-gray-800">{cleanP}</span></li>;
                })}
              </ul>
            </div>
          </div>
        );
      }

      if (title === "Let's recall.") {
        return (
          <div key={idx} className="textbook-box-recall group">
            <div className="absolute -top-4 left-6 bg-white px-4 py-1 text-[#2196f3] font-bold text-lg border-2 border-[#2196f3] rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              Let's recall.
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 pt-2">
              {body.split('\n').map((p, i) => p.trim() && <p key={i} className="mb-2 leading-relaxed">{p}</p>)}
            </div>
          </div>
        );
      }

      return (
        <div key={idx} className="mb-12">
          {idx > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e91e63]/20" />
              <h2 className="text-2xl font-black text-[#e91e63] uppercase tracking-tight">{title}</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e91e63]/20" />
            </div>
          )}
          <div className="prose prose-lg max-w-none text-gray-800">
            {body.split('\n\n').map((p, i) => {
              if (p.startsWith('**Ex.')) {
                return (
                  <div key={i} className="textbook-example-box p-6 bg-[#fff5f8] rounded-xl border-l-8 border-[#e91e63] mb-8 shadow-sm">
                    {p.split('\n').map((line, li) => (
                      <p key={li} className={li === 0 ? 'font-black text-[#e91e63] text-xl mb-3' : 'text-gray-700 leading-relaxed'}>
                        {line.replace(/^\*\*Ex\.\s*/, 'Example: ')}
                      </p>
                    ))}
                  </div>
                );
              }
              if (p.startsWith('**Solution :**')) {
                return (
                  <div key={i} className="mt-4 mb-8 p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                    <div className="text-[#e91e63] font-bold uppercase text-sm tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#e91e63]" /> Solution
                    </div>
                    <div className="space-y-3">
                      {p.replace('**Solution :**', '').split('\n').map((line, li) => (
                        <p key={li} className="text-gray-600 italic leading-relaxed">{line.trim()}</p>
                      ))}
                    </div>
                  </div>
                );
              }
              if (p.startsWith('**Activity')) {
                return (
                  <div key={i} className="my-12 p-8 bg-[#fffde7] border-4 border-[#fbc02d] rounded-3xl shadow-lg relative group">
                    <div className="absolute -top-6 left-10 bg-[#fbc02d] text-white px-6 py-2 rounded-full font-black text-xl shadow-md flex items-center gap-3">
                      <span className="text-2xl">✏️</span> Activity
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-800 pt-4">
                      {p.split('\n').slice(1).map((line, li) => (
                        <div key={li} className="flex gap-4 mb-4 items-start">
                          <div className="w-6 h-6 rounded-md border-2 border-[#fbc02d] flex-shrink-0 mt-1" />
                          <p className="leading-relaxed">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (p.startsWith('**Practice Set')) {
                return (
                  <div key={i} className="my-12 p-8 bg-gray-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#e91e63] rounded-sm" />
                      {p.split('\n')[0].replace(/\*\*/g, '')}
                    </h3>
                    <div className="h-1 w-24 bg-[#e91e63] mb-6" />
                    <div className="space-y-4">
                      {p.split('\n').slice(1).map((line, li) => (
                        <p key={li} className="text-gray-300 font-medium">{line}</p>
                      ))}
                    </div>
                  </div>
                );
              }
              return <p key={i} className="mb-6 whitespace-pre-wrap leading-relaxed text-lg">{p}</p>;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8 notebook-page">
        <div className="notebook-margin" />
        <div className="max-w-4xl mx-auto pl-16">
          <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold uppercase text-xs tracking-widest">
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex justify-between items-center mb-12 border-b-2 border-black pb-4">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Standard Ten</div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Mathematics Part 1</div>
          </div>

          <div className="textbook-banner-v2">
            <div className="textbook-chapter-badge">
              <div className="text-xs uppercase tracking-widest font-bold opacity-70">Chapter</div>
              <div className="text-5xl font-black">{chapter.id}</div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-[#e91e63] uppercase tracking-[0.2em] mb-2">Mathematics Part 1</div>
              <h1 className="text-5xl font-black text-gray-900 leading-tight">{chapter.title}</h1>
              <div className="h-2 w-24 bg-[#e91e63] mt-4" />
            </div>
          </div>

          {/* Selectable content area */}
          <div onMouseUp={handleMouseUp}>
            {renderContent()}
          </div>

          <div className="mt-24 flex justify-between items-center text-gray-400 font-bold text-sm border-t-2 border-gray-100 pt-8 mb-12">
            <div>Mathematics Part 1</div>
            <div className="bg-gray-100 px-4 py-1 rounded-full text-gray-600">Page {parseInt(chapter.id) * 10 + 1}</div>
            <div>Chapter {chapter.id}</div>
          </div>

        </div>
      </div>

      {/* ── Floating action bar (appears on text selection) ──────────────────── */}
      <AnimatePresence>
        {showAIAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black text-white rounded-full shadow-2xl z-50"
          >
            <button onClick={() => askAI('Summary')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
              <FileText size={16} /> Summarize
            </button>
            <button onClick={() => askAI('Explanation')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
              <BrainCircuit size={16} /> Explain
            </button>
            <button onClick={() => askAI('Example')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
              <Zap size={16} /> Real-world Example
            </button>
            <div className="w-[1px] bg-gray-700 mx-1" />
            <button onClick={() => setShowAIAction(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right sidebar ────────────────────────────────────────────────────── */}
      <div className="w-80 border-l-2 border-black bg-[#f8f9fa] overflow-y-auto font-sans relative flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#e91e63]" />

        {/* ── AI Response Panel (replaces sidebar content when active) ───────── */}
        <AnimatePresence mode="wait">
          {showPanel ? (
            <motion.div
              key="ai-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex-1 flex flex-col p-6 ${meta.bg}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between mb-4 ${meta.color}`}>
                <div className="flex items-center gap-2">
                  {isStreaming
                    ? <Loader2 size={20} className="animate-spin" />
                    : <Icon size={20} />
                  }
                  <h3 className="text-lg font-bold">{meta.label}</h3>
                  {isStreaming && (
                    <span className="text-xs font-bold animate-pulse">● generating</span>
                  )}
                </div>
                <button onClick={clearAIResponse} className="p-1 text-gray-400 hover:text-black transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Selected text chip */}
              {selectedText && (
                <div className={`mb-4 px-3 py-2 bg-white border ${meta.border} rounded text-xs text-gray-500 font-mono line-clamp-2`}>
                  "{selectedText.slice(0, 100)}{selectedText.length > 100 ? '…' : ''}"
                </div>
              )}

              {/* Streaming / final content */}
              <div className="flex-1 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {displayContent}
                  {isStreaming && (
                    <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle opacity-70" />
                  )}
                </p>
              </div>

              {/* Ask another */}
              {!isStreaming && aiResponse.content && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  {['Summary', 'Explanation', 'Example'].map(a => {
                    const m = ACTION_META[a];
                    const I = m.icon;
                    return (
                      <button
                        key={a}
                        onClick={() => askAI(a)}
                        className={`flex-1 py-1.5 text-[10px] font-bold border ${m.border} ${m.bg} ${m.color} flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity`}
                      >
                        <I size={12} />
                        {a}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

          ) : (
            <motion.div
              key="objectives"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8"
            >
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900 uppercase tracking-tighter">
                <div className="w-2 h-8 bg-[#e91e63]" />
                Objectives
              </h3>

              <div className="space-y-6">
                {(chapter.goals || [
                  'Understand core concepts',
                  'Identify key components',
                  'Differentiate between types',
                  'Apply learning to problems',
                ]).map((goal, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="mt-1 w-6 h-6 border-2 border-[#e91e63] flex items-center justify-center rounded-sm group-hover:bg-[#e91e63] transition-colors shrink-0">
                      <CheckCircle2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 leading-tight">{goal}</span>
                  </div>
                ))}
              </div>

              {chapter.quiz && (
                <div className="mt-12 p-6 bg-white border-4 border-[#2196f3] rounded-3xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#2196f3]/5 rounded-full -mr-8 -mt-8" />
                  <h4 className="font-black text-lg mb-4 flex items-center gap-2 text-[#2196f3] uppercase tracking-widest">
                    <MessageSquare size={20} /> Quick Check
                  </h4>
                  <p className="text-sm font-bold text-gray-800 mb-6 leading-relaxed">{chapter.quiz.question}</p>
                  <div className="space-y-3">
                    {chapter.quiz.options.map(opt => (
                      <button key={opt} className="w-full text-left p-4 text-xs font-black border-2 border-gray-200 bg-white hover:border-[#2196f3] hover:bg-[#2196f3]/5 transition-all uppercase tracking-widest">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8 border-t-2 border-gray-200">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Maharashtra State Board</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mathematics Part 1 • Standard X</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};