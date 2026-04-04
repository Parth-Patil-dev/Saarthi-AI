import React from 'react';
import {
  ChevronRight,
  Plus,
  ArrowRight,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { SUBJECTS } from '../../constants';

// One color per subject slot — cycles if there are more subjects
const SUBJECT_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#e11d48', // rose
  '#8b5cf6', // violet
  '#0ea5e9', // sky
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export const Dashboard = ({ profile, onNavigate }) => {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold handwritten mb-2">Hello, {profile.name}!</h1>
          <p className="text-gray-600">Grade {profile.grade} • {profile.aptitude.charAt(0).toUpperCase() + profile.aptitude.slice(1)} Level</p>
        </div>
        <div className="flex gap-4">
          <div className="card-notebook p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => onNavigate('progress')}>
            <div className="bg-orange-100 p-2 rounded-full"><Award className="text-orange-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Points</p>
              <p className="font-bold">1,250</p>
            </div>
          </div>
          <div className="card-notebook p-3 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full"><Activity className="text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Streak</p>
              <p className="font-bold">5 Days</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="card-notebook">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Recent Progress
          </h3>
          <div className="space-y-4">
            {['Science: Cell Structure', 'Math: Linear Equations', 'History: French Revolution'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-gray-100 hover:border-black transition-all cursor-pointer group" onClick={() => onNavigate('subjects')}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium">{item}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${80 - i * 20}%` }}></div>
                  </div>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {SUBJECTS.map((subject, index) => {
          const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
          return (
            <div key={subject.id} className="group cursor-pointer" onClick={() => onNavigate('subjects')}>
              <div className="aspect-[3/4] bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-all p-4 flex flex-col justify-between overflow-hidden relative">

                {/* Colored triangle + icon — top right */}
                <div
                  className="absolute top-0 right-0 w-16 h-16"
                  style={{
                    background: `linear-gradient(225deg, ${color} 50%, transparent 50%)`,
                  }}
                >
                  <span className="absolute top-2 right-2 text-white text-lg leading-none">
                    {subject.icon}
                  </span>
                </div>

                {/* Thin colored top border accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: color }}
                />

                <div className="mt-1">
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {subject.name}
                  </div>
                  <h4
                    className="text-lg font-bold leading-tight transition-colors"
                    style={{ color: 'inherit' }}
                  >
                    {subject.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1">{subject.chapters.length} Chapters</p>
                </div>

                <div
                  className="flex items-center font-bold text-xs gap-1 group-hover:gap-2 transition-all"
                  style={{ color }}
                >
                  Open <ArrowRight size={12} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add subject card */}
        <div className="aspect-[3/4] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all cursor-pointer group">
          <Plus size={32} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold mt-2 text-xs uppercase tracking-widest">Add Subject</span>
        </div>
      </div>
    </div>
  );
};