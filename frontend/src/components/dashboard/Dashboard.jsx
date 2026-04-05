import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  Plus,
  ArrowRight,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { SUBJECTS } from '../../constants';
const checkpoints = ['Intro', 'Concept', 'Practice', 'Quiz'];
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

const BASE_URL = 'http://localhost:3000';
const STUDENT_ID = 'student-default';

export const Dashboard = ({ profile, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/api/grading/stats/${STUDENT_ID}`).then(r => r.json()),
      fetch(`${BASE_URL}/api/grading/stats/${STUDENT_ID}/trend`).then(r => r.json()),
    ])
      .then(([statsData, trendData]) => {
        if (statsData?.success) setStats(statsData.stats || null);
        if (trendData?.success) setTrend(trendData || null);
      })
      .catch(() => {});
  }, []);

  const improvementPct = useMemo(() => {
    const avg = Number(stats?.averageScore ?? 0);
    const predicted = Number(trend?.overall?.predictedNext);
    const slope = Number(trend?.overall?.slope ?? 0);

    if (Number.isFinite(predicted) && Number.isFinite(avg) && avg > 0) {
      const fromPrediction = ((predicted - avg) / avg) * 100;
      return Math.round(fromPrediction * 10) / 10;
    }

    // Fallback to slope-based improvement signal when prediction is unavailable.
    return Math.round(slope * 10) / 10;
  }, [stats, trend]);

  const improvementTone = improvementPct > 0
    ? { bg: 'bg-green-100', text: 'text-green-600' }
    : improvementPct < 0
      ? { bg: 'bg-red-100', text: 'text-red-600' }
      : { bg: 'bg-yellow-100', text: 'text-yellow-700' };

  const formattedImprovement = `${improvementPct > 0 ? '+' : ''}${improvementPct}%`;

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold handwritten mb-2">Hello, {profile.name}!</h1>
          <p className="text-gray-600">Grade {profile.grade} • {profile.aptitude.charAt(0).toUpperCase() + profile.aptitude.slice(1)} Level</p>
        </div>
        <div className="flex gap-4">
          <div
            className="card-notebook p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onNavigate('progress')}
          >
            <div className={`${improvementTone.bg} p-2 rounded-full`}><Activity className={improvementTone.text} /></div>
            <div>
              <p className="text-xs text-gray-500">Improvement</p>
              <p className="font-bold">{formattedImprovement}</p>
            </div>
          </div>
        </div>
      </header>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {SUBJECTS.slice(0, 3).map((subject, index) => {
    const color = SUBJECT_COLORS[index];
    const currentStep = 1; // later dynamic

    return (
      <div key={subject.id} className="bg-white border p-4">

        {/* Title */}
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          {subject.name}
        </p>
        <h3 className="text-sm font-bold mb-2">
          {subject.chapters[0]?.title || "Chapter Name"}
        </h3>

        {/* Timeline */}
        <Timeline
          checkpoints={['Intro', 'Concept', 'Practice', 'Quiz']}
          currentStep={currentStep}
          color={color}
        />

      </div>
    );
  })}
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
    </div >
  );
};
const Timeline = ({ checkpoints, currentStep, color }) => {
  return (
    <div className="w-full">

      {/* Progress Line Container */}
      <div className="relative flex items-center justify-between">

        {/* Base line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gray-200 top-1/2 -translate-y-1/2" />

        {/* Active line */}
        <div
          className="absolute left-0 h-[2px] top-1/2 -translate-y-1/2 transition-all duration-500"
          style={{
            width: `${(currentStep / (checkpoints.length - 1)) * 100}%`,
            backgroundColor: color
          }}
        />

        {/* Dots */}
        {checkpoints.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-center">

            <div
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                idx <= currentStep ? 'border-black' : 'border-gray-300'
              }`}
              style={{
                backgroundColor: idx <= currentStep ? color : 'white',
                transform: idx === currentStep ? 'scale(1.3)' : 'scale(1)'
              }}
            >
              {/* Active glow */}
              {idx === currentStep && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-70" />
              )}
            </div>

            {/* Labels */}
            <span className="mt-1 text-[8px] font-bold text-gray-500 uppercase">
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-2 text-[8px] text-gray-400 font-semibold">
        <span>STEP {currentStep + 1} OF {checkpoints.length}</span>
        <span>{Math.round((currentStep / (checkpoints.length - 1)) * 100)}%</span>
      </div>
    </div>
  );
};