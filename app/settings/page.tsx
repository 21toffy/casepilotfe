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
  X
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
      const response = await apiClient.post('/api/users/invite/', invitationData)
      
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
        
        // Reload staff list
        loadStaffMembers()
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </TabsTrigger>
              {user?.role === 'super_user' && (
                <TabsTrigger value="organization" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Organization Settings</span>
                </TabsTrigger>
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
                </Accordion>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}