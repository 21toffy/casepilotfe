import { jwtDecode } from 'jwt-decode'
import { extractErrorMessage } from './api-client'

export interface User {
  uid: string
  email: string
  first_name: string
  last_name: string
  role: string
  firm?: {
    uid: string
    name: string
    industry: string
  }
  is_active: boolean
  // has_completed_onboarding: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface DecodedToken {
  exp: number
  user_id: string
  email: string
}

export class AuthService {
  private static instance: AuthService
  private user: User | null = null
  private tokens: AuthTokens | null = null
  private inactivityTimer: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private isInitialized = false

  private readonly STORAGE_KEY = process.env.NEXT_PUBLIC_SESSION_STORAGE_KEY || 'casepilot_session'
  private readonly INACTIVITY_TIMEOUT = (parseInt(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT || '3') * 60 * 1000) // Convert to milliseconds
  private readonly TOKEN_REFRESH_THRESHOLD = (parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD || '5') * 60 * 1000) // Convert to milliseconds

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeFromStorage()
      this.startInactivityTracking()
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private initializeFromStorage(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        this.tokens = parsed.tokens
        this.user = parsed.user
        this.lastActivity = parsed.lastActivity || Date.now()

        // Validate tokens
        if (this.tokens?.access) {
          const decoded = this.decodeToken(this.tokens.access)
          if (decoded && decoded.exp * 1000 > Date.now()) {
            this.isInitialized = true
            return
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error initializing from storage:', error)
    }

    // Clear invalid data
    this.clearSession()
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const dataToStore = {
        tokens: this.tokens,
        user: this.user,
        lastActivity: this.lastActivity
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore))
    } catch (error) {
      console.error('[Auth] Error saving to storage:', error)
    }
  }

  private clearSession(): void {
    this.user = null
    this.tokens = null
    this.isInitialized = false
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token)
    } catch (error) {
      console.error('[Auth] Error decoding token:', error)
      return null
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return true
    
    return decoded.exp * 1000 <= Date.now()
  }

  private shouldRefreshToken(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return false
    
    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()
    const timeUntilExpiry = expirationTime - currentTime
    
    return timeUntilExpiry <= this.TOKEN_REFRESH_THRESHOLD
  }

  private startInactivityTracking(): void {
    if (typeof window === 'undefined') return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const updateActivity = () => {
      this.lastActivity = Date.now()
      this.saveToStorage()
      this.resetInactivityTimer()
    }

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    this.resetInactivityTimer()
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }

    this.inactivityTimer = setTimeout(() => {
      if (this.isAuthenticated()) {
        console.log('[Auth] User inactive for too long, logging out')
        this.logout()
      }
    }, this.INACTIVITY_TIMEOUT)
  }

  public async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Return the full error object for login errors so we can access account_status, verification_required, etc.
        return { success: false, error: data }
      }

      // Store tokens
      this.tokens = {
        access: data.access,
        refresh: data.refresh
      }

      // Get user profile
      const userResponse = await this.getCurrentUser()
      if (!userResponse.success || !userResponse.user) {
        return { success: false, error: extractErrorMessage(userResponse.error) }
      }

      this.user = userResponse.user
      this.lastActivity = Date.now()
      this.isInitialized = true
      
      this.saveToStorage()
      this.resetInactivityTimer()

      return { success: true, user: this.user }

    } catch (error: any) {
      console.error('[Auth] Login error:', error)
      return { success: false, error: extractErrorMessage(error.message) || 'Network error' }
    }
  }

  public async refreshToken(): Promise<boolean> {
    if (!this.tokens?.refresh) {
      return false
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.tokens.refresh }),
      })

      if (!response.ok) {
        console.error('[Auth] Token refresh failed:', response.status)
        return false
      }

      const data = await response.json()
      
      this.tokens = {
        access: data.access,
        refresh: this.tokens.refresh // Keep the same refresh token
      }

      this.saveToStorage()
      return true

    } catch (error) {
      console.error('[Auth] Token refresh error:', error)
      return false
    }
  }

  public async getValidAccessToken(): Promise<string | null> {
    if (!this.tokens?.access) {
      return null
    }

    // Check if token is expired
    if (this.isTokenExpired(this.tokens.access)) {
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        this.logout()
        return null
      }
    }
    // Check if token needs refresh
    else if (this.shouldRefreshToken(this.tokens.access)) {
      // Refresh in background, don't wait for it
      this.refreshToken().catch(error => {
        console.error('[Auth] Background token refresh failed:', error)
      })
    }

    return this.tokens.access
  }

  private async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.tokens?.access) {
      return { success: false, error: 'No access token' }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${this.tokens.access}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      const userData = await response.json()
      return { success: true, user: userData }

    } catch (error: any) {
      console.error('[Auth] Get current user error:', error)
      return { success: false, error: error.message }
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.tokens?.access) {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.access}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('[Auth] Logout API call failed:', error)
    } finally {
      this.clearSession()
      
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
        this.inactivityTimer = null
      }

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  public isAuthenticated(): boolean {
    return this.isInitialized && !!this.user && !!this.tokens?.access && !this.isTokenExpired(this.tokens.access)
  }

  public getUser(): User | null {
    return this.user
  }

  public getTokens(): AuthTokens | null {
    return this.tokens
  }

  public updateActivity(): void {
    this.lastActivity = Date.now()
    this.saveToStorage()
    this.resetInactivityTimer()
  }

  public getLastActivity(): number {
    return this.lastActivity
  }

  public getInactivityTimeLeft(): number {
    const timeSinceLastActivity = Date.now() - this.lastActivity
    return Math.max(0, this.INACTIVITY_TIMEOUT - timeSinceLastActivity)
  }
}

export default AuthService