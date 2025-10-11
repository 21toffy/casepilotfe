"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, Users, FileText, TrendingUp, Clock, CheckCircle, MessageSquare,
  ChevronRight, ThumbsDown, PlusCircle
} from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"
import { ConvertRecommendationModal } from "@/components/convert-recommendation-modal"
import { TaskDetailsModal } from "@/components/task-details-modal"

// Interfaces for API data
interface DashboardStats {
  active_cases: number
  team_members: number
  pending_tasks: number
  success_rate: number
}

interface ActiveCase {
  id: number
  uid: string
  title: string
  reference_number: string
  case_type: string
  status: string
  jurisdiction: string
  court_location: string
  description?: string
  progress_percentage: number
  participants_count: number
  user_role: string
  created_by: {
    full_name: string
    email: string
  }
  created_at: string
  updated_at: string
}

interface Recommendation {
  id: number
  title: string
  description: string
  recommendation_type: string
  case_title: string
  case_id: number
  priority?: string
}

interface UpcomingTask {
  id: number
  title: string
  case_title: string
  case_id: number
  due_date: string | null
  priority: string
}

interface TeamMember {
  id: number
  uid: string
  full_name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Real data state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingCases, setIsLoadingCases] = useState(true)

  // New state for recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [recommendationsPage, setRecommendationsPage] = useState(1)
  const [recommendationsHasMore, setRecommendationsHasMore] = useState(false)

  // New state for tasks
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [tasksPage, setTasksPage] = useState(1)
  const [tasksHasMore, setTasksHasMore] = useState(false)

  // New state for tabs
  const [allCases, setAllCases] = useState<ActiveCase[]>([])
  const [isLoadingAllCases, setIsLoadingAllCases] = useState(true)
  const [casesPage, setCasesPage] = useState(1)
  const [casesHasMore, setCasesHasMore] = useState(false)

  const [allTasks, setAllTasks] = useState<UpcomingTask[]>([])
  const [isLoadingAllTasks, setIsLoadingAllTasks] = useState(true)
  const [allTasksPage, setAllTasksPage] = useState(1)
  const [allTasksHasMore, setAllTasksHasMore] = useState(false)

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true)

  // State for the conversion modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'cases' && allCases.length === 0) {
      loadAllCases()
    } else if (activeTab === 'tasks' && allTasks.length === 0) {
      loadAllTasks()
    } else if (activeTab === 'team' && teamMembers.length === 0) {
      loadTeamMembers()
    }
  }, [activeTab])


  const loadDashboardData = async () => {
    await Promise.all([
      loadDashboardStats(),
      loadActiveCases(),
      loadRecommendations(),
      loadUpcomingTasks()
    ])
  }

  const loadDashboardStats = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/dashboard/stats/')
      
      if (response.data) {
        setStats(response.data)
      } else {
        console.warn('No stats data received')
      }
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error)
      toast({
        variant: "destructive",
        title: "Failed to load dashboard statistics",
        description: "Some data may not be up to date.",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadActiveCases = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/cases/active/')
      
      if (response.data) {
        setActiveCases(response.data)
      } else {
        setActiveCases([])
      }
    } catch (error: any) {
      console.error('Failed to load active cases:', error)
      toast({
        variant: "destructive",
        title: "Failed to load active cases",
        description: "Please try refreshing the page.",
      })
      setActiveCases([])
    } finally {
      setIsLoadingCases(false)
    }
  }

  const loadRecommendations = async (page = 1) => {
    setIsLoadingRecommendations(true)
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/recommendations/?page=${page}`)
      
      if (response.data && response.data.results) {
        setRecommendations(prev => page === 1 ? response.data.results : [...prev, ...response.data.results])
        setRecommendationsHasMore(!!response.data.next)
      } else {
        setRecommendations([])
        setRecommendationsHasMore(false)
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error)
      toast({
        variant: "destructive",
        title: "Failed to load AI recommendations",
      })
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const loadUpcomingTasks = async (page = 1) => {
    setIsLoadingTasks(true)
    try {
      const apiClient = getApiClient()
      // Fetch open tasks, sorted by due date
      const response = await apiClient.get(`/api/tasks/?page=${page}&status=open&ordering=due_date`)
      
      if (response.data && response.data.results) {
        setUpcomingTasks(prev => page === 1 ? response.data.results : [...prev, ...response.data.results])
        setTasksHasMore(!!response.data.next)
      } else {
        setUpcomingTasks([])
        setTasksHasMore(false)
      }
    } catch (error: any) {
      console.error('Failed to load upcoming tasks:', error)
      toast({
        variant: "destructive",
        title: "Failed to load upcoming tasks",
      })
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const loadAllCases = async (page = 1) => {
    setIsLoadingAllCases(true)
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/?page=${page}`)
      if (response.data && response.data.results) {
        setAllCases(prev => page === 1 ? response.data.results : [...prev, ...response.data.results])
        setCasesHasMore(!!response.data.next)
      } else {
        setAllCases([])
        setCasesHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load all cases:', error)
      toast({ variant: 'destructive', title: 'Failed to load cases' })
    } finally {
      setIsLoadingAllCases(false)
    }
  }

  const loadAllTasks = async (page = 1) => {
    setIsLoadingAllTasks(true)
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/tasks/?page=${page}`)
      if (response.data && response.data.results) {
        setAllTasks(prev => page === 1 ? response.data.results : [...prev, ...response.data.results])
        setAllTasksHasMore(!!response.data.next)
      } else {
        setAllTasks([])
        setAllTasksHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load all tasks:', error)
      toast({ variant: 'destructive', title: 'Failed to load tasks' })
    } finally {
      setIsLoadingAllTasks(false)
    }
  }

  const loadTeamMembers = async () => {
    setIsLoadingTeamMembers(true)
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/users/dashboard/team/`)
      if (response.data) {
        setTeamMembers(response.data)
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.error('Failed to load team members:', error)
      toast({ variant: 'destructive', title: 'Failed to load team members' })
    } finally {
      setIsLoadingTeamMembers(false)
    }
  }

  const handleDismissRecommendation = async (recommendationId: number) => {
    try {
      const apiClient = getApiClient()
      await apiClient.post(`/api/recommendations/${recommendationId}/dismiss/`, {})
      
      toast({
        title: "Recommendation dismissed",
      })
      
      // Remove from list
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
      
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error)
      toast({ variant: 'destructive', title: 'Failed to dismiss recommendation' })
    }
  }
  
  const handleOpenConvertToTaskModal = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation)
    setIsModalOpen(true)
  }

  const handleTaskCreated = (recommendationId: number) => {
    // Remove the recommendation from the list and refresh tasks
    setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
    loadUpcomingTasks() // Refresh upcoming tasks list
  }

  // Helper function to format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.active_cases || 0}
              </div>
              <p className="text-xs text-muted-foreground">Cases you're participating in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.team_members || 0}
              </div>
              <p className="text-xs text-muted-foreground">People in your firm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.pending_tasks || 0}
              </div>
              <p className="text-xs text-muted-foreground">Tasks awaiting completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : `${stats?.success_rate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">Overall case success rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Cases */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Cases</CardTitle>
                    <CardDescription>Your most active cases</CardDescription>
                  </div>
                  <Link href="/cases/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingCases ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : activeCases.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No active cases yet</p>
                      <Link href="/cases/new">
                        <Button size="sm" className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Case
                        </Button>
                      </Link>
                    </div>
                  ) : activeCases.map((case_) => (
                    <Link key={case_.id} href={`/cases/${case_.id}`}>
                      <div className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{case_.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={case_.status === "open" ? "default" : "secondary"}>
                                {case_.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant={case_.user_role === "case_owner" ? "default" : "outline"}>
                                {case_.user_role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{case_.case_type.replace('_', ' ')}</div>
                            <div className="flex items-center mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {case_.participants_count}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{case_.progress_percentage}%</span>
                          </div>
                          <Progress value={case_.progress_percentage} className="h-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks requiring your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingTasks ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1 space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No upcoming tasks</p>
                      <p className="text-xs text-gray-400">Tasks will appear here when you create cases</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.case_title}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={
                                task.priority.toLowerCase() === "high"
                              ? "destructive"
                                  : task.priority.toLowerCase() === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                            <p className="text-xs text-muted-foreground">{formatDate(task.due_date)}</p>
                      </div>
                    </div>
                  ))}
                      {tasksHasMore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadUpcomingTasks(tasksPage + 1)}
                          disabled={isLoadingTasks}
                          className="w-full"
                        >
                          {isLoadingTasks ? "Loading..." : "Load More Tasks"}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  AI Insights & Recommendations
                </CardTitle>
                <CardDescription>Intelligent suggestions based on your case data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {isLoadingRecommendations ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No AI recommendations yet</p>
                    <p className="text-xs text-gray-400">Recommendations will appear here when you create cases</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                          <Link href={`/cases/${rec.case_id}`}>
                            <Button variant="ghost" size="sm">
                              View Case <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{rec.recommendation_type.replace('_', ' ')}</Badge>
                            <span className="text-xs text-muted-foreground">For: {rec.case_title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenConvertToTaskModal(rec)}>
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Convert to Task
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDismissRecommendation(rec.id)}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                </div>
                </div>
                    ))}
                    {recommendationsHasMore && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadRecommendations(recommendationsPage + 1)}
                        disabled={isLoadingRecommendations}
                        className="w-full"
                      >
                        {isLoadingRecommendations ? "Loading..." : "Load More Recommendations"}
                      </Button>
                    )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Cases</CardTitle>
                  <CardDescription>Manage and track all your cases</CardDescription>
                </div>
                <Link href="/cases/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Case
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingAllCases && allCases.length === 0 ? (
                  <p>Loading cases...</p>
                ) : allCases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No cases found.</p>
                    <Link href="/cases/new"><Button className="mt-4">Create First Case</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allCases.map((case_) => (
                      <Link key={case_.id} href={`/cases/${case_.id}`}>
                        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                          <h4 className="font-medium">{case_.title}</h4>
                          <p className="text-sm text-muted-foreground">{case_.reference_number}</p>
                          <div className="flex justify-between items-end mt-2">
                            <Badge variant={case_.status === 'open' ? 'default' : 'secondary'}>
                              {case_.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Updated: {formatDate(case_.updated_at)}
                            </span>
                          </div>
                        </div>
                  </Link>
                    ))}
                    {casesHasMore && (
                      <Button variant="outline" onClick={() => loadAllCases(casesPage + 1)} disabled={isLoadingAllCases}>
                        {isLoadingAllCases ? 'Loading...' : 'Load More'}
                      </Button>
                    )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>Track and manage all tasks across cases</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAllTasks && allTasks.length === 0 ? (
                  <p>Loading tasks...</p>
                ) : allTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link href={`/cases/${task.case_id}`} className="text-sm text-blue-600 hover:underline">
                              {task.case_title}
                            </Link>
                            <h4 className="font-medium mt-1">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={task.priority.toLowerCase() === 'high' ? 'destructive' : 'default'}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Due: {formatDate(task.due_date)}
                              </span>
                            </div>
                          </div>
                          <TaskDetailsModal 
                            task={task} 
                            trigger={
                              <Button variant="outline" size="sm">View Details</Button>
                            }
                            onTaskUpdate={() => loadAllTasks()}
                          />
                        </div>
                      </div>
                    ))}
                    {allTasksHasMore && (
                      <Button variant="outline" onClick={() => loadAllTasks(allTasksPage + 1)} disabled={isLoadingAllTasks}>
                        {isLoadingAllTasks ? 'Loading...' : 'Load More'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage team members and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTeamMembers ? (
                  <p>Loading team members...</p>
                ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No team members found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{member.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge>{member.role.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <ConvertRecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={selectedRecommendation}
        onTaskCreated={handleTaskCreated}
      />
      </div>
    </ProtectedRoute>
  )
}
