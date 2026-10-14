import {
  Dataset,
  ProblemConfig,
  PipelineConfig,
  LeaderboardModel,
  MLAlgorithm,
  AlgorithmOption,
  FeatureImportanceItem,
  ConfusionMatrixData,
  ROCPoint,
  PrecisionRecallPoint,
  LearningCurvePoint,
} from './types'

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  {
    id: 'xgboost',
    name: 'XGBoost',
    family: 'gradient_boosting',
    description: 'Extreme Gradient Boosting with regularized trees, high performance on tabular data.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'fast',
    accuracyRating: 'very_high',
  },
  {
    id: 'lightgbm',
    name: 'LightGBM',
    family: 'gradient_boosting',
    description: 'Fast histogram-based gradient boosting optimized for speed and memory efficiency.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'fast',
    accuracyRating: 'very_high',
  },
  {
    id: 'catboost',
    name: 'CatBoost',
    family: 'gradient_boosting',
    description: 'Specialized gradient boosting with superior out-of-the-box handling of categorical features.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'medium',
    accuracyRating: 'very_high',
  },
  {
    id: 'random_forest',
    name: 'Random Forest',
    family: 'tree_ensemble',
    description: 'Robust bagging ensemble of randomized decision trees with low variance.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'fast',
    accuracyRating: 'high',
  },
  {
    id: 'gradient_boosting',
    name: 'Gradient Boosting (Scikit-Learn)',
    family: 'gradient_boosting',
    description: 'Classic sequential additive gradient boosted decision trees.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'medium',
    accuracyRating: 'high',
  },
  {
    id: 'neural_network',
    name: 'Deep Tabular MLP',
    family: 'deep_learning',
    description: 'Multi-layer perceptron neural network with batch normalization and dropout.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'slow',
    accuracyRating: 'high',
  },
  {
    id: 'logistic_regression',
    name: 'Regularized Logistic Regression',
    family: 'linear',
    description: 'L2-regularized linear model providing fast baseline classification benchmark.',
    supportedTasks: ['binary_classification', 'multiclass_classification'],
    speedRating: 'fast',
    accuracyRating: 'moderate',
  },
  {
    id: 'ridge_regression',
    name: 'Ridge / ElasticNet Regressor',
    family: 'linear',
    description: 'Penalized linear model with L1/L2 regularization for continuous targets.',
    supportedTasks: ['regression'],
    speedRating: 'fast',
    accuracyRating: 'moderate',
  },
  {
    id: 'stacking_ensemble',
    name: 'AutoML Super Stacking Ensemble',
    family: 'ensemble',
    description: 'Meta-learner blending cross-validated predictions of the top-performing candidate models.',
    supportedTasks: ['binary_classification', 'multiclass_classification', 'regression'],
    speedRating: 'medium',
    accuracyRating: 'very_high',
  },
]

// Generate realistic Feature Importance for a dataset
export function generateFeatureImportance(
  dataset: Dataset,
  targetColumn: string,
  algorithm: MLAlgorithm
): FeatureImportanceItem[] {
  const candidateFeatures = dataset.columns.filter((c) => c.name !== targetColumn && c.name.toLowerCase() !== 'id' && !c.name.toLowerCase().endsWith('id'))

  if (candidateFeatures.length === 0) return []

  // Deterministic seed based on algorithm name
  const weights = candidateFeatures.map((feat, idx) => {
    let base = 0.15 + ((candidateFeatures.length - idx) / candidateFeatures.length) * 0.7
    if (feat.name.toLowerCase().includes('charge') || feat.name.toLowerCase().includes('income') || feat.name.toLowerCase().includes('age') || feat.name.toLowerCase().includes('risk') || feat.name.toLowerCase().includes('st')) {
      base += 0.35
    }
    if (algorithm === 'xgboost' || algorithm === 'lightgbm') {
      base *= 1.15
    }
    return { name: feat.name, raw: Math.max(0.05, base + (Math.sin(idx * 7) * 0.15)) }
  })

  const totalRaw = weights.reduce((acc, curr) => acc + curr.raw, 0)
  const items = weights
    .map((w) => {
      const percentage = Number(((w.raw / totalRaw) * 100).toFixed(1))
      return {
        feature: w.name,
        importance: Number((w.raw / totalRaw).toFixed(4)),
        percentage,
      }
    })
    .sort((a, b) => b.importance - a.importance)

  return items
}

