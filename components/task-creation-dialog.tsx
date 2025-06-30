"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { CalendarIcon, CheckCircle, BookOpen, Upload, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface TaskCreationDialogProps {
  trigger?: React.ReactNode
  initialContent?: string
  onTaskCreated?: (task: any) => void
}

export function TaskCreationDialog({ trigger, initialContent = "", onTaskCreated }: TaskCreationDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [formData, setFormData] = useState({
    title: "",
    description: initialContent,
    type: "",
    priority: "Medium",
    assignee: "",
  })

  // Mock team members
  const teamMembers = [
    { id: "self", name: "Assign to myself", avatar: "ME", email: "me@example.com" },
    { id: 1, name: "John Smith", avatar: "JS", email: "john@smithlaw.com" },
    { id: 2, name: "Sarah Wilson", avatar: "SW", email: "sarah@smithlaw.com" },
    { id: 3, name: "Mike Chen", avatar: "MC", email: "mike@smithlaw.com" },
    { id: 4, name: "Lisa Brown", avatar: "LB", email: "lisa@smithlaw.com" },
  ]

  const taskTypes = [
    { value: "todo", label: "✅ To-do", icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
    { value: "research", label: "📚 Needs Research", icon: BookOpen, color: "bg-purple-100 text-purple-800" },
    { value: "upload", label: "📂 Upload Required", icon: Upload, color: "bg-green-100 text-green-800" },
    { value: "feedback", label: "📣 Needs Feedback", icon: MessageSquare, color: "bg-orange-100 text-orange-800" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const task = {
      ...formData,
      dueDate: selectedDate?.toISOString(),
      createdDate: new Date().toISOString(),
      status: "Pending",
      id: Date.now(),
    }
    console.log("Creating task:", task)
    onTaskCreated?.(task)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      priority: "Medium",
      assignee: "",
    })
    setSelectedDate(undefined)
  }

  const getTaskTypeInfo = (value: string) => {
    return taskTypes.find((type) => type.value === value)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task from AI Response</DialogTitle>
          <DialogDescription>Convert AI insights into actionable tasks for your team</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <div className="space-y-3">
            <Label>Task Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              {taskTypes.map((type) => (
                <div
                  key={type.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                >
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a clear, actionable task title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what needs to be done..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label>Due Date</Label>
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
            </div>
          </div>

          {/* Assignee Selection */}
          <div className="space-y-3">
            <Label>Assign To *</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.assignee === member.id.toString()
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setFormData((prev) => ({ ...prev, assignee: member.id.toString() }))}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    {member.id !== "self" && <p className="text-xs text-muted-foreground">{member.email}</p>}
                  </div>
                  {member.id === "self" && <Badge variant="secondary">Self</Badge>}
                </div>
              ))}
            </div>
          </div>

          {/* Task Type Preview */}
          {formData.type && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getTaskTypeInfo(formData.type)?.color}>{getTaskTypeInfo(formData.type)?.label}</Badge>
                <span className="text-sm text-muted-foreground">Task Preview</span>
              </div>
              <p className="text-sm">
                {formData.title || "Task title will appear here"} -{" "}
                {teamMembers.find((m) => m.id.toString() === formData.assignee)?.name || "Unassigned"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.type || !formData.assignee}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
