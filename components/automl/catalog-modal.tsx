"use client"

import React, { useState } from 'react'
import {
  X,
  BookOpen,
  Database,
  Target,
  Sliders,
  Flame,
  Brain,
  Gauge,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

interface CatalogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CatalogModal({ isOpen, onClose }: CatalogModalProps) {
  const [activeStep, setActiveStep] = useState(0)

  if (!isOpen) return null

  const catalogItems = [
    {
      title: '1. Data Studio & Dataset Ingestion',
      icon: Database,
      badge: 'Step 1',
      summary: 'Upload and profile your tabular data in-browser.',
      details: [
        'Upload any custom CSV (.csv), TSV (.tsv), or Excel (.xlsx) dataset.',
        'View the interactive data table with instant search and pagination.',
        'Inspect column profiling cards: detected data types, missing value rates, and statistical metrics.',
        'Configure data cleaning: missing value imputation (Mean/Median/Mode), outlier clipping (IQR 1.5x / Z-Score 3.0σ), and feature scaling.',
      ],
    },
    {
      title: '2. Target Variable & Problem Detection',
      icon: Target,
      badge: 'Step 2',
      summary: 'Define what you want the AI model to predict.',
      details: [
        'Pick the target column (Y) from your dataset; all other columns become input features (X).',
        'Auto-detects problem type: Binary Classification, Multiclass Classification, or Continuous Regression.',
        'View the target distribution and class balance bar chart.',
        'Select the primary optimization metric (ROC-AUC, F1, Accuracy, or RMSE, MAE, R²) and adjust train/test split (80/20).',
      ],
    },
    {
      title: '3. Pipeline & Candidate Model Builder',
      icon: Sliders,
      badge: 'Step 3',
      summary: 'Choose algorithms and hyperparameter search budgets.',
      details: [
        'Select competing algorithms: XGBoost, LightGBM, CatBoost, Random Forest, Scikit-Learn Boosters, and Super Stacking Ensemble.',
        'Choose hyperparameter search strategies: Bayesian Optimization (TPE), Random Search, or Grid Search.',
        'Configure compute time limit, max trials per model, and early stopping patience.',
        'Enable automated feature engineering: non-linear interactions ($X_i \\times X_j$), mutual information feature pruning, and calendar features.',
      ],
    },
    {
      title: '4. Live Training Arena & Leaderboard',
      icon: Flame,
      badge: 'Step 4',
      summary: 'Execute the tournament and monitor real-time rankings.',
      details: [
        'Track multi-stage execution progress across CV splits, preprocessing fit, and model training.',
        'Watch the real-time leaderboard update with Validation Score, Test Score, and Training Latency.',
        'Inspect the live learning curve chart displaying training loss vs. validation loss over iterations.',
        'View real-time console stdout/stderr log stream with timestamps and parameters.',
      ],
    },
    {
      title: '5. Model Diagnostics & Explainability (XAI)',
      icon: Brain,
      badge: 'Step 5',
      summary: 'Deep-dive into decision thresholds and feature attributions.',
      details: [
        'Interactive Confusion Matrix: drag the Decision Threshold Slider (τ) between 0.10 and 0.90 to recompute precision, recall, and F1 in real time.',
        'Receiver Operating Characteristic (ROC) & Precision-Recall curves with AUC badges.',
        'Global Feature Attribution horizontal bar charts ranking top predictors by predictive weight (SHAP / Gini Gain).',
        'Side-by-side benchmark comparison table comparing all models across speed, accuracy, and complexity.',
      ],
    },
    {
      title: '6. Prediction Playground & Batch Scoring',
      icon: Gauge,
      badge: 'Step 6',
      summary: 'Generate single predictions or score thousands of rows in bulk.',
      details: [
        'Interactive single prediction: sliders and inputs are dynamically generated matching your dataset schema.',
        'Instant prediction gauge with confidence score and Local SHAP impact indicators showing which features drove the score.',
        'Batch CSV Scoring: upload any unlabelled CSV file with the same columns to score all rows and download scored_predictions.csv.',
      ],
    },
  ]

  const current = catalogItems[activeStep]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  User Catalog & Workflow Guide
                </h3>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                  Optional Tour
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Learn how to build, evaluate, and deploy models with Nexus AutoML Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            title="Close Catalog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
          {catalogItems.map((item, idx) => {
            const isCurrent = activeStep === idx
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.badge}
              </button>
            )
          })}
        </div>

        {/* Stage Content Card */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{current.title}</h4>
                <p className="text-xs text-muted-foreground">{current.summary}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {activeStep + 1} / {catalogItems.length}
            </span>
          </div>

          <ul className="space-y-2 pt-2 border-t border-border/40 text-xs">
            {current.details.map((detail, dIdx) => (
              <li key={dIdx} className="flex items-start gap-2 text-foreground/90">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Actions: Pass/Skip vs Next */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Skip / Pass Catalog Button */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border/70 bg-background text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            Skip Catalog & Start Studio
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              className="px-3.5 py-2 rounded-xl border border-border/70 bg-background text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {activeStep < catalogItems.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(catalogItems.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                <span>Next Stage</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>Got it! Open Studio</span>
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
