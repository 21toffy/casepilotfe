import { getApiClient, extractErrorMessage } from './api-client'

// API Response interfaces
export interface FirmApiResponse {
  firm?: any
  user?: any
  tokens?: {
    access: string
    refresh: string
  }
  message?: string
  verification_required?: boolean
  otp_sent?: boolean
}

export interface UserApiResponse {
  user?: any
  message?: string
}

export interface FirmRegistrationData {
  // Firm details
  name: string
  address: string
  phone: string
  industry: string
  default_jurisdiction: string
  website?: string
  description?: string
  
  // Admin user details
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface RegistrationResponse {
  success: boolean
  firm?: any
  user?: any
  tokens?: {
    access: string
    refresh: string
  }
  error?: string
}

export class RegistrationService {
  static async registerFirm(formData: {
    firmName: string
    adminName: string
    adminEmail: string
    password: string
    confirmPassword: string
    firmAddress: string
    phone: string
    jurisdiction: string
    practiceAreas: string
    turnstile_token?: string
  }): Promise<RegistrationResponse> {
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' }
      }

      // Parse admin name
      const nameParts = formData.adminName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Map practice areas to industry
      const industryMapping: Record<string, string> = {
        'corporate': 'corporate',
        'criminal': 'criminal',
        'civil': 'civil',
        'family': 'family',
        'real estate': 'real_estate',
        'intellectual property': 'intellectual_property',
        'employment': 'employment',
        'tax': 'tax',
        'immigration': 'immigration',
        'environmental': 'environmental',
        'healthcare': 'healthcare',
        'general': 'general'
      }

      const practiceArea = formData.practiceAreas.toLowerCase()
      const industry = industryMapping[practiceArea] || 'general'

      const registrationData: any = {
        name: formData.firmName,
        address: formData.firmAddress,
        phone: formData.phone,
        industry,
        default_jurisdiction: formData.jurisdiction,
        first_name: firstName,
        last_name: lastName,
        email: formData.adminEmail,
        password: formData.password,
      }

      if (formData.turnstile_token) {
        registrationData.turnstile_token = formData.turnstile_token
      }

      // Make API call
      const apiClient = getApiClient()
      const response = await apiClient.registerFirm(registrationData)
      
      if (response.error) {
        return { success: false, error: extractErrorMessage(response.error) }
      }

      // Type assertion for API response data
      const responseData = response.data as FirmApiResponse | undefined

      return {
        success: true,
        firm: responseData?.firm,
        user: responseData?.user,
        tokens: responseData?.tokens
      }

    } catch (error: any) {
      console.error('[Registration] Error:', error)
      return { 
        success: false, 
        error: extractErrorMessage(error.message) || 'Registration failed' 
      }
    }
  }

  static async createUser(userData: {
    firstName: string
    lastName: string
    email: string
    role: string
    phoneNumber?: string
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.createUser({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role: userData.role,
        phone_number: userData.phoneNumber,
      })

      if (response.error) {
        return { success: false, error: extractErrorMessage(response.error) }
      }

      return { success: true, user: response.data }

    } catch (error: any) {
      console.error('[Registration] Create user error:', error)
      return { 
        success: false, 
        error: extractErrorMessage(error.message) || 'User creation failed' 
      }
    }
  }

  static async inviteUser(userData: {
    firstName: string
    lastName: string
    email: string
    role: string
    phoneNumber?: string
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.post('/api/user/invite/', {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role: userData.role,
        phone_number: userData.phoneNumber,
      })

      if (response.error) {
        return { success: false, error: extractErrorMessage(response.error) }
      }

      // Type assertion for API response data
      const responseData = response.data as UserApiResponse | undefined

      return { success: true, user: responseData?.user }

    } catch (error: any) {
      console.error('[Registration] Invite user error:', error)
      return { 
        success: false, 
        error: extractErrorMessage(error.message) || 'User invitation failed' 
      }
    }
  }
}

export default RegistrationService