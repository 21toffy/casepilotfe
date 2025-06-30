"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, FileText, TrendingUp, Clock, CheckCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const recentCases = [
    {
      id: 1,
      title: "Smith vs. Johnson Contract Dispute",
      status: "Active",
      progress: 65,
      dueDate: "2024-01-15",
      team: 4,
      priority: "High",
    },
    {
      id: 2,
      title: "Corporate Merger - TechCorp",
      status: "Review",
      progress: 80,
      dueDate: "2024-01-20",
      team: 6,
      priority: "Medium",
    },
    {
      id: 3,
      title: "Criminal Defense - State vs. Williams",
      status: "Discovery",
      progress: 35,
      dueDate: "2024-01-25",
      team: 3,
      priority: "High",
    },
  ]

  const upcomingTasks = [
    { id: 1, title: "File motion for summary judgment", case: "Smith vs. Johnson", due: "Today", priority: "High" },
    { id: 2, title: "Review merger documents", case: "TechCorp Merger", due: "Tomorrow", priority: "Medium" },
    { id: 3, title: "Prepare witness statements", case: "State vs. Williams", due: "Jan 18", priority: "High" },
    { id: 4, title: "Client consultation call", case: "Smith vs. Johnson", due: "Jan 19", priority: "Low" },
  ]

  return (
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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">8 due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">+2% from last quarter</p>
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
                  {recentCases.map((case_) => (
                    <Link key={case_.id} href={`/cases/${case_.id}`}>
                      <div className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{case_.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={case_.status === "Active" ? "default" : "secondary"}>
                                {case_.status}
                              </Badge>
                              <Badge variant={case_.priority === "High" ? "destructive" : "outline"}>
                                {case_.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Due: {case_.dueDate}</div>
                            <div className="flex items-center mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {case_.team}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{case_.progress}%</span>
                          </div>
                          <Progress value={case_.progress} className="h-2" />
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
                  {upcomingTasks.map((task) => (
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
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-sm">Case Priority Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider prioritizing the Smith vs. Johnson case - similar cases in your jurisdiction have a 15%
                    higher success rate when motions are filed within the next 3 days.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-medium text-sm">Resource Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Your team's workload analysis suggests reassigning 2 tasks from the TechCorp merger to available
                    associates to meet the deadline efficiently.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4 py-2">
                  <h4 className="font-medium text-sm">Jurisdiction Update</h4>
                  <p className="text-sm text-muted-foreground">
                    New precedent in State vs. Williams type cases: Recent ruling may impact your defense strategy.
                    Review recommended.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>All Cases</CardTitle>
                <CardDescription>Manage and track all your cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cases management interface would be here</p>
                  <Link href="/cases">
                    <Button className="mt-4">View All Cases</Button>
                  </Link>
                </div>
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
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Task management interface would be here</p>
                  <Link href="/tasks">
                    <Button className="mt-4">View All Tasks</Button>
                  </Link>
                </div>
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
  )
}
