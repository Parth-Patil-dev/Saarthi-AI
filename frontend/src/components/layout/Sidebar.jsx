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

const tabs = [
  {
    id:     'dashboard',
    icon:   LayoutDashboard,
    label:  'Dashboard',
    color:  'bg-violet-500',
    light:  'bg-violet-50',
    text:   'text-violet-600',
    border: 'border-violet-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(139,92,246,0.4)]',
  },
  {
    id:     'ai-chat',
    icon:   MessageCircle,
    label:  'Chat with AI',
    color:  'bg-sky-500',
    light:  'bg-sky-50',
    text:   'text-sky-600',
    border: 'border-sky-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(14,165,233,0.4)]',
  },
  {
    id:     'subjects',
    icon:   BookOpen,
    label:  'Subjects',
    color:  'bg-emerald-500',
    light:  'bg-emerald-50',
    text:   'text-emerald-600',
    border: 'border-emerald-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(16,185,129,0.4)]',
  },
  {
    id:     'my-notes',
    icon:   FileText,
    label:  'My Notes',
    color:  'bg-amber-500',
    light:  'bg-amber-50',
    text:   'text-amber-600',
    border: 'border-amber-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(245,158,11,0.4)]',
  },
  {
    id:     'question-paper',
    icon:   GraduationCap,
    label:  'Question Papers',
    color:  'bg-rose-500',
    light:  'bg-rose-50',
    text:   'text-rose-600',
    border: 'border-rose-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(244,63,94,0.4)]',
  },
  {
    id:     'MCQ Practice',
    icon:   BrainCircuit,
    label:  'MCQ Practice',
    color:  'bg-fuchsia-500',
    light:  'bg-fuchsia-50',
    text:   'text-fuchsia-600',
    border: 'border-fuchsia-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(217,70,239,0.4)]',
  },
  {
    id:     'check-answers',
    icon:   CheckCircle2,
    label:  'Check Answers',
    color:  'bg-teal-500',
    light:  'bg-teal-50',
    text:   'text-teal-600',
    border: 'border-teal-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(20,184,166,0.4)]',
  },
  {
    id:     'progress',
    icon:   Activity,
    label:  'My Progress',
    color:  'bg-blue-500',
    light:  'bg-blue-50',
    text:   'text-blue-600',
    border: 'border-blue-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(59,130,246,0.4)]',
  },
  {
    id:     'settings',
    icon:   Settings,
    label:  'Settings',
    color:  'bg-gray-500',
    light:  'bg-gray-50',
    text:   'text-gray-600',
    border: 'border-gray-200',
    shadow: 'shadow-[4px_4px_0px_0px_rgba(107,114,128,0.4)]',
  },
];

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 border-r-2 border-black bg-white h-screen flex flex-col p-4 sticky top-0 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-bold text-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
          S
        </div>
        <h1 className="text-xl font-bold handwritten">Saarthi AI</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          const Icon   = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 border-2 font-medium
                transition-all duration-150 text-left
                ${active
                  ? `${tab.light} ${tab.border} ${tab.text} ${tab.shadow} translate-x-[1px] translate-y-[1px]`
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                }
              `}
            >
              {/* Colored icon dot */}
              <div className={`w-7 h-7 flex items-center justify-center shrink-0 border-2 border-black ${active ? tab.color : 'bg-gray-100'} transition-colors`}>
                <Icon size={15} className={active ? 'text-white' : 'text-gray-500'} />
              </div>
              <span className={`text-sm ${active ? 'font-bold' : ''}`}>{tab.label}</span>

              {/* Active indicator bar */}
              {active && (
                <div className={`ml-auto w-1.5 h-5 ${tab.color} border border-black`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* AI status chip */}
      <div className="mt-4 p-3 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(139,92,246,0.5)]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Tutor Active</span>
        </div>
        <p className="text-[10px] text-gray-400">Adapting to your learning style...</p>
      </div>
    </div>
  );
};