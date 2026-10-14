export type ColumnType = 'numeric' | 'categorical' | 'boolean' | 'datetime' | 'text'

export interface ColumnProfile {
  name: string
  type: ColumnType
  missingCount: number
  missingPercentage: number
  uniqueCount: number
  min?: number
  max?: number
  mean?: number
  median?: number
  stdDev?: number
  topCategory?: string
  topCategoryFrequency?: number
  sampleValues: (string | number | boolean | null)[]
}

export interface Dataset {
  id: string
  name: string
  description: string
  filename: string
  rowCount: number
  columnCount: number
  columns: ColumnProfile[]
  rows: Record<string, any>[]
  source: 'sample' | 'uploaded'
}

export type TaskType = 'binary_classification' | 'multiclass_classification' | 'regression'

export type EvaluationMetric =
  | 'roc_auc'
  | 'f1'
  | 'accuracy'
  | 'precision'
  | 'recall'
  | 'log_loss'
  | 'rmse'
  | 'mae'
  | 'r2'
  | 'mse'

export interface ProblemConfig {
  targetColumn: string
  taskType: TaskType
  primaryMetric: EvaluationMetric
  trainTestSplit: number // e.g. 0.8
  cvFolds: number // 3, 5, 10
  useStratified: boolean
  randomSeed: number
  imbalanceHandling: 'none' | 'smote' | 'class_weights'
}

export type MLAlgorithm =
  | 'xgboost'
  | 'lightgbm'
  | 'catboost'
  | 'random_forest'
  | 'gradient_boosting'
  | 'logistic_regression'
  | 'ridge_regression'
  | 'neural_network'
  | 'stacking_ensemble'

export interface AlgorithmOption {
  id: MLAlgorithm
  name: string
  family: 'gradient_boosting' | 'tree_ensemble' | 'linear' | 'deep_learning' | 'ensemble'
  description: string
  supportedTasks: TaskType[]
  speedRating: 'fast' | 'medium' | 'slow'
  accuracyRating: 'high' | 'very_high' | 'moderate'
}

export interface PipelineConfig {
  selectedAlgorithms: MLAlgorithm[]
  tuningStrategy: 'bayesian' | 'random' | 'hyperband' | 'grid'
  timeBudgetMinutes: number
  maxTrials: number
  earlyStoppingPatience: number
  preprocessing: {
    missingImputation: 'mean' | 'median' | 'mode' | 'drop'
    scalingMethod: 'standard' | 'minmax' | 'robust' | 'none'
    categoricalEncoding: 'onehot' | 'ordinal' | 'target'
    outlierTreatment: 'iqr_clip' | 'zscore_clip' | 'none'
  }
  featureEngineering: {
    enablePolynomial: boolean
    enableFeatureSelection: boolean
    topFeaturesCount: number
    extractDateFeatures: boolean
  }
}

export type ModelStatus = 'queued' | 'training' | 'completed' | 'failed'

export interface LearningCurvePoint {
  iteration: number
  trainLoss: number
  valLoss: number
  trainScore: number
  valScore: number
}

export interface ConfusionMatrixData {
  tn: number
  fp: number
  fn: number
  tp: number
  labels: [string, string]
}

export interface ROCPoint {
  fpr: number
  tpr: number
  threshold: number
}

export interface PrecisionRecallPoint {
  recall: number
  precision: number
  threshold: number
}

export interface FeatureImportanceItem {
  feature: string
  importance: number
  percentage: number
}

export interface LeaderboardModel {
  id: string
  name: string
  algorithm: MLAlgorithm
  status: ModelStatus
  isBest?: boolean
  rank: number
  primaryScore: number
  validationScore: number
  testScore: number
  trainingTimeSec: number
  inferenceLatencyMs: number
  hyperparameters: Record<string, any>
  metrics: {
    accuracy?: number
    f1?: number
    roc_auc?: number
    precision?: number
    recall?: number
    rmse?: number
    mae?: number
    r2?: number
    mse?: number
  }
  confusionMatrix?: ConfusionMatrixData
  rocCurve?: ROCPoint[]
  prCurve?: PrecisionRecallPoint[]
  featureImportance: FeatureImportanceItem[]
  learningCurve: LearningCurvePoint[]
  classificationReport?: {
    classLabel: string
    precision: number
    recall: number
    f1Score: number
    support: number
  }[]
  residuals?: { actual: number; predicted: number; residual: number }[]
}

export interface TrainingLogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warn' | 'debug'
  message: string
}

export interface TrainingStage {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  durationSec?: number
}

export interface SinglePredictionInput {
  [featureName: string]: any
}

export interface SinglePredictionResult {
  prediction: string | number
  probability?: number
  probabilities?: { label: string; probability: number }[]
  featureContributions: {
    feature: string
    value: any
    contribution: number // positive or negative SHAP contribution
    direction: 'increases' | 'decreases'
  }[]
  explanationSummary: string
}
