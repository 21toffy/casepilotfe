"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Search, FileText, Users, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DashboardHeader } from "@/components/dashboard-header"

// Interface for case data
interface CaseData {
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

interface PaginatedResponse {
  count: number
  total_pages: number
  current_page: number
  results: CaseData[]
}

export default function CasesPage() {
  const { toast } = useToast()
  
  const [cases, setCases] = useState<CaseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [caseTypeFilter, setCaseTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Load cases on component mount and when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCases()
    }
  }, [currentPage, searchTerm, caseTypeFilter, statusFilter])

  const loadCases = async () => {
    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '10'
      })
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      if (caseTypeFilter && caseTypeFilter !== 'all') {
        params.append('case_type', caseTypeFilter)
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await apiClient.get(`/api/cases/?${params.toString()}`)
      
      if (response.data) {
        const data: PaginatedResponse = response.data
        setCases(data.results)
        setTotalPages(data.total_pages)
        setTotalCount(data.count)
      } else {
        setCases([])
        setTotalCount(0)
        setTotalPages(1)
      }

    } catch (error: any) {
      console.error('Failed to load cases:', error)
      toast({
        variant: "destructive",
        title: "Failed to load cases",
        description: "Please try refreshing the page.",
      })
      setCases([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    loadCases()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'default'
      case 'closed': return 'secondary'
      case 'pending': return 'outline'
      case 'on_hold': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityColor = (role: string) => {
    switch (role) {
      case 'case_owner': return 'default'
      case 'invitee': return 'secondary'
      default: return 'outline'
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
      return dateString // Fallback to original string if date parsing fails
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: "Cases" }
            ]}
          />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
              <p className="text-gray-600 mt-1">
                Manage and track all your cases ({totalCount} total)
              </p>
            </div>
            <Link href="/cases/new">
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </Link>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search cases by title or reference number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Case Type Filter */}
                  <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All case types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All case types</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Cases List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || caseTypeFilter || statusFilter 
                    ? "No cases match your current filters."
                    : "Get started by creating your first case."
                  }
                </p>
                <Link href="/cases/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Case
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((case_) => (
                <Link key={case_.id} href={`/cases/${case_.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{case_.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {case_.reference_number}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="capitalize">{case_.case_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{case_.jurisdiction}</span>
                            <span>•</span>
                            <span>{case_.court_location}</span>
                          </div>

                          {case_.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {case_.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(case_.status)}>
                              {case_.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getPriorityColor(case_.user_role)}>
                              {case_.user_role.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-gray-500 text-right">
                            <div>Created {formatDate(case_.created_at)}</div>
                            <div>by {case_.created_by.full_name}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {case_.participants_count} participant{case_.participants_count !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Last updated {formatDate(case_.updated_at)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{case_.progress_percentage}%</span>
                          <Progress value={case_.progress_percentage} className="w-20 h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}