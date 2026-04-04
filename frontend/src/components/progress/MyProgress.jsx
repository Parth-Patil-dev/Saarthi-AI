import React, { useState, useMemo, useEffect } from 'react';
import {
  Area, AreaChart, Line, ComposedChart,
  CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis, ReferenceLine, Legend
} from 'recharts';
import {
  Activity, AlertCircle, X, TrendingUp,
  TrendingDown, Minus, Target, Zap, Brain
} from 'lucide-react';

const BASE_URL   = 'http://localhost:3000';
const STUDENT_ID = 'student-default';

const api = {
  async getStats() {
    const res  = await fetch(`${BASE_URL}/api/grading/stats/${STUDENT_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.stats;
  },
  async getResults() {
    const res  = await fetch(`${BASE_URL}/api/grading/results?studentId=${STUDENT_ID}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message);
    return data.results;
  },
  async getSubjects() {
    const res  = await fetch(`${BASE_URL}/api/question-paper/subjects`);
    const data = await res.json();
    return data.subjects || [];
  },
  async getTrend() {
    const res  = await fetch(`${BASE_URL}/api/grading/stats/${STUDENT_ID}/trend`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message);
    return data;
  },
};

// ── Trend badge ───────────────────────────────────────────────────────────────
function TrendBadge({ trend, slope }) {
  const config = {
    improving: { icon: TrendingUp,   bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-700',  label: 'Improving' },
    declining:  { icon: TrendingDown, bg: 'bg-red-100',    border: 'border-red-400',    text: 'text-red-700',    label: 'Declining'  },
    stable:     { icon: Minus,        bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', label: 'Stable'     },
  };
  const c    = config[trend] || config.stable;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 font-bold text-sm ${c.bg} ${c.border} ${c.text}`}>
      <Icon size={14} />
      {c.label}
      <span className="text-xs font-normal opacity-70">
        ({slope > 0 ? '+' : ''}{slope}%/attempt)
      </span>
    </span>
  );
}

// ── R² confidence bar ─────────────────────────────────────────────────────────
function ConfidenceBar({ r2 }) {
  const pct   = Math.round(r2 * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Confidence</span>
      <div className="flex-1 h-2 bg-gray-100 border border-gray-200">
        <div className={`h-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold w-12 text-right">R²={pct}%</span>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-bold min-w-[160px]">
      <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
          <span>{p.name === 'actual' ? 'Score' : 'Trend'}</span>
          <span>{p.value != null ? `${p.value}%` : '—'}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export const MyProgress = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [stats,    setStats]    = useState(null);
  const [results,  setResults]  = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [trend,    setTrend]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getStats(), api.getResults(), api.getSubjects(), api.getTrend()])
      .then(([s, r, sub, t]) => { setStats(s); setResults(r); setSubjects(sub); setTrend(t); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = useMemo(() => {
    if (selectedSubject === 'All') return results;
    return results.filter(r => r.subject === selectedSubject);
  }, [results, selectedSubject]);

  const averageScore = useMemo(() => {
    if (selectedSubject === 'All') return stats?.averageScore ?? 0;
    return stats?.bySubject?.[selectedSubject]?.average ?? 0;
  }, [stats, selectedSubject]);

  const subjectBreakdown = useMemo(() =>
    Object.entries(stats?.bySubject || {}).map(([name, d]) => ({
      name, avg: d.average, count: d.attempts,
    })), [stats]);

  const activeTrend = useMemo(() => {
    if (!trend) return null;
    if (selectedSubject === 'All') return trend.overall;
    return trend.bySubject?.[selectedSubject] || null;
  }, [trend, selectedSubject]);

  const subjectsStudied = useMemo(() => new Set(results.map(r => r.subject)).size, [results]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">

      {error && (
        <div className="flex items-center gap-3 p-4 border-2 border-red-500 bg-red-50 text-red-700 font-bold">
          <AlertCircle size={20} /><span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold handwritten">My Progress</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Filter:</span>
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
          <div className="text-sm text-gray-500 uppercase font-bold mb-1">Avg Score</div>
          <div className="text-4xl font-bold text-blue-600">{averageScore}%</div>
        </div>
        <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-sm text-gray-500 uppercase font-bold mb-1">Total Attempts</div>
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

      {/* ── Trend Panel ─────────────────────────────────────────────────────── */}
      {activeTrend && !activeTrend.insufficient ? (
        <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl font-bold handwritten flex items-center gap-2">
              <Brain size={20} /> AI Trend Analysis — {selectedSubject}
            </h3>
            <TrendBadge trend={activeTrend.trend} slope={activeTrend.slope} />
          </div>

          <ConfidenceBar r2={activeTrend.r2} />

          {/* Prediction cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border-2 border-black bg-blue-50">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Target size={14} /> Predicted Next Score
              </div>
              <div className="text-3xl font-bold text-blue-700">{activeTrend.predictedNext}%</div>
              <div className="text-xs text-gray-500 mt-1">Based on your trend line</div>
            </div>
            <div className="p-4 border-2 border-black bg-gray-50">
              <div className="flex items-center gap-2 text-gray-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Zap size={14} /> Data Points
              </div>
              <div className="text-3xl font-bold text-gray-700">{activeTrend.dataPoints}</div>
              <div className="text-xs text-gray-500 mt-1">
                {activeTrend.r2 < 0.4
                  ? 'Low confidence — submit more attempts'
                  : activeTrend.r2 < 0.7
                    ? 'Moderate confidence'
                    : 'High confidence trend'}
              </div>
            </div>
          </div>

          {/* Chart */}
          {activeTrend.chartPoints?.length >= 2 && (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeTrend.chartPoints}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 'bold' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 'bold' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={v => v === 'actual' ? 'Your Score' : 'Trend Line (Linear Regression)'}
                  />
                  <ReferenceLine
                    x={activeTrend.chartPoints.find(p => p.predicted)?.date}
                    stroke="#9ca3af"
                    strokeDasharray="4 4"
                    label={{ value: 'Predicted →', position: 'insideTopLeft', fontSize: 10, fill: '#9ca3af' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="actual"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#actualGrad)"
                    dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                    animationDuration={1200}
                  />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    name="trend"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={(props) => {
                      if (props.payload?.predicted) {
                        return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#f59e0b" stroke="#000" strokeWidth={2} />;
                      }
                      return <React.Fragment key={props.key} />;
                    }}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : activeTrend?.insufficient ? (
        <div className="p-6 border-2 border-dashed border-gray-300 text-center text-gray-400 font-bold">
          Need at least 2 {selectedSubject} attempts to calculate a trend.
        </div>
      ) : !trend?.overall ? (
        <div className="p-6 border-2 border-dashed border-gray-300 text-center text-gray-400 font-bold">
          Complete at least 2 assessments to see your AI trend analysis.
        </div>
      ) : null}

      {/* Best / Worst topics */}
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
            {subjectBreakdown.map(subject => {
              const subTrend = trend?.bySubject?.[subject.name];
              return (
                <div
                  key={subject.name}
                  onClick={() => setSelectedSubject(subject.name)}
                  className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-lg group-hover:text-blue-600 transition-colors">{subject.name}</div>
                    {subTrend && !subTrend.insufficient && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 border ${
                        subTrend.trend === 'improving' ? 'bg-green-100 border-green-400 text-green-700'
                        : subTrend.trend === 'declining' ? 'bg-red-100 border-red-400 text-red-700'
                        : 'bg-yellow-100 border-yellow-400 text-yellow-700'
                      }`}>
                        {subTrend.trend === 'improving' ? '↑' : subTrend.trend === 'declining' ? '↓' : '→'}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-bold">Avg</div>
                      <div className="text-2xl font-bold">{subject.avg}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold">Attempts</div>
                      <div className="text-lg font-bold">{subject.count}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${subject.avg >= 80 ? 'bg-green-500' : subject.avg >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${subject.avg}%` }}
                    />
                  </div>
                  {subTrend && !subTrend.insufficient && (
                    <div className="text-xs text-gray-400 mt-1.5">
                      Next predicted: <span className="font-bold text-black">{subTrend.predictedNext}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By difficulty */}
      {selectedSubject === 'All' && stats?.byDifficulty && Object.keys(stats.byDifficulty).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold handwritten">By Difficulty</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.byDifficulty).map(([level, data]) => (
              <div key={level} className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[140px]">
                <div className="text-xs text-gray-500 uppercase font-bold mb-1 capitalize">{level}</div>
                <div className="text-2xl font-bold">{data.average}%</div>
                <div className="text-xs text-gray-400">{data.attempts} attempt{data.attempts !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past paper list */}
      <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-bold mb-4">Past Paper Performance</h3>
        <div className="space-y-3">
          {filteredResults.length === 0 ? (
            <p className="text-gray-400 italic">No papers checked yet.</p>
          ) : (
            [...filteredResults]
              .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
              .map(result => (
                <div key={result.id} className="flex items-center justify-between p-4 border-b-2 border-gray-100 last:border-0">
                  <div>
                    <div className="font-bold">{result.subject} — {result.chapter}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(result.submittedAt).toLocaleDateString()} · {result.marksAwarded}/{result.totalMarks} marks · Grade {result.grade}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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