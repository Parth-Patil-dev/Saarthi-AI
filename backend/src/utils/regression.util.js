/**
 * regression.util.js — Simple Linear Regression
 *
 * Given an array of {x, y} points, computes:
 *   - slope (m)
 *   - intercept (b)
 *   - R² (coefficient of determination — confidence 0..1)
 *   - predict(x) function
 *   - trend: 'improving' | 'declining' | 'stable'
 */

export function linearRegression(points) {
  const n = points.length;

  if (n === 0) return null;
  if (n === 1) {
    return {
      slope:     0,
      intercept: points[0].y,
      r2:        0,
      trend:     'stable',
      predict:   () => points[0].y,
    };
  }

  const sumX  = points.reduce((s, p) => s + p.x, 0);
  const sumY  = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denom = sumX2 - n * meanX * meanX;

  // All x values identical — can't fit a line
  if (denom === 0) {
    return {
      slope:     0,
      intercept: meanY,
      r2:        0,
      trend:     'stable',
      predict:   () => meanY,
    };
  }

  const slope     = (sumXY - n * meanX * meanY) / denom;
  const intercept = meanY - slope * meanX;

  // R² — how well the line fits the data
  const ssTot = points.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssRes = points.reduce((s, p) => {
    const predicted = slope * p.x + intercept;
    return s + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  // Trend threshold: >0.5 pts/attempt = improving, <-0.5 = declining
  const trend = slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable';

  const predict = (x) => {
    const val = slope * x + intercept;
    return Math.min(100, Math.max(0, Math.round(val * 10) / 10));
  };

  return { slope: Math.round(slope * 100) / 100, intercept: Math.round(intercept * 10) / 10, r2: Math.round(r2 * 1000) / 1000, trend, predict };
}

/**
 * Build regression points from an array of result objects.
 * Sorts by submittedAt ascending, assigns x = 1..n.
 */
export function buildRegressionPoints(results) {
  return [...results]
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .map((r, i) => ({ x: i + 1, y: r.percentage, label: r.chapter, date: r.submittedAt }));
}
