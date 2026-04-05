import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, BrainCircuit, X, Download,
  MessageSquare, Plus, PenLine, Sparkles, ChevronRight,
  AlertCircle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';

const api = {
  // GET /api/notes
  async listNotes() {
    const res  = await fetch(`${BASE_URL}/api/notes`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load notes');
    return data.notes;
  },

  // GET /api/question-paper/subjects
  async getSubjects() {
    const res  = await fetch(`${BASE_URL}/api/question-paper/subjects`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load subjects');
    return data.subjects;
  },

  // POST /api/notes/generate  — AI generates notes
  async generateNotes(subject, chapter, style) {
    const res  = await fetch(`${BASE_URL}/api/notes/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subject, chapter, style }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Generation failed');
    return data.note;
  },

  // POST /api/notes  — save manual note
  async createManualNote(title, subject, chapter, content) {
    const res  = await fetch(`${BASE_URL}/api/notes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, subject, chapter, content }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Save failed');
    return data.note;
  },

  // DELETE /api/notes/:id
  async deleteNote(id) {
    const res  = await fetch(`${BASE_URL}/api/notes/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Delete failed');
  },
};

// ── Step indicators ───────────────────────────────────────────────────────────
const STEPS = ['Topic', 'Type', 'Content'];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {STEPS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 flex items-center justify-center border-2 border-black font-bold text-sm
            ${i < current ? 'bg-black text-white' : i === current ? 'bg-yellow-300 text-black' : 'bg-white text-gray-400'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${i === current ? 'text-black' : 'text-gray-400'}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`h-0.5 w-12 mb-4 ${i < current ? 'bg-black' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ── Styled note renderer ─────────────────────────────────────────────────────
function cleanInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[-*\u2022]\s+/, '')
    .trim();
}

function parseNoteSections(content = '') {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let current = { title: 'Study Notes', entries: [] };

  const pushCurrent = () => {
    if (!current.entries.length) return;
    sections.push(current);
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const markdownHeadingMatch = line.match(/^#{1,6}\s+(.+)$/);
    const colonHeadingMatch = line.match(/^([A-Za-z][A-Za-z\s/&()'-]{1,50}):\s*(.*)$/);
    const bulletMatch = line.match(/^[-*\u2022]\s+(.+)$/);
    const numberMatch = line.match(/^(\d+)[.)]\s+(.+)$/);

    if (markdownHeadingMatch) {
      pushCurrent();
      current = { title: cleanInline(markdownHeadingMatch[1]), entries: [] };
      continue;
    }

    if (colonHeadingMatch && colonHeadingMatch[1].length <= 40) {
      pushCurrent();
      current = { title: cleanInline(colonHeadingMatch[1]), entries: [] };
      if (colonHeadingMatch[2]) {
        current.entries.push({ type: 'paragraph', text: cleanInline(colonHeadingMatch[2]) });
      }
      continue;
    }

    if (bulletMatch) {
      current.entries.push({ type: 'bullet', text: cleanInline(bulletMatch[1]) });
      continue;
    }

    if (numberMatch) {
      current.entries.push({ type: 'number', number: numberMatch[1], text: cleanInline(numberMatch[2]) });
      continue;
    }

    current.entries.push({ type: 'paragraph', text: cleanInline(line) });
  }

  pushCurrent();

  if (!sections.length) {
    return [{
      title: 'Study Notes',
      entries: [{ type: 'paragraph', text: content.trim() }],
    }];
  }

  return sections;
}

function getSectionTheme(title, idx) {
  const t = (title || '').toLowerCase();
  if (/key concept|overview|summary|topic/.test(t)) {
    return { bg: 'bg-blue-50', border: 'border-blue-300', chip: 'bg-blue-500' };
  }
  if (/definition|formula|term/.test(t)) {
    return { bg: 'bg-purple-50', border: 'border-purple-300', chip: 'bg-purple-500' };
  }
  if (/important|point|note/.test(t)) {
    return { bg: 'bg-amber-50', border: 'border-amber-300', chip: 'bg-amber-500' };
  }
  if (/example|application/.test(t)) {
    return { bg: 'bg-green-50', border: 'border-green-300', chip: 'bg-green-500' };
  }
  if (/activity|exercise|practice|question/.test(t)) {
    return { bg: 'bg-yellow-50', border: 'border-yellow-400', chip: 'bg-yellow-500' };
  }

  const fallback = [
    { bg: 'bg-gray-50', border: 'border-gray-300', chip: 'bg-gray-600' },
    { bg: 'bg-cyan-50', border: 'border-cyan-300', chip: 'bg-cyan-500' },
    { bg: 'bg-rose-50', border: 'border-rose-300', chip: 'bg-rose-500' },
  ];
  return fallback[idx % fallback.length];
}

function StyledNoteContent({ content }) {
  const sections = parseNoteSections(content);

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        const theme = getSectionTheme(section.title, idx);
        return (
          <section
            key={`${section.title}-${idx}`}
            className={`border-2 border-black ${theme.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}
          >
            <div className="px-4 py-2 border-b-2 border-black bg-white flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${theme.chip} border border-black`} />
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-700">{section.title}</h4>
            </div>

            <div className={`p-4 border-l-4 ${theme.border} space-y-2`}>
              {section.entries.map((entry, entryIdx) => {
                if (entry.type === 'bullet') {
                  return (
                    <div key={entryIdx} className="flex items-start gap-2.5 text-sm text-gray-800 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                      <span>{entry.text}</span>
                    </div>
                  );
                }

                if (entry.type === 'number') {
                  return (
                    <div key={entryIdx} className="flex items-start gap-2.5 text-sm text-gray-800 leading-relaxed">
                      <span className="text-xs font-bold border border-black bg-white px-1.5 py-0.5 mt-0.5 shrink-0">{entry.number}</span>
                      <span>{entry.text}</span>
                    </div>
                  );
                }

                return (
                  <p key={entryIdx} className="text-sm text-gray-800 leading-relaxed">
                    {entry.text}
                  </p>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const MyNotes = () => {
  const [notes,    setNotes]    = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Modal state
  const [showCreate,  setShowCreate]  = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Create flow state
  const [step,       setStep]       = useState(0); // 0=topic, 1=type, 2=content
  const [subject,    setSubject]    = useState('');
  const [chapter,    setChapter]    = useState('');
  const [noteType,   setNoteType]   = useState(''); // 'ai' | 'manual'
  const [aiStyle,    setAiStyle]    = useState('concise');
  const [manualTitle,   setManualTitle]   = useState('');
  const [manualContent, setManualContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Load notes + subjects on mount
  useEffect(() => {
    Promise.all([api.listNotes(), api.getSubjects()])
      .then(([n, s]) => { setNotes(n); setSubjects(s); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Open / reset create modal ───────────────────────────────────────────────
  const openCreate = () => {
    setStep(0); setSubject(''); setChapter(''); setNoteType('');
    setAiStyle('concise'); setManualTitle(''); setManualContent('');
    setCreateError(null); setShowCreate(true);
  };

  // ── Step 0 → 1 ─────────────────────────────────────────────────────────────
  const handleTopicNext = () => {
    if (!subject || !chapter.trim()) {
      setCreateError('Please select a subject and enter a chapter.');
      return;
    }
    setCreateError(null);
    setStep(1);
  };

  // ── Step 1 → 2 ─────────────────────────────────────────────────────────────
  const handleTypeSelect = (type) => {
    setNoteType(type);
    setStep(2);
  };

  // ── Step 2: Generate AI notes ───────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setCreateError(null);
    try {
      const note = await api.generateNotes(subject, chapter, aiStyle);
      setNotes(prev => [note, ...prev]);
      setShowCreate(false);
      setSelectedNote(note);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Step 2: Save manual note ────────────────────────────────────────────────
  const handleManualSave = async () => {
    if (!manualTitle.trim() || !manualContent.trim()) {
      setCreateError('Please fill in both title and content.');
      return;
    }
    setGenerating(true);
    setCreateError(null);
    try {
      const note = await api.createManualNote(manualTitle, subject, chapter, manualContent);
      setNotes(prev => [note, ...prev]);
      setShowCreate(false);
      setSelectedNote(note);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Delete note ─────────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Source badge ────────────────────────────────────────────────────────────
  const sourceBadge = (source) => {
    const map = {
      'ai-generated': { label: 'AI', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'pdf-summary':  { label: 'PDF', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      'manual':       { label: 'Manual', color: 'bg-gray-100 text-gray-600 border-gray-300' },
    };
    const b = map[source] || map['manual'];
    return (
      <span className={`text-xs font-bold px-2 py-0.5 border rounded-sm ${b.color}`}>
        {b.label}
      </span>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold handwritten">My Notes</h2>
        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-bold"
        >
          <Plus size={20} />
          New Note
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 border-2 border-red-500 bg-red-50 text-red-700 font-bold">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" size={36} />
        </div>
      ) : notes.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-gray-300">
          <FileText className="mx-auto mb-4 text-gray-200" size={64} />
          <p className="text-gray-400 font-bold handwritten text-xl">No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedNote(note)}
              className="p-4 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer relative group"
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(note.id, e)}
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 border border-transparent hover:border-red-300 transition-all"
              >
                <X size={14} className="text-red-400" />
              </button>

              <div className="flex items-start justify-between mb-2 pr-6">
                <h3 className="font-bold text-lg leading-tight">{note.title}</h3>
                <FileText className="text-gray-300 shrink-0 ml-2" size={18} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                {sourceBadge(note.source)}
                {note.subject && (
                  <span className="text-xs text-gray-400 font-bold">{note.subject}</span>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {note.content?.slice(0, 120)}...
              </p>
              <div className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create Note Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold handwritten">Create Note</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100">
                  <X size={22} />
                </button>
              </div>

              <StepBar current={step} />

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2 p-3 mb-4 border-2 border-red-400 bg-red-50 text-red-700 text-sm font-bold">
                  <AlertCircle size={16} />{createError}
                </div>
              )}

              {/* ── Step 0: Subject + Chapter ─────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full p-3 border-2 border-black focus:outline-none font-bold"
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Chapter / Topic</label>
                    <input
                      type="text"
                      value={chapter}
                      onChange={e => setChapter(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTopicNext()}
                      placeholder="e.g. Newton's Laws of Motion"
                      className="w-full p-3 border-2 border-black focus:outline-none font-bold"
                    />
                  </div>
                  <button
                    onClick={handleTopicNext}
                    className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* ── Step 1: AI or Manual ──────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-bold text-center mb-2">
                    How would you like to create notes for<br />
                    <span className="text-black">{subject} — {chapter}</span>?
                  </p>
                  <button
                    onClick={() => handleTypeSelect('ai')}
                    className="w-full p-5 border-2 border-black bg-white hover:bg-yellow-50 hover:border-yellow-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 text-left"
                  >
                    <Sparkles size={28} className="text-yellow-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">AI Generated</div>
                      <div className="text-sm text-gray-500">Let AI write structured notes on this topic</div>
                    </div>
                    <ChevronRight size={20} className="ml-auto text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleTypeSelect('manual')}
                    className="w-full p-5 border-2 border-black bg-white hover:bg-blue-50 hover:border-blue-400 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 text-left"
                  >
                    <PenLine size={28} className="text-blue-500 shrink-0" />
                    <div>
                      <div className="font-bold text-lg">Write Manually</div>
                      <div className="text-sm text-gray-500">Type your own notes and save them</div>
                    </div>
                    <ChevronRight size={20} className="ml-auto text-gray-400" />
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* ── Step 2a: AI style picker + generate ───────────────────── */}
              {step === 2 && noteType === 'ai' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-bold text-center">
                    Generating notes for <span className="text-black">{chapter}</span>
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">Note Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['concise', 'detailed', 'outline'].map(s => (
                        <button
                          key={s}
                          onClick={() => setAiStyle(s)}
                          className={`py-2 border-2 border-black font-bold text-sm capitalize transition-all ${
                            aiStyle === s ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-center">
                      {aiStyle === 'concise'  && 'Short bullet points, key terms only'}
                      {aiStyle === 'detailed' && 'Full paragraphs covering all subtopics'}
                      {aiStyle === 'outline'  && 'Hierarchical headings and sub-bullets'}
                    </div>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    {generating ? (
                      <><Loader2 className="animate-spin" size={18} /> Generating...</>
                    ) : (
                      <><Sparkles size={18} /> Generate Notes</>
                    )}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* ── Step 2b: Manual note editor ───────────────────────────── */}
              {step === 2 && noteType === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Note Title</label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={e => setManualTitle(e.target.value)}
                      placeholder={`${chapter} — ${subject}`}
                      className="w-full p-3 border-2 border-black focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Content</label>
                    <textarea
                      value={manualContent}
                      onChange={e => setManualContent(e.target.value)}
                      placeholder="Write your notes here..."
                      rows={7}
                      className="w-full p-3 border-2 border-black focus:outline-none font-bold resize-none text-sm leading-relaxed"
                    />
                  </div>
                  <button
                    onClick={handleManualSave}
                    disabled={generating}
                    className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    {generating ? (
                      <><Loader2 className="animate-spin" size={18} /> Saving...</>
                    ) : (
                      <><PenLine size={18} /> Save Note</>
                    )}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Note Detail Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-2xl font-bold handwritten">{selectedNote.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {sourceBadge(selectedNote.source)}
                    <span className="text-xs text-gray-400">
                      {selectedNote.subject} · {new Date(selectedNote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-1 hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6">
                <StyledNoteContent content={selectedNote.content} />
              </div>

              <div className="flex gap-4 pt-6">
                <button className="flex-1 py-2 border-2 border-black font-bold hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  Ask AI about these notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};