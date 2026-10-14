"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Cpu,
  Trophy,
  Flame,
  Terminal,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  Dataset,
  ProblemConfig,
  PipelineConfig,
  LeaderboardModel,
  TrainingLogEntry,
  TrainingStage,
} from './types'
import { createTrainedModel } from './ml-engine'

interface TrainingArenaProps {
  dataset: Dataset
  problemConfig: ProblemConfig
  pipelineConfig: PipelineConfig
  leaderboard: LeaderboardModel[]
  onUpdateLeaderboard: (models: LeaderboardModel[]) => void
  onSelectModelForDeepDive: (model: LeaderboardModel) => void
  onBack: () => void
  onProceedToDiagnostics: () => void
}

export function TrainingArenaComponent({
  dataset,
  problemConfig,
  pipelineConfig,
  leaderboard,
  onUpdateLeaderboard,
  onSelectModelForDeepDive,
  onBack,
  onProceedToDiagnostics,
}: TrainingArenaProps) {
  const [isRunning, setIsRunning] = useState(true)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [logs, setLogs] = useState<TrainingLogEntry[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [copiedLog, setCopiedLog] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  const stages: TrainingStage[] = [
    { id: 'validation', name: 'Schema Validation & Data Sanitization', status: activeStageIndex > 0 ? 'completed' : activeStageIndex === 0 ? 'in_progress' : 'pending', progress: 100 },
    { id: 'cv_split', name: `${problemConfig.cvFolds}-Fold Stratified Cross-Validation Splitting`, status: activeStageIndex > 1 ? 'completed' : activeStageIndex === 1 ? 'in_progress' : 'pending', progress: 100 },
    { id: 'preprocessing', name: 'Feature Imputation, Outlier Clipping & Scaling', status: activeStageIndex > 2 ? 'completed' : activeStageIndex === 2 ? 'in_progress' : 'pending', progress: 100 },
    { id: 'model_tuning', name: 'Candidate Model Execution & Bayesian Tuning', status: activeStageIndex > 3 ? 'completed' : activeStageIndex === 3 ? 'in_progress' : 'pending', progress: 100 },
    { id: 'ensembling', name: 'Super Stacking Meta-Ensemble Blending', status: activeStageIndex > 4 ? 'completed' : activeStageIndex === 4 ? 'in_progress' : 'pending', progress: 100 },
    { id: 'artifacts', name: 'Final Artifact Serialization & Calibration', status: activeStageIndex >= 5 ? 'completed' : 'pending', progress: 100 },
  ]

  // Training simulation effect
  useEffect(() => {
    if (!isRunning) return

    // Initialize simulation if starting fresh
    if (leaderboard.length === 0 || currentProgress === 0) {
      setLogs([
        {
          id: 'log-0',
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `[INIT] Nexus AutoML Tournament launched for dataset "${dataset.name}" (${dataset.rowCount} rows, ${dataset.columnCount} columns).`,
        },
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `[SETUP] Target: "${problemConfig.targetColumn}" | Task: ${problemConfig.taskType} | Primary Metric: ${problemConfig.primaryMetric.toUpperCase()}.`,
        },
      ])
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    // Progression of stages & models
    let currentStep = 0
    const totalSteps = pipelineConfig.selectedAlgorithms.length + 3
    const interval = setInterval(() => {
      currentStep++
      const progressPct = Math.min(100, Math.round((currentStep / totalSteps) * 100))
      setCurrentProgress(progressPct)

      // Add stage advancement and logs
      if (currentStep === 1) {
        setActiveStageIndex(1)
        addLog('info', `[CV] Created ${problemConfig.cvFolds}-fold stratified partitions with random_seed=${problemConfig.randomSeed}.`)
      } else if (currentStep === 2) {
        setActiveStageIndex(2)
        addLog('info', `[PREPROC] Applied missing imputation (${pipelineConfig.preprocessing.missingImputation}) and scaling (${pipelineConfig.preprocessing.scalingMethod}).`)
      } else if (currentStep >= 3 && currentStep < 3 + pipelineConfig.selectedAlgorithms.length) {
        setActiveStageIndex(3)
        const algoIdx = currentStep - 3
        const algo = pipelineConfig.selectedAlgorithms[algoIdx]
        addLog('info', `[TUNE] Optimizing ${algo.toUpperCase()} hyperparameters using ${pipelineConfig.tuningStrategy} search...`)

        // Synthesize model
        const isBestCandidate = algo === 'stacking_ensemble' || (algoIdx === 0 && !pipelineConfig.selectedAlgorithms.includes('stacking_ensemble'))
        const model = createTrainedModel(algo, dataset, problemConfig, algoIdx + 1, isBestCandidate)

        onUpdateLeaderboard((prev) => {
          const updated = [...prev.filter((m) => m.algorithm !== algo), model]
          // Sort by primary score descending
          return updated.sort((a, b) => b.primaryScore - a.primaryScore).map((m, idx) => ({ ...m, rank: idx + 1, isBest: idx === 0 }))
        })

        addLog('success', `[COMPLETED] ${model.name} finished. ${problemConfig.primaryMetric.toUpperCase()}: ${model.primaryScore} (Train latency: ${model.trainingTimeSec}s).`)
      } else if (currentStep >= totalSteps) {
        setActiveStageIndex(5)
        addLog('success', `[DONE] AutoML Tournament finished! Best model identified and artifacts calibrated.`)
        setIsRunning(false)
        clearInterval(interval)
      }
    }, 1800)

    return () => {
      clearInterval(timer)
      clearInterval(interval)
    }
  }, [isRunning])

  const addLog = (level: TrainingLogEntry['level'], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
      },
    ])
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  // Active best model for chart
  const bestModel = leaderboard.find((m) => m.isBest) || leaderboard[0]
  const displayModel = (selectedModelId && leaderboard.find((m) => m.id === selectedModelId)) || bestModel

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedLog(true)
    setTimeout(() => setCopiedLog(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              Stage 4 of 5
            </span>
            <span className="text-xs text-muted-foreground">AutoML Training Arena</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Live Model Tournament & Leaderboard
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Candidate algorithms are actively training and tuning hyperparameters across cross-validation folds. Real-time metrics stream live into the leaderboard.
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
            onClick={onProceedToDiagnostics}
            disabled={leaderboard.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer disabled:opacity-40"
          >
            <span>Model Diagnostics & XAI</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress & Live Status Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isRunning
                  ? 'bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-400'
              }`}
            >
              {isRunning ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  {isRunning ? 'AutoML Pipeline Active' : 'Tournament Complete'}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isRunning
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {isRunning ? 'TRAINING' : 'FINISHED'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stages[activeStageIndex]?.name || 'Pipeline finalized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Elapsed: <strong>{String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}s</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Trained: <strong>{leaderboard.length}/{pipelineConfig.selectedAlgorithms.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Global Progress</span>
            <span className="text-indigo-400 font-mono">{currentProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Multi-Stage Step Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-border/60">
          {stages.map((st, idx) => (
            <div
              key={st.id}
              className={`rounded-xl p-2 text-[11px] border transition-all ${
                st.status === 'completed'
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
                  : st.status === 'in_progress'
                    ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-400 font-semibold ring-1 ring-indigo-500/30'
                    : 'border-border/40 bg-muted/20 text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {st.status === 'completed' ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                ) : st.status === 'in_progress' ? (
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping shrink-0" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground shrink-0" />
                )}
                <span className="font-mono text-[9px] text-muted-foreground">0{idx + 1}</span>
              </div>
              <p className="line-clamp-2 leading-tight text-[10px]">{st.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table & Learning Curve Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Model Leaderboard (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-foreground">Model Leaderboard</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Sorted by <strong className="text-foreground">{problemConfig.primaryMetric.toUpperCase()}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-muted/60 border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-12 text-center">Rank</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Model Architecture</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">{problemConfig.primaryMetric.toUpperCase()}</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Val Score</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Test Score</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground">Train (s)</th>
                  <th className="py-2.5 px-3 font-semibold text-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                      Training models... Leaderboard entries will populate shortly.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((m) => {
                    const isSelected = displayModel?.id === m.id
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedModelId(m.id)}
                        className={`transition-colors cursor-pointer ${
                          m.isBest
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : isSelected
                              ? 'bg-indigo-500/5 hover:bg-indigo-500/10'
                              : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-bold">
                          {m.rank === 1 ? (
                            <span className="text-amber-400 font-bold">🏆 #1</span>
                          ) : m.rank === 2 ? (
                            <span className="text-zinc-300 font-bold">🥈 #2</span>
                          ) : m.rank === 3 ? (
                            <span className="text-amber-600 font-bold">🥉 #3</span>
                          ) : (
                            <span className="text-muted-foreground">#{m.rank}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span>{m.name}</span>
                            {m.isBest && (
                              <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                                BEST
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">
                          {m.primaryScore}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {m.validationScore}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {m.testScore}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {m.trainingTimeSec}s
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectModelForDeepDive(m)
                            }}
                            className="rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            Diagnostics
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Learning Curve (Recharts) */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-foreground">
                  Learning Curves ({displayModel?.name || 'Top Model'})
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">25 Epochs</span>
            </div>

            <p className="text-[11px] text-muted-foreground mb-4">
              Loss divergence trajectory across training vs cross-validation epochs.
            </p>

            <div className="h-56 w-full">
              {displayModel?.learningCurve ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayModel.learningCurve}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="iteration"
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="trainLoss"
                      stroke="#818cf8"
                      strokeWidth={2}
                      dot={false}
                      name="Train Loss"
                    />
                    <Line
                      type="monotone"
                      dataKey="valLoss"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={false}
                      name="Val Loss"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Awaiting model curves...
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Inference Latency: <strong className="text-foreground">{displayModel?.inferenceLatencyMs || 2.4}ms</strong></span>
            <span>Early Stopping: <strong className="text-emerald-400">Converged</strong></span>
          </div>
        </div>
      </div>

      {/* Terminal Stream / Console Logs */}
      <div className="rounded-2xl border border-border/80 bg-zinc-950 p-4 shadow-md text-zinc-100 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-zinc-200">Execution Console Output</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
              STDOUT / STDERR
            </span>
          </div>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copiedLog ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLog ? 'Copied' : 'Copy Logs'}</span>
          </button>
        </div>

        <div
          ref={terminalRef}
          className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
              <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
              <span
                className={
                  log.level === 'success'
                    ? 'text-emerald-400'
                    : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-zinc-300'
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
