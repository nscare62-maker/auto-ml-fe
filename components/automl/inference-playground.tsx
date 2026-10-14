"use client"

import React, { useState, useMemo } from 'react'
import {
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Code2,
  FileText,
  Upload,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Layers,
  Cpu,
  Gauge,
  Brain,
} from 'lucide-react'
import Papa from 'papaparse'
import {
  Dataset,
  ProblemConfig,
  PipelineConfig,
  LeaderboardModel,
  SinglePredictionResult,
} from './types'
import { runInference } from './ml-engine'

interface InferencePlaygroundProps {
  dataset: Dataset
  problemConfig: ProblemConfig
  pipelineConfig?: PipelineConfig
  selectedModel: LeaderboardModel
  onBack: () => void
}

export function InferencePlaygroundComponent({
  dataset,
  problemConfig,
  pipelineConfig,
  selectedModel,
  onBack,
}: InferencePlaygroundProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'fastapi' | 'curl' | 'docker'>('python')
  const [copiedCode, setCopiedCode] = useState(false)

  // Predictor features (all columns except target and ID)
  const predictorColumns = useMemo(() => {
    return dataset.columns.filter(
      (c) =>
        c.name !== problemConfig.targetColumn &&
        c.name.toLowerCase() !== 'id' &&
        !c.name.toLowerCase().endsWith('id')
    )
  }, [dataset, problemConfig.targetColumn])

  // Form inputs state
  const [inputValues, setInputValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    predictorColumns.forEach((col) => {
      if (col.type === 'numeric') {
        initial[col.name] = col.median ?? col.mean ?? 0
      } else {
        initial[col.name] = col.topCategory || col.sampleValues[0] || ''
      }
    })
    return initial
  })

  // Real-time prediction state
  const predictionResult = useMemo<SinglePredictionResult>(() => {
    return runInference(selectedModel, dataset, problemConfig, inputValues)
  }, [selectedModel, dataset, problemConfig, inputValues])

  // Load random row from dataset
  const handleLoadRandomRow = () => {
    if (dataset.rows.length === 0) return
    const randomRow = dataset.rows[Math.floor(Math.random() * dataset.rows.length)]
    const updated: Record<string, any> = {}
    predictorColumns.forEach((col) => {
      if (randomRow[col.name] !== undefined) {
        updated[col.name] = randomRow[col.name]
      }
    })
    setInputValues(updated)
  }

  // Batch CSV Prediction State
  const [batchFile, setBatchFile] = useState<File | null>(null)
  const [batchScoring, setBatchScoring] = useState(false)
  const [batchDownloadUrl, setBatchDownloadUrl] = useState<string | null>(null)

  const handleBatchUpload = (file: File) => {
    setBatchFile(file)
    setBatchScoring(true)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, any>[]
        const scoredRows = rows.map((row) => {
          const res = runInference(selectedModel, dataset, problemConfig, row)
          return {
            ...row,
            predicted_output: res.prediction,
            confidence_score: res.probability ? (res.probability * 100).toFixed(1) + '%' : 'N/A',
          }
        })

        const csvString = Papa.unparse(scoredRows)
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        setBatchDownloadUrl(url)
        setBatchScoring(false)
      },
      error: () => {
        setBatchScoring(false)
      },
    })
  }

  // Code generator
  const generatedCode = useMemo(() => {
    const isClassification = problemConfig.taskType.includes('classification')
    const featuresList = predictorColumns.map((c) => `"${c.name}"`).join(', ')
    const samplePayload = JSON.stringify(inputValues, null, 2)

    if (codeLanguage === 'python') {
      return `# ==============================================================================
# Nexus AutoML Production Pipeline
# Model Architecture: ${selectedModel.name}
# Target Variable: "${problemConfig.targetColumn}"
# Primary Metric: ${problemConfig.primaryMetric.toUpperCase()} (${selectedModel.primaryScore})
# ==============================================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
import joblib

${selectedModel.algorithm === 'xgboost' ? 'import xgboost as xgb' : selectedModel.algorithm === 'lightgbm' ? 'import lightgbm as lgb' : 'from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor'}

# 1. Load Dataset
df = pd.read_csv("${dataset.filename}")
target_col = "${problemConfig.targetColumn}"

X = df[${featuresList}]
y = df[target_col]

# 2. Split Features & Targets (${(problemConfig.trainTestSplit * 100).toFixed(0)}/${((1 - problemConfig.trainTestSplit) * 100).toFixed(0)})
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=${(1 - problemConfig.trainTestSplit).toFixed(2)}, random_state=${problemConfig.randomSeed}
)

# 3. Preprocessing Transformers
numeric_features = [${predictorColumns.filter((c) => c.type === 'numeric').map((c) => `"${c.name}"`).join(', ')}]
categorical_features = [${predictorColumns.filter((c) => c.type !== 'numeric').map((c) => `"${c.name}"`).join(', ')}]

numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='${pipelineConfig?.preprocessing?.missingImputation || 'mean'}')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

# 4. Model Estimator (${selectedModel.name})
${selectedModel.algorithm === 'xgboost'
  ? `model = xgb.XGB${isClassification ? 'Classifier' : 'Regressor'}(
    n_estimators=${selectedModel.hyperparameters.n_estimators || 300},
    learning_rate=${selectedModel.hyperparameters.learning_rate || 0.05},
    max_depth=${selectedModel.hyperparameters.max_depth || 6},
    random_state=${problemConfig.randomSeed}
)`
  : `model = RandomForest${isClassification ? 'Classifier' : 'Regressor'}(
    n_estimators=300,
    max_depth=12,
    random_state=${problemConfig.randomSeed}
)`}

pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('model', model)
])

# 5. Fit & Save Pipeline Artifact
pipeline.fit(X_train, y_train)
joblib.dump(pipeline, "automl_production_model.joblib")
print("Model pipeline fitted and saved successfully.")

# 6. Inference Test on Input
sample_record = pd.DataFrame([${samplePayload}])
prediction = pipeline.predict(sample_record)
print("Predicted Output:", prediction[0])
`
    } else if (codeLanguage === 'fastapi') {
      return `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI(title="Nexus AutoML REST Microservice", version="2.4.0")

# Load compiled model pipeline
pipeline = joblib.load("automl_production_model.joblib")

class PredictionRequest(BaseModel):
${predictorColumns.map((c) => `    ${c.name}: ${c.type === 'numeric' ? 'float' : 'str'}`).join('\n')}

class PredictionResponse(BaseModel):
    predicted_target: ${isClassification ? 'str' : 'float'}
    confidence_score: float = None

@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest):
    try:
        input_df = pd.DataFrame([payload.model_dump()])
        prediction = pipeline.predict(input_df)[0]
        
        prob = None
        if hasattr(pipeline, "predict_proba"):
            prob = float(max(pipeline.predict_proba(input_df)[0]))
            
        return {
            "predicted_target": str(prediction),
            "confidence_score": prob
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
`
    } else if (codeLanguage === 'curl') {
      return `curl -X POST "http://localhost:8000/predict" \\
  -H "Content-Type: application/json" \\
  -d '${samplePayload}'`
    } else {
      return `FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
`
    }
  }, [codeLanguage, selectedModel, dataset, problemConfig, pipelineConfig, predictorColumns, inputValues])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleDownloadArtifact = () => {
    const artifactData = {
      model_name: selectedModel.name,
      algorithm: selectedModel.algorithm,
      primary_metric: problemConfig.primaryMetric,
      score: selectedModel.primaryScore,
      features: predictorColumns.map((c) => c.name),
      hyperparameters: selectedModel.hyperparameters,
      trained_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(artifactData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus_automl_${selectedModel.algorithm}_pipeline.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              Stage 5 of 5
            </span>
            <span className="text-xs text-muted-foreground">Inference & Predictions</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Prediction Playground & Batch Scoring
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Test single record inferences interactively with real-time scoring, or upload CSV files for bulk prediction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Diagnostics</span>
          </button>
          <button
            onClick={handleDownloadArtifact}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Pipeline JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'single'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Gauge className="h-3.5 w-3.5" />
          <span>Single Prediction Playground</span>
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'batch'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Batch CSV Scoring</span>
        </button>
      </div>

      {/* Tab 1: Single Prediction Playground */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Dynamic Input Form */}
          <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Interactive Feature Inputs</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust features below to observe real-time model scoring and local attribution.
                </p>
              </div>

              <button
                onClick={handleLoadRandomRow}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Load Sample Row</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {predictorColumns.map((col) => {
                const currentVal = inputValues[col.name]
                return (
                  <div key={col.name} className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{col.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize font-mono">
                        {col.type}
                      </span>
                    </div>

                    {col.type === 'numeric' ? (
                      <div className="space-y-1">
                        <input
                          type="number"
                          step="any"
                          value={currentVal ?? 0}
                          onChange={(e) =>
                            setInputValues({
                              ...inputValues,
                              [col.name]: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-mono text-foreground focus:border-indigo-500 focus:outline-hidden"
                        />
                        {col.min !== undefined && col.max !== undefined && (
                          <input
                            type="range"
                            min={col.min}
                            max={col.max}
                            step={(col.max - col.min) / 100 || 1}
                            value={currentVal ?? col.min}
                            onChange={(e) =>
                              setInputValues({
                                ...inputValues,
                                [col.name]: Number(e.target.value),
                              })
                            }
                            className="w-full accent-indigo-500 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                          />
                        )}
                      </div>
                    ) : col.type === 'boolean' ? (
                      <select
                        value={String(currentVal)}
                        onChange={(e) =>
                          setInputValues({
                            ...inputValues,
                            [col.name]: e.target.value === 'true' || e.target.value === 'Yes',
                          })
                        }
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                      >
                        <option value="true">True / Yes</option>
                        <option value="false">False / No</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={String(currentVal ?? '')}
                        onChange={(e) =>
                          setInputValues({
                            ...inputValues,
                            [col.name]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Col: Instant Prediction Result Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-foreground">Live Inference Forecast</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Output evaluated by <span className="font-semibold text-foreground">{selectedModel.name}</span>.
              </p>

              {/* Prediction Hero Box */}
              <div className="my-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Predicted {problemConfig.targetColumn}
                </span>
                <p className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {typeof predictionResult.prediction === 'number'
                    ? predictionResult.prediction.toLocaleString()
                    : String(predictionResult.prediction)}
                </p>

                {predictionResult.probability !== undefined && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-bold text-indigo-400">
                        {(predictionResult.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${predictionResult.probability * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Local SHAP Explanations */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Key Feature Drivers (Local SHAP)</span>
                </h4>

                <div className="space-y-1.5 text-xs font-mono">
                  {predictionResult.featureContributions.map((fc) => (
                    <div
                      key={fc.feature}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40"
                    >
                      <div>
                        <span className="font-medium text-foreground block font-sans">
                          {fc.feature}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Value: {String(fc.value)}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          fc.direction === 'increases' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {fc.direction === 'increases' ? '+' : ''}
                        {fc.contribution}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-3">
              {predictionResult.explanationSummary}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Batch CSV Scoring */}
      {activeTab === 'batch' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Batch Inference Engine</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload an unlabeled dataset CSV to score thousands of rows in seconds.
            </p>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleBatchUpload(e.dataTransfer.files[0])
              }
            }}
            className="rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 hover:border-indigo-500/60 p-8 flex flex-col items-center justify-center text-center cursor-pointer"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv'
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files[0]) {
                  handleBatchUpload(e.target.files[0])
                }
              }
              input.click()
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
              <Upload className="h-6 w-6" />
            </div>

            <h4 className="text-sm font-semibold text-foreground">
              {batchFile ? batchFile.name : 'Choose CSV file for batch prediction'}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Dataset should contain the same columns as the training schema.
            </p>

            {batchScoring && (
              <p className="text-xs text-indigo-400 font-semibold mt-3 animate-pulse">
                Evaluating batch predictions across pipeline...
              </p>
            )}
          </div>

          {batchDownloadUrl && (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Batch scoring complete!
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Predictions and probability confidence intervals appended to CSV.
                  </span>
                </div>
              </div>

              <a
                href={batchDownloadUrl}
                download="scored_predictions.csv"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Scored CSV</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