// Generate Realistic Learning Curves
export function generateLearningCurve(
  algorithm: MLAlgorithm,
  isClassification: boolean,
  targetScore: number
): LearningCurvePoint[] {
  const points: LearningCurvePoint[] = []
  const epochs = 25

  let currentTrainLoss = isClassification ? 0.69 : 1.2
  let currentValLoss = isClassification ? 0.72 : 1.25
  const minLoss = isClassification ? 0.18 : 0.22

  for (let i = 1; i <= epochs; i++) {
    const progress = i / epochs
    const decay = Math.exp(-progress * 2.8)

    currentTrainLoss = minLoss + (currentTrainLoss - minLoss) * decay + (Math.random() * 0.015 - 0.007)
    currentValLoss = minLoss * 1.15 + (currentValLoss - minLoss * 1.15) * decay + (Math.random() * 0.02 - 0.008)

    const baseScore = isClassification ? 0.62 : 0.45
    const currentScore = Number((baseScore + (targetScore - baseScore) * (1 - decay) + (Math.random() * 0.008 - 0.004)).toFixed(4))
    const trainScore = Math.min(0.995, Number((currentScore + 0.025 * progress).toFixed(4)))

    points.push({
      iteration: i,
      trainLoss: Number(Math.max(0.05, currentTrainLoss).toFixed(4)),
      valLoss: Number(Math.max(0.08, currentValLoss).toFixed(4)),
      trainScore,
      valScore: Math.min(0.99, currentScore),
    })
  }

  return points
}

// Generate Realistic ROC Curve
export function generateROCCurve(aucScore: number): ROCPoint[] {
  const points: ROCPoint[] = [{ fpr: 0, tpr: 0, threshold: 1.0 }]
  const steps = 20

  for (let i = 1; i < steps; i++) {
    const fpr = i / steps
    // Concave curve shaped by AUC score power law
    const power = Math.max(0.12, 1 - (aucScore - 0.5) * 1.7)
    const tpr = Math.min(1.0, Math.pow(fpr, power))
    const threshold = Number((1.0 - fpr).toFixed(2))

    points.push({
      fpr: Number(fpr.toFixed(3)),
      tpr: Number(tpr.toFixed(3)),
      threshold,
    })
  }

  points.push({ fpr: 1.0, tpr: 1.0, threshold: 0.0 })
  return points
}

// Generate Realistic Precision-Recall Curve
export function generatePRCurve(f1Score: number): PrecisionRecallPoint[] {
  const points: PrecisionRecallPoint[] = []
  const steps = 20

  for (let i = 0; i <= steps; i++) {
    const recall = i / steps
    const precision = Math.max(0.5, Math.min(0.99, 1.0 - Math.pow(recall, 2.5) * (1 - f1Score * 0.9)))
    points.push({
      recall: Number(recall.toFixed(3)),
      precision: Number(precision.toFixed(3)),
      threshold: Number((1.0 - recall * 0.9).toFixed(2)),
    })
  }

  return points
}

// Generate Confusion Matrix
export function generateConfusionMatrix(
  totalSamples: number,
  accuracy: number,
  labels: [string, string] = ['Negative', 'Positive']
): ConfusionMatrixData {
  const correct = Math.floor(totalSamples * accuracy)
  const incorrect = totalSamples - correct

  const tn = Math.floor(correct * 0.54)
  const tp = correct - tn
  const fp = Math.floor(incorrect * 0.48)
  const fn = incorrect - fp

  return {
    tn,
    fp,
    fn,
    tp,
    labels,
  }
}

// Hyperparameters generator per algorithm
export function getModelHyperparameters(algorithm: MLAlgorithm): Record<string, any> {
  switch (algorithm) {
    case 'xgboost':
      return {
        n_estimators: 450,
        learning_rate: 0.038,
        max_depth: 6,
        subsample: 0.85,
        colsample_bytree: 0.8,
        gamma: 0.15,
        reg_alpha: 0.05,
        reg_lambda: 1.2,
      }
    case 'lightgbm':
      return {
        n_estimators: 500,
        learning_rate: 0.042,
        num_leaves: 63,
        min_child_samples: 20,
        subsample: 0.8,
        colsample_bytree: 0.75,
        reg_alpha: 0.1,
      }
    case 'catboost':
      return {
        iterations: 600,
        learning_rate: 0.05,
        depth: 6,
        l2_leaf_reg: 3.5,
        border_count: 128,
      }
    case 'random_forest':
      return {
        n_estimators: 300,
        max_depth: 12,
        min_samples_split: 4,
        min_samples_leaf: 2,
        max_features: 'sqrt',
        criterion: 'gini',
      }
    case 'gradient_boosting':
      return {
        n_estimators: 250,
        learning_rate: 0.06,
        max_depth: 5,
        subsample: 0.9,
      }
    case 'neural_network':
      return {
        hidden_layer_sizes: [128, 64, 32],
        activation: 'relu',
        alpha: 0.001,
        learning_rate_init: 0.003,
        batch_size: 64,
        max_iter: 200,
      }
    case 'stacking_ensemble':
      return {
        base_models: ['XGBoost', 'LightGBM', 'CatBoost', 'RandomForest'],
        meta_learner: 'LogisticRegressionCV',
        cv_strategy: 'StratifiedKFold(n_splits=5)',
        passthrough: true,
      }
    case 'logistic_regression':
    case 'ridge_regression':
    default:
      return {
        C: 1.0,
        penalty: 'l2',
        solver: 'lbfgs',
        max_iter: 1000,
      }
  }
}

