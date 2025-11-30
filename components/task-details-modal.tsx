"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Eye,
  Download,
  Trash2,
  FileText,
  Image,
  File,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Target,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Edit,
  Send
} from "lucide-react"
import { useToast } from "@/lib/use-toast"
import { getApiClient, isSuccessResponse } from "@/lib/api-client"
import { TaskSubmissionModal } from "@/components/task-submission-modal"
import { CommentsSection } from "@/components/comments-section"
import { useAuth } from "@/contexts/auth-context"
import { Textarea } from "@/components/ui/textarea"

interface Task {
  id: number
  uid: string
  title: string
  description: string
  status: string
  priority: string
  task_type: string
  due_date?: string
  progress_percentage: number
  case_id: number
  case_title: string
  created_by_name: string
  created_by: number
  assigned_to_name: string
  assigned_to: number
  assigned_to_me: boolean
  created_at: string
  updated_at: string
  notes?: string
  completion_notes?: string
}

interface SubmissionFile {
  id: number
  original_filename: string
  stored_filename: string
  file_url: string
  file_size: number
  file_size_human: string
  content_type: string
  file_type: string
  extracted_text?: string
  is_processed: boolean
  processing_error?: string
  created_at: string
}

interface Submission {
  id: number
  uid: string
  title: string
  description: string
  content: string
  notes?: string
  status: string
  is_draft: boolean
  submitted_by_name: string
  reviewed_by_name?: string
  files: SubmissionFile[]
  file_count: number
  total_file_size: number
  total_extracted_text?: string
  reviewed_at?: string
  review_comments?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

interface TaskDetailsModalProps {
  task: Task
  trigger?: React.ReactNode
  onTaskUpdate?: () => void
}

export function TaskDetailsModal({ task, trigger, onTaskUpdate }: TaskDetailsModalProps) {
  console.log(task, "LLL")
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null)
  const [approvingSubmission, setApprovingSubmission] = useState<number | null>(null)
  const [approvalComments, setApprovalComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionComments, setRejectionComments] = useState("")
  const [commentsCount, setCommentsCount] = useState(0)
  const [unreadCommentsCount, setUnreadCommentsCount] = useState(0)

