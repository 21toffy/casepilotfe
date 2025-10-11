"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ThumbsUp, ThumbsDown, Trash2, FileText, Download, User, Calendar, MessageSquare } from "lucide-react"
import { useToast } from "@/lib/use-toast"
import { CommentsSection } from "@/components/comments-section"

interface SubmissionApprovalCardProps {
  submission: any
  currentUserId?: string
  onApprove: (submissionId: number, comments: string) => Promise<void>
  onReject: (submissionId: number, reason: string, comments: string) => Promise<void>
  onDelete: (submissionId: number) => Promise<void>
}

export function SubmissionApprovalCard({
  submission,
  currentUserId,
  onApprove,
  onReject,
  onDelete,
}: SubmissionApprovalCardProps) {
  const { toast } = useToast()
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionComments, setRejectionComments] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const isSubmitter = submission.submitted_by?.id === currentUserId
  const isTaskCreator = submission.task?.created_by?.id === currentUserId
  const canApprove = isTaskCreator && submission.status === 'pending'
  const canDelete = isSubmitter && submission.status !== 'approved'

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(submission.id, approvalComments)
      setShowApproveDialog(false)
      setApprovalComments("")
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
      })
      return
    }

    setIsProcessing(true)
    try {
      await onReject(submission.id, rejectionReason, rejectionComments)
      setShowRejectDialog(false)
      setRejectionReason("")
      setRejectionComments("")
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    setIsProcessing(true)
    try {
      await onDelete(submission.id)
      setShowDeleteDialog(false)
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{submission.title}</h4>
                  <Badge variant={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {submission.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Task Info */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>Task: {submission.task?.title || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>By: {submission.submitted_by?.full_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(submission.created_at)}</span>
              </div>
            </div>

            {/* Files */}
            {submission.files && submission.files.length > 0 && (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {submission.files.length} file(s) attached
                </span>
              </div>
            )}

            {/* Content Preview */}
            {submission.content && (
              <div className="bg-muted/50 rounded-md p-3">
                <p className="text-sm line-clamp-3">{submission.content}</p>
              </div>
            )}

            {/* Review Comments (if any) */}
            {submission.review_comments && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                <p className="text-sm font-medium text-blue-900">Review Comments:</p>
                <p className="text-sm text-blue-800 mt-1">{submission.review_comments}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                {canApprove && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setShowApproveDialog(true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>

              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {/* Comments Section */}
            <div className="pt-4 border-t">
              <CommentsSection
                type="submission"
                entityId={submission.id}
                title="Submission Comments"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this submission? This will mark the task as completed
              and generate embeddings for the content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-comments">Comments (Optional)</Label>
              <Textarea
                id="approval-comments"
                placeholder="Add any comments about this approval..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? "Approving..." : "Approve Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this submission. The submitter will be able to
              resubmit after making corrections.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Why is this submission being rejected?"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="rejection-comments">Additional Comments (Optional)</Label>
              <Textarea
                id="rejection-comments"
                placeholder="Any additional feedback..."
                value={rejectionComments}
                onChange={(e) => setRejectionComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? "Rejecting..." : "Reject Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Submission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

