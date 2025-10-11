"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  User, 
  Building2, 
  Shield, 
  Mail, 
  Phone, 
  Save, 
  UserPlus,
  Users,
  AlertCircle,
  Check,
  X,
  Clock,
  Copy,
  Link as LinkIcon
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface ProfileFormData {
  first_name: string
  last_name: string
  phone_number: string
  title: string
  gender: string
  dob: string
  email_notifications: boolean
  push_notifications: boolean
}

interface InvitationFormData {
  email: string
  first_name: string
  last_name: string
  role: string
  phone_number: string
  message: string
}

interface OrganizationSettings {
  uid: string
  name: string
  email: string
  phone: string
  address: string
  website: string
  description: string
  logo_url: string
  company_domain: string
  restrict_invites_to_domain: boolean
  default_jurisdiction: string
  default_case_types: string[]
  industry: string
}

interface OrganizationMetrics {
  total_cases: number
  active_cases: number
  closed_cases: number
  total_users: number
  active_users: number
  total_tasks: number
  pending_tasks: number
  completed_tasks: number
  cases_by_status: Record<string, number>
  tasks_by_priority: Record<string, number>
  users_per_case: Array<{case_id: number, case_title: string, user_count: number}>
  tasks_per_case: Array<{case_id: number, case_title: string, task_count: number}>
}

