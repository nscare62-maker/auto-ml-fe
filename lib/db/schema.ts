import { pgTable, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core'

// Better-Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// AutoML Tables
export const datasets = pgTable('datasets', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  rowCount: integer('row_count').notNull(),
  columnCount: integer('column_count').notNull(),
  columns: jsonb('columns').notNull(), // column metadata, types, stats
  sampleData: jsonb('sample_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const experiments = pgTable('experiments', {
  id: uuid('id').defaultRandom().primaryKey(),
  datasetId: uuid('dataset_id').references(() => datasets.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetColumn: text('target_column').notNull(),
  taskType: text('task_type').notNull(), // binary_classification, multiclass_classification, regression
  primaryMetric: text('primary_metric').notNull(),
  splitRatio: text('split_ratio').notNull().default('80/20'),
  status: text('status').notNull().default('pending'), // pending, running, completed, failed
  config: jsonb('config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const trainedModels = pgTable('trained_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }),
  algorithm: text('algorithm').notNull(), // XGBoost, LightGBM, RandomForest, etc.
  metrics: jsonb('metrics').notNull(), // accuracy, f1, auc, rmse, r2, etc.
  featureImportance: jsonb('feature_importance'),
  hyperparameters: jsonb('hyperparameters'),
  trainingDurationSec: integer('training_duration_sec'),
  isBest: boolean('is_best').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
