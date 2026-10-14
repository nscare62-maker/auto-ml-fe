"use client"

import React, { useMemo } from 'react'
import {
  Target,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Activity,
  Layers,
  Scale,
  Cpu,
} from 'lucide-react'
import { Dataset, ProblemConfig, TaskType, EvaluationMetric } from './types'

interface ProblemConfigProps {
  dataset: Dataset
  config: ProblemConfig
  onChangeConfig: (newConfig: ProblemConfig) => void
  onBack: () => void
  onProceed: () => void
}

export function ProblemConfigComponent({
  dataset,
  config,
  onChangeConfig,
  onBack,
  onProceed,
}: ProblemConfigProps) {
  // Infer Target & Task Type if target changes
  const handleTargetChange = (targetColName: string) => {
    const col = dataset.columns.find((c) => c.name === targetColName)
    let detectedTask: TaskType = 'binary_classification'
    let defaultMetric: EvaluationMetric = 'roc_auc'

    if (col) {
      if (col.type === 'numeric' && col.uniqueCount > 10) {
        detectedTask = 'regression'
        defaultMetric = 'rmse'
      } else if (col.uniqueCount > 2) {
        detectedTask = 'multiclass_classification'
        defaultMetric = 'f1'
      } else {
        detectedTask = 'binary_classification'
        defaultMetric = 'roc_auc'
      }
    }

    onChangeConfig({
      ...config,
      targetColumn: targetColName,
      taskType: detectedTask,
      primaryMetric: defaultMetric,
    })
  }

  // Active target column profile
  const targetProfile = useMemo(() => {
    return dataset.columns.find((c) => c.name === config.targetColumn)
  }, [dataset, config.targetColumn])

  // Target class balance for classification
  const classBalance = useMemo(() => {
    if (!targetProfile || config.taskType === 'regression') return []
    const frequencies: Record<string, number> = {}
    dataset.rows.forEach((r) => {
      const v = String(r[config.targetColumn] ?? 'null')
      frequencies[v] = (frequencies[v] || 0) + 1
    })

    return Object.entries(frequencies).map(([label, count]) => ({
      label,
      count,
      pct: Number(((count / dataset.rowCount) * 100).toFixed(1)),
    }))
  }, [dataset, config.targetColumn, config.taskType, targetProfile])

  // Imbalance severity
  const isImbalanced = useMemo(() => {
    if (classBalance.length < 2) return false
    const minPct = Math.min(...classBalance.map((c) => c.pct))
    return minPct < 25
  }, [classBalance])

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
              Stage 2 of 5
            </span>
            <span className="text-xs text-muted-foreground">Target & Objective Setup</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Define Target Variable & Optimization Goal
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Choose what you want the model to predict. Nexus AutoML will automatically detect the mathematical task type and configure the loss metric.
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
            onClick={onProceed}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
          >
            <span>Algorithm Setup</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Target Selector & Target Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Variable Selector Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-foreground">Select Target Variable (Y)</h3>
              </div>
              <span className="text-xs text-indigo-400 font-medium">
                Auto-detected: <span className="font-mono">{config.targetColumn}</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Select the feature you want your trained model to forecast. All other features will be treated as predictor inputs ($X$).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {dataset.columns.map((col) => {
                const isSelected = col.name === config.targetColumn
                return (
                  <button
                    key={col.name}
                    onClick={() => handleTargetChange(col.name)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-xs'
                        : 'border-border/60 hover:border-border hover:bg-muted/40'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-semibold block truncate max-w-[130px] ${isSelected ? 'text-indigo-400' : 'text-foreground'}`}>
                        {col.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {col.type} • {col.uniqueCount} distinct
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Profiling & Distribution Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-foreground">Target Distribution & Balance</h3>
              </div>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
                {config.taskType.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {config.taskType === 'regression' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-xl border border-border/40 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Minimum</span>
                    <span className="font-semibold text-foreground">{targetProfile?.min?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Maximum</span>
                    <span className="font-semibold text-foreground">{targetProfile?.max?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Mean Average</span>
                    <span className="font-semibold text-foreground">{targetProfile?.mean?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Std Dev</span>
                    <span className="font-semibold text-foreground">{targetProfile?.stdDev?.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Continuous numeric target variable. Continuous loss functions (RMSE, MAE, R²) will evaluate residual variance.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {classBalance.map((cls) => (
                    <div key={cls.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-semibold text-foreground">{cls.label}</span>
                        <span className="text-muted-foreground">
                          {cls.count} rows ({cls.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all"
                          style={{ width: `${cls.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {isImbalanced && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      Moderate class imbalance detected. Automatic class-weight balancing is recommended.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Task Settings, Metric, Train/Test Split */}
        <div className="space-y-6">
          {/* Task Type Override & Primary Metric Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Machine Learning Task Type
              </label>
              <select
                value={config.taskType}
                onChange={(e) =>
                  onChangeConfig({ ...config, taskType: e.target.value as TaskType })
                }
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="binary_classification">Binary Classification</option>
                <option value="multiclass_classification">Multiclass Classification</option>
                <option value="regression">Regression (Continuous Value)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Primary Optimization Metric
              </label>
              <select
                value={config.primaryMetric}
                onChange={(e) =>
                  onChangeConfig({ ...config, primaryMetric: e.target.value as EvaluationMetric })
                }
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
              >
                {config.taskType === 'regression' ? (
                  <>
                    <option value="rmse">Root Mean Squared Error (RMSE) - Recommended</option>
                    <option value="mae">Mean Absolute Error (MAE)</option>
                    <option value="r2">R² Coefficient of Determination</option>
                    <option value="mse">Mean Squared Error (MSE)</option>
                  </>
                ) : (
                  <>
                    <option value="roc_auc">Area Under ROC Curve (ROC-AUC) - Recommended</option>
                    <option value="f1">F1-Score (Harmonic Precision/Recall)</option>
                    <option value="accuracy">Accuracy Score</option>
                    <option value="precision">Precision Score</option>
                    <option value="recall">Recall (Sensitivity)</option>
                    <option value="log_loss">Cross-Entropy Log Loss</option>
                  </>
                )}
              </select>
            </div>

            {/* Imbalance Handling */}
            {config.taskType !== 'regression' && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Imbalance Correction Strategy
                </label>
                <select
                  value={config.imbalanceHandling}
                  onChange={(e) =>
                    onChangeConfig({ ...config, imbalanceHandling: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="none">None (Standard Loss)</option>
                  <option value="class_weights">Balanced Class Weights (Inverse Frequency)</option>
                  <option value="smote">SMOTE Synthetic Minority Oversampling</option>
                </select>
              </div>
            )}
          </div>

          {/* Validation & Train/Test Split Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-foreground">Validation Protocol</h3>
            </div>

            {/* Split Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Train / Test Split</span>
                <span className="font-mono font-semibold text-foreground">
                  {(config.trainTestSplit * 100).toFixed(0)}% /{' '}
                  {((1 - config.trainTestSplit) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="0.9"
                step="0.05"
                value={config.trainTestSplit}
                onChange={(e) =>
                  onChangeConfig({ ...config, trainTestSplit: Number(e.target.value) })
                }
                className="w-full accent-indigo-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>60/40</span>
                <span>80/20 (Default)</span>
                <span>90/10</span>
              </div>
            </div>

            {/* K-Fold CV Selector */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Cross-Validation Folds
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 10].map((folds) => (
                  <button
                    key={folds}
                    onClick={() => onChangeConfig({ ...config, cvFolds: folds })}
                    className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      config.cvFolds === folds
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                        : 'border-border/60 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {folds}-Fold CV
                  </button>
                ))}
              </div>
            </div>

            {/* Random Seed */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Random Seed (Reproducibility)
              </label>
              <input
                type="number"
                value={config.randomSeed}
                onChange={(e) =>
                  onChangeConfig({ ...config, randomSeed: Number(e.target.value) || 42 })
                }
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
