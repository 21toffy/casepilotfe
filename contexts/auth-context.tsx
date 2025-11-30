"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthService, User } from '@/lib/auth-service'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, turnstileToken?: string) => Promise<{ success: boolean; error?: any; user?: User }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateActivity: () => void
  getInactivityTimeLeft: () => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authService] = useState(() => AuthService.getInstance())

  useEffect(() => {
    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('[Auth] Initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [authService])

  useEffect(() => {
    // Set up periodic token refresh check
    const interval = setInterval(async () => {
      if (authService.isAuthenticated()) {
        try {
          await authService.getValidAccessToken()
        } catch (error) {
          console.error('[Auth] Token validation error:', error)
          await logout()
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [authService])

  const login = async (email: string, password: string, turnstileToken?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const result = await authService.login(email, password, turnstileToken)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return result
    } catch (error: any) {
      console.error('[Auth] Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (!authService.isAuthenticated()) return

    try {
      // This will trigger a fresh API call to get user data
      const currentUser = authService.getUser()
      setUser(currentUser)
    } catch (error) {
      console.error('[Auth] Refresh user error:', error)
    }
  }

  const updateActivity = (): void => {
    authService.updateActivity()
  }

  const getInactivityTimeLeft = (): number => {
    return authService.getInactivityTimeLeft()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshUser,
    updateActivity,
    getInactivityTimeLeft
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext