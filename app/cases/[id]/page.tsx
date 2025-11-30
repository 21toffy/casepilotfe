"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"

// Required for static export with dynamic routes
export function generateStaticParams() {
  // Return empty array - this route will be handled client-side
  // The actual case ID will be read from the URL at runtime
  return []
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import {
  Download,
  Edit,
  Share,
  MoreHorizontal,
  Users,
  Calendar,
  Gavel,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Archive,
  Target,
  FileText,
  Loader2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { EnhancedAIAssistantChat } from "@/components/enhanced-ai-assistant-chat"
import { ChatHistoryDrawer } from "@/components/chat-history-drawer"
import { AddArtifactDialog } from "@/components/add-artifact-dialog"
import { PDFExportDialog } from "@/components/pdf-export-dialog"
import { CourtReportEditor } from "@/components/court-report-editor"
import { AddHearingModal } from "@/components/add-hearing-modal"
import { TaskSubmissionModal } from "@/components/task-submission-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { CaseFactModal } from "@/components/case-fact-modal"
import { DesiredOutcomeModal } from "@/components/desired-outcome-modal"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { AddTaskModal } from "@/components/add-task-modal"
import { InviteToCaseModal } from "@/components/invite-to-case-modal"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { SubmissionApprovalCard } from "@/components/submission-approval-card"
import { useAuth } from "@/contexts/auth-context"

export default function CaseDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [newComment, setNewComment] = useState("")
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Real data state
  const [caseData, setCaseData] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [hearings, setHearings] = useState<any[]>([])
  const [facts, setFacts] = useState<any[]>([])
  const [desiredOutcomes, setDesiredOutcomes] = useState<any[]>([])
  const [strategies, setStrategies] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [loadingStrategies, setLoadingStrategies] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [convertedSteps, setConvertedSteps] = useState<Set<string>>(new Set())
  const [convertingStep, setConvertingStep] = useState<{strategyId: number, stepIndex: number} | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [currentChatSessionId, setCurrentChatSessionId] = useState<number | null>(null)

  // Load case data on mount
  useEffect(() => {
    if (params.id && !hasLoaded) {
      setHasLoaded(true)
      loadCaseData()
      loadHearings()
      loadFacts()
      loadDesiredOutcomes()
      loadStrategies()
      loadTasks()
      loadArtifacts()
      loadPendingApprovals()
      loadMostRecentChatSession()
    }
  }, [params.id, hasLoaded])

  // Reset hasLoaded when case ID changes
  useEffect(() => {
    setHasLoaded(false)
  }, [params.id])

  // Load most recent chat session on mount
  const loadMostRecentChatSession = async () => {
    try {
      console.log('Loading most recent chat session for case:', params.id)
      const response = await apiClient.getChatSessions(parseInt(params.id))
      if (isSuccessResponse(response)) {
        const sessions = response.data || []
        if (sessions.length > 0) {
          // Sessions are already ordered by last_message_at desc
          const mostRecent = sessions[0]
          console.log('Auto-selecting most recent session:', mostRecent.id)
          setCurrentChatSessionId(mostRecent.id)
        } else {
          console.log('No existing chat sessions found')
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    }
  }

  const loadCaseData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/${params.id}/`)
      
      if (response.data) {
        setCaseData(response.data)
        setTeamMembers(response.data.team_members || [])
      } else {
        setError("Case not found")
      }
    } catch (error: any) {
      console.error('Failed to load case data:', error)
      setError(error.message || "Failed to load case data")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load case details. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadHearings = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/${params.id}/hearings/`)
      
      if (response.data) {
        setHearings(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load hearings:', error)
      // Don't show error toast for hearings as it's not critical
    }
  }

  const loadFacts = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/${params.id}/facts/`)
      
      if (response.data) {
        setFacts(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load facts:', error)
      // Don't show error toast for facts as it's not critical
    }
  }

  const loadDesiredOutcomes = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/${params.id}/desired-outcomes/`)
      
      if (response.data) {
        setDesiredOutcomes(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load desired outcomes:', error)
      // Don't show error toast for desired outcomes as it's not critical
    }
  }

  const loadStrategies = async () => {
    try {
      setLoadingStrategies(true)
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/strategies/case/${params.id}/`)
      
      let strategiesData = []
      if (response.data && response.data.results) {
        strategiesData = response.data.results
      } else if (response.data) {
        strategiesData = response.data
      }
      
      // Ensure strategy_data is parsed if it comes as a string
      const parsedStrategies = strategiesData.map((strategy: any) => {
        if (strategy.strategy_data && typeof strategy.strategy_data === 'string') {
          try {
            strategy.strategy_data = JSON.parse(strategy.strategy_data)
          } catch (e) {
            console.error('Failed to parse strategy_data:', e)
          }
        }
        return strategy
      })
      
      setStrategies(parsedStrategies)
    } catch (error: any) {
      console.error('Failed to load strategies:', error)
      // Don't show error toast for strategies as it's not critical
    } finally {
      setLoadingStrategies(false)
    }
  }

  const loadTasks = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/tasks/case/${params.id}/`)
      if (response.data && response.data.results) {
        console.log(response.data.results, "lllllll")
        setMyTasks(response.data.results)
      } else if (response.data) {
        setMyTasks(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error)
    }
  }

  const handleConvertStepToTask = async (strategy: any, step: any, stepIndex: number) => {
    const stepKey = `${strategy.id}-${stepIndex}`
    
    // Check if already converted
    if (convertedSteps.has(stepKey)) {
      toast({
        variant: "destructive",
        title: "Already Converted",
        description: "This step has already been converted to a task.",
      })
      return
    }

    setConvertingStep({ strategyId: strategy.id, stepIndex })
    
    try {
      const apiClient = getApiClient()
      
      // Create task from step
      const taskData = {
        title: `${strategy.title} - Step ${step.step || stepIndex + 1}`,
        description: step.action,
        task_type: 'task',
        priority: strategy.priority || 'medium',
        due_date: null, // Could calculate based on timeline
        notes: `Converted from strategy: ${strategy.title}\nTimeline: ${step.timeline || 'Not specified'}\nResponsible: ${step.responsible || 'Not specified'}`
      }
      
      const response = await apiClient.post(`/api/tasks/case/${params.id}/create/`, taskData)
      
      // Check if task was created successfully (response.data should contain task data)
      if (response.data && (response.data.id || response.data.uid)) {
        // Mark step as converted to prevent duplicate conversions
        setConvertedSteps(prev => new Set([...prev, stepKey]))
        
        toast({
          title: "Task Created Successfully",
          description: `Step ${step.step || stepIndex + 1} has been converted to a task.`,
        })
        
        // Reload tasks to show the new task
        loadTasks()
        
        // Reload strategies to update implementation timeline status
        loadStrategies()
      } else {
        throw new Error("Task creation response was invalid")
      }
    } catch (error: any) {
      console.error('Failed to convert step to task:', error)
      toast({
        variant: "destructive",
        title: "Failed to Create Task",
        description: "Could not convert this step to a task. Please try again.",
      })
    } finally {
      setConvertingStep(null)
    }
  }

  const loadArtifacts = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/documents/case/${params.id}/`)
      if (response.data && response.data.results) {
        setArtifacts(response.data.results)
      } else if (response.data) {
        setArtifacts(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load artifacts:', error)
    }
  }

  const loadPendingApprovals = async () => {
    try {
      setLoadingApprovals(true)
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/tasks/approvals/pending/?case_id=${params.id}`)
      if (response.data && response.data.submissions) {
        setPendingApprovals(response.data.submissions)
      }
    } catch (error: any) {
      console.error('Failed to load pending approvals:', error)
    } finally {
      setLoadingApprovals(false)
    }
  }

  const handleApproveSubmission = async (submissionId: number, comments: string = '') => {
    try {
      const apiClient = getApiClient()
      await apiClient.post(`/api/tasks/submissions/${submissionId}/approve/`, { comments })
      
      toast({
        title: "Submission Approved",
        description: "The submission has been approved successfully.",
      })
      
      // Reload approvals and tasks
      loadPendingApprovals()
      loadTasks()
    } catch (error: any) {
      console.error('Failed to approve submission:', error)
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Could not approve the submission. Please try again.",
      })
    }
  }

  const handleRejectSubmission = async (submissionId: number, reason: string, comments: string = '') => {
    try {
      const apiClient = getApiClient()
      await apiClient.post(`/api/tasks/submissions/${submissionId}/reject/`, { reason, comments })
      
      toast({
        title: "Submission Rejected",
        description: "The submission has been rejected.",
      })
      
      // Reload approvals
      loadPendingApprovals()
    } catch (error: any) {
      console.error('Failed to reject submission:', error)
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Could not reject the submission. Please try again.",
      })
    }
  }

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      const apiClient = getApiClient()
      await apiClient.delete(`/api/tasks/submissions/${submissionId}/delete/`)
      
      toast({
        title: "Submission Deleted",
        description: "The submission has been deleted successfully.",
      })
      
      // Reload approvals
      loadPendingApprovals()
    } catch (error: any) {
      console.error('Failed to delete submission:', error)
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the submission. Please try again.",
      })
    }
  }

  const handleHearingAdded = () => {
    // Reload case data to get updated next hearing info
    loadCaseData()
    loadHearings()
  }

  // Helper functions
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "published":
      case "completed":
        return "default"
      case "pending":
      case "pending review":
      case "in progress":
        return "secondary"
      case "needs revision":
      case "under review":
        return "outline"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Loading state
  if (isLoading) {
  return (
      <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Error state
  if (error || !caseData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h1>
              <p className="text-gray-600 mb-4">{error || "The requested case could not be found."}</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
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
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Cases", href: "/cases" },
            { label: caseData?.title || "Case Details" }
          ]}
        />

        {/* Case Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              <p className="text-gray-600 mt-1">Case #{caseData.quick_stats?.case_number || caseData.reference_number}</p>
            </div>
            <div className="flex items-center space-x-2">
              <InviteToCaseModal 
                caseId={params.id as string}
                onInviteSent={() => {
                  toast({
                    title: "Invitation Sent",
                    description: "The user has been invited to this case.",
                  })
                }}
              />
              <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
              <Button variant="outline" size="sm" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Court Report
                  </Button>
              <Button variant="outline" size="sm" disabled>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Badge className="mt-1">{caseData.status}</Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Case Type</Label>
              <Badge variant="secondary" className="mt-1">
                {caseData.case_type?.replace('_', ' ') || 'Unknown'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Progress</Label>
              <div className="mt-1">
                <Progress value={caseData.quick_stats?.progress_percentage || 0} className="h-2" />
                <span className="text-sm text-muted-foreground">{caseData.quick_stats?.progress_percentage || 0}%</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Client</Label>
              <p className="text-sm font-medium mt-1">{caseData.quick_stats?.client_name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Next Hearing</Label>
              <p className="text-sm font-medium mt-1">
                {caseData.quick_stats?.next_hearing ? 
                  `${formatDate(caseData.quick_stats.next_hearing.date)} at ${caseData.quick_stats.next_hearing.time}` : 
                  'None scheduled'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Team Size</Label>
              <p className="text-sm font-medium mt-1">{teamMembers.length} members</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
            </TabsTrigger>
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="desired-outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Case Description */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Case Details</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowFullDescription(!showFullDescription)}>
                      {showFullDescription ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showFullDescription ? "Show Less" : "Show More"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {showFullDescription ? 
                        (caseData.description || caseData.summary || "No detailed description available.") : 
                        (caseData.summary || caseData.description || "No description available.")?.slice(0, 200) + "..."
                      }
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {caseData.jurisdiction || 'Unknown Jurisdiction'}
                        </Badge>
                        {caseData.quick_stats?.court_location && (
                          <Badge variant="outline">
                            {caseData.quick_stats.court_location}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(caseData.created_at)}
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span> {formatDate(caseData.updated_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assigned Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Assigned Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers.length > 0 ? teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.full_name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{member.role_in_case?.replace('_', ' ') || member.role?.replace('_', ' ')}</Badge>
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No team members assigned yet.
                        </p>
                      )}
                      
                      {/* Add Team Member Button */}
                      <Button variant="outline" className="w-full" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Invite Team Members
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">My Tasks</span>
                      <span className="font-medium">{caseData.quick_stats?.tasks_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed Tasks</span>
                      <span className="font-medium">{caseData.quick_stats?.completed_tasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Documents</span>
                      <span className="font-medium">{caseData.quick_stats?.documents_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Team Members</span>
                      <span className="font-medium">{caseData.quick_stats?.team_size || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Days Active</span>
                      <span className="font-medium">{caseData.quick_stats?.days_active || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Billable Hours</span>
                      <span className="font-medium">{caseData.quick_stats?.billable_hours || 0}h</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Court Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Next Court Date
                      </div>
                      <AddHearingModal 
                        caseId={params.id as string} 
                        onHearingAdded={handleHearingAdded}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {caseData.quick_stats?.next_hearing ? (
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-3">
                          <p className="font-medium">Upcoming Hearing</p>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(caseData.quick_stats.next_hearing.date)} at {caseData.quick_stats.next_hearing.time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            📍 {caseData.quick_stats.next_hearing.location}
                          </p>
                          {caseData.quick_stats.next_hearing.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {caseData.quick_stats.next_hearing.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming court dates scheduled.</p>
                    )}
                    
                    {/* Previous Hearings */}
                    {hearings.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Previous Hearings</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {hearings
                            .filter(hearing => new Date(hearing.date) < new Date())
                            .slice(0, 3)
                            .map((hearing) => (
                            <div key={hearing.id} className="text-xs text-muted-foreground">
                              <span className="font-medium">
                                {formatDate(hearing.date)}
                              </span>
                              {hearing.location && (
                                <span className="ml-2">• {hearing.location}</span>
                              )}
                              {hearing.is_completed && (
                                <span className="ml-2 text-green-600">✓ Completed</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Tasks assigned to you for this case</CardDescription>
                </div>
                <AddTaskModal 
                  caseId={params.id as string}
                  onTaskAdded={loadTasks}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <TaskDetailsModal 
                      key={task.id}
                      task={task}
                      onTaskUpdate={loadCaseData}
                      trigger={
                        <div className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned by {task.assignedBy} • Due: {task.dueDate}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{task.status}</Badge>
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <TaskSubmissionModal 
                                task={task}
                                onSubmissionUpdate={loadCaseData}
                              />
                          <DeleteConfirmation
                            type="task"
                            id={task.id}
                            title={task.title}
                            onDelete={loadTasks}
                            trigger={
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                Delete
                          </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Task submissions requiring your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingApprovals ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading approvals...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.length > 0 ? (
                      pendingApprovals.map((submission) => (
                        <SubmissionApprovalCard
                          key={submission.id}
                          submission={submission}
                          currentUserId={user?.uid}
                          onApprove={handleApproveSubmission}
                          onReject={handleRejectSubmission}
                          onDelete={handleDeleteSubmission}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <ThumbsUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                          No submissions pending approval
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submissions from your assigned tasks will appear here
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facts" className="space-y-6">
              <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Case Facts
                  </CardTitle>
                  <CardDescription>Structured facts about this case</CardDescription>
                </div>
                <CaseFactModal 
                  caseId={params.id as string}
                  onFactChange={loadFacts}
                />
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facts.length > 0 ? facts.map((fact) => (
                    <div key={fact.id} className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {fact.source_type === 'AI_GENERATED' ? 'AI Generated' : 
                           fact.source_type === 'USER_GENERATED' ? 'User Generated' :
                           'User Modified'}
                        </Badge>
                        <div className="flex space-x-1">
                          <CaseFactModal 
                            caseId={params.id as string}
                            fact={fact}
                            onFactChange={loadFacts}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            type="fact"
                            id={fact.id}
                            title={fact.fact_text}
                            onDelete={loadFacts}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Archive className="h-3 w-3" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <p className="text-sm leading-relaxed line-clamp-3 cursor-pointer hover:text-blue-600">
                            {fact.fact_text}
                          </p>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed">{fact.fact_text}</p>
                            <div className="flex flex-col space-y-1 text-xs text-muted-foreground pt-2 border-t">
                              <span>Created: {formatDate(fact.created_at)}</span>
                              {fact.is_modified && (
                                <span>Modified by: {fact.modified_by?.full_name || 'Unknown'}</span>
                            )}
                          </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                        </div>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No facts available for this case yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Facts are automatically generated when a case is created, or you can add them manually.
                      </p>
                      </div>
                  )}
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="desired-outcomes" className="space-y-6">
              <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Desired Outcomes
                  </CardTitle>
                  <CardDescription>Expected results and goals for this case</CardDescription>
                </div>
                <DesiredOutcomeModal 
                  caseId={params.id as string}
                  onOutcomeChange={loadDesiredOutcomes}
                />
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {desiredOutcomes.length > 0 ? desiredOutcomes.map((outcome) => (
                    <div key={outcome.id} className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {outcome.vector_db_indexed && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Indexed
                            </Badge>
                          )}
                          {outcome.vector_indexing_failed && (
                            <Badge variant="outline" className="text-xs text-red-600">
                              Index Failed
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <DesiredOutcomeModal 
                            caseId={params.id as string}
                            outcome={outcome}
                            onOutcomeChange={loadDesiredOutcomes}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            type="outcome"
                            id={outcome.id}
                            title={outcome.description}
                            onDelete={loadDesiredOutcomes}
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Archive className="h-3 w-3" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <p className="text-sm leading-relaxed line-clamp-3 cursor-pointer hover:text-blue-600">
                            {outcome.description}
                          </p>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed">{outcome.description}</p>
                            <div className="flex flex-col space-y-1 text-xs text-muted-foreground pt-2 border-t">
                              <span>Created by: {outcome.created_by?.full_name || 'Unknown'}</span>
                              <span>Created: {formatDate(outcome.created_at)}</span>
                          </div>
                        </div>
                        </PopoverContent>
                      </Popover>
                      </div>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No desired outcomes defined for this case yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add desired outcomes to help guide case strategy and track success metrics.
                      </p>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Reports & Timelines</CardTitle>
                <CardDescription>Published reports from team members with approval timelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.length > 0 ? reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{report.title}</h4>
                            <Badge variant="outline">{report.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{report.summary}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>By {report.author}</span>
                            <span>Submitted: {report.submittedDate}</span>
                            <span>Approved: {report.approvedDate}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reports have been published for this case yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  AI-Generated Strategies
                </CardTitle>
                <CardDescription>Strategic approaches generated by AI for this case</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStrategies ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading strategies...</span>
                  </div>
                ) : (
                <div className="space-y-6">
                    {strategies.length > 0 ? strategies.map((strategy) => (
                    <div key={strategy.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{strategy.title}</h4>
                              <Badge variant="outline">{strategy.strategy_type?.replace('_', ' ')}</Badge>
                              <Badge variant={
                                strategy.priority === 'urgent' ? 'destructive' :
                                strategy.priority === 'high' ? 'default' :
                                strategy.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {strategy.priority}
                              </Badge>
                          </div>
                            <p className="text-sm text-muted-foreground">{strategy.description}</p>
                            {strategy.key_points && strategy.key_points.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Key Points:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                  {strategy.key_points.map((point: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Generated: {formatDate(strategy.created_at)}</span>
                              <span>Confidence: {Math.round((strategy.confidence || 0.7) * 100)}%</span>
                              <span>Status: {strategy.status}</span>
                        </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-2" />
                                View Details
                        </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{strategy.title}</DialogTitle>
                                <DialogDescription>
                                  AI-Generated Strategy • {strategy.strategy_type?.replace('_', ' ')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Description</h4>
                                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                                </div>
                                
                                {/* Implementation Steps with Timeline */}
                                {strategy.strategy_data?.steps && strategy.strategy_data.steps.length > 0 && (
                                  <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <h4 className="font-medium text-base mb-6 flex items-center text-blue-900">
                                      <Calendar className="h-5 w-5 mr-2" />
                                      Implementation Timeline
                                    </h4>
                                    <div className="relative">
                                      {/* Vertical Timeline Line */}
                                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-300"></div>
                                      
                                      <div className="space-y-6">
                                        {strategy.strategy_data.steps.map((step: any, index: number) => (
                                          <div key={index} className="relative pl-12">
                                            {/* Timeline Dot */}
                                            <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-500 border-4 border-blue-100 flex items-center justify-center shadow-md z-10">
                                              <span className="text-white text-xs font-bold">{step.step || index + 1}</span>
                                            </div>
                                            
                                            {/* Step Content Card */}
                                            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <h5 className="font-semibold text-sm text-blue-900">Step {step.step || index + 1}</h5>
                                                    {step.timeline && (
                                                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {step.timeline}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <p className="text-sm text-gray-700 leading-relaxed">{step.action}</p>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                {step.responsible && (
                                                  <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                                                    <Users className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                                    <span className="font-medium">Responsible:</span>
                                                    <span className="ml-1 capitalize">{step.responsible}</span>
                                                  </div>
                                                )}
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className={`text-xs ${convertedSteps.has(`${strategy.id}-${index}`) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                  onClick={() => handleConvertStepToTask(strategy, step, index)}
                                                  disabled={convertedSteps.has(`${strategy.id}-${index}`) || (convertingStep?.strategyId === strategy.id && convertingStep?.stepIndex === index)}
                                                >
                                                  {convertedSteps.has(`${strategy.id}-${index}`) ? (
                                                    <>✓ Converted</>
                                                  ) : convertingStep?.strategyId === strategy.id && convertingStep?.stepIndex === index ? (
                                                    <>Converting...</>
                                                  ) : (
                                                    <>Convert to Task</>
                                                  )}
                                                </Button>
                                              </div>
                      </div>
                    </div>
                  ))}
                </div>
                                    </div>
                                  </div>
                                )}

                                {/* Risks */}
                                {strategy.strategy_data?.risks && strategy.strategy_data.risks.length > 0 && (
                                  <div className="border rounded-lg p-4 bg-orange-50">
                                    <h4 className="font-medium text-sm mb-3 flex items-center text-orange-700">
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Potential Risks
                                    </h4>
                                    <ul className="text-sm space-y-2">
                                      {strategy.strategy_data.risks.map((risk: string, index: number) => (
                                        <li key={index} className="flex items-start bg-white p-2 rounded">
                                          <span className="mr-2 text-orange-500">⚠️</span>
                                          <span className="text-muted-foreground capitalize">{risk}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Resources Needed */}
                                {strategy.strategy_data?.resources_needed && strategy.strategy_data.resources_needed.length > 0 && (
                                  <div className="border rounded-lg p-4 bg-green-50">
                                    <h4 className="font-medium text-sm mb-3 flex items-center text-green-700">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Resources Needed
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {strategy.strategy_data.resources_needed.map((resource: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="capitalize">
                                          {resource}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Success Metrics */}
                                {strategy.strategy_data?.success_metrics && strategy.strategy_data.success_metrics.length > 0 && (
                                  <div className="border rounded-lg p-4 bg-purple-50">
                                    <h4 className="font-medium text-sm mb-3 flex items-center text-purple-700">
                                      <Target className="h-4 w-4 mr-2" />
                                      Success Metrics
                                    </h4>
                                    <ul className="text-sm space-y-2">
                                      {strategy.strategy_data.success_metrics.map((metric: string, index: number) => (
                                        <li key={index} className="flex items-start bg-white p-2 rounded">
                                          <span className="mr-2">✓</span>
                                          <span className="text-muted-foreground capitalize">{metric}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Priority</p>
                                    <Badge variant={
                                      strategy.priority === 'urgent' ? 'destructive' :
                                      strategy.priority === 'high' ? 'default' :
                                      'secondary'
                                    }>
                                      {strategy.priority}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className="text-sm font-medium capitalize">{strategy.status}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Confidence Score</p>
                                    <p className="text-sm font-medium">{Math.round((strategy.confidence || 0.7) * 100)}%</p>
                                  </div>
                                  {strategy.strategy_data?.estimated_duration && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Estimated Duration</p>
                                      <p className="text-sm font-medium capitalize">{strategy.strategy_data.estimated_duration}</p>
                                    </div>
                                  )}
                                  {strategy.strategy_data?.cost_estimate && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Cost Estimate</p>
                                      <Badge variant="outline" className="capitalize">
                                        {strategy.strategy_data.cost_estimate}
                                      </Badge>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-xs text-muted-foreground">Generated</p>
                                    <p className="text-sm font-medium">{formatDate(strategy.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No AI strategies generated for this case yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Strategies are automatically generated when a case is created. They may take a few moments to appear.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artifacts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Archive className="h-5 w-5 mr-2" />
                    Artifacts
                  </CardTitle>
                  <CardDescription>
                    All documents and evidence related to this case.
                  </CardDescription>
                </div>
                <AddArtifactDialog 
                  caseId={params.id as string}
                  onArtifactAdded={loadArtifacts} 
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artifacts.length > 0 ? artifacts.map((artifact) => (
                    <div key={artifact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{artifact.title}</h4>
                            <Badge variant="outline">{artifact.document_type || 'Document'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{artifact.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Added by {artifact.uploaded_by_name}</span>
                            <span>{new Date(artifact.created_at).toLocaleDateString()}</span>
                            <span>{(artifact.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getStatusColor(artifact.status)}>{artifact.status}</Badge>
                          <div className="flex space-x-2">
                            {/* View button for PDFs and images */}
                            {(artifact.file_type?.includes('pdf') || artifact.file_type?.startsWith('image/')) && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => window.open(artifact.view_url, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            )}
                            {/* Download button */}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(artifact.download_url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No artifacts have been added to this case yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <Card className="h-[600px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>Chat with Rhoda AI about your case</CardDescription>
                </div>
                <ChatHistoryDrawer 
                  caseId={caseData.id}
                  currentSessionId={currentChatSessionId || undefined}
                  onSessionSelect={(session) => {
                    setCurrentChatSessionId(session.id)
                  }}
                  onNewSession={() => {
                    setCurrentChatSessionId(null)
                  }}
                />
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {caseData && (
                  <EnhancedAIAssistantChat
                    caseId={caseData.id}
                    sessionId={currentChatSessionId}
                    onSessionChange={(sessionId) => {
                      setCurrentChatSessionId(sessionId)
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ProtectedRoute>
  )
}
