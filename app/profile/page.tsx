"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Shield, 
  Edit3, 
  Save, 
  X,
  MapPin,
  Briefcase
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface UserProfileData {
  id: number
  uid: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number?: string
  role: string
  title?: string
  gender?: string
  dob?: string
  firm?: {
    name: string
    uid: string
  }
  wallet?: any
  is_active: boolean
  created_at: string
  updated_at: string
  // has_completed_onboarding: boolean
}

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data for editing
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    title: '',
    gender: '',
    dob: ''
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/me/')
      
      if (response.data) {
        setUser(response.data)
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone_number: response.data.phone_number || '',
          title: response.data.title || '',
          gender: response.data.gender || '',
          dob: response.data.dob || ''
        })
      }
    } catch (error: any) {
      console.error('Failed to load user profile:', error)
      setError('Failed to load profile data')
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your profile. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.patch('/api/users/me/', formData)
      
      if (response.data) {
        setUser(response.data)
        setIsEditing(false)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update your profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        title: user.title || '',
        gender: user.gender || '',
        dob: user.dob || ''
      })
    }
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_user':
        return 'Super User'
      case 'case_owner':
        return 'Case Owner'
      case 'invitee':
        return 'Invitee'
      default:
        return role?.replace('_', ' ') || 'User'
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_user':
        return 'default'
      case 'case_owner':
        return 'secondary'
      case 'invitee':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="md:col-span-2">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
              <p className="text-gray-600 mb-4">{error || "Unable to load your profile."}</p>
              <Button onClick={loadUserProfile}>Try Again</Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{user.full_name}</CardTitle>
                  <CardDescription className="text-sm">{user.email}</CardDescription>
                  <div className="flex justify-center mt-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user.firm?.name || 'No organization'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{user.is_active ? 'Active Account' : 'Inactive Account'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details Card */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          disabled={isSaving}
                        />
                      ) : (
                        <p className="text-sm font-medium">{user.first_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          disabled={isSaving}
                        />
                      ) : (
                        <p className="text-sm font-medium">{user.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Enter your phone number"
                        disabled={isSaving}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{user.phone_number || 'Not provided'}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      {isEditing ? (
                        <Select
                          value={formData.title}
                          onValueChange={(value) => setFormData({ ...formData, title: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr.">Mr.</SelectItem>
                            <SelectItem value="Mrs.">Mrs.</SelectItem>
                            <SelectItem value="Ms.">Ms.</SelectItem>
                            <SelectItem value="Miss">Miss</SelectItem>
                            <SelectItem value="Dr.">Dr.</SelectItem>
                            <SelectItem value="Prof.">Prof.</SelectItem>
                            <SelectItem value="Hon.">Hon.</SelectItem>
                            <SelectItem value="Rev.">Rev.</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium">{user.title || 'Not specified'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Male</SelectItem>
                            <SelectItem value="F">Female</SelectItem>
                            <SelectItem value="N">Non-binary</SelectItem>
                            <SelectItem value="P">Prefer not to say</SelectItem>
                            <SelectItem value="O">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-medium">
                          {user.gender === 'M' ? 'Male' :
                           user.gender === 'F' ? 'Female' :
                           user.gender === 'N' ? 'Non-binary' :
                           user.gender === 'P' ? 'Prefer not to say' :
                           user.gender === 'O' ? 'Other' :
                           'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm font-medium">
                        {user.dob ? formatDate(user.dob) : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{getRoleDisplayName(user.role)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Organization</Label>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{user.firm?.name || 'No organization'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Account Created</Label>
                        <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Last Updated</Label>
                        <p className="text-sm font-medium">{formatDate(user.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}