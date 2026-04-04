// import React, { useState, useMemo } from 'react';
// import { 
//   Area,
//   AreaChart,
//   CartesianGrid, 
//   ResponsiveContainer,
//   Tooltip, 
//   XAxis, 
//   YAxis 
// } from 'recharts';
// import { Activity } from 'lucide-react';
// import { SUBJECTS } from '../../constants';

// export const MyProgress = ({ papers }) => {
//   const [selectedSubject, setSelectedSubject] = useState('All');
  
//   const checkedPapers = papers.filter(p => p.status === 'checked');
  
//   const filteredPapers = useMemo(() => {
//     return selectedSubject === 'All' 
//       ? checkedPapers 
//       : checkedPapers.filter(p => p.subject === selectedSubject);
//   }, [checkedPapers, selectedSubject]);

//   const averageScore = filteredPapers.length > 0 
//     ? Math.round(filteredPapers.reduce((acc, p) => acc + (p.score || 0), 0) / filteredPapers.length)
//     : 0;

//   const subjectBreakdown = useMemo(() => {
//     const breakdown = {};
//     checkedPapers.forEach(p => {
//       if (!breakdown[p.subject]) {
//         breakdown[p.subject] = { count: 0, totalScore: 0 };
//       }
//       breakdown[p.subject].count += 1;
//       breakdown[p.subject].totalScore += (p.score || 0);
//     });
//     return Object.entries(breakdown).map(([name, data]) => ({
//       name,
//       avg: Math.round(data.totalScore / data.count),
//       count: data.count
//     }));
//   }, [checkedPapers]);

//   const chartData = useMemo(() => {
//     return filteredPapers
//       .sort((a, b) => a.timestamp - b.timestamp)
//       .map(p => ({
//         date: new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
//         score: p.score,
//         subject: p.subject
//       }));
//   }, [filteredPapers]);

//   return (
//     <div className="space-y-8 p-8 max-w-6xl mx-auto">
//       <div className="flex justify-between items-center">
//         <h2 className="text-3xl font-bold handwritten">My Progress</h2>
//         <div className="flex items-center gap-3">
//           <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Filter View:</span>
//           <select 
//             value={selectedSubject}
//             onChange={(e) => setSelectedSubject(e.target.value)}
//             className="p-2 border-2 border-black bg-white font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
//           >
//             <option value="All">Overall Progress</option>
//             {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//           <div className="text-sm text-gray-500 uppercase font-bold mb-1">
//             {selectedSubject === 'All' ? 'Overall' : selectedSubject} Avg Score
//           </div>
//           <div className="text-4xl font-bold text-blue-600">{averageScore}%</div>
//         </div>
//         <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//           <div className="text-sm text-gray-500 uppercase font-bold mb-1">
//             {selectedSubject === 'All' ? 'Total' : selectedSubject} Papers
//           </div>
//           <div className="text-4xl font-bold text-green-600">{filteredPapers.length}</div>
//         </div>
//         <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//           <div className="text-sm text-gray-500 uppercase font-bold mb-1">Subjects Studied</div>
//           <div className="text-4xl font-bold text-purple-600">{new Set(papers.map(p => p.subject)).size}</div>
//         </div>
//       </div>

//       {/* Subject Breakdown Section */}
//       {selectedSubject === 'All' && subjectBreakdown.length > 0 && (
//         <div className="space-y-4">
//           <h3 className="text-xl font-bold handwritten">Subject-wise Breakdown</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             {subjectBreakdown.map(subject => (
//               <div 
//                 key={subject.name}
//                 onClick={() => setSelectedSubject(subject.name)}
//                 className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
//               >
//                 <div className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{subject.name}</div>
//                 <div className="flex justify-between items-end">
//                   <div>
//                     <div className="text-xs text-gray-500 uppercase font-bold">Avg Score</div>
//                     <div className="text-2xl font-bold">{subject.avg}%</div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-xs text-gray-500 uppercase font-bold">Papers</div>
//                     <div className="text-lg font-bold">{subject.count}</div>
//                   </div>
//                 </div>
//                 <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
//                   <div 
//                     className={`h-full transition-all duration-1000 ${
//                       subject.avg >= 80 ? 'bg-green-500' : subject.avg >= 50 ? 'bg-yellow-500' : 'bg-red-500'
//                     }`}
//                     style={{ width: `${subject.avg}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Performance Trend Graph */}
//       <div className="p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
//         {/* Notebook Lines Background */}
//         <div className="absolute inset-0 pointer-events-none flex opacity-20">
//           <div className="w-10 border-r-2 border-red-200 h-full"></div>
//           <div className="flex-1 h-full" style={{ 
//             backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', 
//             backgroundSize: '100% 2rem',
//             marginTop: '2rem'
//           }}></div>
//         </div>

