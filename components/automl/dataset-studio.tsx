"use client"

import React, { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ChevronRight,
  Database,
  Layers,
  ArrowRight,
  Hash,
  Type,
  ToggleLeft,
  Calendar,
  Sparkles,
  Info,
  Download,
  CheckSquare,
} from 'lucide-react'
import { Dataset, ColumnProfile, ColumnType, ProblemConfig } from './types'
import { parseUploadedFile } from './sample-datasets'
import { DataChecklistComponent } from './data-checklist'

interface DatasetStudioProps {
  dataset: Dataset | null
  onUpdateDataset: (dataset: Dataset) => void
  onProceed: () => void
  problemConfig?: ProblemConfig
  onSelectTarget?: (targetCol: string) => void
}

export function DatasetStudio({
  dataset,
  onUpdateDataset,
  onProceed,
  problemConfig,
  onSelectTarget,
}: DatasetStudioProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'profiling' | 'checklist' | 'cleaning'>('preview')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleaning options state
  const [missingStrategy, setMissingStrategy] = useState<'mean' | 'median' | 'mode' | 'drop'>('mean')
  const [outlierStrategy, setOutlierStrategy] = useState<'iqr_clip' | 'zscore_clip' | 'none'>('iqr_clip')
  const [scalingMethod, setScalingMethod] = useState<'standard' | 'minmax' | 'robust' | 'none'>('standard')

  // Handle file drop/upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadError(null)
      const parsed = await parseUploadedFile(file)
      onUpdateDataset(parsed)
      setPage(1)
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process file. Please check file format.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Initial Upload Screen if no dataset has been uploaded yet
  if (!dataset) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border-2 border-dashed border-border/80 bg-card/60 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400 mx-auto shadow-inner">
            <Upload className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Upload Your Dataset to Begin
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Drag & drop your file here, or click to browse. Nexus AutoML will automatically profile column types, missing values, and statistical distributions.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0])
              }
            }}
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 p-8 transition-all cursor-pointer space-y-3"
          >
            <FileSpreadsheet className="h-10 w-10 text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <span className="text-sm font-semibold text-foreground block">
                Choose CSV or Excel Spreadsheet
              </span>
              <span className="text-xs text-muted-foreground block">
                Supports .csv, .xlsx, .tsv, .xls
              </span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer"
            >
              Browse Files
            </button>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-400 font-medium">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              Parsing & Profiling Dataset...
            </div>
          )}

          {uploadError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60 text-left text-xs">
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="font-semibold text-foreground block text-[11px] mb-0.5">1. Column Headers</span>
              <span className="text-[10px] text-muted-foreground">Row 1 must contain clean feature and target names.</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="font-semibold text-foreground block text-[11px] mb-0.5">2. Any ML Problem</span>
              <span className="text-[10px] text-muted-foreground">Binary/multiclass labels or numeric regression targets.</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="font-semibold text-foreground block text-[11px] mb-0.5">3. Auto Profiling</span>
              <span className="text-[10px] text-muted-foreground">Missing values, types, and stats computed client-side.</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Column type override
  const handleTypeChange = (colName: string, newType: ColumnType) => {
    const updatedCols = dataset.columns.map((c) =>
      c.name === colName ? { ...c, type: newType } : c
    )
    onUpdateDataset({ ...dataset, columns: updatedCols })
  }

  // Filter rows by search query
  const filteredRows = dataset.rows.filter((row) => {
    if (!searchQuery.trim()) return true
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredRows.length / pageSize)
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  // Quick stats
  const totalMissing = dataset.columns.reduce((acc, c) => acc + c.missingCount, 0)
  const totalCells = dataset.rowCount * dataset.columnCount
  const overallMissingPct = ((totalMissing / Math.max(1, totalCells)) * 100).toFixed(1)

  const getTypeIcon = (type: ColumnType) => {
    switch (type) {
      case 'numeric':
        return <Hash className="h-3.5 w-3.5 text-blue-400" />
      case 'categorical':
        return <Type className="h-3.5 w-3.5 text-amber-400" />
      case 'boolean':
        return <ToggleLeft className="h-3.5 w-3.5 text-emerald-400" />
      case 'datetime':
        return <Calendar className="h-3.5 w-3.5 text-purple-400" />
      default:
        return <FileText className="h-3.5 w-3.5 text-zinc-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Dataset Loaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dataset Info & Quick Stats Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                  Uploaded Dataset
                </span>
                <span className="text-xs text-muted-foreground font-mono">{dataset.filename}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                {dataset.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {dataset.description}
              </p>
            </div>

            <button
              onClick={onProceed}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all shrink-0 cursor-pointer"
            >
              <span>Problem Setup</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border/60">
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground">Total Rows</span>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {dataset.rowCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground">Features (Cols)</span>
              <p className="text-xl font-bold text-foreground mt-0.5">{dataset.columnCount}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground">Missing Values</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xl font-bold text-foreground">{totalMissing}</p>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    Number(overallMissingPct) > 5
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {overallMissingPct}%
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground">Numeric / Cat</span>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {dataset.columns.filter((c) => c.type === 'numeric').length} /{' '}
                {dataset.columns.filter((c) => c.type === 'categorical' || c.type === 'boolean').length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className="rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 p-3 border border-indigo-500/30 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-indigo-300">Readiness Audit</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-400 font-bold">
                  10 Checks
                </span>
              </div>
              <p className="text-xs font-bold text-indigo-200 mt-1 group-hover:underline flex items-center gap-1">
                Open Checklist &rarr;
              </p>
            </button>
          </div>
        </div>

        {/* Upload Zone Card */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 hover:border-indigo-500/60 hover:bg-indigo-500/5 p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.tsv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0])
              }
            }}
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
            <Upload className="h-6 w-6" />
          </div>

          <h3 className="text-sm font-semibold text-foreground">Upload Your Dataset</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Drag & drop or browse for <span className="font-medium text-foreground">.csv</span> or{' '}
            <span className="font-medium text-foreground">.xlsx</span> files
          </p>

          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
            Fast in-browser parsing
          </span>

          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center rounded-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                Parsing Dataset...
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-rose-500 mt-2 font-medium">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border/60">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Table Preview</span>
            <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
              {dataset.rowCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('profiling')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profiling'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Column Profiling</span>
            <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
              {dataset.columnCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'checklist'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Readiness Checklist</span>
            <span className="rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono">
              10
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cleaning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'cleaning'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Cleansing & Scaling</span>
          </button>
        </div>

        {activeTab === 'preview' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search values in table..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-indigo-500 focus:outline-hidden"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Interactive Table Preview */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-muted-foreground w-12 text-center">
                    #
                  </th>
                  {dataset.columns.map((col) => (
                    <th key={col.name} className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(col.type)}
                        <span>{col.name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({col.type.slice(0, 3)})
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-muted/30 transition-colors odd:bg-background even:bg-muted/10"
                  >
                    <td className="py-2 px-3 text-center text-[11px] text-muted-foreground font-mono">
                      {(page - 1) * pageSize + rowIdx + 1}
                    </td>
                    {dataset.columns.map((col) => {
                      const val = row[col.name]
                      const isNull = val === null || val === undefined || val === ''
                      return (
                        <td
                          key={col.name}
                          className="py-2 px-3 whitespace-nowrap font-mono text-[11px]"
                        >
                          {isNull ? (
                            <span className="text-amber-500/80 italic text-[10px]">null</span>
                          ) : typeof val === 'boolean' ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                val
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-zinc-500/10 text-zinc-400'
                              }`}
                            >
                              {String(val)}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 bg-muted/20 text-xs">
            <span className="text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} rows
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border/60 bg-background px-2.5 py-1 font-medium text-foreground disabled:opacity-40 hover:bg-muted"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-foreground">
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-border/60 bg-background px-2.5 py-1 font-medium text-foreground disabled:opacity-40 hover:bg-muted"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Column Profiling Cards */}
      {activeTab === 'profiling' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataset.columns.map((col) => {
            return (
              <div
                key={col.name}
                className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-muted border border-border/60">
                        {getTypeIcon(col.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{col.name}</h4>
                        <span className="text-[10px] text-muted-foreground">
                          {col.uniqueCount} distinct values
                        </span>
                      </div>
                    </div>

                    {/* Data Type Selector Override */}
                    <select
                      value={col.type}
                      onChange={(e) => handleTypeChange(col.name, e.target.value as ColumnType)}
                      className="rounded-lg border border-border/60 bg-background px-2 py-1 text-[11px] font-medium text-foreground focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="numeric">Numeric</option>
                      <option value="categorical">Categorical</option>
                      <option value="boolean">Boolean</option>
                      <option value="datetime">Datetime</option>
                      <option value="text">Text/ID</option>
                    </select>
                  </div>

                  {/* Missing Value Bar */}
                  <div className="my-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Missing Rate</span>
                      <span
                        className={
                          col.missingPercentage > 0
                            ? 'text-amber-400 font-medium'
                            : 'text-emerald-400 font-medium'
                        }
                      >
                        {col.missingPercentage}% ({col.missingCount} nulls)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${
                          col.missingPercentage > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(2, 100 - col.missingPercentage))}%` }}
                      />
                    </div>
                  </div>

                  {/* Statistics Breakdown */}
                  {col.type === 'numeric' ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/30 rounded-xl p-2.5 border border-border/40 font-mono">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Min / Max</span>
                        <span className="font-semibold text-foreground">
                          {col.min} / {col.max}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Mean (Avg)</span>
                        <span className="font-semibold text-foreground">{col.mean}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Median</span>
                        <span className="font-semibold text-foreground">{col.median}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Std Dev (σ)</span>
                        <span className="font-semibold text-foreground">{col.stdDev}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-xl p-2.5 border border-border/40 text-[11px]">
                      <span className="text-muted-foreground block text-[10px] mb-0.5">
                        Top Mode Category
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate max-w-[150px]">
                          {col.topCategory || 'N/A'}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                          {col.topCategoryFrequency} occurrences
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sample Values Badges */}
                <div className="mt-3 pt-2.5 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground block mb-1">Samples:</span>
                  <div className="flex flex-wrap gap-1">
                    {col.sampleValues.slice(0, 4).map((sample, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                      >
                        {String(sample)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 3: Data Cleaning & Preprocessing Suite */}
      {activeTab === 'cleaning' && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">Automated Data Cleansing Strategy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nexus AutoML automatically applies standard imputation, outlier suppression, and scaling transformations during cross-validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Missing Imputation */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-foreground">Missing Value Imputation</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                How should null/NaN cells in numeric and categorical features be populated?
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'mean', label: 'Mean (Numeric) & Mode (Categorical)', desc: 'Standard average' },
                  { id: 'median', label: 'Median & Mode', desc: 'Resistant to extreme outliers' },
                  { id: 'mode', label: 'Most Frequent Value', desc: 'Preserves discrete states' },
                  { id: 'drop', label: 'Drop Incomplete Rows', desc: 'Strict complete-case analysis' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                      missingStrategy === item.id
                        ? 'border-indigo-500/60 bg-indigo-500/5 text-foreground'
                        : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="missing"
                      checked={missingStrategy === item.id}
                      onChange={() => setMissingStrategy(item.id as any)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-xs text-foreground block">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Outlier Clipping */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-semibold text-foreground">Outlier Handling</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Clamp extreme anomalous points to prevent gradient divergence and leverage distortion.
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'iqr_clip', label: 'IQR 1.5x Clipping', desc: 'Tukey bounds [Q1-1.5*IQR, Q3+1.5*IQR]' },
                  { id: 'zscore_clip', label: 'Z-Score 3.0σ Truncation', desc: 'Clamp beyond ±3 standard deviations' },
                  { id: 'none', label: 'No Clipping (Raw Values)', desc: 'Preserve natural distribution extremes' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                      outlierStrategy === item.id
                        ? 'border-indigo-500/60 bg-indigo-500/5 text-foreground'
                        : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="outliers"
                      checked={outlierStrategy === item.id}
                      onChange={() => setOutlierStrategy(item.id as any)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-xs text-foreground block">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Feature Scaling */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h4 className="text-xs font-semibold text-foreground">Feature Normalization</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Scale numerical features so linear models and neural networks converge smoothly.
              </p>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'standard', label: 'StandardScaler (Z-Score)', desc: 'Mean = 0, Variance = 1' },
                  { id: 'minmax', label: 'MinMaxScaler [0, 1]', desc: 'Bounded between zero and one' },
                  { id: 'robust', label: 'RobustScaler (IQR-based)', desc: 'Median & interquartile scaling' },
                  { id: 'none', label: 'Unscaled (Tree-native)', desc: 'Tree models are scale invariant' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                      scalingMethod === item.id
                        ? 'border-indigo-500/60 bg-indigo-500/5 text-foreground'
                        : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scaling"
                      checked={scalingMethod === item.id}
                      onChange={() => setScalingMethod(item.id as any)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-xs text-foreground block">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-foreground">
                <span className="font-semibold">Pipeline Integrity:</span> Preprocessing transformers will be fit strictly on training splits to prevent data leakage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Readiness & Integrity Checklist */}
      {activeTab === 'checklist' && (
        <DataChecklistComponent
          dataset={dataset}
          problemConfig={
            problemConfig || {
              targetColumn: dataset.columns[dataset.columns.length - 1]?.name || '',
              taskType: 'binary_classification',
              primaryMetric: 'roc_auc',
              trainTestSplit: 0.8,
              cvFolds: 5,
              useStratified: true,
              randomSeed: 42,
              imbalanceHandling: 'class_weights',
            }
          }
          onSelectTarget={onSelectTarget}
        />
      )}
    </div>
  )
}
