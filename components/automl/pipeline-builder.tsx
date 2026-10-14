"use client"

import React from 'react'
import {
  Cpu,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  Shield,
  Layers,
  Flame,
} from 'lucide-react'
import { PipelineConfig, ProblemConfig, MLAlgorithm } from './types'
import { ALGORITHM_OPTIONS } from './ml-engine'

interface PipelineBuilderProps {
  problemConfig: ProblemConfig
  pipelineConfig: PipelineConfig
  onChangePipelineConfig: (config: PipelineConfig) => void
  onBack: () => void
  onStartTraining: () => void
}

export function PipelineBuilderComponent({
  problemConfig,
  pipelineConfig,
  onChangePipelineConfig,
  onBack,
  onStartTraining,
}: PipelineBuilderProps) {
  // Filter compatible algorithms
  const compatibleAlgorithms = ALGORITHM_OPTIONS.filter((alg) =>
    alg.supportedTasks.includes(problemConfig.taskType)
  )

  const toggleAlgorithm = (algoId: MLAlgorithm) => {
    const isSelected = pipelineConfig.selectedAlgorithms.includes(algoId)
    let updated: MLAlgorithm[]

    if (isSelected) {
      if (pipelineConfig.selectedAlgorithms.length === 1) {
        return // keep at least 1
      }
      updated = pipelineConfig.selectedAlgorithms.filter((id) => id !== algoId)
    } else {
      updated = [...pipelineConfig.selectedAlgorithms, algoId]
    }

    onChangePipelineConfig({ ...pipelineConfig, selectedAlgorithms: updated })
  }

  // Preset selectors
  const applyPreset = (preset: 'all' | 'top_accuracy' | 'fastest') => {
    let selected: MLAlgorithm[] = []
    if (preset === 'all') {
      selected = compatibleAlgorithms.map((a) => a.id)
    } else if (preset === 'top_accuracy') {
      selected = compatibleAlgorithms
        .filter((a) => a.accuracyRating === 'very_high' || a.id === 'stacking_ensemble')
        .map((a) => a.id)
    } else if (preset === 'fastest') {
      selected = compatibleAlgorithms
        .filter((a) => a.speedRating === 'fast')
        .map((a) => a.id)
    }

    if (selected.length === 0) selected = ['xgboost', 'random_forest']
    onChangePipelineConfig({ ...pipelineConfig, selectedAlgorithms: selected })
  }

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              Stage 3 of 5
            </span>
            <span className="text-xs text-muted-foreground">Pipeline & Algorithm Builder</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Configure Candidate Models & Hyperparameter Strategy
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Select the algorithms to compete in the AutoML tournament. The engine will tune hyperparameters and synthesize ensemble models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <button
            onClick={onStartTraining}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-indigo-700 transition-all cursor-pointer"
          >
            <Flame className="h-4 w-4" />
            <span>Launch AutoML Arena</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preset Quick Filters */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Quick Presets:</span>
          <button
            onClick={() => applyPreset('top_accuracy')}
            className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-all"
          >
            🏆 High Accuracy (Boosters + Ensemble)
          </button>
          <button
            onClick={() => applyPreset('fastest')}
            className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-all"
          >
            ⚡ Ultra-Fast Search (Trees + Linear)
          </button>
          <button
            onClick={() => applyPreset('all')}
            className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted transition-all"
          >
            Select All ({compatibleAlgorithms.length})
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          <strong className="text-foreground">{pipelineConfig.selectedAlgorithms.length}</strong> of{' '}
          {compatibleAlgorithms.length} models selected
        </span>
      </div>

      {/* Candidate Algorithms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {compatibleAlgorithms.map((algo) => {
          const isSelected = pipelineConfig.selectedAlgorithms.includes(algo.id)
          return (
            <div
              key={algo.id}
              onClick={() => toggleAlgorithm(algo.id)}
              className={`rounded-2xl border p-4.5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500/80 bg-card shadow-sm ring-1 ring-indigo-500/30'
                  : 'border-border/60 bg-card/60 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        algo.id === 'stacking_ensemble'
                          ? 'bg-amber-500/20 text-amber-400'
                          : isSelected
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {algo.name}
                        {algo.id === 'stacking_ensemble' && (
                          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                            META
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {algo.family.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-border" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                  {algo.description}
                </p>
              </div>

              {/* Badges footer */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Speed:</span>
                  <span
                    className={`font-semibold capitalize ${
                      algo.speedRating === 'fast'
                        ? 'text-emerald-400'
                        : algo.speedRating === 'medium'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {algo.speedRating}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Quality:</span>
                  <span
                    className={`font-semibold capitalize ${
                      algo.accuracyRating === 'very_high'
                        ? 'text-purple-400'
                        : algo.accuracyRating === 'high'
                          ? 'text-blue-400'
                          : 'text-zinc-400'
                    }`}
                  >
                    {algo.accuracyRating.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Advanced Optimization & Feature Engineering Tuning Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Hyperparameter Optimization Settings */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-foreground">
              Hyperparameter Search & Compute Budget
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Tuning Search Algorithm
              </label>
              <select
                value={pipelineConfig.tuningStrategy}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    tuningStrategy: e.target.value as any,
                  })
                }
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="bayesian">Bayesian Optimization (TPE) - Recommended</option>
                <option value="random">Randomized Search (Fast exploration)</option>
                <option value="hyperband">Hyperband (Adaptive resource allocation)</option>
                <option value="grid">Grid Search (Deterministic lattice)</option>
              </select>
            </div>

            {/* Time Budget */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Time Budget Limit</span>
                <span className="font-mono font-semibold text-foreground">
                  {pipelineConfig.timeBudgetMinutes} minute
                  {pipelineConfig.timeBudgetMinutes > 1 ? 's' : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={pipelineConfig.timeBudgetMinutes}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    timeBudgetMinutes: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1 min (Rapid)</span>
                <span>5 min (Standard)</span>
                <span>15 min (Deep Search)</span>
              </div>
            </div>

            {/* Max Trials */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Max Optimization Trials per Model</span>
                <span className="font-mono font-semibold text-foreground">
                  {pipelineConfig.maxTrials} trials
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={pipelineConfig.maxTrials}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    maxTrials: Number(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Automated Feature Engineering Settings */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-foreground">Automated Feature Engineering</h3>
          </div>

          <p className="text-xs text-muted-foreground">
            Nexus AutoML synthesizes derived features and ranks predictive importance before model fitting.
          </p>

          <div className="space-y-3 text-xs">
            {/* Polynomial Feature Interaction */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={pipelineConfig.featureEngineering.enablePolynomial}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    featureEngineering: {
                      ...pipelineConfig.featureEngineering,
                      enablePolynomial: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-foreground block">
                  Non-linear Feature Interactions ($X_i \times X_j$)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Generates multiplicative feature pairs for top numerical drivers to capture synergistic effects.
                </span>
              </div>
            </label>

            {/* Feature Selection */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={pipelineConfig.featureEngineering.enableFeatureSelection}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    featureEngineering: {
                      ...pipelineConfig.featureEngineering,
                      enableFeatureSelection: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-foreground block">
                  Mutual Information & Importance Pruning
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Discards noisy and collinear features using Gini impurity and variance threshold filters.
                </span>
              </div>
            </label>

            {/* Datetime Features */}
            <label className="flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={pipelineConfig.featureEngineering.extractDateFeatures}
                onChange={(e) =>
                  onChangePipelineConfig({
                    ...pipelineConfig,
                    featureEngineering: {
                      ...pipelineConfig.featureEngineering,
                      extractDateFeatures: e.target.checked,
                    },
                  })
                }
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="font-semibold text-foreground block">
                  Cyclical Calendar Decomposition
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Extracts DayOfWeek, Month, IsWeekend, and sin/cos cyclical temporal encodings.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
