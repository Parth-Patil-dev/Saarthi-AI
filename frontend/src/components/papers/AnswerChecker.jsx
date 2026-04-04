// import React, { useState, useMemo } from 'react';
// import { 
//   Upload, 
//   CheckCircle2, 
//   BrainCircuit,
//   History,
//   FileText,
//   Download,
//   Search,
//   Filter
// } from 'lucide-react';
// import { SUBJECTS } from '../../constants';

// export const AnswerChecker = ({ papers, onCheck }) => {
//   const [activeView, setActiveView] = useState('check');
//   const [selectedPaperId, setSelectedPaperId] = useState('');
//   const [isChecking, setIsChecking] = useState(false);
//   const [files, setFiles] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [subjectFilter, setSubjectFilter] = useState('All');

//   const handleCheck = () => {
//     if (!selectedPaperId || !files) return;
//     setIsChecking(true);

//     setTimeout(() => {
//       const score = Math.floor(Math.random() * 41) + 60; // Random score 60-100
//       onCheck(selectedPaperId, score, "Great work! Your understanding of the core concepts is strong. Pay more attention to the diagrams in question 2.");
//       setIsChecking(false);
//       setSelectedPaperId('');
//       setFiles(null);
//       setActiveView('history');
//     }, 3000);
//   };

//   const pendingPapers = papers.filter(p => p.status === 'generated');
//   const checkedPapers = useMemo(() => {
//     return papers
//       .filter(p => p.status === 'checked')
//       .filter(p => subjectFilter === 'All' || p.subject === subjectFilter)
//       .filter(p => 
//         p.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
//         p.chapter.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//       .sort((a, b) => b.timestamp - a.timestamp);
//   }, [papers, subjectFilter, searchQuery]);

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 p-8">
//       <div className="text-center">
//         <h2 className="text-4xl font-bold handwritten mb-2">AI Answer Checker</h2>
//         <p className="text-gray-600">Upload your handwritten answer sheets for AI evaluation and marking.</p>
//       </div>

//       {/* View Toggle */}
//       <div className="flex justify-center gap-4">
//         <button 
//           onClick={() => setActiveView('check')}
//           className={`px-6 py-2 font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
//             activeView === 'check' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
//           }`}
//         >
//           <Upload size={20} />
//           Check New
//         </button>
//         <button 
//           onClick={() => setActiveView('history')}
//           className={`px-6 py-2 font-bold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
//             activeView === 'history' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
//           }`}
//         >
//           <History size={20} />
//           Previous Sheets
//         </button>
//       </div>

//       {activeView === 'check' ? (
//         <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto">
//           <div className="space-y-2">
//             <label className="block font-bold uppercase text-xs tracking-wider">Select Question Paper</label>
//             <select 
//               value={selectedPaperId} 
//               onChange={e => setSelectedPaperId(e.target.value)}
//               className="w-full p-3 border-2 border-black focus:outline-none font-bold"
//             >
//               <option value="">Choose a paper to check...</option>
//               {pendingPapers.map(p => (
//                 <option key={p.id} value={p.id}>{p.subject} - {p.chapter} ({new Date(p.timestamp).toLocaleDateString()})</option>
//               ))}
//             </select>
//           </div>

//           <div className="space-y-2">
//             <label className="block font-bold uppercase text-xs tracking-wider">Upload Answer Sheets (Images/PDF)</label>
//             <div className="border-2 border-dashed border-black p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
//               <input 
//                 type="file" 
//                 multiple 
//                 onChange={e => setFiles(e.target.files)}
//                 className="absolute inset-0 opacity-0 cursor-pointer"
//               />
//               <Upload className="mx-auto mb-2 text-gray-400" size={32} />
//               <p className="text-sm font-bold">
//                 {files ? `${files.length} files selected` : "Click or drag files here to upload"}
//               </p>
//               <p className="text-xs text-gray-400 mt-2">Handwritten or typed text supported</p>
//             </div>
//           </div>

