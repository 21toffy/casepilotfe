"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"

interface Recommendation {
  id: number
  title: string
  description: string
  recommendation_type: string
  case_title: string
  case_id: number
  priority?: string
}

interface TeamMember {
  id: number
  full_name: string
}

interface TaskType {
  value: string
  label: string
}

interface ConvertRecommendationModalProps {
  recommendation: Recommendation | null
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (recommendationId: number) => void
}

export function ConvertRecommendationModal({
  recommendation,
  isOpen,
  onClose,
  onTaskCreated,
}: ConvertRecommendationModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined)
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("")
  const [taskType, setTaskType] = useState("task")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (recommendation) {
      setTitle(recommendation.title)
      setDescription(recommendation.description)
      setPriority(recommendation.priority?.toLowerCase() || "medium")
    }
  }, [recommendation])

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers()
      fetchTaskTypes()
    }
  }, [isOpen])

  const fetchTeamMembers = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/dashboard/team/')
      if (response.data) {
        setTeamMembers(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch team members", error)
      toast({
        variant: "destructive",
        title: "Failed to load team members",
        description: "Could not populate the 'assign to' list.",
      })
    }
  }

  const fetchTaskTypes = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/dropdowns/constants/')
      if (response.data && response.data.task_types) {
        setTaskTypes(response.data.task_types)
      }
    } catch (error) {
      console.error("Failed to fetch task types", error)
    }
  }

  const handleSubmit = async () => {
    if (!recommendation) return

    setIsLoading(true)
    try {
      const apiClient = getApiClient()
      const payload = {
        title,
        description,
        assigned_to: assignedTo ? parseInt(assignedTo) : undefined,
        due_date: dueDate || null,
        priority,
        task_type: taskType,
      }
      
      await apiClient.post(`/api/recommendations/${recommendation.id}/convert-to-task/`, payload)

      toast({
        title: "Task Created Successfully",
        description: `The recommendation has been converted to a new task for the case: ${recommendation.case_title}.`,
      })
      onTaskCreated(recommendation.id)
      onClose()
    } catch (error) {
      console.error("Failed to convert recommendation to task", error)
      toast({
        variant: "destructive",
        title: "Failed to Create Task",
        description: "An error occurred while converting the recommendation.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Recommendation to Task</DialogTitle>
          <DialogDescription>
            Edit the details below and create a new task from this AI recommendation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taskType" className="text-right">
              Task Type
            </Label>
            <Select onValueChange={setTaskType} value={taskType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedTo" className="text-right">
              Assign To
            </Label>
            <Select onValueChange={setAssignedTo} value={assignedTo}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select onValueChange={setPriority} value={priority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating Task..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