// Synthesize Trained Model Results for AutoML Leaderboard
export function createTrainedModel(
  algorithm: MLAlgorithm,
  dataset: Dataset,
  problemConfig: ProblemConfig,
  rank: number,
  isBest: boolean = false
): LeaderboardModel {
  const isClassification = problemConfig.taskType.includes('classification')
  const opt = ALGORITHM_OPTIONS.find((a) => a.id === algorithm)
  const name = opt?.name || algorithm

  // Metric calculation based on algorithm strengths
  let baseScore = isBest ? 0.935 : 0.82 + (ALGORITHM_OPTIONS.length - rank) * 0.018
  if (algorithm === 'stacking_ensemble') baseScore = 0.948
  else if (algorithm === 'xgboost') baseScore = 0.932
  else if (algorithm === 'lightgbm') baseScore = 0.925
  else if (algorithm === 'catboost') baseScore = 0.921
  else if (algorithm === 'random_forest') baseScore = 0.898
  else if (algorithm === 'gradient_boosting') baseScore = 0.884
  else if (algorithm === 'neural_network') baseScore = 0.876
  else baseScore = 0.812

  const primaryScore = Number(baseScore.toFixed(4))
  const valScore = Number((primaryScore - 0.012).toFixed(4))
  const testScore = Number((primaryScore - 0.018).toFixed(4))

  const metrics: LeaderboardModel['metrics'] = isClassification
    ? {
        accuracy: Number(primaryScore.toFixed(4)),
        f1: Number((primaryScore - 0.015).toFixed(4)),
        roc_auc: Number(Math.min(0.995, primaryScore + 0.025).toFixed(4)),
        precision: Number((primaryScore + 0.01).toFixed(4)),
        recall: Number((primaryScore - 0.02).toFixed(4)),
      }
    : {
        r2: Number(primaryScore.toFixed(4)),
        rmse: Number((Math.max(12000, (1 - primaryScore) * 85000)).toFixed(2)),
        mae: Number((Math.max(8500, (1 - primaryScore) * 62000)).toFixed(2)),
        mse: Number(Math.pow((1 - primaryScore) * 85000, 2).toFixed(0)),
      }

  // Feature Importance
  const featureImportance = generateFeatureImportance(dataset, problemConfig.targetColumn, algorithm)

  // Learning Curve
  const learningCurve = generateLearningCurve(algorithm, isClassification, primaryScore)

  // Confusion Matrix (Classification only)
  const labels: [string, string] = isClassification
    ? [
        String(dataset.columns.find((c) => c.name === problemConfig.targetColumn)?.sampleValues[0] || 'Class 0'),
        String(dataset.columns.find((c) => c.name === problemConfig.targetColumn)?.sampleValues[1] || 'Class 1'),
      ]
    : ['Negative', 'Positive']

  const confusionMatrix = isClassification
    ? generateConfusionMatrix(Math.floor(dataset.rowCount * (1 - problemConfig.trainTestSplit)), primaryScore, labels)
    : undefined

  // ROC and PR Curves
  const rocCurve = isClassification ? generateROCCurve(metrics.roc_auc || 0.9) : undefined
  const prCurve = isClassification ? generatePRCurve(metrics.f1 || 0.88) : undefined

  // Classification Report
  const classificationReport = isClassification
    ? [
        {
          classLabel: labels[0],
          precision: Number((primaryScore + 0.01).toFixed(3)),
          recall: Number((primaryScore + 0.02).toFixed(3)),
          f1Score: Number((primaryScore + 0.015).toFixed(3)),
          support: Math.floor(dataset.rowCount * 0.65),
        },
        {
          classLabel: labels[1],
          precision: Number((primaryScore - 0.02).toFixed(3)),
          recall: Number((primaryScore - 0.03).toFixed(3)),
          f1Score: Number((primaryScore - 0.025).toFixed(3)),
          support: Math.floor(dataset.rowCount * 0.35),
        },
      ]
    : undefined

  // Residuals for regression
  const residuals = !isClassification
    ? Array.from({ length: 40 }).map((_, i) => {
        const actual = 100000 + i * 9000 + Math.sin(i) * 15000
        const pred = actual + (Math.random() - 0.5) * 18000 * (1 - primaryScore + 0.1)
        return {
          actual: Number(actual.toFixed(0)),
          predicted: Number(pred.toFixed(0)),
          residual: Number((actual - pred).toFixed(0)),
        }
      })
    : undefined

  const durationMultiplier = algorithm === 'neural_network' ? 4.5 : algorithm === 'stacking_ensemble' ? 3.8 : 1.2
  const trainingTimeSec = Number((3.5 * durationMultiplier + Math.random() * 2).toFixed(1))
  const inferenceLatencyMs = Number((algorithm === 'neural_network' ? 8.4 : algorithm === 'stacking_ensemble' ? 12.2 : 2.1 + Math.random()).toFixed(1))

  return {
    id: `model-${algorithm}-${Date.now()}`,
    name,
    algorithm,
    status: 'completed',
    rank,
    isBest,
    primaryScore,
    validationScore: valScore,
    testScore,
    trainingTimeSec,
    inferenceLatencyMs,
    hyperparameters: getModelHyperparameters(algorithm),
    metrics,
    confusionMatrix,
    rocCurve,
    prCurve,
    featureImportance,
    learningCurve,
    classificationReport,
    residuals,
  }
}

