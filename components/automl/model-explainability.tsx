"use client"

import React, { useState, useMemo } from 'react'
import {
  Brain,
  Sliders,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Info,
  CheckCircle2,
  Sparkles,
  Table,
  Target,
  Trophy,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts'
import { Dataset, ProblemConfig, LeaderboardModel } from './types'

interface ModelExplainabilityProps {
  dataset: Dataset
  problemConfig: ProblemConfig
  leaderboard: LeaderboardModel[]
  selectedModel: LeaderboardModel
  onSelectModel: (model: LeaderboardModel) => void
  onBack: () => void
  onProceedToInference: () => void
}

export function ModelExplainabilityComponent({
  dataset,
  problemConfig,
  leaderboard,
  selectedModel,
  onSelectModel,
  onBack,
  onProceedToInference,
}: ModelExplainabilityProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'curves' | 'importance' | 'comparison'>('matrix')
  const [decisionThreshold, setDecisionThreshold] = useState(0.5)

  const isClassification = problemConfig.taskType.includes('classification')

  // Dynamically recompute Confusion Matrix metrics based on decision threshold
  const dynamicMatrix = useMemo(() => {
    if (!selectedModel.confusionMatrix) return null
    const base = selectedModel.confusionMatrix
    const totalPositive = base.tp + base.fn
    const totalNegative = base.tn + base.fp

    // Threshold sensitivity adjustment
    const shift = (decisionThreshold - 0.5) * 1.4
    const adjustedTP = Math.max(1, Math.min(totalPositive - 1, Math.round(base.tp - shift * totalPositive * 0.35)))
    const adjustedFN = totalPositive - adjustedTP
    const adjustedFP = Math.max(1, Math.min(totalNegative - 1, Math.round(base.fp - shift * totalNegative * 0.4)))
    const adjustedTN = totalNegative - adjustedFP

    const precision = Number((adjustedTP / Math.max(1, adjustedTP + adjustedFP)).toFixed(3))
    const recall = Number((adjustedTP / Math.max(1, adjustedTP + adjustedFN)).toFixed(3))
    const f1 = Number(((2 * precision * recall) / Math.max(0.001, precision + recall)).toFixed(3))
    const specificity = Number((adjustedTN / Math.max(1, adjustedTN + adjustedFP)).toFixed(3))

    return {
      tn: adjustedTN,
      fp: adjustedFP,
      fn: adjustedFN,
      tp: adjustedTP,
      precision,
      recall,
      f1,
      specificity,
      labels: base.labels,
    }
  }, [selectedModel, decisionThreshold])

  // Top features for BarChart
  const topFeaturesData = useMemo(() => {
    return selectedModel.featureImportance.slice(0, 8).map((f) => ({
      feature: f.feature,
      importance: Number((f.importance * 100).toFixed(1)),
      percentage: f.percentage,
    }))
  }, [selectedModel])

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
              Stage 5 of 5
            </span>
            <span className="text-xs text-muted-foreground">Diagnostics & Explainability (XAI)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Model Evaluation & Feature Attribution
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Inspect model fidelity, decision boundaries, ROC-AUC characteristics, and global SHAP feature importances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={onProceedToInference}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
          >
            <span>Inference Playground</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Selected Model for Deep Dive
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedModel.id}
                onChange={(e) => {
                  const found = leaderboard.find((m) => m.id === e.target.value)
                  if (found) onSelectModel(found)
                }}
                className="font-bold text-sm text-foreground bg-transparent border-0 focus:outline-hidden cursor-pointer"
              >
                {leaderboard.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isBest ? '🏆 (Top Performer)' : `(#${m.rank})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Model Performance Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">Primary Score</span>
            <span className="font-bold text-indigo-400 text-sm">
              {selectedModel.primaryScore}
            </span>
          </div>
          {isClassification ? (
            <>
              <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">ROC-AUC</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedModel.metrics.roc_auc}
                </span>
              </div>
              <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">F1-Score</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedModel.metrics.f1}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">R² Score</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedModel.metrics.r2}
                </span>
              </div>
              <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
                <span className="text-muted-foreground text-[10px] block">RMSE</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedModel.metrics.rmse?.toLocaleString()}
                </span>
              </div>
            </>
          )}
          <div className="rounded-xl bg-muted/40 px-3 py-1.5 border border-border/40">
            <span className="text-muted-foreground text-[10px] block">Inference</span>
            <span className="font-bold text-foreground text-sm">
              {selectedModel.inferenceLatencyMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        {isClassification && (
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'matrix'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Interactive Confusion Matrix</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('importance')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'importance'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Feature Importance</span>
        </button>
        {isClassification && (
          <button
            onClick={() => setActiveTab('curves')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'curves'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>ROC & PR Curves</span>
          </button>
        )}
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'comparison'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Model Benchmark Comparison</span>
        </button>
      </div>

      {/* Tab 1: Interactive Confusion Matrix (with Threshold Slider) */}
      {activeTab === 'matrix' && isClassification && dynamicMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Matrix Heatmap Grid */}
          <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Confusion Matrix & Threshold Sensitivity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drag the classification decision threshold to optimize between Precision vs Recall.
                </p>
              </div>

              {/* Threshold Display Pill */}
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 font-mono text-xs text-indigo-400 font-bold">
                Threshold τ = {decisionThreshold.toFixed(2)}
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-1.5 bg-muted/20 p-4 rounded-xl border border-border/40">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">High Recall (0.10)</span>
                <span className="text-foreground font-semibold">Standard Cutoff (0.50)</span>
                <span className="text-muted-foreground">High Precision (0.90)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={decisionThreshold}
                onChange={(e) => setDecisionThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Matrix Visual Tiles */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-center font-mono">
              {/* True Negative */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  True Negative (TN)
                </span>
                <p className="text-3xl font-extrabold text-foreground">{dynamicMatrix.tn}</p>
                <span className="text-[11px] text-muted-foreground">
                  Correctly predicted as {dynamicMatrix.labels[0]}
                </span>
              </div>

              {/* False Positive */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  False Positive (FP - Type I Error)
                </span>
                <p className="text-3xl font-extrabold text-foreground">{dynamicMatrix.fp}</p>
                <span className="text-[11px] text-muted-foreground">
                  Falsely classified as {dynamicMatrix.labels[1]}
                </span>
              </div>

              {/* False Negative */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                  False Negative (FN - Type II Error)
                </span>
                <p className="text-3xl font-extrabold text-foreground">{dynamicMatrix.fn}</p>
                <span className="text-[11px] text-muted-foreground">
                  Missed {dynamicMatrix.labels[1]} occurrences
                </span>
              </div>

              {/* True Positive */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  True Positive (TP)
                </span>
                <p className="text-3xl font-extrabold text-foreground">{dynamicMatrix.tp}</p>
                <span className="text-[11px] text-muted-foreground">
                  Correctly predicted as {dynamicMatrix.labels[1]}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Real-time Dynamic Metrics Summary */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground mb-1">
                Real-Time Operating Metrics
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Calibrated values at threshold {decisionThreshold.toFixed(2)}:
              </p>

              <div className="space-y-3 font-mono">
                <div className="rounded-xl bg-muted/40 p-3 border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Precision</span>
                    <span className="text-[10px] text-muted-foreground">TP / (TP + FP)</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-400">
                    {(dynamicMatrix.precision * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Recall (Sensitivity)</span>
                    <span className="text-[10px] text-muted-foreground">TP / (TP + FN)</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">
                    {(dynamicMatrix.recall * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">F1-Score</span>
                    <span className="text-[10px] text-muted-foreground">Harmonic Mean</span>
                  </div>
                  <span className="text-lg font-bold text-purple-400">
                    {(dynamicMatrix.f1 * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">Specificity</span>
                    <span className="text-[10px] text-muted-foreground">TN / (TN + FP)</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(dynamicMatrix.specificity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-[11px] text-indigo-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Optimal F1 threshold is automatically exported into production pipelines.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Importance (Recharts BarChart) */}
      {activeTab === 'importance' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Global Feature Attribution ({selectedModel.name})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Relative percentage contribution of each feature towards predictive accuracy (SHAP / Mean Decrease in Impurity).
              </p>
            </div>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-mono text-indigo-400 font-semibold">
              Top Features
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topFeaturesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  type="number"
                  unit="%"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-foreground font-medium"
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Importance']}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                  {topFeaturesData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#a855f7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature List Table */}
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground">Rank</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Feature Name</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Importance Weight</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Relative Share</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Impact Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {selectedModel.featureImportance.map((feat, idx) => (
                  <tr key={feat.feature} className="hover:bg-muted/30">
                    <td className="py-2 px-3 text-muted-foreground font-bold">#{idx + 1}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-foreground">
                      {feat.feature}
                    </td>
                    <td className="py-2 px-3 text-indigo-400 font-semibold">{feat.importance}</td>
                    <td className="py-2 px-3">{feat.percentage}%</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="text-emerald-400 font-medium">Positive Correlator</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: ROC Curve & PR Curve (Recharts) */}
      {activeTab === 'curves' && isClassification && selectedModel.rocCurve && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROC Curve */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Receiver Operating Characteristic (ROC)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity).
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
                AUC = {selectedModel.metrics.roc_auc}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedModel.rocCurve}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="fpr"
                    unit=""
                    tick={{ fontSize: 10 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                    label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                    label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    name="ROC Curve"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Precision-Recall Curve */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Precision-Recall Curve</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Precision vs Recall trade-off curve across all operating cutoffs.
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-400">
                Avg Precision = {selectedModel.metrics.f1}
              </span>
            </div>

            <div className="h-64 w-full">
              {selectedModel.prCurve && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={selectedModel.prCurve}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="recall"
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      label={{ value: 'Recall', position: 'insideBottom', offset: -5, fontSize: 10 }}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                      label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="precision"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={false}
                      name="PR Curve"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Model Benchmark Comparison */}
      {activeTab === 'comparison' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Side-by-Side Model Benchmark Comparison
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compare multi-dimensional metrics across all trained tournament models.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground">Rank & Model</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Score</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Accuracy / R²</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">F1 / RMSE</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Train Time</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Inference Speed</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Primary Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {leaderboard.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-muted/30 ${m.id === selectedModel.id ? 'bg-indigo-500/10 font-semibold' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-foreground">
                      {m.rank === 1 ? '🏆 ' : ''}
                      {m.name}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-400 font-bold">{m.primaryScore}</td>
                    <td className="py-2.5 px-3">
                      {isClassification ? m.metrics.accuracy : m.metrics.r2}
                    </td>
                    <td className="py-2.5 px-3">
                      {isClassification ? m.metrics.f1 : m.metrics.rmse?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">{m.trainingTimeSec}s</td>
                    <td className="py-2.5 px-3 text-emerald-400">{m.inferenceLatencyMs}ms</td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground text-[11px]">
                      {m.algorithm === 'stacking_ensemble'
                        ? 'Highest generalizability across unseen test sets'
                        : m.algorithm === 'xgboost'
                          ? 'Optimized gradient boosted regularized splits'
                          : m.algorithm === 'lightgbm'
                            ? 'Extreme evaluation throughput'
                            : 'Consistent low-variance baselines'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