//           <button 
//             onClick={handleCheck}
//             disabled={!selectedPaperId || !files || isChecking}
//             className="w-full py-4 bg-black text-white font-bold text-xl hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//           >
//             {isChecking ? (
//               <>
//                 <div className="animate-spin"><BrainCircuit size={24} /></div>
//                 <span>AI is Marking...</span>
//               </>
//             ) : (
//               <>
//                 <CheckCircle2 size={24} />
//                 <span>Start AI Evaluation</span>
//               </>
//             )}
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {/* Filters */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input 
//                 type="text"
//                 placeholder="Search by subject or chapter..."
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <Filter size={20} className="text-gray-500" />
//               <select 
//                 value={subjectFilter}
//                 onChange={e => setSubjectFilter(e.target.value)}
//                 className="p-3 border-2 border-black focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold bg-white"
//               >
//                 <option value="All">All Subjects</option>
//                 {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* History List */}
//           <div className="grid grid-cols-1 gap-4">
//             {checkedPapers.length === 0 ? (
//               <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
//                 <FileText className="mx-auto mb-4 text-gray-200" size={64} />
//                 <p className="text-gray-400 font-bold handwritten text-xl">No previous answer sheets found</p>
//               </div>
//             ) : (
//               checkedPapers.map(paper => (
//                 <div key={paper.id} className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
//                   <div className="flex items-center gap-4">
//                     <div className={`w-12 h-12 flex items-center justify-center border-2 border-black ${
//                       (paper.score || 0) >= 80 ? 'bg-green-100' : (paper.score || 0) >= 50 ? 'bg-yellow-100' : 'bg-red-100'
//                     }`}>
//                       <span className="font-bold text-lg">{paper.score}%</span>
//                     </div>
//                     <div>
//                       <h4 className="font-bold text-lg">{paper.subject}</h4>
//                       <p className="text-sm text-gray-500">{paper.chapter} • {new Date(paper.timestamp).toLocaleDateString()}</p>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center gap-3 w-full md:w-auto">
//                     <a 
//                       href={paper.pdfUrl} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="flex-1 md:flex-none px-4 py-2 border-2 border-black bg-blue-50 hover:bg-blue-100 font-bold flex items-center justify-center gap-2 transition-colors"
//                     >
//                       <Download size={18} />
//                       Download PDF
//                     </a>
//                     <button className="flex-1 md:flex-none px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold flex items-center justify-center gap-2 transition-colors">
//                       <FileText size={18} />
//                       View Advice
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Upload,
  CheckCircle2,
  BrainCircuit,
  History,
  FileText,
  Search,
  Filter,
  AlertCircle,
  Lightbulb,
  X,
  ChevronDown,
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL   = 'http://localhost:3000';
const STUDENT_ID = 'student-default'; // hardcoded single user

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  // GET /api/question-paper — list all saved papers
  async getPapers() {
    const res = await fetch(`${BASE_URL}/api/question-paper`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load papers');
    return data.papers;
  },

  // POST /api/grading/submit — submit answers for grading
  async submitAnswers(paperId, files) {
    const form = new FormData();
    form.append('paperId',     paperId);
    form.append('studentId',   STUDENT_ID);
    form.append('studentName', 'Student');
    // Attach first file — backend handles image OCR or PDF extraction
    if (files?.[0]) form.append('file', files[0]);

    const res = await fetch(`${BASE_URL}/api/grading/submit`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Grading failed');
    return data.result;
  },

  // GET /api/grading/results — list results with optional filters
  async getResults({ search = '', subject = '' } = {}) {
    const params = new URLSearchParams();
    if (search)  params.set('search',  search);
    if (subject && subject !== 'All') params.set('subject', subject);
    params.set('studentId', STUDENT_ID);

    const res  = await fetch(`${BASE_URL}/api/grading/results?${params}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load results');
    return data.results;
  },

  // GET /api/grading/results/:id/advice — get AI advice for a result
  async getAdvice(resultId) {
    const res  = await fetch(`${BASE_URL}/api/grading/results/${resultId}/advice`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load advice');
    return data.advice;
  },

  // GET /api/question-paper/subjects — subject list for filter dropdown
  async getSubjects() {
    const res  = await fetch(`${BASE_URL}/api/question-paper/subjects`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load subjects');
    return data.subjects;
  },
};

// ── Main Component ────────────────────────────────────────────────────────────
export const AnswerChecker = () => {
  const [activeView,      setActiveView]      = useState('check');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [isChecking,      setIsChecking]      = useState(false);
  const [files,           setFiles]           = useState(null);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [subjectFilter,   setSubjectFilter]   = useState('All');

  // Data from backend
  const [papers,   setPapers]   = useState([]);
  const [results,  setResults]  = useState([]);
  const [subjects, setSubjects] = useState([]);

  // UI state
  const [error,         setError]         = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Advice modal
  const [adviceModal,   setAdviceModal]   = useState(null); // { resultId, data, loading }

  // ── Load papers + subjects on mount ────────────────────────────────────────
  useEffect(() => {
    api.getPapers()
      .then(setPapers)
      .catch(err => setError(`Could not load papers: ${err.message}`));

    api.getSubjects()
      .then(setSubjects)
      .catch(() => {}); // non-critical
  }, []);

  // ── Load results when switching to history or filters change ───────────────
  const fetchResults = useCallback(async () => {
    setLoadingResults(true);
    setError(null);
    try {
      const data = await api.getResults({ search: searchQuery, subject: subjectFilter });
      setResults(data);
    } catch (err) {
      setError(`Could not load results: ${err.message}`);
    } finally {
      setLoadingResults(false);
    }
  }, [searchQuery, subjectFilter]);

  useEffect(() => {
    if (activeView === 'history') fetchResults();
  }, [activeView, fetchResults]);

  // ── Submit answers ─────────────────────────────────────────────────────────
  const handleCheck = async () => {
    if (!selectedPaperId || !files) return;
    setIsChecking(true);
    setError(null);
    try {
      await api.submitAnswers(selectedPaperId, files);
      setSelectedPaperId('');
      setFiles(null);
      setActiveView('history');
    } catch (err) {
      setError(`Grading failed: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // ── View Advice ────────────────────────────────────────────────────────────
  const handleViewAdvice = async (resultId) => {
    setAdviceModal({ resultId, data: null, loading: true });
    try {
      const advice = await api.getAdvice(resultId);
      setAdviceModal({ resultId, data: advice, loading: false });
    } catch (err) {
      setAdviceModal({ resultId, data: null, loading: false, error: err.message });
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  // Only show papers that can still be checked (generated, not yet checked)
  const pendingPapers = papers; // backend returns all; filter if you track status

  const scoreColor = (pct) => {
    if (pct >= 80) return 'bg-green-100 text-green-800';
    if (pct >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold handwritten mb-2">AI Answer Checker</h2>
        <p className="text-gray-600">Upload your handwritten answer sheets for AI evaluation and marking.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 border-2 border-red-500 bg-red-50 text-red-700 font-bold">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

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

      {/* ── Check View ─────────────────────────────────────────────────────── */}
      {activeView === 'check' ? (
        <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto">

          {/* Paper selector */}
          <div className="space-y-2">
            <label className="block font-bold uppercase text-xs tracking-wider">
              Select Question Paper
            </label>
            <div className="relative">
              <select
                value={selectedPaperId}
                onChange={e => setSelectedPaperId(e.target.value)}
                className="w-full p-3 border-2 border-black focus:outline-none font-bold appearance-none pr-10"
              >
                <option value="">Choose a paper to check...</option>
                {pendingPapers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.subject} — {p.chapter} ({new Date(p.generatedAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={18} />
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="block font-bold uppercase text-xs tracking-wider">
              Upload Answer Sheets (Images / PDF)
            </label>
            <div className="border-2 border-dashed border-black p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e => setFiles(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm font-bold">
                {files ? `${files.length} file(s) selected: ${files[0]?.name}` : 'Click or drag files here to upload'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Handwritten or typed text supported · JPG, PNG, PDF
              </p>
            </div>
          </div>

          {/* Submit button */}
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
        /* ── History View ──────────────────────────────────────────────────── */
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
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results list */}
          <div className="grid grid-cols-1 gap-4">
            {loadingResults ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
                <p className="text-gray-400 font-bold">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 bg-white">
                <FileText className="mx-auto mb-4 text-gray-200" size={64} />
                <p className="text-gray-400 font-bold handwritten text-xl">No previous answer sheets found</p>
              </div>
            ) : (
              results.map(result => (
                <div
                  key={result.id}
                  className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 flex items-center justify-center border-2 border-black font-bold text-lg ${scoreColor(result.percentage)}`}>
                      {result.percentage}%
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{result.subject}</h4>
                      <p className="text-sm text-gray-500">
                        {result.chapter} · {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {result.marksAwarded}/{result.totalMarks} marks · Grade {result.grade}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleViewAdvice(result.id)}
                      className="flex-1 md:flex-none px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Lightbulb size={18} />
                      View Advice
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Advice Modal ──────────────────────────────────────────────────── */}
      {adviceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lightbulb size={20} /> AI Advice
              </h3>
              <button
                onClick={() => setAdviceModal(null)}
                className="p-1 hover:bg-gray-100 border border-black"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {adviceModal.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin mx-auto mb-3 w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
                  <p className="font-bold text-gray-500">Generating advice...</p>
                </div>
              ) : adviceModal.error ? (
                <div className="text-red-600 font-bold flex items-center gap-2">
                  <AlertCircle size={18} /> {adviceModal.error}
                </div>
              ) : adviceModal.data ? (
                <>
                  {/* Overall feedback */}
                  <div className="p-4 bg-blue-50 border-2 border-blue-200">
                    <p className="font-bold text-sm uppercase tracking-wider text-blue-700 mb-1">Overall</p>
                    <p className="text-gray-800">{adviceModal.data.overall}</p>
                  </div>

                  {/* Per question advice */}
                  {adviceModal.data.perQuestion?.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-bold text-sm uppercase tracking-wider text-gray-500">Per Question</p>
                      {adviceModal.data.perQuestion.map(q => (
                        <div key={q.number} className="p-3 border-2 border-black bg-yellow-50">
                          <p className="font-bold text-sm mb-1">Question {q.number}</p>
                          <p className="text-sm text-gray-700">{q.advice}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};