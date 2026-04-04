import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  GraduationCap, 
  CheckCircle2,
  FileText,
  BrainCircuit,
  Activity,
  MessageCircle
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'ai-chat', icon: MessageCircle, label: 'Chat with AI' },
    { id: 'subjects', icon: BookOpen, label: 'Subjects' },
    { id: 'my-notes', icon: FileText, label: 'My Notes' },
    { id: 'question-paper', icon: GraduationCap, label: 'Question Papers' },
    { id: 'check-answers', icon: CheckCircle2, label: 'Check Answers' },
    { id: 'progress', icon: Activity, label: 'My Progress' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 border-r-2 border-black bg-white h-screen flex flex-col p-4 sticky top-0 shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
        <h1 className="text-xl font-bold handwritten">Saarthi AI</h1>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-2 transition-all ${
              activeTab === tab.id 
                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                : 'border-transparent hover:border-black'
            }`}
          >
            <tab.icon size={20} />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 bg-gray-50 border-2 border-black rounded-lg mt-4">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit size={18} className="text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Tutor Active</span>
        </div>
        <p className="text-[10px] text-gray-500">Adapting to your learning style...</p>
      </div>
    </div>
  );
};
