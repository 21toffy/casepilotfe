"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Filter, Users, Calendar, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const cases = [
    {
      id: 1,
      title: "Smith vs. Johnson Contract Dispute",
      caseNumber: "CV-2024-001234",
      status: "Active",
      priority: "High",
      progress: 65,
      client: "John Smith",
      assignedTeam: [
        { name: "John Smith", avatar: "JS", role: "Case Owner" },
        { name: "Sarah Wilson", avatar: "SW", role: "Associate" },
        { name: "Mike Chen", avatar: "MC", role: "Paralegal" },
      ],
      nextHearing: "2024-01-15",
      lastActivity: "2 hours ago",
      tasksCount: { total: 12, completed: 8, pending: 4 },
      documentsCount: 15,
      createdDate: "2023-12-01",
      description: "Contract dispute involving breach of service agreement and damages claim of $2.5M.",
    },
    {
      id: 2,
      title: "Corporate Merger - TechCorp",
      caseNumber: "CM-2024-002156",
      status: "Review",
      priority: "Medium",
      progress: 80,
      client: "TechCorp Industries",
      assignedTeam: [
        { name: "Sarah Wilson", avatar: "SW", role: "Case Owner" },
        { name: "Lisa Brown", avatar: "LB", role: "Associate" },
        { name: "David Kim", avatar: "DK", role: "Associate" },
        { name: "Mike Chen", avatar: "MC", role: "Paralegal" },
      ],
      nextHearing: "2024-01-20",
      lastActivity: "1 day ago",
      tasksCount: { total: 18, completed: 14, pending: 4 },
      documentsCount: 32,
      createdDate: "2023-11-15",
      description: "Corporate merger due diligence and regulatory compliance review for $50M acquisition.",
    },
    {
      id: 3,
      title: "Criminal Defense - State vs. Williams",
      caseNumber: "CR-2024-003789",
      status: "Discovery",
      priority: "High",
      progress: 35,
      client: "Robert Williams",
      assignedTeam: [
        { name: "Lisa Brown", avatar: "LB", role: "Case Owner" },
        { name: "John Smith", avatar: "JS", role: "Associate" },
        { name: "Emily Davis", avatar: "ED", role: "Paralegal" },
      ],
      nextHearing: "2024-01-25",
      lastActivity: "3 hours ago",
      tasksCount: { total: 8, completed: 3, pending: 5 },
      documentsCount: 7,
      createdDate: "2023-12-20",
      description: "Criminal defense case involving white-collar fraud allegations.",
    },
    {
      id: 4,
      title: "IP Litigation - Patent Infringement",
      caseNumber: "IP-2024-004321",
      status: "Settlement",
      priority: "Medium",
      progress: 90,
      client: "Innovation Labs",
      assignedTeam: [
        { name: "David Kim", avatar: "DK", role: "Case Owner" },
        { name: "Sarah Wilson", avatar: "SW", role: "Associate" },
      ],
      nextHearing: "2024-02-01",
      lastActivity: "5 hours ago",
      tasksCount: { total: 15, completed: 13, pending: 2 },
      documentsCount: 28,
      createdDate: "2023-10-10",
      description: "Patent infringement case involving software technology disputes.",
    },
    {
      id: 5,
      title: "Employment Law - Wrongful Termination",
      caseNumber: "EL-2024-005678",
      status: "Active",
      priority: "Low",
      progress: 45,
      client: "Maria Rodriguez",
      assignedTeam: [
        { name: "Emily Davis", avatar: "ED", role: "Case Owner" },
        { name: "Mike Chen", avatar: "MC", role: "Paralegal" },
      ],
      nextHearing: "2024-01-30",
      lastActivity: "1 day ago",
      tasksCount: { total: 6, completed: 3, pending: 3 },
      documentsCount: 9,
      createdDate: "2024-01-05",
      description: "Wrongful termination and discrimination case against former employer.",
    },
  ]

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.client.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || case_.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority = priorityFilter === "all" || case_.priority.toLowerCase() === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default"
      case "review":
        return "secondary"
      case "discovery":
        return "outline"
      case "settlement":
        return "secondary"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
            <p className="text-gray-600 mt-2">Manage and track all your legal cases</p>
          </div>
          <Link href="/cases/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases by title, number, or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Grid */}
        <div className="grid gap-6">
          {filteredCases.map((case_) => (
            <Link key={case_.id} href={`/cases/${case_.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                            {case_.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">Case #{case_.caseNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(case_.status)}>{case_.status}</Badge>
                          <Badge variant={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{case_.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Client</p>
                          <p className="text-sm font-medium">{case_.client}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Next Hearing</p>
                          <p className="text-sm font-medium flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {case_.nextHearing}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Documents</p>
                          <p className="text-sm font-medium flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {case_.documentsCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Activity</p>
                          <p className="text-sm font-medium flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {case_.lastActivity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Team Members */}
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div className="flex -space-x-2">
                              {case_.assignedTeam.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                                </Avatar>
                              ))}
                              {case_.assignedTeam.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                                  <span className="text-xs text-gray-600">+{case_.assignedTeam.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tasks Progress */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">Tasks:</span>
                            <span className="text-xs font-medium">
                              {case_.tasksCount.completed}/{case_.tasksCount.total}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center space-x-3">
                          <div className="w-24">
                            <Progress value={case_.progress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{case_.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first case."}
              </p>
              {!searchTerm && statusFilter === "all" && priorityFilter === "all" && (
                <Link href="/cases/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Case
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
