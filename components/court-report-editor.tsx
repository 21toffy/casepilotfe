"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Save, FileText, CalendarIcon, Gavel, User, Plus, Minus } from "lucide-react"
import { format } from "date-fns"

interface CourtReportEditorProps {
  trigger?: React.ReactNode
  caseId?: number
  onReportSaved?: (report: any) => void
}

export function CourtReportEditor({ trigger, caseId, onReportSaved }: CourtReportEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    hearingType: "",
    judge: "",
    court: "",
    courtroom: "",
    attendees: [] as string[],
    summary: "",
    keyPoints: [] as string[],
    decisions: "",
    nextSteps: "",
    adjournment: {
      isAdjourned: false,
      newDate: "",
      reason: "",
    },
    outcome: "",
    notes: "",
  })

  const [newAttendee, setNewAttendee] = useState("")
  const [newKeyPoint, setNewKeyPoint] = useState("")

  const hearingTypes = [
    "Case Management Conference",
    "Motion Hearing",
    "Trial",
    "Settlement Conference",
    "Deposition",
    "Preliminary Hearing",
    "Sentencing",
    "Appeal Hearing",
    "Other",
  ]

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const report = {
      ...formData,
      date: selectedDate?.toISOString(),
      time: selectedTime,
      caseId,
      createdDate: new Date().toISOString(),
      status: "Draft",
      id: Date.now(),
    }
    console.log("Saving court report:", report)
    onReportSaved?.(report)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      hearingType: "",
      judge: "",
      court: "",
      courtroom: "",
      attendees: [],
      summary: "",
      keyPoints: [],
      decisions: "",
      nextSteps: "",
      adjournment: {
        isAdjourned: false,
        newDate: "",
        reason: "",
      },
      outcome: "",
      notes: "",
    })
    setSelectedDate(undefined)
    setSelectedTime("")
    setNewAttendee("")
    setNewKeyPoint("")
  }

  const addAttendee = () => {
    if (newAttendee && !formData.attendees.includes(newAttendee)) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee],
      }))
      setNewAttendee("")
    }
  }

  const removeAttendee = (attendee: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((a) => a !== attendee),
    }))
  }

  const addKeyPoint = () => {
    if (newKeyPoint && !formData.keyPoints.includes(newKeyPoint)) {
      setFormData((prev) => ({
        ...prev,
        keyPoints: [...prev.keyPoints, newKeyPoint],
      }))
      setNewKeyPoint("")
    }
  }

  const removeKeyPoint = (point: string) => {
    setFormData((prev) => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((p) => p !== point),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Create Court Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gavel className="h-5 w-5 mr-2" />
            Court Report Editor
          </DialogTitle>
          <DialogDescription>Create a comprehensive report of court proceedings and outcomes</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hearing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Motion for Summary Judgment Hearing - Smith vs. Johnson"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hearing Type *</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, hearingType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hearing type" />
                    </SelectTrigger>
                    <SelectContent>
                      {hearingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Judge *</Label>
                  <Input
                    value={formData.judge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, judge: e.target.value }))}
                    placeholder="Hon. Patricia Martinez"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Courtroom</Label>
                  <Input
                    value={formData.courtroom}
                    onChange={(e) => setFormData((prev) => ({ ...prev, courtroom: e.target.value }))}
                    placeholder="3A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Court *</Label>
                <Input
                  value={formData.court}
                  onChange={(e) => setFormData((prev) => ({ ...prev, court: e.target.value }))}
                  placeholder="Superior Court of California, Los Angeles County"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Attendees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  placeholder="Add attendee (e.g., John Smith - Plaintiff Attorney)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAttendee())}
                />
                <Button type="button" onClick={addAttendee}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.attendees.map((attendee, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {attendee}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeAttendee(attendee)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proceedings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proceedings Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Hearing Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Provide a comprehensive summary of what transpired during the hearing..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Key Points Discussed</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    placeholder="Add key point or argument presented"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyPoint())}
                  />
                  <Button type="button" onClick={addKeyPoint}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    {formData.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 border rounded">
                        <span className="text-sm flex-1">{point}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeKeyPoint(point)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisions">Judge's Decisions/Rulings</Label>
                <Textarea
                  id="decisions"
                  value={formData.decisions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, decisions: e.target.value }))}
                  placeholder="Document any decisions, rulings, or orders made by the judge..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Outcome & Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outcome & Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Hearing Outcome</Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, outcome: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="favorable">Favorable</SelectItem>
                    <SelectItem value="unfavorable">Unfavorable</SelectItem>
                    <SelectItem value="mixed">Mixed Results</SelectItem>
                    <SelectItem value="continued">Continued</SelectItem>
                    <SelectItem value="settled">Settled</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextSteps">Next Steps & Action Items</Label>
                <Textarea
                  id="nextSteps"
                  value={formData.nextSteps}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nextSteps: e.target.value }))}
                  placeholder="List action items, deadlines, and next steps following this hearing..."
                  rows={3}
                />
              </div>

              {/* Adjournment Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="adjournment"
                    checked={formData.adjournment.isAdjourned}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adjournment: { ...prev.adjournment, isAdjourned: e.target.checked },
                      }))
                    }
                  />
                  <Label htmlFor="adjournment">Case was adjourned</Label>
                </div>

                {formData.adjournment.isAdjourned && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label>New Date</Label>
                      <Input
                        type="date"
                        value={formData.adjournment.newDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adjournment: { ...prev.adjournment, newDate: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Adjournment</Label>
                      <Input
                        value={formData.adjournment.reason}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adjournment: { ...prev.adjournment, reason: e.target.value },
                          }))
                        }
                        placeholder="Additional discovery needed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Private Notes & Observations</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any private notes, observations, or strategic thoughts about the hearing..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={() => console.log("Saving as draft...")}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit">
              <FileText className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
