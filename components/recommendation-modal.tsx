"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, Clock, AlertTriangle, Plus, X } from "lucide-react"

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

interface Staff {
  id: number
  uid: string
  full_name: string
  email: string
  role: string
}

interface RecommendationModalProps {
  recommendation: AIRecommendation
  onRecommendationUpdate?: () => void
}

export function RecommendationModal({ recommendation, onRecommendationUpdate }: RecommendationModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  
  // Debug the recommendation object
  console.log('Recommendation object:', recommendation)
  
  // Form state
  const [formData, setFormData] = useState({
    title: recommendation?.title || '',
    description: recommendation?.description || '',
    assigned_to: 'self', // Default to self-assignment
    due_date: '',
    task_type: 'task' as const,
    priority: recommendation?.priority || 'medium',
    close_recommendation: true,
  })

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/company/staff/')
      
      if (response.data) {
        setStaffMembers(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load staff:', error)
      toast({
        variant: "destructive",
        title: "Failed to load staff",
        description: "Could not load team members for assignment.",
      })
    } finally {
      setIsLoadingStaff(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && staffMembers.length === 0) {
      loadStaff()
    }
  }

  const handleConvertToTask = async () => {
    try {
      setIsLoading(true)
      
      const apiClient = getApiClient()
      // Handle "self" assignment
      let assignedToId = undefined
      if (formData.assigned_to === "self") {
        assignedToId = user?.id
      } else if (formData.assigned_to) {
        assignedToId = parseInt(formData.assigned_to)
      }
      
      const payload = {
        ...formData,
        assigned_to: assignedToId,
        due_date: formData.due_date || undefined,
      }
      
      const response = await apiClient.post(`/api/recommendations/${recommendation?.id || recommendation?.uid}/convert-to-task/`, payload)
      
      if (response.data) {
        toast({
          title: "Task Created",
          description: `Successfully converted recommendation to task: "${response.data.title}"`,
        })
        
        setIsOpen(false)
        
        // Call the update callback
        if (onRecommendationUpdate) {
          onRecommendationUpdate()
        }
      }
    } catch (error: any) {
      console.error('Failed to convert recommendation:', error)
      toast({
        variant: "destructive",
        title: "Conversion Failed",
        description: error.message || "Failed to convert recommendation to task.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async () => {
    try {
      setIsLoading(true)
      
      const apiClient = getApiClient()
      await apiClient.post(`/api/recommendations/${recommendation?.id || recommendation?.uid}/dismiss/`)
      
      toast({
        title: "Recommendation Dismissed",
        description: "The recommendation has been dismissed.",
      })
      
      setIsOpen(false)
      
      // Call the update callback
      if (onRecommendationUpdate) {
        onRecommendationUpdate()
      }
      
    } catch (error: any) {
      console.error('Failed to dismiss recommendation:', error)
      toast({
        variant: "destructive",
        title: "Dismiss Failed",
        description: error.message || "Failed to dismiss recommendation.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500'
      case 'high':
        return 'border-orange-500'
      case 'medium':
        return 'border-blue-500'
      case 'low':
        return 'border-green-500'
      default:
        return 'border-gray-500'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Clock className="h-4 w-4" />
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatRecommendationType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className={`border-l-4 ${getPriorityColor(recommendation?.priority || 'medium')} pl-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {getPriorityIcon(recommendation?.priority || 'medium')}
                <h4 className="font-medium text-sm">{recommendation?.title || 'Untitled Recommendation'}</h4>
                <Badge variant="outline" className="text-xs">
                  {formatRecommendationType(recommendation?.recommendation_type || 'other')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recommendation?.description || 'No description available'}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {recommendation?.case_title || 'Unknown Case'}
                </Badge>
                <span className="text-xs text-gray-400">
                  {Math.round((recommendation?.confidence_score || 0.5) * 100)}% confidence
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getPriorityIcon(recommendation?.priority || 'medium')}
            <span>Convert to Task</span>
          </DialogTitle>
          <DialogDescription>
            Convert this AI recommendation into a task that can be assigned and tracked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recommendation Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Original Recommendation</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{formatRecommendationType(recommendation?.recommendation_type || 'other')}</Badge>
                <Badge variant={(recommendation?.priority || 'medium') === 'urgent' ? 'destructive' : 'secondary'}>
                  {(recommendation?.priority || 'medium').charAt(0).toUpperCase() + (recommendation?.priority || 'medium').slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {Math.round((recommendation?.confidence_score || 0.5) * 100)}% confidence
                </span>
              </div>
              <p className="text-sm">{recommendation?.description || 'No description available'}</p>
              <p className="text-xs text-gray-500">Case: {recommendation?.case_title || 'Unknown Case'}</p>
            </div>
          </div>

          {/* Task Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  disabled={isLoading || isLoadingStaff}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Assign to yourself</SelectItem>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.full_name} ({staff.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task_type">Task Type</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value: any) => setFormData({ ...formData, task_type: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="todo">To-do</SelectItem>
                    <SelectItem value="research">Needs Research</SelectItem>
                    <SelectItem value="upload">Upload Required</SelectItem>
                    <SelectItem value="feedback">Needs Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="close_recommendation"
                checked={formData.close_recommendation}
                onCheckedChange={(checked) => setFormData({ ...formData, close_recommendation: checked })}
                disabled={isLoading}
              />
              <Label htmlFor="close_recommendation" className="text-sm">
                Close recommendation after conversion
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDismiss}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConvertToTask}
                disabled={isLoading || !formData.title?.trim() || !formData.description?.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
