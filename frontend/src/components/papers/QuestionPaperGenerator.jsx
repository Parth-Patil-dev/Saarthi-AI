import React, { useState } from 'react';
import { 
  FileText, 
  BrainCircuit,
  Download,
  Printer,
  Plus
} from 'lucide-react';
import { SUBJECTS } from '../../constants';

export const QuestionPaperGenerator = ({ onGenerate }) => {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedPaper, setLastGeneratedPaper] = useState(null);

  const handleGenerate = () => {
    if (!subject || !chapter) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const newPaper = {
        id: Date.now().toString(),
        subject,
        chapter,
        difficulty,
        questions: [
          `1. Explain the fundamental concepts of ${chapter} in detail.`,
          `2. What are the key components and their functions in ${chapter}?`,
          `3. Provide a real-world example of how ${chapter} is applied in daily life.`,
          `4. Compare and contrast different approaches to ${chapter}.`,
          `5. Discuss the future implications of ${chapter} in the current context.`,
        ],
        timestamp: Date.now(),
        status: 'generated'
      };
      setLastGeneratedPaper(newPaper);
      onGenerate(newPaper);
      setIsGenerating(false);
      setSubject('');
      setChapter('');
    }, 2000);
  };

  const handleDownload = () => {
    alert('Generating PDF... Your download will start shortly.');
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold handwritten">Question Paper Generator</h2>
        <p className="text-gray-600">Create custom practice papers to test your knowledge.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card: Generator Form */}
        <div className="card-notebook relative overflow-hidden flex flex-col min-h-[500px]">
          {/* Notebook Background */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-10 border-r-2 border-red-200 h-full"></div>
            <div className="flex-1 h-full" style={{ 
              backgroundImage: 'linear-gradient(#f3f4f6 1px, transparent 1px)', 
              backgroundSize: '100% 2rem',
              marginTop: '2rem'
            }}></div>
          </div>

          <div className="relative z-10 p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 border-2 border-black rounded-lg flex items-center justify-center">
                <Plus className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl handwritten">Create New Paper</h3>
                <p className="text-xs text-gray-500">Configure your practice session</p>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <label className="block font-bold uppercase text-xs tracking-wider">Select Subject</label>
                <select 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-3 border-2 border-black focus:outline-none bg-white font-bold"
                >
                  <option value="">Choose a subject...</option>
                  {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-bold uppercase text-xs tracking-wider">Chapter / Topic</label>
                <input 
                  type="text" 
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  placeholder="e.g., Photosynthesis, Trigonometry"
                  className="w-full p-3 border-2 border-black focus:outline-none bg-white font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold uppercase text-xs tracking-wider">Difficulty Level</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 border-2 border-black font-bold capitalize transition-all ${
                        difficulty === d ? 'bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!subject || !chapter || isGenerating}
              className="mt-8 w-full py-4 bg-yellow-400 text-black border-2 border-black font-bold text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin"><BrainCircuit size={24} /></div>
                  <span className="handwritten">Generating...</span>
                </>
              ) : (
                <>
                  <FileText size={24} />
                  <span className="handwritten">Generate Paper</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Card: Generated Paper Preview */}
        <div className="card-notebook relative overflow-hidden flex flex-col min-h-[500px]">
          {/* Notebook Background */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-10 border-r-2 border-red-200 h-full"></div>
            <div className="flex-1 h-full" style={{ 
              backgroundImage: 'linear-gradient(#f3f4f6 1px, transparent 1px)', 
              backgroundSize: '100% 2rem',
              marginTop: '2rem'
            }}></div>
          </div>

          <div className="relative z-10 p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-green-100 border-2 border-black rounded-lg flex items-center justify-center">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl handwritten">Generated Paper</h3>
                <p className="text-xs text-gray-500">Preview and download your paper</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!lastGeneratedPaper ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 py-12">
                  <FileText size={48} className="opacity-20" />
                  <p className="font-bold handwritten text-xl">No paper currently generated</p>
                  <p className="text-xs text-center px-8">Fill out the form on the left to create your practice questions.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b-2 border-black pb-4">
                    <h4 className="text-2xl font-bold handwritten text-blue-600">{lastGeneratedPaper.subject}</h4>
                    <p className="font-bold">Topic: {lastGeneratedPaper.chapter}</p>
                    <div className="flex gap-4 text-xs mt-2">
                      <span className="bg-black text-white px-2 py-1 uppercase tracking-widest">{lastGeneratedPaper.difficulty}</span>
                      <span className="text-gray-500">{new Date(lastGeneratedPaper.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {lastGeneratedPaper.questions.map((q, idx) => (
                      <div key={idx} className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="handwritten text-lg leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button 
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Download size={18} /> Download PDF
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-black font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Printer size={18} /> Print Paper
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
