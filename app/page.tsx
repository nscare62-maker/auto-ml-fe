"use client"

import React, { useState, useEffect } from 'react'
import {
  Database,
  Target,
  Sliders,
  Flame,
  Brain,
  Gauge,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/automl/navbar'
import { DatasetStudio } from '@/components/automl/dataset-studio'
import { ProblemConfigComponent } from '@/components/automl/problem-config'
import { PipelineBuilderComponent } from '@/components/automl/pipeline-builder'
import { TrainingArenaComponent } from '@/components/automl/training-arena'
import { ModelExplainabilityComponent } from '@/components/automl/model-explainability'
import { InferencePlaygroundComponent } from '@/components/automl/inference-playground'
import { LoginPage } from '@/components/automl/login-page'
import { CatalogModal } from '@/components/automl/catalog-modal'
import {
  Dataset,
  ProblemConfig,
  PipelineConfig,
  LeaderboardModel,
} from '@/components/automl/types'

export default function Page() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [activeStep, setActiveStep] = useState<number>(1)

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userEmail, setUserEmail] = useState<string>('sanjay@gmail.com')

  // Catalog Guide State (shown automatically on login, optional to dismiss)
  const [showCatalog, setShowCatalog] = useState<boolean>(false)

  // 1. Dataset State (initialized to null - user must upload)
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null)

  // 2. Problem Config State
  const [problemConfig, setProblemConfig] = useState<ProblemConfig>({
    targetColumn: '',
    taskType: 'binary_classification',
    primaryMetric: 'roc_auc',
    trainTestSplit: 0.8,
    cvFolds: 5,
    useStratified: true,
    randomSeed: 42,
    imbalanceHandling: 'class_weights',
  })

  // 3. Pipeline Config State
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
    selectedAlgorithms: [
      'xgboost',
      'lightgbm',
      'catboost',
      'random_forest',
      'stacking_ensemble',
    ],
    tuningStrategy: 'bayesian',
    timeBudgetMinutes: 3,
    maxTrials: 30,
    earlyStoppingPatience: 5,
    preprocessing: {
      missingImputation: 'mean',
      scalingMethod: 'standard',
      categoricalEncoding: 'onehot',
      outlierTreatment: 'iqr_clip',
    },
    featureEngineering: {
      enablePolynomial: true,
      enableFeatureSelection: true,
      topFeaturesCount: 15,
      extractDateFeatures: true,
    },
  })

  // 4. Leaderboard & Trained Models State
  const [leaderboard, setLeaderboard] = useState<LeaderboardModel[]>([])
  const [selectedModel, setSelectedModel] = useState<LeaderboardModel | null>(null)

  // Check saved session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_user_auth')
      if (stored === 'true') {
        setIsAuthenticated(true)
        const email = localStorage.getItem('nexus_user_email')
        if (email) setUserEmail(email)
      }
    } catch {
      // ignore
    }
  }, [])

  // Sync theme to root HTML class
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // When user logs in
  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true)
    setUserEmail(email)
    try {
      localStorage.setItem('nexus_user_auth', 'true')
      localStorage.setItem('nexus_user_email', email)
    } catch {
      // ignore
    }
    setShowCatalog(true) // Automatically pop up the catalog guide after login
  }

  // When user logs out
  const handleLogout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem('nexus_user_auth')
      localStorage.removeItem('nexus_user_email')
    } catch {
      // ignore
    }
    setCurrentDataset(null)
    setLeaderboard([])
    setSelectedModel(null)
    setActiveStep(1)
  }

  // When user uploads a new dataset
  const handleUpdateDataset = (dataset: Dataset) => {
    setCurrentDataset(dataset)
    setLeaderboard([])
    setSelectedModel(null)

    // Select last column as target default
    const lastCol = dataset.columns[dataset.columns.length - 1]
    const isRegression = lastCol.type === 'numeric' && lastCol.uniqueCount > 10
    const isMulticlass = !isRegression && lastCol.uniqueCount > 2

    setProblemConfig({
      targetColumn: lastCol.name,
      taskType: isRegression
        ? 'regression'
        : isMulticlass
          ? 'multiclass_classification'
          : 'binary_classification',
      primaryMetric: isRegression ? 'rmse' : 'roc_auc',
      trainTestSplit: 0.8,
      cvFolds: 5,
      useStratified: true,
      randomSeed: 42,
      imbalanceHandling: 'class_weights',
    })

    setActiveStep(1)
  }

  // Reset experiment
  const handleReset = () => {
    setCurrentDataset(null)
    setLeaderboard([])
    setSelectedModel(null)
    setActiveStep(1)
  }

  const steps = [
    { number: 1, label: 'Data Studio', icon: Database },
    { number: 2, label: 'Problem & Target', icon: Target },
    { number: 3, label: 'Pipeline Builder', icon: Sliders },
    { number: 4, label: 'Training Arena', icon: Flame },
    { number: 5, label: 'Diagnostics & XAI', icon: Brain },
    { number: 6, label: 'Inference & Prediction', icon: Gauge },
  ]

  // If not logged in, show Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Optional Catalog Guide Modal */}
      <CatalogModal
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
      />

      {/* Top Navigation */}
      <Navbar
        currentDataset={currentDataset}
        activeStep={activeStep}
        onReset={handleReset}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        userEmail={userEmail}
        onLogout={handleLogout}
        onOpenCatalog={() => setShowCatalog(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step Progression Stepper */}
        <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
          <div className="flex items-center justify-between overflow-x-auto gap-2 scrollbar-none py-1">
            {steps.map((st, idx) => {
              const Icon = st.icon
              const isCurrent = activeStep === st.number
              const isCompleted = activeStep > st.number
              const isAccessible =
                st.number === 1 ||
                (currentDataset !== null && st.number <= Math.max(activeStep, leaderboard.length > 0 ? 6 : 3))

              return (
                <React.Fragment key={st.number}>
                  <button
                    onClick={() => {
                      if (isAccessible) setActiveStep(st.number)
                    }}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : isAccessible
                            ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            : 'opacity-30 cursor-not-allowed text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Icon className="h-4 w-4 shrink-0" />
                      )}
                      <span>{st.label}</span>
                    </div>
                  </button>

                  {idx < steps.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-border shrink-0 hidden md:block" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Step 1: Dataset Studio */}
        {activeStep === 1 && (
          <DatasetStudio
            dataset={currentDataset}
            onUpdateDataset={handleUpdateDataset}
            onProceed={() => setActiveStep(2)}
            problemConfig={problemConfig}
            onSelectTarget={(col) =>
              setProblemConfig((prev) => ({ ...prev, targetColumn: col }))
            }
          />
        )}

        {/* Step 2: Problem & Target Selection */}
        {activeStep === 2 && currentDataset && (
          <ProblemConfigComponent
            dataset={currentDataset}
            config={problemConfig}
            onChangeConfig={(cfg) => setProblemConfig(cfg)}
            onBack={() => setActiveStep(1)}
            onProceed={() => setActiveStep(3)}
          />
        )}

        {/* Step 3: Pipeline & Algorithm Builder */}
        {activeStep === 3 && (
          <PipelineBuilderComponent
            problemConfig={problemConfig}
            pipelineConfig={pipelineConfig}
            onChangePipelineConfig={(cfg) => setPipelineConfig(cfg)}
            onBack={() => setActiveStep(2)}
            onStartTraining={() => {
              setLeaderboard([])
              setActiveStep(4)
            }}
          />
        )}

        {/* Step 4: Training Arena & Leaderboard */}
        {activeStep === 4 && currentDataset && (
          <TrainingArenaComponent
            dataset={currentDataset}
            problemConfig={problemConfig}
            pipelineConfig={pipelineConfig}
            leaderboard={leaderboard}
            onUpdateLeaderboard={(models) => {
              setLeaderboard(models)
              if (!selectedModel && models.length > 0) {
                setSelectedModel(models[0])
              }
            }}
            onSelectModelForDeepDive={(model) => {
              setSelectedModel(model)
              setActiveStep(5)
            }}
            onBack={() => setActiveStep(3)}
            onProceedToDiagnostics={() => {
              if (leaderboard.length > 0) {
                if (!selectedModel) setSelectedModel(leaderboard[0])
                setActiveStep(5)
              }
            }}
          />
        )}

        {/* Step 5: Model Explainability (XAI) & Diagnostics */}
        {activeStep === 5 && currentDataset && selectedModel && (
          <ModelExplainabilityComponent
            dataset={currentDataset}
            problemConfig={problemConfig}
            leaderboard={leaderboard}
            selectedModel={selectedModel}
            onSelectModel={(model) => setSelectedModel(model)}
            onBack={() => setActiveStep(4)}
            onProceedToInference={() => setActiveStep(6)}
          />
        )}

        {/* Step 6: Inference Playground & Production Deployment */}
        {activeStep === 6 && currentDataset && selectedModel && (
          <InferencePlaygroundComponent
            dataset={currentDataset}
            problemConfig={problemConfig}
            pipelineConfig={pipelineConfig}
            selectedModel={selectedModel}
            onBack={() => setActiveStep(5)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-12 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Nexus AutoML Studio • Authenticated as <span className="font-mono text-foreground font-semibold">{userEmail}</span>
          </p>
          <p className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Autonomous Machine Learning Engine</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
