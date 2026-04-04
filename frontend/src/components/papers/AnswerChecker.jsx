import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  BrainCircuit,
  History,
  FileText,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { SUBJECTS } from '../../constants';

export const AnswerChecker = ({ papers, onCheck }) => {
  const [activeView, setActiveView] = useState('check');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [files, setFiles] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const handleCheck = () => {
    if (!selectedPaperId || !files) return;
    setIsChecking(true);

    setTimeout(() => {
      const score = Math.floor(Math.random() * 41) + 60; // Random score 60-100
      onCheck(selectedPaperId, score, "Great work! Your understanding of the core concepts is strong. Pay more attention to the diagrams in question 2.");
      setIsChecking(false);
      setSelectedPaperId('');
      setFiles(null);
      setActiveView('history');
    }, 3000);
  };

  const pendingPapers = papers.filter(p => p.status === 'generated');
  const checkedPapers = useMemo(() => {
    return papers
      .filter(p => p.status === 'checked')
      .filter(p => subjectFilter === 'All' || p.subject === subjectFilter)
      .filter(p => 
        p.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.chapter.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [papers, subjectFilter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold handwritten mb-2">AI Answer Checker</h2>
        <p className="text-gray-600">Upload your handwritten answer sheets for AI evaluation and marking.</p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setActiveView('check')}
          className={`px-6 py-2 font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
            activeView === 'check' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          <Upload size={20} />
          Check New
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={`px-6 py-2 font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
            activeView === 'history' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
          }`}
        >
          <History size={20} />
          Previous Sheets
        </button>
      </div>

      {activeView === 'check' ? (
        <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <label className="block font-bold uppercase text-xs tracking-wider">Select Question Paper</label>
            <select 
              value={selectedPaperId} 
              onChange={e => setSelectedPaperId(e.target.value)}
              className="w-full p-3 border-2 border-black focus:outline-none font-bold"
            >
              <option value="">Choose a paper to check...</option>
              {pendingPapers.map(p => (
                <option key={p.id} value={p.id}>{p.subject} - {p.chapter} ({new Date(p.timestamp).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-bold uppercase text-xs tracking-wider">Upload Answer Sheets (Images/PDF)</label>
            <div className="border-2 border-dashed border-black p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                onChange={e => setFiles(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-bold">
                {files ? `${files.length} files selected` : "Click or drag files here to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-2">Handwritten or typed text supported</p>
            </div>
          </div>

          <button 
            onClick={handleCheck}
            disabled={!selectedPaperId || !files || isChecking}
            className="w-full py-4 bg-black text-white font-bold text-xl hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isChecking ? (
              <>
                <div className="animate-spin"><BrainCircuit size={24} /></div>
                <span>AI is Marking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={24} />
                <span>Start AI Evaluation</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search by subject or chapter..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select 
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="p-3 border-2 border-black focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold bg-white"
              >
                <option value="All">All Subjects</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* History List */}
          <div className="grid grid-cols-1 gap-4">
            {checkedPapers.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                <FileText className="mx-auto mb-4 text-gray-200" size={64} />
                <p className="text-gray-400 font-bold handwritten text-xl">No previous answer sheets found</p>
              </div>
            ) : (
              checkedPapers.map(paper => (
                <div key={paper.id} className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center border-2 border-black ${
                      (paper.score || 0) >= 80 ? 'bg-green-100' : (paper.score || 0) >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <span className="font-bold text-lg">{paper.score}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{paper.subject}</h4>
                      <p className="text-sm text-gray-500">{paper.chapter} • {new Date(paper.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <a 
                      href={paper.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none px-4 py-2 border-2 border-black bg-blue-50 hover:bg-blue-100 font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={18} />
                      Download PDF
                    </a>
                    <button className="flex-1 md:flex-none px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold flex items-center justify-center gap-2 transition-colors">
                      <FileText size={18} />
                      View Advice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
