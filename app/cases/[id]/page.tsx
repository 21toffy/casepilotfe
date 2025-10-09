"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AIAssistantChat } from "@/components/ai-assistant-chat"
import { AddArtifactDialog } from "@/components/add-artifact-dialog"
import { PDFExportDialog } from "@/components/pdf-export-dialog"
import { CourtReportEditor } from "@/components/court-report-editor"
import { AddHearingModal } from "@/components/add-hearing-modal"
import { TaskSubmissionModal } from "@/components/task-submission-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"
import { CaseFactModal } from "@/components/case-fact-modal"
import { DesiredOutcomeModal } from "@/components/desired-outcome-modal"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { RegenerateCaseDialog } from "@/components/regenerate-case-dialog"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"
import ProtectedRoute from "@/components/protected-route"

export default function CaseDetailPage() {
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
  const [loadingStrategies, setLoadingStrategies] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load case data on mount
  useEffect(() => {
    if (params.id && !hasLoaded) {
      setHasLoaded(true)
      loadCaseData()
      loadHearings()
      loadFacts()
      loadDesiredOutcomes()
      loadStrategies()
    }
  }, [params.id, hasLoaded])

  // Reset hasLoaded when case ID changes
  useEffect(() => {
    setHasLoaded(false)
  }, [params.id])

  const loadCaseData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/${params.id}/`)
      
      if (response.data) {
        setCaseData(response.data)
        setTeamMembers(response.data.team_members || [])
        
        // Generate mock tasks based on case data for now
        // TODO: Replace with real tasks API when tasks app is implemented
        const mockTasks = [
    {
      id: 1,
            title: `Review documents for ${response.data.title}`,
            description: "Analyze case documents and identify key evidence",
            assignedBy: response.data.created_by?.full_name || "System",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "High",
      status: "In Progress",
      submissionStatus: "Draft",
            lastUpdated: new Date().toISOString().split('T')[0],
    },
    {
      id: 2,
            title: `Prepare case strategy for ${response.data.title}`,
            description: "Develop comprehensive legal strategy and timeline",
            assignedBy: response.data.created_by?.full_name || "System",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "High",
      status: "Pending",
      submissionStatus: "Not Started",
            lastUpdated: new Date().toISOString().split('T')[0],
    },
    {
      id: 3,
            title: `Research legal precedents`,
            description: `Find similar cases in ${response.data.jurisdiction} jurisdiction`,
            assignedBy: response.data.created_by?.full_name || "System",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: "Medium",
      status: "Completed",
      submissionStatus: "Approved",
            lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        ]
        setMyTasks(mockTasks)
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
      
      if (response.data && response.data.results) {
        setStrategies(response.data.results)
      } else if (response.data) {
        setStrategies(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load strategies:', error)
      // Don't show error toast for strategies as it's not critical
    } finally {
      setLoadingStrategies(false)
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

  const myApprovals = [
    {
      id: 1,
      type: "Document",
      title: "Financial Records Analysis",
      submittedBy: "Mike Chen",
      submittedDate: "2024-01-07",
      status: "Pending Review",
      description: "Comprehensive analysis of client's financial damages",
    },
    {
      id: 2,
      type: "Report",
      title: "Witness Interview Summary",
      submittedBy: "Lisa Brown",
      submittedDate: "2024-01-06",
      status: "Approved",
      description: "Summary of key witness interviews and statements",
    },
    {
      id: 3,
      type: "Strategy",
      title: "Settlement Negotiation Strategy",
      submittedBy: "Sarah Wilson",
      submittedDate: "2024-01-05",
      status: "Needs Revision",
      description: "Proposed approach for settlement negotiations",
    },
  ]

  const courtDates = [
    {
      id: 1,
      type: "Hearing",
      title: "Motion for Summary Judgment",
      date: "2024-01-15",
      time: "10:00 AM",
      location: "Courtroom 3A, Superior Court of California",
      status: "Scheduled",
      judge: "Hon. Patricia Martinez",
    },
    {
      id: 2,
      type: "Deposition",
      title: "Plaintiff Deposition",
      date: "2024-01-18",
      time: "2:00 PM",
      location: "Smith & Associates Conference Room",
      status: "Scheduled",
      judge: "N/A",
    },
    {
      id: 3,
      type: "Hearing",
      title: "Case Management Conference",
      date: "2023-12-20",
      time: "9:00 AM",
      location: "Courtroom 2B, Superior Court of California",
      status: "Completed",
      judge: "Hon. Patricia Martinez",
    },
  ]

  const adjournments = [
    {
      id: 1,
      originalDate: "2023-12-15",
      newDate: "2024-01-15",
      reason: "Opposing counsel requested additional time for discovery",
      requestedBy: "Defense",
      approvedBy: "Hon. Patricia Martinez",
      approvedDate: "2023-12-10",
    },
  ]

  const teamReports = [
    {
      id: 1,
      title: "Contract Analysis Report",
      author: "Sarah Wilson",
      submittedDate: "2024-01-08",
      approvedDate: "2024-01-08",
      status: "Published",
      type: "Analysis",
      summary: "Detailed analysis of contract terms and breach elements",
    },
    {
      id: 2,
      title: "Discovery Phase Summary",
      author: "Mike Chen",
      submittedDate: "2024-01-06",
      approvedDate: "2024-01-07",
      status: "Published",
      type: "Summary",
      summary: "Summary of documents and evidence collected during discovery",
    },
    {
      id: 3,
      title: "Witness Statement Compilation",
      author: "Lisa Brown",
      submittedDate: "2024-01-05",
      approvedDate: "2024-01-06",
      status: "Published",
      type: "Evidence",
      summary: "Compiled witness statements and testimony summaries",
    },
  ]

  const publishedStrategies = [
    {
      id: 1,
      title: "Primary Litigation Strategy",
      author: "John Smith",
      publishedDate: "2024-01-08",
      category: "Litigation",
      summary: "Focus on contract breach elements and damages calculation",
      keyPoints: [
        "Establish clear timeline of breach events",
        "Document financial impact with expert testimony",
        "Pursue both compensatory and consequential damages",
      ],
    },
    {
      id: 2,
      title: "Settlement Negotiation Approach",
      author: "Sarah Wilson",
      publishedDate: "2024-01-07",
      category: "Settlement",
      summary: "Strategic approach for potential settlement discussions",
      keyPoints: [
        "Start with 80% of claimed damages",
        "Emphasize strength of breach evidence",
        "Consider structured payment terms",
      ],
    },
  ]

  const artifacts = [
    {
      id: 1,
      title: "Service Agreement (Original)",
      type: "Contract",
      dateAdded: "2023-12-01",
      addedBy: "John Smith",
      status: "Approved",
      description: "Original service agreement between parties",
    },
    {
      id: 2,
      title: "Breach Notice Letter",
      type: "Legal Notice",
      dateAdded: "2024-01-05",
      addedBy: "Sarah Wilson",
      status: "Approved",
      description: "Formal notice of contract breach sent to defendant",
    },
    {
      id: 3,
      title: "Financial Damage Assessment",
      type: "Analysis",
      dateAdded: "2024-01-07",
      addedBy: "Mike Chen",
      status: "Approved",
      description: "Comprehensive financial impact analysis",
    },
    {
      id: 4,
      title: "Expert Witness Report",
      type: "Expert Opinion",
      dateAdded: "2024-01-08",
      addedBy: "Lisa Brown",
      status: "Under Review",
      description: "Technical expert analysis of software development issues",
    },
  ]

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
        {/* Case Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              <p className="text-gray-600 mt-1">Case #{caseData.quick_stats?.case_number || caseData.reference_number}</p>
            </div>
            <div className="flex items-center space-x-2">
              <RegenerateCaseDialog 
                caseId={params.id as string}
                caseTitle={caseData.title}
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
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
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
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Tasks assigned to you for this case</CardDescription>
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
                          <Badge variant={getStatusColor(task.submissionStatus)}>{task.submissionStatus}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{task.status}</Badge>
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <TaskSubmissionModal 
                                task={task}
                                onSubmissionUpdate={loadCaseData}
                              />
                          <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
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
                <CardTitle>My Approvals</CardTitle>
                <CardDescription>Items requiring your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{approval.title}</h4>
                            <Badge variant="outline">{approval.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{approval.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted by {approval.submittedBy} on {approval.submittedDate}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(approval.status)}>{approval.status}</Badge>
                      </div>
                      {approval.status === "Pending Review" && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="default">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Request Changes
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {facts.length > 0 ? facts.map((fact) => (
                    <div key={fact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{fact.fact_text}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {fact.source_type === 'AI_GENERATED' ? 'AI Generated' : 
                               fact.source_type === 'USER_GENERATED' ? 'User Generated' :
                               'User Modified'}
                            </Badge>
                            <span>Created: {formatDate(fact.created_at)}</span>
                            {fact.is_modified && (
                              <span>Modified by: {fact.modified_by?.full_name || 'Unknown'}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <CaseFactModal 
                            caseId={params.id as string}
                            fact={fact}
                            onFactChange={loadFacts}
                            trigger={
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            type="fact"
                            id={fact.id}
                            title={fact.fact_text}
                            onDelete={loadFacts}
                            trigger={
                              <Button size="sm" variant="ghost">
                                <Archive className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
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
                <div className="space-y-4">
                  {desiredOutcomes.length > 0 ? desiredOutcomes.map((outcome) => (
                    <div key={outcome.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{outcome.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>Created by: {outcome.created_by?.full_name || 'Unknown'}</span>
                            <span>Created: {formatDate(outcome.created_at)}</span>
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
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <DesiredOutcomeModal 
                            caseId={params.id as string}
                            outcome={outcome}
                            onOutcomeChange={loadDesiredOutcomes}
                            trigger={
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DeleteConfirmation
                            type="outcome"
                            id={outcome.id}
                            title={outcome.description}
                            onDelete={loadDesiredOutcomes}
                            trigger={
                              <Button size="sm" variant="ghost">
                                <Archive className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
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
                  {teamReports.map((report) => (
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
                  ))}
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
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
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
                    Case Artifacts
                  </CardTitle>
                  <CardDescription>Important documents and evidence for this case</CardDescription>
                </div>
                <AddArtifactDialog onArtifactAdded={(artifact) => console.log("Artifact added:", artifact)} />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artifacts.map((artifact) => (
                    <div key={artifact.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{artifact.title}</h4>
                            <Badge variant="outline">{artifact.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{artifact.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Added by {artifact.addedBy} on {artifact.dateAdded}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getStatusColor(artifact.status)}>{artifact.status}</Badge>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <AIAssistantChat caseId={caseData.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ProtectedRoute>
  )
}
