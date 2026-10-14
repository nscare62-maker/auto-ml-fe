"use client"

import React from 'react'
import {
  Database,
  RefreshCw,
  Sun,
  Moon,
  Cpu,
  BookOpen,
  LogOut,
  User,
} from 'lucide-react'
import { Dataset } from './types'

interface NavbarProps {
  currentDataset: Dataset | null
  activeStep: number
  onReset: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  userEmail?: string
  onLogout?: () => void
  onOpenCatalog?: () => void
}

export function Navbar({
  currentDataset,
  activeStep,
  onReset,
  theme,
  onToggleTheme,
  userEmail = 'sanjay@gmail.com',
  onLogout,
  onOpenCatalog,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 dark:bg-white/5 border border-border/60 shadow-lg shadow-indigo-500/10 p-1 backdrop-blur-sm">
            <img
              src="/apple-icon.png"
              alt="AutoML-FE Emblem"
              className="h-8 w-8 object-contain"
            />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">
                AutoML<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">-FE</span>
              </span>
              <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                Studio
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Automate • Engineer • Empower
            </p>
          </div>
        </div>

        {/* Dataset Status, Catalog Button & User Profile Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active Dataset Chip */}
          {currentDataset ? (
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-400 font-medium">
              <Database className="h-3.5 w-3.5" />
              <span className="truncate max-w-[140px] font-mono">{currentDataset.filename}</span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300">
                {currentDataset.rowCount} rows
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              <span>Awaiting CSV Upload</span>
            </div>
          )}

          {/* User Guide / Catalog Button */}
          {onOpenCatalog && (
            <button
              onClick={onOpenCatalog}
              title="Open Platform Guide & Catalog"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-border transition-all cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Catalog Guide</span>
            </button>
          )}

          {/* User Profile Chip */}
          {userEmail && (
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="font-mono text-[11px] truncate max-w-[120px]">{userEmail}</span>
            </div>
          )}

          {/* Reset Experiment */}
          <button
            onClick={onReset}
            title="Reset Experiment Session"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 text-xs font-medium text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
