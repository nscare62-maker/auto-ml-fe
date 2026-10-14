"use client"

import React, { useState } from 'react'
import {
  Cpu,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

interface LoginPageProps {
  onLoginSuccess: (email: string) => void
}

interface StoredUser {
  name: string
  email: string
  password: string
  createdAt: string
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Sign In fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign Up fields
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  // Status feedback
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Retrieve locally stored registered users
  const getStoredUsers = (): StoredUser[] => {
    try {
      const data = localStorage.getItem('nexus_registered_users')
      if (data) {
        return JSON.parse(data)
      }
    } catch {
      // ignore
    }
    return []
  }

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase()
      const storedUsers = getStoredUsers()

      // 1. Check default credentials
      if (trimmedEmail === 'sanjay@gmail.com' && password === 'sanjay@123') {
        onLoginSuccess(trimmedEmail)
        return
      }

      // 2. Check registered accounts
      const matchedUser = storedUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
      )

      if (matchedUser) {
        onLoginSuccess(matchedUser.email)
      } else {
        setError('Invalid email or password. Please check your credentials or create a new account.')
        setIsLoading(false)
      }
    }, 400)
  }

  // Handle Account Creation submission
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const trimmedName = signupName.trim()
    const trimmedEmail = signupEmail.trim().toLowerCase()

    // Validations
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter a valid full name.')
      setIsLoading(false)
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.')
      setIsLoading(false)
      return
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify your password.')
      setIsLoading(false)
      return
    }

    const storedUsers = getStoredUsers()

    // Check if user already exists
    if (
      trimmedEmail === 'sanjay@gmail.com' ||
      storedUsers.some((u) => u.email.toLowerCase() === trimmedEmail)
    ) {
      setError('An account with this email address already exists. Please sign in instead.')
      setIsLoading(false)
      return
    }

    // Save new user
    const newUser: StoredUser = {
      name: trimmedName,
      email: trimmedEmail,
      password: signupPassword,
      createdAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem('nexus_registered_users', JSON.stringify([...storedUsers, newUser]))
    } catch {
      // ignore
    }

    setSuccess('Account created successfully! Logging you in...')

    setTimeout(() => {
      onLoginSuccess(trimmedEmail)
    }, 600)
  }


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Platform Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4 p-2.5 rounded-2xl bg-white shadow-xl shadow-indigo-500/15 border border-border/40 backdrop-blur-md">
            <img
              src="/logo.png"
              alt="AutoML-FE Logo"
              className="h-16 sm:h-20 w-auto max-w-[260px] object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            AutoML<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">-FE</span> Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Automate • Engineer • Empower — Autonomous Tabular ML
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-8 shadow-2xl space-y-5">
          {/* Sign In / Sign Up Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setError(null)
                setSuccess(null)
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
                setSuccess(null)
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              {mode === 'signin' ? 'Sign in to your workspace' : 'Create your AutoML account'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'signin'
                ? 'Enter your credentials to access the AutoML pipeline'
                : 'Join Nexus AutoML to train and deploy tabular machine learning models'}
            </p>
          </div>


          {/* Feedback Alerts */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Mode 1: Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In & Open Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                  >
                    Create an account
                  </button>
                </span>
              </div>
            </form>
          ) : (
            /* Mode 2: Create Account Form */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Sanjay Kumar"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-border/70 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 mt-3"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Open Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError(null)
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-border/40 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted Session • Secure Local Machine Learning</span>
          </div>
        </div>
      </div>
    </div>
  )
}
