import React, { useState, useEffect } from 'react';
import { 
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Constants
import { SUBJECTS } from './constants';

// Components
import { Onboarding } from './components/onboarding/Onboarding';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { TextbookReader } from './components/reader/TextbookReader';
import { MyNotes } from './components/notes/MyNotes';
import { MyProgress } from './components/progress/MyProgress';
import { QuestionPaperGenerator } from './components/papers/QuestionPaperGenerator';
import { AnswerChecker } from './components/papers/AnswerChecker';
import { AIAssistantSplit } from './components/ai/AIAssistantSplit';
import { Settings } from './components/settings/Settings';
import { SubjectsView } from './components/subjects/SubjectsView';
import { AIChatView } from './components/ai/AIChatView';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // New State for Features
  const [papers, setPapers] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // Sample Data for Progress
  const SAMPLE_PAPERS = [
    {
      id: 's1',
      subject: 'Science',
      chapter: 'Cell Structure',
      difficulty: 'medium',
      questions: [],
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 75,
      feedback: 'Good understanding of organelles.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 's2',
      subject: 'Science',
      chapter: 'Photosynthesis',
      difficulty: 'hard',
      questions: [],
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 82,
      feedback: 'Excellent explanation of the light-dependent reactions.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 's3',
      subject: 'Science',
      chapter: 'Human Anatomy',
      difficulty: 'medium',
      questions: [],
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 90,
      feedback: 'Perfect score! You have a strong grasp of this topic.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'm1',
      subject: 'Math',
      chapter: 'Linear Equations',
      difficulty: 'easy',
      questions: [],
      timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 65,
      feedback: 'Practice more on balancing equations.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'm2',
      subject: 'Math',
      chapter: 'Quadratic Equations',
      difficulty: 'medium',
      questions: [],
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 78,
      feedback: 'Good progress. Watch out for sign errors.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'm3',
      subject: 'Math',
      chapter: 'Trigonometry',
      difficulty: 'hard',
      questions: [],
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 85,
      feedback: 'Strong understanding of trigonometric identities.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'h1',
      subject: 'History',
      chapter: 'French Revolution',
      difficulty: 'medium',
      questions: [],
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 88,
      feedback: 'Great analysis of the social causes.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'h2',
      subject: 'History',
      chapter: 'Industrial Revolution',
      difficulty: 'medium',
      questions: [],
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      status: 'checked',
      score: 92,
      feedback: 'Excellent work on the economic impacts.',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const [conversations, setConversations] = useState([
    {
      id: '1',
      title: 'General Help',
      messages: [{ id: '1', role: 'assistant', content: "Hello! I'm your AI Tutor. How can I help you today?", timestamp: Date.now() }],
      timestamp: Date.now()
    }
  ]);

  // Load from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('saarthi_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedPapers = localStorage.getItem('saarthi_papers');
    if (savedPapers) {
      setPapers(JSON.parse(savedPapers));
    } else {
      setPapers(SAMPLE_PAPERS);
    }

    const savedNotes = localStorage.getItem('saarthi_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    const savedConvs = localStorage.getItem('saarthi_convs');
    if (savedConvs) setConversations(JSON.parse(savedConvs));
  }, []);

  // Save to local storage
  useEffect(() => {
    if (papers.length > 0) localStorage.setItem('saarthi_papers', JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    if (notes.length > 0) localStorage.setItem('saarthi_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (conversations.length > 0) localStorage.setItem('saarthi_convs', JSON.stringify(conversations));
  }, [conversations]);

  const handleOnboarding = (p) => {
    setProfile(p);
    localStorage.setItem('saarthi_profile', JSON.stringify(p));
  };

  const handleGeneratePaper = (paper) => {
    setPapers([paper, ...papers]);
    setActiveTab('question-paper');
  };

  const handleCheckAnswers = (id, score, feedback) => {
    setPapers(papers.map(p => p.id === id ? { 
      ...p, 
      status: 'checked', 
      score, 
      feedback,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    } : p));
    setActiveTab('progress');
  };

  const handleUploadNote = (note) => {
    const existing = notes.find(n => n.id === note.id);
    if (existing) {
      setNotes(notes.map(n => n.id === note.id ? note : n));
    } else {
      setNotes([note, ...notes]);
    }
  };

  const handleResetAccount = () => {
    localStorage.removeItem('saarthi_profile');
    window.location.reload();
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {!selectedChapter && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
        
        <div className="flex-1 flex overflow-hidden relative">
          <main className="flex-1 overflow-y-auto">
            {selectedChapter ? (
              <TextbookReader 
                subject={selectedChapter.subject} 
                chapter={selectedChapter.chapter} 
                profile={profile}
                onBack={() => setSelectedChapter(null)} 
              />
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard profile={profile} onNavigate={setActiveTab} />}
                {activeTab === 'ai-chat' && (
                  <AIChatView 
                    profile={profile} 
                    conversations={conversations} 
                    onUpdateConversations={setConversations} 
                  />
                )}
                {activeTab === 'subjects' && (
                  <SubjectsView onSelectChapter={(subject, chapter) => setSelectedChapter({ subject, chapter })} />
                )}
                {activeTab === 'my-notes' && <MyNotes notes={notes} onUpload={handleUploadNote} />}
                {activeTab === 'question-paper' && <QuestionPaperGenerator onGenerate={handleGeneratePaper} />}
                {activeTab === 'check-answers' && <AnswerChecker papers={papers} onCheck={handleCheckAnswers} />}
                {activeTab === 'progress' && <MyProgress papers={papers} />}
                {activeTab === 'settings' && (
                  <Settings profile={profile} onReset={handleResetAccount} />
                )}
              </>
            )}
          </main>

          <AIAssistantSplit 
            isOpen={isAssistantOpen} 
            onClose={() => setIsAssistantOpen(false)} 
            profile={profile}
            conversations={conversations}
            onUpdateConversations={setConversations}
          />
        </div>
      </div>

      <AnimatePresence>
        {!isAssistantOpen && (
          <motion.button 
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('Opening AI Assistant');
              setIsAssistantOpen(true);
            }}
            className="fixed bottom-6 right-6 px-6 h-16 bg-black text-white rounded-full flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all z-[100] cursor-pointer pointer-events-auto"
          >
            <MessageCircle size={28} />
            <span className="font-bold handwritten text-lg">Chat with AI</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