interface StaffMember {
  id: number
  uid: string
  full_name: string
  email: string
  role: string
  title?: string
  is_case_owner: boolean
  is_super_user: boolean
  can_be_case_owner: boolean
  profile_completed: boolean
  last_active?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null)
  const [isLoadingOrgSettings, setIsLoadingOrgSettings] = useState(false)
  const [isSavingOrgSettings, setIsSavingOrgSettings] = useState(false)
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false)
  
  // Profile form data
  const [profileData, setProfileData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    title: '',
    gender: '',
    dob: '',
    email_notifications: true,
    push_notifications: true
  })

  // Invitation form data
  const [invitationData, setInvitationData] = useState<InvitationFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'invitee',
    phone_number: '',
    message: ''
  })

  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    loadUserProfile()
    if (user?.role === 'super_user') {
      loadStaffMembers()
      loadOrganizationSettings()
      loadOrganizationMetrics()
      loadInvitations()
    }
  }, [user])

  const loadUserProfile = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/me/')
      
      if (response.data) {
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone_number: response.data.phone_number || '',
          title: response.data.title || '',
          gender: response.data.gender || '',
          dob: response.data.dob || '',
          email_notifications: response.data.email_notifications ?? true,
          push_notifications: response.data.push_notifications ?? true
        })
      }
    } catch (error: any) {
      console.error('Failed to load user profile:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your profile data.",
      })
    }
  }

  const loadStaffMembers = async () => {
    try {
      setIsLoadingStaff(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/company/staff/')
      
      if (response.data) {
        setStaffMembers(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load staff members:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load staff members.",
      })
    } finally {
      setIsLoadingStaff(false)
    }
  }

  const loadOrganizationSettings = async () => {
    try {
      setIsLoadingOrgSettings(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/firms/settings/')
      
      if (response.data) {
        setOrgSettings(response.data)
      } else if (response.error) {
        console.error('Failed to load organization settings:', response.error)
        // Don't show toast for permission errors, just log it
        if (response.status !== 403) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load organization settings.",
          })
        }
      }
    } catch (error: any) {
      console.error('Failed to load organization settings:', error)
    } finally {
      setIsLoadingOrgSettings(false)
    }
  }

  const loadOrganizationMetrics = async () => {
    try {
      setIsLoadingMetrics(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/firms/metrics/')
      
      if (response.data) {
        setMetrics(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load organization metrics:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load organization metrics.",
      })
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const loadInvitations = async () => {
    try {
      setIsLoadingInvitations(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/invitations/organization/')
      
      if (response.data) {
        setInvitations(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load invitations:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invitations.",
      })
    } finally {
      setIsLoadingInvitations(false)
    }
  }

  const handleOrganizationSettingsSave = async () => {
    if (!orgSettings) return
    
    try {
      setIsSavingOrgSettings(true)
      const apiClient = getApiClient()
      const response = await apiClient.patch('/api/firms/settings/', orgSettings)
      
      if (response.data) {
        setOrgSettings(response.data)
        toast({
          title: "Settings Updated",
          description: "Organization settings have been saved successfully.",
        })
      }
    } catch (error: any) {
      console.error('Failed to update organization settings:', error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update organization settings.",
      })
    } finally {
      setIsSavingOrgSettings(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      setIsLoading(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.patch('/api/users/me/', profileData)
      
      if (response.data) {
        toast({
          title: "Profile Updated",
          description: "Your profile settings have been saved successfully.",
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
      setIsLoading(false)
    }
  }

  const handleInvitation = async () => {
    try {
      setIsInviting(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.post('/api/users/invitations/organization/', invitationData)
      
      if (response.data) {
        toast({
          title: "Invitation Sent",
          description: `Invitation has been sent to ${invitationData.email} successfully.`,
        })
        
        // Reset form
        setInvitationData({
          email: '',
          first_name: '',
          last_name: '',
          role: 'invitee',
          phone_number: '',
          message: ''
        })
        
        // Reload staff list and invitations
        loadStaffMembers()
        loadInvitations()
      }
    } catch (error: any) {
      console.error('Failed to send invitation:', error)
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation. Please try again.",
      })
    } finally {
      setIsInviting(false)
    }
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
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation/${token}`
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link Copied!",
        description: "Invitation link has been copied to clipboard.",
      })
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
      })
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account preferences and organization settings</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full ${user?.role === 'super_user' ? 'grid-cols-3' : 'grid-cols-1'}`}>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </TabsTrigger>
              {user?.role === 'super_user' && (
                <>
                  <TabsTrigger value="organization" className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Organization</span>
                  </TabsTrigger>
                  <TabsTrigger value="metrics" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Metrics</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={profileData.phone_number}
                      onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Select
                        value={profileData.title}
                        onValueChange={(value) => setProfileData({ ...profileData, title: value })}
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profileData.gender}
                        onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Preferences</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email_notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about case updates, tasks, and deadlines via email
                        </p>
                      </div>
                      <Switch
                        id="email_notifications"
                        checked={profileData.email_notifications}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, email_notifications: checked })}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push_notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive real-time notifications in your browser
                        </p>
                      </div>
                      <Switch
                        id="push_notifications"
                        checked={profileData.push_notifications}
                        onCheckedChange={(checked) => setProfileData({ ...profileData, push_notifications: checked })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleProfileSave} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organization Settings Tab */}
            {user?.role === 'super_user' && (
              <TabsContent value="organization" className="space-y-6">
                <div className="mb-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      These settings are only available to Super Users. Changes here will affect your entire organization.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Organization Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Configuration</CardTitle>
                    <CardDescription>
                      Manage your organization's basic information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoadingOrgSettings ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse h-10 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    ) : orgSettings ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="org_name">Organization Name</Label>
                            <Input
                              id="org_name"
                              value={orgSettings.name}
                              onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                              disabled={isSavingOrgSettings}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="org_email">Organization Email</Label>
                            <Input
                              id="org_email"
                              type="email"
                              value={orgSettings.email}
                              onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                              disabled={isSavingOrgSettings}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="org_phone">Phone Number</Label>
                            <Input
                              id="org_phone"
                              value={orgSettings.phone}
                              onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                              disabled={isSavingOrgSettings}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="org_website">Website</Label>
                            <Input
                              id="org_website"
                              value={orgSettings.website || ''}
                              onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
                              placeholder="https://example.com"
                              disabled={isSavingOrgSettings}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="org_address">Address</Label>
                          <Textarea
                            id="org_address"
                            value={orgSettings.address}
                            onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                            rows={2}
                            disabled={isSavingOrgSettings}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Domain Restriction</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="company_domain">Company Email Domain</Label>
                            <Input
                              id="company_domain"
                              value={orgSettings.company_domain || ''}
                              onChange={(e) => setOrgSettings({ ...orgSettings, company_domain: e.target.value })}
                              placeholder="example.com"
                              disabled={isSavingOrgSettings}
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter your company's email domain (e.g., company.com)
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="restrict_domain">Restrict Invitations to Company Domain</Label>
                              <p className="text-sm text-muted-foreground">
                                Only allow invitations to emails from your company domain
                              </p>
                            </div>
                            <Switch
                              id="restrict_domain"
                              checked={orgSettings.restrict_invites_to_domain}
                              onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, restrict_invites_to_domain: checked })}
                              disabled={isSavingOrgSettings}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleOrganizationSettingsSave} disabled={isSavingOrgSettings}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSavingOrgSettings ? 'Saving...' : 'Save Settings'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Failed to load organization settings
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Accordion type="single" collapsible className="space-y-4">
                  {/* Team Member Invitations */}
                  <AccordionItem value="invitations">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Invite Team Members</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardHeader>
                          <CardTitle>Send Invitation</CardTitle>
                          <CardDescription>
                            Invite new team members to join your organization. They will receive an email with instructions to set up their account.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="inv_first_name">First Name *</Label>
                              <Input
                                id="inv_first_name"
                                value={invitationData.first_name}
                                onChange={(e) => setInvitationData({ ...invitationData, first_name: e.target.value })}
                                placeholder="Enter first name"
                                disabled={isInviting}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="inv_last_name">Last Name *</Label>
                              <Input
                                id="inv_last_name"
                                value={invitationData.last_name}
                                onChange={(e) => setInvitationData({ ...invitationData, last_name: e.target.value })}
                                placeholder="Enter last name"
                                disabled={isInviting}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="inv_email">Email Address *</Label>
                            <Input
                              id="inv_email"
                              type="email"
                              value={invitationData.email}
                              onChange={(e) => setInvitationData({ ...invitationData, email: e.target.value })}
                              placeholder="Enter email address"
                              disabled={isInviting}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="inv_role">Role *</Label>
                              <Select
                                value={invitationData.role}
                                onValueChange={(value) => setInvitationData({ ...invitationData, role: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="super_user">Super User</SelectItem>
                                  <SelectItem value="case_owner">Case Owner</SelectItem>
                                  <SelectItem value="invitee">Invitee</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="inv_phone">Phone Number</Label>
                              <Input
                                id="inv_phone"
                                value={invitationData.phone_number}
                                onChange={(e) => setInvitationData({ ...invitationData, phone_number: e.target.value })}
                                placeholder="Enter phone number (optional)"
                                disabled={isInviting}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="inv_message">Welcome Message</Label>
                            <Textarea
                              id="inv_message"
                              value={invitationData.message}
                              onChange={(e) => setInvitationData({ ...invitationData, message: e.target.value })}
                              placeholder="Enter a welcome message for the new team member (optional)"
                              rows={3}
                              disabled={isInviting}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button 
                              onClick={handleInvitation} 
                              disabled={isInviting || !invitationData.email || !invitationData.first_name || !invitationData.last_name}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {isInviting ? 'Sending Invitation...' : 'Send Invitation'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Current Team Members */}
                  <AccordionItem value="team-members">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Current Team Members</span>
                        <Badge variant="secondary">{staffMembers.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardHeader>
                          <CardTitle>Team Members</CardTitle>
                          <CardDescription>
                            View and manage all team members in your organization.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingStaff ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                              ))}
                            </div>
                          ) : staffMembers.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No team members found</p>
                              <p className="text-xs text-gray-400 mt-2">Invite team members using the form above</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {staffMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-sm">{member.full_name}</h4>
                                      <Badge variant={getRoleBadgeVariant(member.role)}>
                                        {getRoleDisplayName(member.role)}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                    {member.last_active && (
                                      <p className="text-xs text-gray-400">
                                        Last active: {formatDate(member.last_active)}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {member.profile_completed ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {member.profile_completed ? 'Profile Complete' : 'Profile Incomplete'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Sent Invitations */}
                  <AccordionItem value="sent-invitations">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>Sent Invitations</span>
                        <Badge variant="secondary">{invitations.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardHeader>
                          <CardTitle>Invitation Status</CardTitle>
                          <CardDescription>
                            Track all invitations sent to join your organization.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingInvitations ? (
                            <div className="space-y-4">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                              ))}
                            </div>
                          ) : invitations.length === 0 ? (
                            <div className="text-center py-8">
                              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No invitations sent yet</p>
                              <p className="text-xs text-gray-400 mt-2">Send invitations using the form above</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {invitations.map((invitation) => (
                                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-sm">
                                        {invitation.first_name} {invitation.last_name}
                                      </h4>
                                      <Badge variant={getRoleBadgeVariant(invitation.role)}>
                                        {getRoleDisplayName(invitation.role)}
                                      </Badge>
                                      {invitation.is_accepted ? (
                                        <Badge variant="default" className="bg-green-500">
                                          <Check className="h-3 w-3 mr-1" />
                                          Accepted
                                        </Badge>
                                      ) : invitation.is_expired ? (
                                        <Badge variant="destructive">
                                          <X className="h-3 w-3 mr-1" />
                                          Expired
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">
                                          <Clock className="h-3 w-3 mr-1" />
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{invitation.email}</p>
                                    <p className="text-xs text-gray-400">
                                      Invited by: {invitation.invited_by_name} • 
                                      Expires: {formatDate(invitation.expires_at)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyInvitationLink(invitation.token)}
                                      disabled={invitation.is_accepted || invitation.is_expired}
                                    >
                                      <Copy className="h-4 w-4 mr-1" />
                                      Copy Link
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            )}

            {/* Metrics Tab */}
            {user?.role === 'super_user' && (
              <TabsContent value="metrics" className="space-y-6">
                <div className="mb-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Organization-wide metrics and analytics dashboard
                    </AlertDescription>
                  </Alert>
                </div>

                {isLoadingMetrics ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : metrics ? (
                  <>
                    {/* Key Metrics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.total_cases}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metrics.active_cases} active, {metrics.closed_cases} closed
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.total_users}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metrics.active_users} active users
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metrics.total_tasks}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metrics.pending_tasks} pending, {metrics.completed_tasks} completed
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {metrics.total_tasks > 0 
                              ? Math.round((metrics.completed_tasks / metrics.total_tasks) * 100)
                              : 0}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Task completion rate
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cases and Tasks Distribution */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Users per Case</CardTitle>
                          <CardDescription>Top 10 cases by team size</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {metrics.users_per_case && metrics.users_per_case.length > 0 ? (
                            <div className="space-y-2">
                              {metrics.users_per_case.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <span className="text-sm truncate flex-1">{item.case_title}</span>
                                  <Badge variant="secondary">{item.user_count} users</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No data available
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Tasks per Case</CardTitle>
                          <CardDescription>Top 10 cases by task count</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {metrics.tasks_per_case && metrics.tasks_per_case.length > 0 ? (
                            <div className="space-y-2">
                              {metrics.tasks_per_case.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <span className="text-sm truncate flex-1">{item.case_title}</span>
                                  <Badge variant="secondary">{item.task_count} tasks</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No data available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load metrics</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}