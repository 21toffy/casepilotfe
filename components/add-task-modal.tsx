"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"
import { Plus } from "lucide-react"

interface TeamMember {
  id: number
  full_name: string
}

interface TaskType {
  value: string
  label: string
}

interface AddTaskModalProps {
  caseId: string
  onTaskAdded: () => void
  trigger?: React.ReactNode
}

export function AddTaskModal({ caseId, onTaskAdded, trigger }: AddTaskModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined)
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("medium")
  const [taskType, setTaskType] = useState("task")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])

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

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setAssignedTo(undefined)
    setDueDate("")
    setPriority("medium")
    setTaskType("task")
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
      })
      return
    }

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

      const response = await apiClient.post(`/api/tasks/case/${caseId}/create/`, payload)

      if (response.data) {
        toast({
          title: "Task Created Successfully",
          description: `The task "${title}" has been created.`,
        })
        resetForm()
        setIsOpen(false)
        onTaskAdded()
      } else {
        throw new Error("Failed to create task")
      }
    } catch (error: any) {
      console.error("Failed to create task", error)
      toast({
        variant: "destructive",
        title: "Failed to Create Task",
        description: error.message || "An error occurred while creating the task.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this case and assign it to a team member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title *
            </Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="col-span-3"
              placeholder="Enter task title"
            />
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
              placeholder="Enter task description"
              rows={3}
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
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

