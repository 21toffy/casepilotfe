"use client"

import { useState } from "react"
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
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AIAssistantChat } from "@/components/ai-assistant-chat"
import { AddArtifactDialog } from "@/components/add-artifact-dialog"
import { PDFExportDialog } from "@/components/pdf-export-dialog"
import { CourtReportEditor } from "@/components/court-report-editor"

export default function CaseDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [newComment, setNewComment] = useState("")
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Mock case data
  const caseData = {
    id: 1,
    title: "Smith vs. Johnson Contract Dispute",
    caseNumber: "CV-2024-001234",
    status: "Active",
    priority: "High",
    progress: 65,
    client: "John Smith",
    opposingParty: "Johnson Corporation",
    court: "Superior Court of California",
    nextHearing: "2024-01-15",
    jurisdiction: ["United States", "California"],
    description:
      "Contract dispute involving breach of service agreement and damages claim of $2.5M. Client alleges non-performance and seeks compensatory damages. The case involves complex software development services that were not delivered according to the agreed timeline and specifications. Multiple contract amendments and email correspondence provide clear evidence of breach. The opposing party claims force majeure due to technical difficulties, but evidence suggests poor project management and resource allocation.",
    shortDescription: "Contract dispute involving breach of service agreement and damages claim of $2.5M.",
    createdDate: "2023-12-01",
    lastUpdated: "2024-01-08",
  }

  const teamMembers = [
    { id: 1, name: "John Smith", email: "john@smithlaw.com", role: "Case Owner", avatar: "JS", status: "Active" },
    { id: 2, name: "Sarah Wilson", email: "sarah@smithlaw.com", role: "Associate", avatar: "SW", status: "Active" },
    { id: 3, name: "Mike Chen", email: "mike@smithlaw.com", role: "Paralegal", avatar: "MC", status: "Active" },
    { id: 4, name: "Lisa Brown", email: "lisa@smithlaw.com", role: "Associate", avatar: "LB", status: "Active" },
  ]

  const myTasks = [
    {
      id: 1,
      title: "Review financial damages calculation",
      description: "Analyze client's financial records and calculate actual damages",
      assignedBy: "John Smith",
      dueDate: "2024-01-12",
      priority: "High",
      status: "In Progress",
      submissionStatus: "Draft",
      lastUpdated: "2024-01-08",
    },
    {
      id: 2,
      title: "Prepare witness depositions",
      description: "Schedule and prepare questions for key witness depositions",
      assignedBy: "Sarah Wilson",
      dueDate: "2024-01-14",
      priority: "High",
      status: "Pending",
      submissionStatus: "Not Started",
      lastUpdated: "2024-01-07",
    },
    {
      id: 3,
      title: "Research contract law precedents",
      description: "Find similar cases in California jurisdiction",
      assignedBy: "John Smith",
      dueDate: "2024-01-10",
      priority: "Medium",
      status: "Completed",
      submissionStatus: "Approved",
      lastUpdated: "2024-01-06",
    },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Case Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              <p className="text-gray-600 mt-1">Case #{caseData.caseNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              <PDFExportDialog
                caseData={caseData}
                trigger={
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                }
              />
              <CourtReportEditor
                caseId={caseData.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Court Report
                  </Button>
                }
                onReportSaved={(report) => console.log("Court report saved:", report)}
              />
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
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
              <Label className="text-sm text-muted-foreground">Priority</Label>
              <Badge variant="destructive" className="mt-1">
                {caseData.priority}
              </Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Progress</Label>
              <div className="mt-1">
                <Progress value={caseData.progress} className="h-2" />
                <span className="text-sm text-muted-foreground">{caseData.progress}%</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Client</Label>
              <p className="text-sm font-medium mt-1">{caseData.client}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Next Hearing</Label>
              <p className="text-sm font-medium mt-1">{caseData.nextHearing}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Team Size</Label>
              <p className="text-sm font-medium mt-1">{teamMembers.length} members</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="court-dates">Court Dates</TabsTrigger>
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
                      {showFullDescription ? caseData.description : caseData.shortDescription}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {caseData.jurisdiction.map((j) => (
                        <Badge key={j} variant="outline">
                          {j}
                        </Badge>
                      ))}
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
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{member.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{member.role}</Badge>
                            <Badge variant="default" className="text-xs">
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
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
                      <span className="font-medium">{myTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending Approvals</span>
                      <span className="font-medium">
                        {myApprovals.filter((a) => a.status === "Pending Review").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Court Dates</span>
                      <span className="font-medium">{courtDates.filter((d) => d.status === "Scheduled").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Artifacts</span>
                      <span className="font-medium">{artifacts.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Court Date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Next Court Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {courtDates.filter((d) => d.status === "Scheduled")[0] && (
                      <div className="space-y-2">
                        <p className="font-medium">{courtDates.filter((d) => d.status === "Scheduled")[0].title}</p>
                        <p className="text-sm text-muted-foreground">
                          {courtDates.filter((d) => d.status === "Scheduled")[0].date} at{" "}
                          {courtDates.filter((d) => d.status === "Scheduled")[0].time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {courtDates.filter((d) => d.status === "Scheduled")[0].location}
                        </p>
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
                    <div key={task.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
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
                        <div className="flex space-x-2">
                          {task.submissionStatus === "Draft" && (
                            <Button size="sm" variant="outline">
                              Submit for Review
                            </Button>
                          )}
                          {task.submissionStatus === "Not Started" && <Button size="sm">Start Task</Button>}
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
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

          <TabsContent value="court-dates" className="space-y-6">
            <div className="grid gap-6">
              {/* Upcoming Court Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gavel className="h-5 w-5 mr-2" />
                    Court Dates & Hearings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courtDates.map((date) => (
                      <div key={date.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{date.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {date.date} at {date.time}
                            </p>
                            <p className="text-xs text-muted-foreground">{date.location}</p>
                            {date.judge !== "N/A" && (
                              <p className="text-xs text-muted-foreground">Judge: {date.judge}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="outline">{date.type}</Badge>
                            <Badge variant={date.status === "Scheduled" ? "default" : "secondary"}>{date.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Adjournments */}
              <Card>
                <CardHeader>
                  <CardTitle>Adjournments</CardTitle>
                  <CardDescription>History of postponed court dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {adjournments.map((adj) => (
                      <div key={adj.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {adj.originalDate} → {adj.newDate}
                            </p>
                            <p className="text-sm text-muted-foreground">{adj.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              Requested by {adj.requestedBy} • Approved by {adj.approvedBy} on {adj.approvedDate}
                            </p>
                          </div>
                          <Badge variant="outline">Approved</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  Published Strategies
                </CardTitle>
                <CardDescription>Approved strategic approaches for this case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {publishedStrategies.map((strategy) => (
                    <div key={strategy.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{strategy.title}</h4>
                            <Badge variant="outline">{strategy.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{strategy.summary}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Key Points:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {strategy.keyPoints.map((point, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Published by {strategy.author} on {strategy.publishedDate}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
  )
}
