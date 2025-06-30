"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, Users, FileText, Upload } from "lucide-react"
import { format } from "date-fns"
import { DashboardHeader } from "@/components/dashboard-header"
import { useRouter } from "next/navigation"

export default function NewCasePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    caseNumber: "",
    caseType: "",
    jurisdiction: "",
    court: "",
    description: "",
    clientName: "",
    clientEmail: "",
    opposingParty: "",
    opposingCounsel: "",
    priority: "Medium",
    status: "Active",
  })

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [jurisdictions, setJurisdictions] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating case:", { ...formData, courtDate: selectedDate, invitedUsers, jurisdictions })
    router.push("/cases/1") // Redirect to the created case
  }

  const addUser = () => {
    if (newUserEmail && !invitedUsers.includes(newUserEmail)) {
      setInvitedUsers([...invitedUsers, newUserEmail])
      setNewUserEmail("")
    }
  }

  const removeUser = (email: string) => {
    setInvitedUsers(invitedUsers.filter((user) => user !== email))
  }

  const addJurisdiction = (jurisdiction: string) => {
    if (!jurisdictions.includes(jurisdiction)) {
      setJurisdictions([...jurisdictions, jurisdiction])
    }
  }

  const removeJurisdiction = (jurisdiction: string) => {
    setJurisdictions(jurisdictions.filter((j) => j !== jurisdiction))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Case</h1>
            <p className="text-gray-600 mt-2">Set up a new case and invite team members to collaborate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential case details and identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Case Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Smith vs. Johnson Contract Dispute"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber">Case Number</Label>
                    <Input
                      id="caseNumber"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, caseNumber: e.target.value }))}
                      placeholder="CV-2024-001234"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseType">Case Type *</Label>
                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, caseType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="criminal">Criminal</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="family">Family Law</SelectItem>
                        <SelectItem value="intellectual">Intellectual Property</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Discovery">Discovery</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Settlement">Settlement</SelectItem>
                        <SelectItem value="Trial">Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Case Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the case, key issues, and objectives..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jurisdiction & Court */}
            <Card>
              <CardHeader>
                <CardTitle>Jurisdiction & Court Information</CardTitle>
                <CardDescription>Legal jurisdiction and court details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jurisdictions</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {jurisdictions.map((jurisdiction) => (
                        <Badge key={jurisdiction} variant="secondary" className="flex items-center gap-1">
                          {jurisdiction}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeJurisdiction(jurisdiction)} />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addJurisdiction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="court">Court</Label>
                      <Input
                        id="court"
                        value={formData.court}
                        onChange={(e) => setFormData((prev) => ({ ...prev, court: e.target.value }))}
                        placeholder="Superior Court of California"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Court Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle>Parties Involved</CardTitle>
                <CardDescription>Client and opposing party information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Client Information</h4>
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="john.smith@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Opposing Party</h4>
                    <div className="space-y-2">
                      <Label htmlFor="opposingParty">Opposing Party</Label>
                      <Input
                        id="opposingParty"
                        value={formData.opposingParty}
                        onChange={(e) => setFormData((prev) => ({ ...prev, opposingParty: e.target.value }))}
                        placeholder="Johnson Corporation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
                      <Input
                        id="opposingCounsel"
                        value={formData.opposingCounsel}
                        onChange={(e) => setFormData((prev) => ({ ...prev, opposingCounsel: e.target.value }))}
                        placeholder="Wilson & Associates"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Members
                </CardTitle>
                <CardDescription>Invite team members to collaborate on this case</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="colleague@lawfirm.com"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addUser())}
                  />
                  <Button type="button" onClick={addUser}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {invitedUsers.length > 0 && (
                  <div className="space-y-2">
                    <Label>Invited Team Members</Label>
                    <div className="flex flex-wrap gap-2">
                      {invitedUsers.map((email) => (
                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                          {email}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeUser(email)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artifacts & Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Initial Artifacts & Documents
                </CardTitle>
                <CardDescription>Upload initial case documents and evidence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
                  </p>
                </div>

                {/* Uploaded files preview would go here */}
                <div className="space-y-2">
                  <Label>Uploaded Files (0)</Label>
                  <div className="text-sm text-muted-foreground">
                    No files uploaded yet. You can add documents after creating the case.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">
                <FileText className="h-4 w-4 mr-2" />
                Create Case
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
