"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, FileText, TrendingUp, Clock, CheckCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { RecommendationModal } from "@/components/recommendation-modal"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"

// Interfaces for API data
interface DashboardStats {
  active_cases: number
  team_members: number
  pending_tasks: number
  tasks_awaiting_review: number
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

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface UpcomingTask {
  id: number
  uid: string
  title: string
  task_type: string
  status: string
  priority: string
  due_date: string | null
  progress_percentage: number
  case_title: string
  assigned_to_name: string
  is_overdue: boolean
  created_at: string
}

interface AIRecommendation {
  id: number
  uid: string
  title: string
  description: string
  recommendation_type: string
  priority: string
  status: string
  case_id: number
  case_title: string
  confidence_score: number
  action_data: Record<string, any>
  created_at: string
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")

  // Real data state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  
  // Recent Cases with endless scroll
  const [activeCases, setActiveCases] = useState<ActiveCase[]>([])
  const [recentCasesPage, setRecentCasesPage] = useState(1)
  const [recentCasesHasMore, setRecentCasesHasMore] = useState(true)
  const [isLoadingCases, setIsLoadingCases] = useState(true)
  const [isLoadingMoreCases, setIsLoadingMoreCases] = useState(false)
  const [recentCasesExpanded, setRecentCasesExpanded] = useState(false)
  
  // All Cases with endless scroll (for Cases tab)
  const [allCases, setAllCases] = useState<ActiveCase[]>([])
  const [allCasesPage, setAllCasesPage] = useState(1)
  const [allCasesHasMore, setAllCasesHasMore] = useState(true)
  const [isLoadingAllCases, setIsLoadingAllCases] = useState(true)
  const [isLoadingMoreAllCases, setIsLoadingMoreAllCases] = useState(false)
  const [allCasesExpanded, setAllCasesExpanded] = useState(false)
  
  // All Tasks with endless scroll (for Tasks tab)
  const [allTasks, setAllTasks] = useState<UpcomingTask[]>([])
  const [allTasksPage, setAllTasksPage] = useState(1)
  const [allTasksHasMore, setAllTasksHasMore] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false)
  const [allTasksExpanded, setAllTasksExpanded] = useState(false)
  
