// Removed circular dependency import

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return !response.error && response.status >= 200 && response.status < 300
}

export interface StandardizedError {
  description?: string
  details?: any
  message?: string
  error?: string
}

export function extractErrorMessage(errorData: any): string {
  if (!errorData) return "An unexpected error occurred"
  
  // Check for standardized error keys in order: description, details, message, error
  if (typeof errorData === 'string') return errorData
  
  if (errorData.description) return errorData.description
  if (errorData.details && typeof errorData.details === 'string') return errorData.details
  if (errorData.message) return errorData.message
  if (errorData.error) return errorData.error
  
  // Handle Django REST Framework validation errors
  if (typeof errorData === 'object') {
    // Look for field validation errors like {"field": ["error message"]}
    for (const [field, errors] of Object.entries(errorData)) {
      if (Array.isArray(errors) && errors.length > 0) {
        return `${field}: ${errors[0]}`
      }
    }
    
    // Handle non_field_errors
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      return errorData.non_field_errors[0]
    }
  }
  
  // If none of the expected keys exist, return a custom error message
  return "Something went wrong. Please try again."
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  skipAuth?: boolean
  retries?: number
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private retryAttempts: number

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8005'
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')
    this.retryAttempts = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3')
  }

  // Lazy load AuthService to avoid circular dependency
  private async getAuthService() {
    const { AuthService } = await import('./auth-service')
    return AuthService.getInstance()
  }

  private async makeRequest<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      skipAuth = false,
      retries = this.retryAttempts
    } = config

    // Prepare headers
    // Default headers (don't set Content-Type for FormData)
    const requestHeaders: Record<string, string> = {
      ...(!(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...headers
    }

    // Add authentication if not skipped
    if (!skipAuth) {
      const authService = await this.getAuthService()
      const token = await authService.getValidAccessToken()
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`
      }
    }

    // Prepare request config
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(this.timeout)
    }

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Don't stringify FormData - use it directly
        requestConfig.body = body
      } else {
        requestConfig.body = JSON.stringify(body)
      }
    }

    const url = `${this.baseURL}${endpoint}`

    try {
      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.log(`[API] ${method} ${url}`, { body, headers: requestHeaders })
      }

      const response = await fetch(url, requestConfig)
      
      let data: any = null
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true') {
        console.log(`[API] Response ${response.status}:`, data)
      }

      // Handle authentication errors
      if (response.status === 401 && !skipAuth) {
        // Try to refresh token and retry once
        const authService = await this.getAuthService()
        const refreshed = await authService.refreshToken()
        if (refreshed && retries > 0) {
          return this.makeRequest<T>(endpoint, { ...config, retries: 0 })
        } else {
          // Token refresh failed, logout user
          authService.logout()
          return { error: 'Authentication failed', status: 401 }
        }
      }

      if (!response.ok) {
        return {
          error: data, // Pass the raw error data, let the caller handle extraction
          status: response.status
        }
      }

      return { data, status: response.status }

    } catch (error: any) {
      console.error(`[API] Error making request to ${url}:`, error)
      
      // Retry on network errors
      if (retries > 0 && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.makeRequest<T>(endpoint, { ...config, retries: retries - 1 })
      }

      return {
        error: error.message || 'Network error',
        status: 0
      }
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // Convenience methods for common endpoints
  
  // Authentication endpoints
  async login(email: string, password: string) {
    return this.post('/api/users/auth/login/', { email, password }, { skipAuth: true })
  }

  async refreshAuthToken(refreshToken: string) {
    return this.post('/api/users/auth/token/refresh/', { refresh: refreshToken }, { skipAuth: true })
  }

  async logout() {
    return this.post('/api/users/auth/logout/')
  }

  async getCurrentUser() {
    return this.get('/api/users/me/')
  }

  // User management endpoints
  async createUser(userData: any) {
    return this.post('/api/users/create/', userData)
  }

  async updateUser(uid: string, userData: any) {
    return this.patch(`/api/users/${uid}/`, userData)
  }

  async getUsers(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get(`/api/users/${queryString}`)
  }

  // Firm registration endpoint
  async registerFirm(firmData: any) {
    return this.post('/api/firms/register/', firmData, { skipAuth: true })
  }

  // Health check
  async healthCheck() {
    return this.get('/health/', { skipAuth: true })
  }
}

// Create singleton getter to avoid initialization issues
let apiClientInstance: ApiClient | null = null

export { ApiClient }
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient()
  }
  return apiClientInstance
}

export default getApiClient