// Single Prediction Inference Engine
export function runInference(
  model: LeaderboardModel,
  dataset: Dataset,
  problemConfig: ProblemConfig,
  inputValues: Record<string, any>
): SinglePredictionResult {
  const isClassification = problemConfig.taskType.includes('classification')
  const targetCol = dataset.columns.find((c) => c.name === problemConfig.targetColumn)
  const labels = targetCol ? targetCol.sampleValues.slice(0, 2).map(String) : ['0', '1']

  // Weighted scoring from feature importances
  let score = 0
  const contributions: SinglePredictionResult['featureContributions'] = []

  model.featureImportance.forEach((feat) => {
    const userVal = inputValues[feat.feature]
    const colProf = dataset.columns.find((c) => c.name === feat.feature)
    let featureDelta = 0

    if (colProf && colProf.type === 'numeric' && colProf.mean !== undefined && colProf.stdDev) {
      const z = (Number(userVal || colProf.mean) - colProf.mean) / (colProf.stdDev || 1)
      featureDelta = z * feat.importance * 0.8
    } else if (userVal) {
      featureDelta = (String(userVal).length % 2 === 0 ? 0.3 : -0.2) * feat.importance
    }

    score += featureDelta
    contributions.push({
      feature: feat.feature,
      value: userVal ?? (colProf?.type === 'numeric' ? colProf?.mean : colProf?.topCategory),
      contribution: Number(featureDelta.toFixed(3)),
      direction: featureDelta >= 0 ? 'increases' : 'decreases',
    })
  })

  // Sort by absolute impact
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))

  if (isClassification) {
    const probability = Number((1 / (1 + Math.exp(-score * 2.2))).toFixed(3))
    const predictedClass = probability >= 0.5 ? labels[1] || 'Positive' : labels[0] || 'Negative'

    return {
      prediction: predictedClass,
      probability,
      probabilities: [
        { label: labels[0] || 'Class 0', probability: Number((1 - probability).toFixed(3)) },
        { label: labels[1] || 'Class 1', probability },
      ],
      featureContributions: contributions.slice(0, 6),
      explanationSummary: `The model predicts "${predictedClass}" with ${(probability * 100).toFixed(1)}% confidence, heavily influenced by ${contributions[0]?.feature || 'primary features'}.`,
    }
  } else {
    // Regression
    const meanTarget = targetCol?.mean || 200000
    const predictedValue = Number(Math.max(10000, meanTarget + score * 45000).toFixed(2))

    return {
      prediction: predictedValue,
      featureContributions: contributions.slice(0, 6),
      explanationSummary: `Estimated ${targetCol?.name || 'target'}: ${predictedValue.toLocaleString()} (adjusted by key drivers: ${contributions.slice(0, 3).map((c) => c.feature).join(', ')}).`,
    }
  }
}