//         <div className="relative z-10">
//           <h3 className="text-xl font-bold mb-8 handwritten">Performance Trend - {selectedSubject}</h3>
          
//           <div className="h-[300px] w-full">
//             {chartData.length < 2 ? (
//               <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
//                 <Activity size={48} className="opacity-20" />
//                 <p className="font-bold handwritten text-xl">Need at least 2 papers to show trend</p>
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={chartData}>
//                   <defs>
//                     <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
//                   <XAxis 
//                     dataKey="date" 
//                     axisLine={{ stroke: '#000', strokeWidth: 2 }}
//                     tickLine={false}
//                     tick={{ fontSize: 12, fontWeight: 'bold' }}
//                   />
//                   <YAxis 
//                     domain={[0, 100]} 
//                     axisLine={{ stroke: '#000', strokeWidth: 2 }}
//                     tickLine={false}
//                     tick={{ fontSize: 12, fontWeight: 'bold' }}
//                   />
//                   <Tooltip 
//                     contentStyle={{ 
//                       border: '2px solid black', 
//                       borderRadius: '0px',
//                       boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
//                       fontFamily: 'inherit'
//                     }}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="score" 
//                     stroke="#3b82f6" 
//                     strokeWidth={4}
//                     fillOpacity={1} 
//                     fill="url(#colorScore)" 
//                     animationDuration={1500}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//         <h3 className="text-xl font-bold mb-4">Past Paper Performance</h3>
//         <div className="space-y-4">
//           {checkedPapers.length === 0 ? (
//             <p className="text-gray-400 italic">No papers checked yet. Complete a paper to see your progress!</p>
//           ) : (
//             checkedPapers
//               .filter(p => selectedSubject === 'All' || p.subject === selectedSubject)
//               .map(paper => (
//                 <div key={paper.id} className="flex items-center justify-between p-4 border-b-2 border-gray-100 last:border-0">
//                   <div>
//                     <div className="font-bold">{paper.subject} - {paper.chapter}</div>
//                     <div className="text-xs text-gray-400">{new Date(paper.timestamp).toLocaleDateString()}</div>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <div className="text-xl font-bold">{paper.score}%</div>
//                     <div className={`w-3 h-3 rounded-full ${
//                       (paper.score || 0) >= 80 ? 'bg-green-500' : (paper.score || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
//                     }`} />
//                   </div>
//                 </div>
//               ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useState, useMemo, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, AlertCircle, X } from 'lucide-react';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL   = 'http://localhost:3000';
const STUDENT_ID = 'student-default';

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  // GET /api/grading/stats/:studentId
  async getStats() {
    const res  = await fetch(`${BASE_URL}/api/grading/stats/${STUDENT_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load stats');
    return data.stats;
  },

  // GET /api/grading/results?studentId=
  async getResults() {
    const res  = await fetch(`${BASE_URL}/api/grading/results?studentId=${STUDENT_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Failed to load results');
    return data.results;
  },

  // GET /api/question-paper/subjects
  async getSubjects() {
    const res  = await fetch(`${BASE_URL}/api/question-paper/subjects`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to load subjects');
    return data.subjects; // string[]
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export const MyProgress = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');

  const [stats,    setStats]    = useState(null);
  const [results,  setResults]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Fetch all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([api.getStats(), api.getResults(), api.getSubjects()])
      .then(([s, r, sub]) => {
        setStats(s);
        setResults(r);
        setSubjects(sub);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  // Results filtered by selected subject
  const filteredResults = useMemo(() => {
    if (selectedSubject === 'All') return results;
    return results.filter(r => r.subject === selectedSubject);
  }, [results, selectedSubject]);

  // Average score for filtered view
  const averageScore = useMemo(() => {
    if (selectedSubject === 'All') return stats?.averageScore ?? 0;
    const subj = stats?.bySubject?.[selectedSubject];
    return subj?.average ?? 0;
  }, [stats, selectedSubject]);

  // Subject breakdown from stats.bySubject
  const subjectBreakdown = useMemo(() => {
    if (!stats?.bySubject) return [];
    return Object.entries(stats.bySubject).map(([name, data]) => ({
      name,
      avg:   data.average,
      count: data.attempts,
    }));
  }, [stats]);

  // Chart data — sorted by date ascending
  const chartData = useMemo(() => {
    return [...filteredResults]
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      .map(r => ({
        date:    new Date(r.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        score:   r.percentage,
        subject: r.subject,
        grade:   r.grade,
      }));
  }, [filteredResults]);

  // Unique subjects actually studied (from results)
  const subjectsStudied = useMemo(
    () => new Set(results.map(r => r.subject)).size,
    [results]
  );

  // ── Loading / error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 border-2 border-red-500 bg-red-50 text-red-700 font-bold">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold handwritten">My Progress</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Filter View:</span>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="p-2 border-2 border-black bg-white font-bold focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="All">Overall Progress</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-gray-500 uppercase font-bold mb-1">
            {selectedSubject === 'All' ? 'Overall' : selectedSubject} Avg Score
          </div>
          <div className="text-4xl font-bold text-blue-600">{averageScore}%</div>
        </div>
        <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-gray-500 uppercase font-bold mb-1">
            {selectedSubject === 'All' ? 'Total' : selectedSubject} Attempts
          </div>
          <div className="text-4xl font-bold text-green-600">
            {selectedSubject === 'All'
              ? stats?.totalAttempts ?? 0
              : stats?.bySubject?.[selectedSubject]?.attempts ?? 0}
          </div>
        </div>
        <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-gray-500 uppercase font-bold mb-1">Subjects Studied</div>
          <div className="text-4xl font-bold text-purple-600">{subjectsStudied}</div>
        </div>
      </div>

      {/* Best / Worst topic chips */}
      {selectedSubject === 'All' && stats && (stats.bestTopic || stats.worstTopic) && (
        <div className="flex flex-wrap gap-4">
          {stats.bestTopic && (
            <div className="px-4 py-2 border-2 border-green-500 bg-green-50 font-bold text-sm text-green-800">
              🏆 Best: {stats.bestTopic.chapter} ({stats.bestTopic.average}%)
            </div>
          )}
          {stats.worstTopic && stats.worstTopic.chapter !== stats.bestTopic?.chapter && (
            <div className="px-4 py-2 border-2 border-red-400 bg-red-50 font-bold text-sm text-red-800">
              📚 Needs Work: {stats.worstTopic.chapter} ({stats.worstTopic.average}%)
            </div>
          )}
        </div>
      )}

      {/* Subject breakdown */}
      {selectedSubject === 'All' && subjectBreakdown.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold handwritten">Subject-wise Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectBreakdown.map(subject => (
              <div
                key={subject.name}
                onClick={() => setSelectedSubject(subject.name)}
                className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
              >
                <div className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">{subject.name}</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">Avg Score</div>
                    <div className="text-2xl font-bold">{subject.avg}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold">Attempts</div>
                    <div className="text-lg font-bold">{subject.count}</div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      subject.avg >= 80 ? 'bg-green-500' : subject.avg >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${subject.avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per difficulty breakdown */}
      {selectedSubject === 'All' && stats?.byDifficulty && Object.keys(stats.byDifficulty).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold handwritten">By Difficulty</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.byDifficulty).map(([level, data]) => (
              <div key={level} className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px]">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1">{level}</div>
                <div className="text-2xl font-bold">{data.average}%</div>
                <div className="text-xs text-gray-400">{data.attempts} attempt{data.attempts !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance trend chart */}
      <div className="p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Notebook lines background */}
        <div className="absolute inset-0 pointer-events-none flex opacity-20">
          <div className="w-10 border-r-2 border-red-200 h-full" />
          <div className="flex-1 h-full" style={{
            backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '100% 2rem',
            marginTop: '2rem'
          }} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-8 handwritten">
            Performance Trend — {selectedSubject}
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <Activity size={48} className="opacity-20" />
                <p className="font-bold handwritten text-xl">Need at least 2 attempts to show trend</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 'bold' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 'bold' }}
                  />
                  <Tooltip
                    contentStyle={{
                      border: '2px solid black',
                      borderRadius: '0px',
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      fontFamily: 'inherit',
                    }}
                    formatter={(value, name) => [`${value}%`, 'Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Past paper list */}
      <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-bold mb-4">Past Paper Performance</h3>
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <p className="text-gray-400 italic">No papers checked yet. Complete a paper to see your progress!</p>
          ) : (
            [...filteredResults]
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
              .map(result => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-4 border-b-2 border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-bold">{result.subject} — {result.chapter}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(result.submittedAt).toLocaleDateString()} ·{' '}
                      {result.marksAwarded}/{result.totalMarks} marks · Grade {result.grade}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold">{result.percentage}%</div>
                    <div className={`w-3 h-3 rounded-full ${
                      result.percentage >= 80 ? 'bg-green-500'
                      : result.percentage >= 50 ? 'bg-yellow-500'
                      : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};