import React, { useState } from 'react';
import { 
  ChevronLeft, 
  X, 
  FileText, 
  BrainCircuit, 
  Zap, 
  CheckCircle2, 
  MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TextbookReader = ({ subject, chapter, profile, onBack }) => {
  const [selectedText, setSelectedText] = useState('');
  const [showAIAction, setShowAIAction] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const handleMouseUp = () => {
    const text = window.getSelection()?.toString();
    if (text && text.trim().length > 0) {
      setSelectedText(text);
      setShowAIAction(true);
    } else {
      setShowAIAction(false);
    }
  };

  const askAI = (action) => {
    let content = '';
    if (profile.aptitude === 'beginner') {
      content = `Since you're just starting, let me explain this simply: Imagine ${selectedText.substring(0, 20)}... is like a small seed. Just as a seed has everything needed to grow into a big tree, this concept is the starting point for everything else in ${subject.name}. In our village, we see this when we plant crops...`;
    } else if (profile.aptitude === 'intermediate') {
      content = `Good progress! This concept of "${selectedText.substring(0, 20)}..." connects to what we learned about ${subject.name} last week. It's like how we manage water in our fields – it's a system where every part has a specific role to play...`;
    } else {
      content = `Excellent! You've mastered the basics. Now, let's look at the advanced implications of "${selectedText.substring(0, 20)}...". This structural complexity is what allows for higher-order biological functions. Think of it like the complex irrigation systems used in modern farming...`;
    }

    setAiResponse({
      type: action,
      content: `I'm analyzing "${selectedText.substring(0, 30)}...". Here is a ${action} for you: \n\n${content}`
    });
    setShowAIAction(false);
  };

  // Simple parser for textbook content
  const renderContent = () => {
    const sections = chapter.content.split('### ');
    return sections.map((section, idx) => {
      if (!section.trim()) return null;
      
      const lines = section.split('\n');
      const title = lines[0].trim();
      const body = lines.slice(1).join('\n');

      if (title === "Let’s study.") {
        return (
          <div key={idx} className="textbook-box-study group">
            <div className="absolute -top-4 left-6 bg-white px-4 py-1 text-[#e91e63] font-bold text-lg border-2 border-[#e91e63] rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              Let’s study.
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

      if (title === "Let’s recall.") {
        return (
          <div key={idx} className="textbook-box-recall group">
            <div className="absolute -top-4 left-6 bg-white px-4 py-1 text-[#2196f3] font-bold text-lg border-2 border-[#2196f3] rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              Let’s recall.
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
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#e91e63]/20"></div>
              <h2 className="text-2xl font-black text-[#e91e63] uppercase tracking-tight">{title}</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#e91e63]/20"></div>
            </div>
          )}
          <div className="prose prose-lg max-w-none text-gray-800">
            {body.split('\n\n').map((p, i) => {
              if (p.startsWith('**Ex.')) {
                return (
                  <div key={i} className="textbook-example-box p-6 bg-[#fff5f8] rounded-xl border-l-8 border-[#e91e63] mb-8 shadow-sm">
                    {p.split('\n').map((line, li) => (
                      <p key={li} className={li === 0 ? "font-black text-[#e91e63] text-xl mb-3" : "text-gray-700 leading-relaxed"}>
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
                      <div className="w-2 h-2 rounded-full bg-[#e91e63]"></div>
                      Solution
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
                      <span className="text-2xl">✏️</span>
                      Activity
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-800 pt-4">
                      {p.split('\n').slice(1).map((line, li) => (
                        <div key={li} className="flex gap-4 mb-4 items-start">
                          <div className="w-6 h-6 rounded-md border-2 border-[#fbc02d] flex-shrink-0 mt-1"></div>
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#e91e63] rounded-sm"></div>
                      {p.split('\n')[0].replace('**', '').replace('**', '')}
                    </h3>
                    <div className="h-1 w-24 bg-[#e91e63] mb-6"></div>
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
      <div className="flex-1 overflow-y-auto p-8 notebook-page">
        <div className="notebook-margin"></div>
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
              <div className="h-2 w-24 bg-[#e91e63] mt-4"></div>
            </div>
          </div>

          <div onMouseUp={handleMouseUp}>
            {renderContent()}
          </div>

          <div className="mt-24 flex justify-between items-center text-gray-400 font-bold text-sm border-t-2 border-gray-100 pt-8 mb-12">
            <div>Mathematics Part 1</div>
            <div className="bg-gray-100 px-4 py-1 rounded-full text-gray-600">Page {parseInt(chapter.id) * 10 + 1}</div>
            <div>Chapter {chapter.id}</div>
          </div>

          <AnimatePresence>
            {showAIAction && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black text-white rounded-full shadow-2xl z-50"
              >
                <button onClick={() => askAI('Summary')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <FileText size={16} /> Summarize
                </button>
                <button onClick={() => askAI('Explanation')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <BrainCircuit size={16} /> Explain
                </button>
                <button onClick={() => askAI('Example')} className="px-4 py-2 hover:bg-gray-800 rounded-full text-sm font-bold flex items-center gap-2">
                  <Zap size={16} /> Real-world Example
                </button>
                <div className="w-[1px] bg-gray-700 mx-1"></div>
                <button onClick={() => setShowAIAction(false)} className="p-2 hover:bg-gray-800 rounded-full">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {aiResponse && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 card-notebook bg-blue-50 relative"
            >
              <button onClick={() => setAiResponse(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <BrainCircuit size={24} />
                <h3 className="text-xl font-bold">AI {aiResponse.type}</h3>
              </div>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{aiResponse.content}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="w-80 border-l-2 border-black bg-[#f8f9fa] p-8 overflow-y-auto font-sans relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#e91e63]"></div>
        
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900 uppercase tracking-tighter">
          <div className="w-2 h-8 bg-[#e91e63]"></div>
          Objectives
        </h3>
        
        <div className="space-y-6">
          {(chapter.goals || [
            'Understand core concepts',
            'Identify key components',
            'Differentiate between types',
            'Apply learning to problems'
          ]).map((goal, i) => (
            <div key={i} className="flex gap-4 items-start group">
              <div className="mt-1 w-6 h-6 border-2 border-[#e91e63] flex items-center justify-center rounded-sm group-hover:bg-[#e91e63] transition-colors">
                <CheckCircle2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-gray-700 leading-tight">{goal}</span>
            </div>
          ))}
        </div>

        {chapter.quiz && (
          <div className="mt-16 p-6 bg-white border-4 border-[#2196f3] rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#2196f3]/5 rounded-full -mr-8 -mt-8"></div>
            <h4 className="font-black text-lg mb-4 flex items-center gap-2 text-[#2196f3] uppercase tracking-widest">
              <MessageSquare size={20} />
              Quick Check
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

        <div className="mt-16 pt-8 border-t-2 border-gray-200">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Maharashtra State Board</div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mathematics Part 1 • Standard X</div>
        </div>
      </div>
    </div>
  );
};
