/**
 * trend.controller.js — Linear Regression Trend Endpoint
 */

import { getAllResults } from '../services/grading.service.js';
import { linearRegression, buildRegressionPoints } from '../utils/regression.util.js';
import { createError } from '../utils/error.util.js';

/**
 * GET /api/grading/stats/:studentId/trend
 *
 * Returns:
 * {
 *   overall: { slope, intercept, r2, trend, predictedNext, chartPoints },
 *   bySubject: {
 *     Science: { slope, r2, trend, predictedNext, chartPoints },
 *     ...
 *   },
 *   minResults: number   ← how many results needed for a reliable trend
 * }
 */
export async function getTrend(req, res, next) {
  try {
    const { studentId } = req.params;
    const results = await getAllResults({ studentId });

    if (results.length < 2) {
      return res.status(200).json({
        success: true,
        message: 'Need at least 2 results to calculate a trend.',
        overall:   null,
        bySubject: {},
        minResults: 2,
      });
    }

    // ── Overall regression ──────────────────────────────────────────────────
    const overallPoints = buildRegressionPoints(results);
    const overallReg    = linearRegression(overallPoints);
    const overallNext   = overallReg.predict(overallPoints.length + 1);

    const overall = {
      ...overallReg,
      predictedNext: overallNext,
      dataPoints:    overallPoints.length,
      chartPoints:   buildChartPoints(overallPoints, overallReg, 3),
    };

    // ── Per-subject regression ──────────────────────────────────────────────
    const subjectMap = {};
    for (const r of results) {
      if (!subjectMap[r.subject]) subjectMap[r.subject] = [];
      subjectMap[r.subject].push(r);
    }

    const bySubject = {};
    for (const [subject, subResults] of Object.entries(subjectMap)) {
      if (subResults.length < 2) {
        bySubject[subject] = {
          trend:         'stable',
          slope:         0,
          r2:            0,
          predictedNext: subResults[0]?.percentage ?? 0,
          dataPoints:    subResults.length,
          chartPoints:   [],
          insufficient:  true,
        };
        continue;
      }

      const pts = buildRegressionPoints(subResults);
      const reg = linearRegression(pts);
      bySubject[subject] = {
        ...reg,
        predictedNext: reg.predict(pts.length + 1),
        dataPoints:    pts.length,
        chartPoints:   buildChartPoints(pts, reg, 2),
        insufficient:  false,
      };
    }

    res.status(200).json({
      success: true,
      overall,
      bySubject,
      minResults: 2,
    });
  } catch (err) {
    next(createError(err.message, err.status || 500));
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build chart-ready points: actual data + regression line + N future predictions.
 */
function buildChartPoints(points, reg, futurePredictions = 2) {
  const chart = points.map(p => ({
    x:          p.x,
    date:       new Date(p.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    actual:     p.y,
    trend:      reg.predict(p.x),
  }));

  // Add future predicted points
  for (let i = 1; i <= futurePredictions; i++) {
    const x = points.length + i;
    chart.push({
      x,
      date:      `Prediction ${i}`,
      actual:    null,
      trend:     reg.predict(x),
      predicted: true,
    });
  }

  return chart;
}
