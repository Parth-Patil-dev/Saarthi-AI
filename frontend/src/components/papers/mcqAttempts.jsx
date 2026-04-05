import React, { useState, useEffect, useMemo } from 'react';
import {
  BrainCircuit, ChevronRight, ChevronLeft, CheckCircle2,
  AlertCircle, Trophy, RefreshCcw, Sparkles, Clock,
  Target, Zap, RotateCcw, ListChecks, Loader2
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';

const DIFFICULTY_CONFIG = {
  easy:   { color: 'bg-green-400',  label: 'Easy',   questions: 5,  time: 3 },
  medium: { color: 'bg-yellow-400', label: 'Medium', questions: 8,  time: 2 },
  hard:   { color: 'bg-red-400',    label: 'Hard',   questions: 10, time: 1 },
};

// ── API ───────────────────────────────────────────────────────────────────────
const STUDENT_ID = 'student-default';

const api = {
  async getSubjects() {
    const res  = await fetch(`${BASE_URL}/api/question-paper/subjects`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load subjects');
    return data.subjects;
  },

  async getSavedMCQPapers() {
    const res  = await fetch(`${BASE_URL}/api/mcq/papers`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load saved MCQ papers');
    return data.papers || [];
  },

  async getResults() {
    const res  = await fetch(`${BASE_URL}/api/grading/results?studentId=${STUDENT_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load results');
    return data.results || [];
  },

  // POST /api/mcq/generate
  async generateMCQ(subject, chapter, difficulty) {
    const res  = await fetch(`${BASE_URL}/api/mcq/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject, chapter, difficulty }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Generation failed');
    return data.paper;
  },

  // POST /api/mcq/submit — saves result into grading stats
  // In MCQSection.jsx — api.submitMCQ (replace the existing method)
async submitMCQ(paperId, paper, answers, timeSpent) {
  const answersArray = paper.questions.map((q, idx) => ({
    questionNumber:     q.number,
    selectedOption:     answers[idx] ?? -1,          // raw index
    selectedOptionText: answers[idx] !== undefined
      ? q.options[answers[idx]]
      : '(No answer)',
  }));

  const res  = await fetch(`${BASE_URL}/api/mcq/submit`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      paperId,
      studentId:   STUDENT_ID,
      studentName: 'Student',
      answers:     answersArray,
      timeSpent,                                      // pass seconds used
    }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Submit failed');
  return data.result;
},
};

function MiniScoreGraph({ attempts }) {
  if (!attempts.length) return null;

  const width = 280;
  const height = 120;
  const padding = 14;
  const values = attempts.map(a => a.percentage);
  const maxValue = 100;
  const minValue = 0;
  const span = Math.max(1, values.length - 1);

  const points = values.map((value, idx) => {
    const x = padding + ((width - padding * 2) * idx) / span;
    const y = padding + ((height - padding * 2) * (maxValue - value)) / (maxValue - minValue);
    return { x, y, value };
  });

  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
      <defs>
        <linearGradient id="mcqTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="2" />
      <polyline
        fill="none"
        stroke="#111827"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={linePoints}
      />
      <polyline
        fill="url(#mcqTrendFill)"
        stroke="none"
        points={`${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`}
      />
      {points.map((point, idx) => (
        <g key={idx}>
          <circle cx={point.x} cy={point.y} r="4.5" fill={idx === points.length - 1 ? '#f59e0b' : '#fff'} stroke="#111827" strokeWidth="2" />
          <text x={point.x} y={point.y - 10} textAnchor="middle" className="fill-gray-600" fontSize="10" fontWeight="700">
            {point.value}%
          </text>
        </g>
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM
// ═══════════════════════════════════════════════════════════════════════════════
function MCQGeneratorForm({ onStart }) {
  const [subject,      setSubject]      = useState('');
  const [chapter,      setChapter]      = useState('');
  const [difficulty,   setDifficulty]   = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjects,     setSubjects]     = useState([]);
  const [savedPapers,  setSavedPapers]  = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [openSubjects, setOpenSubjects] = useState({});
  const [previewPaper, setPreviewPaper] = useState(null);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    Promise.all([api.getSubjects(), api.getSavedMCQPapers(), api.getResults()])
      .then(([subjectList, papers, results]) => {
        setSubjects(subjectList);
        setSavedPapers(papers);
        setSavedResults(results);

        const folders = papers.reduce((acc, p) => {
          if (p?.subject) acc[p.subject] = true;
          return acc;
        }, {});
        setOpenSubjects(folders);
      })
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  const papersBySubject = useMemo(() => {
    return savedPapers.reduce((acc, paper) => {
      const folder = paper.subject || 'Other';
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(paper);
      return acc;
    }, {});
  }, [savedPapers]);

  const orderedSubjects = useMemo(() => {
    return Object.keys(papersBySubject)
      .sort((a, b) => a.localeCompare(b));
  }, [papersBySubject]);

  const previewAttempts = useMemo(() => {
    if (!previewPaper) return [];
    return savedResults
      .filter(result => result.paperId === previewPaper.id)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  }, [savedResults, previewPaper]);

  const previewImprovement = useMemo(() => {
    if (previewAttempts.length < 2) return null;
    const first = previewAttempts[0]?.percentage ?? 0;
    const last  = previewAttempts[previewAttempts.length - 1]?.percentage ?? 0;
    return Math.round((last - first) * 10) / 10;
  }, [previewAttempts]);

  const cfg = DIFFICULTY_CONFIG[difficulty];

  const handleStart = async () => {
    if (!subject || !chapter.trim()) {
      setError('Please select a subject and enter a chapter.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const paper = await api.generateMCQ(subject, chapter, difficulty);
      onStart(paper);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-8">

        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <BrainCircuit size={14} /> Interactive MCQ Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-bold handwritten leading-tight">
            Test Your Knowledge
          </h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Build a timed multiple-choice quiz on any topic. Get instant AI explanations after every attempt.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 border-2 border-red-500 bg-red-50 text-red-700 font-bold text-sm">
            <AlertCircle size={16} />{error}
          </div>
        )}

        <div className="relative bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(transparent calc(2.5rem - 1px), #e5e7eb calc(2.5rem - 1px), #e5e7eb 2.5rem, transparent 2.5rem)',
            backgroundSize: '100% 2.5rem',
          }} />
          <div className="absolute inset-y-0 left-12 w-0.5 bg-red-300 pointer-events-none" />

          <div className="relative z-10 p-8 pl-16 space-y-7">

            <div className="space-y-1.5">
              <label className="block font-bold uppercase text-xs tracking-widest text-gray-500">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-3 border-2 border-black bg-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Choose a subject…</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold uppercase text-xs tracking-widest text-gray-500">Chapter / Topic</label>
              <input
                type="text"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="e.g. Photosynthesis, Trigonometry, World War II…"
                className="w-full p-3 border-2 border-black bg-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-bold uppercase text-xs tracking-widest text-gray-500">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(DIFFICULTY_CONFIG).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`py-3 border-2 border-black font-bold capitalize transition-all flex flex-col items-center gap-1 ${
                      difficulty === key
                        ? `${val.color} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{val.label}</span>
                    <span className="text-[10px] font-normal text-gray-600">{val.questions} Qs · {val.time} min/Q</span>
                  </button>
                ))}
              </div>
            </div>

            {subject && chapter && (
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { icon: ListChecks, label: 'Questions', value: cfg.questions },
                  { icon: Clock,      label: 'Time',      value: `${cfg.questions * cfg.time} min` },
                  { icon: Target,     label: 'Level',     value: cfg.label },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className={`p-3 border-2 border-black text-center ${cfg.color}`}>
                    <Icon size={18} className="mx-auto mb-1" />
                    <div className="font-bold text-base leading-none">{value}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5 text-gray-700">{label}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!subject || !chapter || isGenerating}
              className="w-full py-4 bg-black text-white font-bold text-xl transition-all
                         shadow-[6px_6px_0px_0px_rgba(234,179,8,1)]
                         hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]
                         disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3 handwritten"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin" size={24} /> Building your quiz…</>
              ) : (
                <><Zap size={22} /> Start Quiz</>
              )}
            </button>

          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold handwritten">Previous MCQ Papers</h2>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {savedPapers.length} saved
            </span>
          </div>

          {loadingSaved ? (
            <div className="p-5 border-2 border-dashed border-gray-300 text-gray-500 font-bold text-sm">
              Loading saved papers...
            </div>
          ) : savedPapers.length === 0 ? (
            <div className="p-5 border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm">
              No saved MCQ papers yet. Generate one to start building your subject folders.
            </div>
          ) : (
            <div className="space-y-3">
              {orderedSubjects.map(folder => {
                const items = papersBySubject[folder] || [];
                const isOpen = openSubjects[folder] !== false;

                return (
                  <div key={folder} className="border-2 border-black bg-gray-50">
                    <button
                      onClick={() => setOpenSubjects(prev => ({ ...prev, [folder]: !isOpen }))}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border-b-2 border-black font-bold text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black" />
                        {folder}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-gray-500">
                        {items.length} paper{items.length !== 1 ? 's' : ''} {isOpen ? '▾' : '▸'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-gray-200 bg-white">
                        {items.map(paper => (
                          <div key={paper.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="font-bold text-base leading-tight">{paper.chapter}</div>
                              <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">
                                {paper.difficulty} · {paper.numQuestions} Qs · {Math.round((paper.totalTime || 0) / 60)} min · {new Date(paper.generatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewPaper(paper)}
                                className="px-3 py-2 border-2 border-black bg-white font-bold text-sm hover:bg-gray-100 transition-all"
                              >
                                View Paper
                              </button>
                              <button
                                onClick={() => onStart(paper)}
                                className="px-4 py-2 border-2 border-black bg-yellow-400 font-bold text-sm hover:bg-yellow-500 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                              >
                                Re-attempt
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {previewPaper && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[88vh] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-black bg-yellow-100">
                <div>
                  <h3 className="text-xl font-bold handwritten">{previewPaper.subject} - {previewPaper.chapter}</h3>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-0.5">
                    {previewPaper.difficulty} · {previewPaper.numQuestions} questions
                  </p>
                </div>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="px-2 py-1 border-2 border-black bg-white font-bold hover:bg-gray-100"
                >
                  Close
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[70vh] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-black bg-blue-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Previous Attempts</div>
                    <div className="text-3xl font-bold handwritten text-blue-700">{previewAttempts.length}</div>
                  </div>
                  <div className="p-4 border-2 border-black bg-green-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Latest Score</div>
                    <div className="text-3xl font-bold handwritten text-green-700">
                      {previewAttempts.length ? `${previewAttempts[previewAttempts.length - 1].percentage}%` : '—'}
                    </div>
                  </div>
                  <div className="p-4 border-2 border-black bg-amber-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Improvement</div>
                    <div className="text-3xl font-bold handwritten text-amber-700">
                      {previewImprovement === null ? '—' : `${previewImprovement > 0 ? '+' : ''}${previewImprovement}%`}
                    </div>
                  </div>
                </div>

                {previewAttempts.length > 0 && (
                  <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold handwritten">Score Progress</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {previewAttempts[0].submittedAt ? new Date(previewAttempts[0].submittedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <MiniScoreGraph attempts={previewAttempts} />
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-lg font-bold handwritten">Previous Scores</h4>
                  {previewAttempts.length === 0 ? (
                    <div className="p-4 border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm bg-gray-50">
                      No attempts yet for this paper.
                    </div>
                  ) : (
                    previewAttempts.map((attempt, idx) => (
                      <div key={attempt.id} className="p-4 border-2 border-black bg-gray-50 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-base leading-tight">Attempt {idx + 1}</div>
                          <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">
                            {new Date(attempt.submittedAt).toLocaleDateString()} · {attempt.totalMarksAwarded}/{attempt.totalMarks} marks · Grade {attempt.grade}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold handwritten">{attempt.percentage}%</div>
                          <div className={`text-[10px] font-bold uppercase tracking-widest ${attempt.percentage >= 70 ? 'text-green-600' : attempt.percentage >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {idx === 0 ? 'First attempt' : idx === previewAttempts.length - 1 ? 'Latest attempt' : 'Progress'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-lg font-bold handwritten">Paper Content</h4>
                  {previewPaper.questions?.map((q, idx) => (
                    <div key={idx} className="border-2 border-black p-3 bg-gray-50">
                      <div className="font-bold text-sm mb-1">Q{idx + 1}. {q.question}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="border border-gray-300 bg-white px-2 py-1">
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 border-t-2 border-black bg-white flex justify-end gap-2">
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="px-4 py-2 border-2 border-black bg-white font-bold hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  onClick={() => onStart(previewPaper)}
                  className="px-4 py-2 border-2 border-black bg-yellow-400 font-bold hover:bg-yellow-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Re-attempt this paper
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTEMPT SCREEN  (unchanged logic, just uses real paper shape)
// ═══════════════════════════════════════════════════════════════════════════════
function MCQAttempt({ paper, onBack }) {
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [showResults,  setShowResults]  = useState(false);
  const [timeLeft,     setTimeLeft]     = useState(paper.totalTime);
  const [submitted,    setSubmitted]    = useState(false);

  // Submit to grading once when results are shown
  useEffect(() => {
    if (showResults && !submitted) {
      setSubmitted(true);
      // In the useEffect that fires on showResults
api.submitMCQ(paper.id, paper, answers, paper.totalTime - timeLeft)
  .catch(err => console.warn('MCQ submit failed:', err.message));
    }
  }, [showResults]);

  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); setShowResults(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Enter' || showResults) return;
      event.preventDefault();

      setCurrentIdx(prev => {
        if (prev === paper.questions.length - 1) {
          setShowResults(true);
          return prev;
        }
        return Math.min(paper.questions.length - 1, prev + 1);
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paper.questions.length, showResults]);

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const score = paper.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const pct   = Math.round((score / paper.questions.length) * 100);

  // ── Results ─────────────────────────────────────────────────────────────────
  if (showResults) {
    const grade =
      pct >= 90 ? { label: 'Outstanding!', color: 'text-green-600',  bg: 'bg-green-50'  } :
      pct >= 70 ? { label: 'Well Done!',   color: 'text-blue-600',   bg: 'bg-blue-50'   } :
      pct >= 50 ? { label: 'Keep Going!',  color: 'text-yellow-600', bg: 'bg-yellow-50' } :
                  { label: 'Try Again!',   color: 'text-red-600',    bg: 'bg-red-50'    };

    const timeUsed = paper.totalTime - timeLeft;

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-10">
        <div className="max-w-3xl mx-auto space-y-8 py-8">

          <div className="text-center space-y-3">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-black ${grade.bg}`}>
              <Trophy className={grade.color} size={44} />
            </div>
            <h2 className={`text-4xl font-bold handwritten ${grade.color}`}>{grade.label}</h2>
            <p className="text-gray-500 text-sm">{paper.subject} · {paper.chapter} · <span className="capitalize">{paper.difficulty}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Score',     value: `${score}/${paper.questions.length}`, color: 'bg-blue-400'  },
              { label: 'Accuracy',  value: `${pct}%`,                            color: DIFFICULTY_CONFIG[paper.difficulty].color },
              { label: 'Time Used', value: formatTime(timeUsed),                 color: 'bg-purple-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-5 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}>
                <div className="text-3xl font-bold handwritten">{value}</div>
                <div className="text-xs font-bold uppercase tracking-widest mt-1 text-gray-700">{label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold handwritten">Review Answers</h3>
            {paper.questions.map((q, idx) => {
              const correct = answers[idx] === q.correct;
              return (
                <div key={idx} className={`bg-white border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${correct ? 'border-green-500' : 'border-red-400'}`}>
                  <div className="flex items-start gap-3 p-5 pb-3">
                    <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="font-bold flex-1">{q.question}</p>
                    {correct
                      ? <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                      : <AlertCircle  className="text-red-500 shrink-0"   size={20} />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-5 pb-4">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`p-2.5 border text-sm font-medium rounded ${
                        oi === q.correct     ? 'bg-green-50 border-green-400 text-green-900'
                        : oi === answers[idx] ? 'bg-red-50 border-red-400 text-red-900'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mx-5 mb-5 bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                      <Sparkles size={12} /> AI Explanation
                    </div>
                    <p className="text-sm text-blue-800 italic">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 pt-4">
            <button onClick={onBack} className="flex-1 py-4 border-2 border-black bg-white font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              New Quiz
            </button>
            <button
              onClick={() => { setAnswers({}); setCurrentIdx(0); setShowResults(false); setSubmitted(false); setTimeLeft(paper.totalTime); }}
              className="flex-1 py-4 bg-yellow-400 border-2 border-black font-bold hover:bg-yellow-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} /> Re-attempt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────────
  const q        = paper.questions[currentIdx];
  const progress = ((currentIdx + 1) / paper.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const urgent   = timeLeft < 30;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b-2 border-black bg-white px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded border-2 border-transparent hover:border-black transition-all">
            <RotateCcw size={18} />
          </button>
          <div>
            <div className="font-bold text-sm leading-tight">{paper.chapter}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{paper.subject}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-mono font-bold ${urgent ? 'bg-red-400 animate-pulse' : 'bg-white'}`}>
            <Clock size={14} />{formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowResults(true)} className="bg-black text-white px-5 py-2 font-bold text-sm hover:bg-gray-800 transition-all">
            Submit ({answered}/{paper.questions.length})
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-gray-200 w-full">
        <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 p-4 md:p-10 flex items-start justify-center">
        <div className="w-full max-w-2xl space-y-8">

          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-7">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">{currentIdx + 1}</span>
              Question {currentIdx + 1} of {paper.questions.length}
            </div>
            <h3 className="text-2xl font-bold handwritten leading-snug">{q.question}</h3>
          </div>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const selected = answers[currentIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: idx }))}
                  className={`w-full p-5 border-2 border-black text-left flex items-center gap-4 transition-all group ${
                    selected ? 'bg-blue-50 border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]' : 'bg-white hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white group-hover:bg-gray-100'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-medium text-base">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="flex items-center gap-1.5 font-bold text-gray-400 hover:text-black disabled:opacity-30 transition-colors">
              <ChevronLeft size={20} /> Previous
            </button>
            <div className="flex gap-1.5">
              {paper.questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)} className={`w-2.5 h-2.5 rounded-full border border-black transition-all ${i === currentIdx ? 'bg-black scale-125' : answers[i] !== undefined ? 'bg-yellow-400' : 'bg-white'}`} />
              ))}
            </div>
            {currentIdx === paper.questions.length - 1 ? (
              <button onClick={() => setShowResults(true)} className="flex items-center gap-1.5 font-bold bg-green-400 border-2 border-black px-4 py-2 hover:bg-green-500 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Submit <CheckCircle2 size={18} />
              </button>
            ) : (
              <button onClick={() => setCurrentIdx(p => Math.min(paper.questions.length - 1, p + 1))} className="flex items-center gap-1.5 font-bold hover:translate-x-1 transition-all">
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MCQSection() {
  const [activePaper, setActivePaper] = useState(null);

  if (activePaper) {
    return <MCQAttempt paper={activePaper} onBack={() => setActivePaper(null)} />;
  }

  return <MCQGeneratorForm onStart={paper => setActivePaper(paper)} />;
}