  // AI Recommendations with endless scroll
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [recommendationsPage, setRecommendationsPage] = useState(1)
  const [recommendationsHasMore, setRecommendationsHasMore] = useState(true)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [isLoadingMoreRecommendations, setIsLoadingMoreRecommendations] = useState(false)
  const [recommendationsExpanded, setRecommendationsExpanded] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load all cases when Cases tab is activated
  useEffect(() => {
    if (activeTab === 'cases') {
      loadAllCases(1) // Reset to page 1 when switching tabs
    } else if (activeTab === 'tasks') {
      loadAllTasks(1) // Reset to page 1 when switching tabs
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    await Promise.all([
      loadDashboardStats(),
      loadRecentCases(),
      loadRecommendations()
    ])
  }

  const loadRecentCases = async (page = 1, append = false) => {
    try {
      if (!append) setIsLoadingCases(true)
      else setIsLoadingMoreCases(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/users/dashboard/recent-cases/?page=${page}&page_size=10`)
      
      if (response.data) {
        const paginatedData = response.data as PaginatedResponse<ActiveCase>
        
        if (append) {
          setActiveCases(prev => [...prev, ...paginatedData.results])
        } else {
          setActiveCases(paginatedData.results)
        }
        
        setRecentCasesHasMore(!!paginatedData.next)
        setRecentCasesPage(page)
      } else {
        if (!append) setActiveCases([])
      }
    } catch (error: any) {
      console.error('Failed to load recent cases:', error)
      if (!append) setActiveCases([])
    } finally {
      setIsLoadingCases(false)
      setIsLoadingMoreCases(false)
    }
  }

  const loadMoreRecentCases = () => {
    if (recentCasesHasMore && !isLoadingMoreCases) {
      loadRecentCases(recentCasesPage + 1, true)
    }
  }

  const loadAllCases = async (page = 1, append = false) => {
    try {
      if (!append) setIsLoadingAllCases(true)
      else setIsLoadingMoreAllCases(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/cases/?page=${page}&page_size=20`)
      
      if (response.data && (response.data as any).results) {
        const paginatedData = (response.data as any) as PaginatedResponse<ActiveCase>
        
        if (append) {
          setAllCases(prev => [...prev, ...paginatedData.results])
        } else {
          setAllCases(paginatedData.results)
        }
        
        setAllCasesHasMore(!!paginatedData.next)
        setAllCasesPage(page)
      } else {
        if (!append) setAllCases([])
      }
    } catch (error: any) {
      console.error('Failed to load all cases:', error)
      if (!append) {
        toast({
          variant: "destructive",
          title: "Failed to load cases",
          description: "Please try refreshing the page.",
        })
        setAllCases([])
      }
    } finally {
      setIsLoadingAllCases(false)
      setIsLoadingMoreAllCases(false)
    }
  }

  const loadMoreAllCases = () => {
    if (allCasesHasMore && !isLoadingMoreAllCases) {
      loadAllCases(allCasesPage + 1, true)
    }
  }

  const loadAllTasks = async (page = 1, append = false) => {
    try {
      if (!append) setIsLoadingTasks(true)
      else setIsLoadingMoreTasks(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/tasks/?page=${page}&page_size=20`)
      
      if (response.data) {
        const paginatedData = response.data as PaginatedResponse<UpcomingTask>
        
        if (append) {
          setAllTasks(prev => [...prev, ...paginatedData.results])
        } else {
          setAllTasks(paginatedData.results)
        }
        
        setAllTasksHasMore(!!paginatedData.next)
        setAllTasksPage(page)
      } else {
        if (!append) setAllTasks([])
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error)
      // Fallback to mock data for now
      // For now, generate mock tasks based on active cases
      const mockTasks = activeCases.flatMap((case_, index) => [
        {
          id: index * 3 + 1,
          uid: `task-${index * 3 + 1}`,
          title: `Review documents for ${case_.title}`,
          task_type: 'task',
          status: 'open',
          priority: case_.user_role === 'case_owner' ? 'high' : 'medium',
          due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          progress_percentage: 0,
          case_title: case_.title,
          assigned_to_name: 'You',
          is_overdue: false,
          created_at: case_.created_at
        },
        {
          id: index * 3 + 2,
          uid: `task-${index * 3 + 2}`,
          title: `Prepare motion for ${case_.title}`,
          task_type: 'task',
          status: 'in_progress',
          priority: 'high',
          due_date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          progress_percentage: 45,
          case_title: case_.title,
          assigned_to_name: 'You',
          is_overdue: false,
          created_at: case_.created_at
        },
        {
          id: index * 3 + 3,
          uid: `task-${index * 3 + 3}`,
          title: `Client consultation for ${case_.title}`,
          task_type: 'task',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
          progress_percentage: 0,
          case_title: case_.title,
          assigned_to_name: 'You',
          is_overdue: false,
          created_at: case_.created_at
        }
      ]).slice(0, 20); // Limit to 20 tasks
      
      if (!append) setAllTasks(mockTasks);
    } finally {
      setIsLoadingTasks(false);
      setIsLoadingMoreTasks(false);
    }
  }

  const loadMoreAllTasks = () => {
    if (allTasksHasMore && !isLoadingMoreTasks) {
      loadAllTasks(allTasksPage + 1, true)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/dashboard/stats/')
      
      if (response.data) {
        setStats(response.data as DashboardStats)
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
        setActiveCases(response.data as ActiveCase[])
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

  const loadRecommendations = async (page = 1, append = false) => {
    try {
      if (!append) setIsLoadingRecommendations(true)
      else setIsLoadingMoreRecommendations(true)
      
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/users/dashboard/recommendations/?page=${page}&page_size=10&status=active`)
      
      if (response.data) {
        const paginatedData = response.data as PaginatedResponse<AIRecommendation>
        
        if (append) {
          setRecommendations(prev => [...prev, ...paginatedData.results])
        } else {
          setRecommendations(paginatedData.results)
        }
        
        setRecommendationsHasMore(!!paginatedData.next)
        setRecommendationsPage(page)
      } else {
        if (!append) setRecommendations([])
      }
    } catch (error: any) {
      console.error('Failed to load recommendations:', error)
      // Don't show error toast for recommendations - they're not critical
      if (!append) setRecommendations([])
    } finally {
      setIsLoadingRecommendations(false)
      setIsLoadingMoreRecommendations(false)
    }
  }

  const loadMoreRecommendations = () => {
    if (recommendationsHasMore && !isLoadingMoreRecommendations) {
      loadRecommendations(recommendationsPage + 1, true)
    }
  }

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Compress/Expand handlers
  const toggleRecentCasesExpanded = () => {
    if (recentCasesExpanded) {
      // Compress: Reset to first few items
      setRecentCasesExpanded(false)
      loadRecentCases(1, false) // Reload initial data
    } else {
      // Expand: Load more data
      setRecentCasesExpanded(true)
    }
  }

  const toggleAllCasesExpanded = () => {
    if (allCasesExpanded) {
      setAllCasesExpanded(false)
      loadAllCases(1, false)
    } else {
      setAllCasesExpanded(true)
    }
  }

  const toggleAllTasksExpanded = () => {
    if (allTasksExpanded) {
      setAllTasksExpanded(false)
      loadAllTasks(1, false)
    } else {
      setAllTasksExpanded(true)
    }
  }

  const toggleRecommendationsExpanded = () => {
    if (recommendationsExpanded) {
      setRecommendationsExpanded(false)
      loadRecommendations(1, false)
    } else {
      setRecommendationsExpanded(true)
    }
  }

  // Load More / Compress Controls Component
  const EndlessScrollControls = ({
    hasMore,
    isLoading,
    isExpanded,
    onLoadMore,
    onToggleExpanded,
    itemType = "items"
  }: {
    hasMore: boolean
    isLoading: boolean
    isExpanded: boolean
    onLoadMore: () => void
    onToggleExpanded: () => void
    itemType?: string
  }) => {
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex gap-2">
          {isExpanded && hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : `Load More ${itemType}`}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
          >
            {isExpanded ? `Compress ${itemType}` : `Show All ${itemType}`}
          </Button>
        </div>
        
        {isExpanded && !hasMore && (
          <span className="text-sm text-muted-foreground">
            All {itemType} loaded
          </span>
        )}
      </div>
    )
  }

  // TODO: Replace with real tasks API when tasks app is implemented
  const upcomingTasks = activeCases.slice(0, 3).map((case_, index) => ({
    id: index + 1,
    title: `Review documents for ${case_.title}`,
    case: case_.title,
    due: index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDate(case_.updated_at),
    priority: case_.user_role === "case_owner" ? "High" : "Medium"
  }))

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
              <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.tasks_awaiting_review || 0}
              </div>
              <p className="text-xs text-muted-foreground">Tasks awaiting your review</p>
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
                  ) : (
                    <>
                      {activeCases.slice(0, recentCasesExpanded ? activeCases.length : 5).map((case_) => (
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
                      
                      {activeCases.length > 0 && (
                        <EndlessScrollControls
                          hasMore={recentCasesHasMore}
                          isLoading={isLoadingMoreCases}
                          isExpanded={recentCasesExpanded}
                          onLoadMore={loadMoreRecentCases}
                          onToggleExpanded={toggleRecentCasesExpanded}
                          itemType="Cases"
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks requiring your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingCases ? (
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
                  ) : upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.case}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={
                            task.priority === "High"
                              ? "destructive"
                              : task.priority === "Medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{task.due}</p>
                      </div>
                    </div>
                  ))}
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
                      <div key={i} className="animate-pulse border-l-4 border-gray-200 pl-4 py-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                    ))}
                </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No AI recommendations available</p>
                    <p className="text-xs text-gray-400 mt-2">Recommendations will appear as you work on cases</p>
                </div>
                ) : (
                  <>
                    {recommendations.slice(0, recommendationsExpanded ? recommendations.length : 5).map((recommendation) => (
                      <RecommendationModal
                        key={recommendation.id}
                        recommendation={recommendation}
                        onRecommendationUpdate={loadRecommendations}
                      />
                    ))}
                    
                    {recommendations.length > 0 && (
                      <EndlessScrollControls
                        hasMore={recommendationsHasMore}
                        isLoading={isLoadingMoreRecommendations}
                        isExpanded={recommendationsExpanded}
                        onLoadMore={loadMoreRecommendations}
                        onToggleExpanded={toggleRecommendationsExpanded}
                        itemType="Recommendations"
                      />
                    )}
                  </>
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
                {isLoadingAllCases ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : allCases.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No cases found</p>
                    <Link href="/cases/new">
                      <Button className="mt-4">Create Your First Case</Button>
                  </Link>
                </div>
                ) : (
                  <div className="space-y-4">
                    {allCases.slice(0, allCasesExpanded ? allCases.length : 10).map((case_) => (
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
                    
                    {allCases.length > 0 && (
                      <EndlessScrollControls
                        hasMore={allCasesHasMore}
                        isLoading={isLoadingMoreAllCases}
                        isExpanded={allCasesExpanded}
                        onLoadMore={loadMoreAllCases}
                        onToggleExpanded={toggleAllCasesExpanded}
                        itemType="Cases"
                      />
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
                {isLoadingTasks ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks found</p>
                    <p className="text-xs text-gray-400 mt-2">Tasks will appear here when you create cases and assign work</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allTasks.slice(0, allTasksExpanded ? allTasks.length : 15).map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-muted-foreground">{task.case_title}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant={
                              task.priority === "high" ? "destructive" :
                              task.priority === "medium" ? "default" : "secondary"
                            }>
                              {task.priority}
                            </Badge>
                            <Badge variant={
                              task.status === "open" ? "outline" :
                              task.status === "in_progress" ? "default" : "secondary"
                            }>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Due: {task.due_date ? formatDate(task.due_date) : 'No due date'}</span>
                          <span>Assigned to: {task.assigned_to_name}</span>
                        </div>
                      </div>
                    ))}
                    
                    {allTasks.length > 0 && (
                      <EndlessScrollControls
                        hasMore={allTasksHasMore}
                        isLoading={isLoadingMoreTasks}
                        isExpanded={allTasksExpanded}
                        onLoadMore={loadMoreAllTasks}
                        onToggleExpanded={toggleAllTasksExpanded}
                        itemType="Tasks"
                      />
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
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Team management interface would be here</p>
                  <Link href="/team">
                    <Button className="mt-4">Manage Team</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ProtectedRoute>
  )
}