  // Load submissions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSubmissions()
    }
  }, [isOpen])

  const loadSubmissions = async () => {
    try {
      setIsLoadingSubmissions(true)
      const apiClient = getApiClient()
      const response = await apiClient.get(`/api/tasks/${task.id}/submissions/?include_drafts=true`)
      
      if (isSuccessResponse(response)) {
        setSubmissions(response.data || [])
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load submissions",
          description: response.error || "Could not fetch task submissions.",
        })
      }
    } catch (error: any) {
      console.error('Failed to load submissions:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while loading submissions.",
      })
    } finally {
      setIsLoadingSubmissions(false)
    }
  }

  const handleApproveSubmission = async (submissionId: number) => {
    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.post(`/api/tasks/submissions/${submissionId}/approve/`, {
        comments: approvalComments
      })
      
      if (isSuccessResponse(response)) {
        toast({
          title: "Submission Approved",
          description: "The submission has been approved successfully.",
        })
        setApprovalComments("")
        setApprovingSubmission(null)
        loadSubmissions()
        if (onTaskUpdate) onTaskUpdate()
      } else {
        toast({
          variant: "destructive",
          title: "Approval Failed",
          description: response.error || "Could not approve the submission.",
        })
      }
    } catch (error: any) {
      console.error('Failed to approve submission:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while approving the submission.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectSubmission = async (submissionId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
      })
      return
    }

    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.post(`/api/tasks/submissions/${submissionId}/reject/`, {
        reason: rejectionReason,
        comments: rejectionComments
      })
      
      if (isSuccessResponse(response)) {
        toast({
          title: "Submission Rejected",
          description: "The submission has been rejected.",
        })
        setRejectionReason("")
        setRejectionComments("")
        setApprovingSubmission(null)
        loadSubmissions()
      } else {
        toast({
          variant: "destructive",
          title: "Rejection Failed",
          description: response.error || "Could not reject the submission.",
        })
      }
    } catch (error: any) {
      console.error('Failed to reject submission:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while rejecting the submission.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSubmission = async (submissionId: number) => {
    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.delete(`/api/tasks/submissions/${submissionId}/`)
      
      if (isSuccessResponse(response)) {
        toast({
          title: "Submission Deleted",
          description: "The submission and all its files have been deleted.",
        })
        loadSubmissions() // Reload submissions
        onTaskUpdate?.()
      } else {
        throw new Error(response.error || 'Failed to delete submission')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete submission.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (file: SubmissionFile) => {
    try {
      // Open file URL in new tab for download
      window.open(file.file_url, '_blank')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the file.",
      })
    }
  }

  const viewFile = (file: SubmissionFile) => {
    try {
      // Open file URL in new tab for viewing
      // R2 public URLs can be viewed directly in the browser
      window.open(file.file_url, '_blank')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "View Failed",
        description: "Could not open the file.",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'open': return 'outline'
      case 'on_hold': return 'destructive'
      default: return 'outline'
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary' 
      case 'rejected': return 'destructive'
      case 'draft': return 'outline'
      default: return 'outline'
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-4 w-4" />
      case 'pdf': 
      case 'document': return <FileText className="h-4 w-4" />
      case 'text': return <File className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalFiles = submissions.reduce((sum, submission) => sum + submission.file_count, 0)
  const totalSize = submissions.reduce((sum, submission) => sum + submission.total_file_size, 0)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              <DialogDescription className="text-base">
                {task.description}
              </DialogDescription>
              <div className="flex items-center space-x-2">
                <Badge variant={getPriorityColor(task.priority || 'medium')}>{task.priority || 'Medium'}</Badge>
                <Badge variant={getStatusColor(task.status || 'open')}>{task.status || 'Open'}</Badge>
                <Badge variant="outline">{task.task_type?.replace('_', ' ') || 'Task'}</Badge>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="flex items-center space-x-2">
                <Progress value={task.progress_percentage || 0} className="w-20 h-2" />
                <span className="text-sm font-medium">{task.progress_percentage || 0}%</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="artifacts">
              Artifacts ({totalFiles})
            </TabsTrigger>
            <TabsTrigger value="comments" className="relative">
              <MessageSquare className="h-4 w-4 mr-1" />
              Comments {commentsCount > 0 && `(${commentsCount})`}
              {unreadCommentsCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{unreadCommentsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Task Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Task Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Case</div>
                          <div>{task.case_title || 'Unknown Case'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Type</div>
                          <div className="capitalize">{task.task_type?.replace('_', ' ') || 'Task'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Created By</div>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">
                                {task.created_by_name?.split(' ').map(n => n[0]).join('') || 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            {task.created_by_name || 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Assigned To</div>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback className="text-xs">
                                {task.assigned_to_name?.split(' ').map(n => n[0]).join('') || 'UN'}
                              </AvatarFallback>
                            </Avatar>
                            
                            {task.assigned_to_name ? task.assigned_to_name : 'Unassigned'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Created</div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {task.created_at ? formatDate(task.created_at) : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {task.due_date ? formatDate(task.due_date) : 'Not set'}
                          </div>
                        </div>
                      </div>
                      
                      {task.notes && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                          <div className="p-3 bg-muted rounded-md text-sm">{task.notes}</div>
                        </div>
                      )}
                      
                      {task.completion_notes && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Completion Notes</div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                            {task.completion_notes}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <TaskSubmissionModal 
                          task={task}
                          onSubmissionUpdate={() => {
                            loadSubmissions()
                            onTaskUpdate?.()
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="submissions" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {isLoadingSubmissions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading submissions...
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No submissions yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submit your work to get started
                      </p>
                    </div>
                  ) : (
                    submissions.map((submission) => (
                      <Card key={submission.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{submission.title}</CardTitle>
                              <CardDescription>{submission.description}</CardDescription>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getSubmissionStatusColor(submission.status)}>
                                  {submission.status}
                                </Badge>
                                {submission.is_draft && (
                                  <Badge variant="outline">Draft</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  by {submission.submitted_by_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(submission.created_at)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedSubmission(
                                  expandedSubmission === submission.id ? null : submission.id
                                )}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {submission.status !== 'approved' && submission.submitted_by?.id !== user?.uid && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSubmission(submission.id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {expandedSubmission === submission.id && (
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {submission.content && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Content</div>
                                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                    {submission.content}
                                  </div>
                                </div>
                              )}
                              
                              {submission.notes && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Notes</div>
                                  <div className="p-3 bg-blue-50 rounded-md text-sm">
                                    {submission.notes}
                                  </div>
                                </div>
                              )}
                              
                              {submission.files.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">
                                    Files ({submission.file_count})
                                  </div>
                                  <div className="space-y-2">
                                    {submission.files.map((file) => (
                                      <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 border rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          {getFileIcon(file.file_type)}
                                          <div>
                                            <div className="text-sm font-medium">
                                              {file.original_filename}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {file.file_size_human} • {file.content_type}
                                              {file.extracted_text && (
                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                  Text Extracted
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                          {/* View button for PDFs and images */}
                                          {(file.file_type === 'pdf' || file.file_type === 'image') && (
                                            <Button 
                                              variant="ghost"
                                              size="sm" 
                                              onClick={() => viewFile(file)}
                                              title="View file"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {/* Download button */}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => downloadFile(file)}
                                            title="Download file"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {submission.review_comments && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Review Comments</div>
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                                    {submission.review_comments}
                                  </div>
                                </div>
                              )}
                              
                              {submission.rejection_reason && (
                                <div>
                                  <div className="text-sm font-medium mb-2">Rejection Reason</div>
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                                    {submission.rejection_reason}
                                  </div>
                                </div>
                              )}

                              {/* Approval Actions - Only for task creator and pending submissions */}
                              {submission.status === 'pending' && task.created_by === user?.id && (
                                <div className="pt-4 border-t space-y-3">
                                  <div className="text-sm font-medium">Review Submission</div>
                                  
                                  {approvingSubmission === submission.id ? (
                                    <>
                                      <Textarea
                                        placeholder="Add comments (optional)..."
                                        value={approvalComments}
                                        onChange={(e) => setApprovalComments(e.target.value)}
                                        rows={2}
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleApproveSubmission(submission.id)}
                                          disabled={isLoading}
                                        >
                                          {isLoading ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Approving...
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Confirm Approval
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setApprovingSubmission(null)
                                            setApprovalComments("")
                                          }}
                                          disabled={isLoading}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => setApprovingSubmission(submission.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          const reason = prompt("Please provide a reason for rejection:")
                                          if (reason) {
                                            setRejectionReason(reason)
                                            handleRejectSubmission(submission.id)
                                          }
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="artifacts" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Paperclip className="h-5 w-5 mr-2" />
                        All Task Artifacts
                      </CardTitle>
                      <CardDescription>
                        {totalFiles} files • {formatFileSize(totalSize)} total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {submissions.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No artifacts yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((submission) => 
                            submission.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  {getFileIcon(file.file_type)}
                                  <div>
                                    <div className="font-medium">{file.original_filename}</div>
                                    <div className="text-sm text-muted-foreground">
                                      From: {submission.title} • {file.file_size_human}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDate(file.created_at)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {file.extracted_text && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Text Available
                                    </Badge>
                                  )}
                                  {/* View button for PDFs and images */}
                                  {(file.file_type === 'pdf' || file.file_type === 'image') && (
                                    <Button 
                                      variant="outline"
                                      size="sm" 
                                      onClick={() => viewFile(file)}
                                      title="View file"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {/* Download button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(file)}
                                    title="Download file"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <div>
                            <div className="font-medium">Task Created</div>
                            <div className="text-sm text-muted-foreground">
                              {task.created_at ? formatDate(task.created_at) : 'Unknown date'} by {task.created_by_name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        
                        {submissions.map((submission) => (
                          <div key={submission.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <div>
                              <div className="font-medium">
                                {submission.is_draft ? 'Draft Saved' : 'Work Submitted'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(submission.created_at)} • {submission.title}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {task.updated_at && task.created_at && task.updated_at !== task.created_at && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400 mt-2"></div>
                            <div>
                              <div className="font-medium">Task Updated</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(task.updated_at)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <CommentsSection
                    type="task"
                    entityId={task.id}
                    title="Task Comments"
                    onCountChange={(total, unread) => {
                      setCommentsCount(total)
                      setUnreadCommentsCount(unread)
                    }}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
