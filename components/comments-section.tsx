"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface Comment {
  id: number
  uid: string
  user: {
    id: string
    full_name: string
    email: string
  }
  comment: string
  created_at: string
  updated_at: string
  is_read: boolean
}

interface CommentsSectionProps {
  type: "task" | "submission"
  entityId: number
  title?: string
  onCountChange?: (total: number, unread: number) => void
}

export function CommentsSection({ type, entityId, title, onCountChange }: CommentsSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && entityId) {
      loadComments()
    }
  }, [isOpen, entityId])

  // Auto-open on mount to show comments immediately
  useEffect(() => {
    if (entityId) {
      setIsOpen(true)
    }
  }, [entityId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const apiClient = getApiClient()
      const endpoint = type === "task" 
        ? `/api/tasks/${entityId}/comments/`
        : `/api/tasks/submissions/${entityId}/comments/`
      
      const response = await apiClient.get(endpoint)
      
      if (response.data) {
        const total = response.data.total_count || 0
        const unread = response.data.unread_count || 0
        
        setComments(response.data.comments || [])
        setUnreadCount(unread)
        setTotalCount(total)
        
        // Notify parent of count change
        if (onCountChange) {
          onCountChange(total, unread)
        }
        
        // Mark all comments as read
        await markAllAsRead()
      }
    } catch (error: any) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const apiClient = getApiClient()
      
      // Mark each unread comment as read
      for (const comment of comments) {
        if (!comment.is_read && comment.user.id !== (await getCurrentUserId())) {
          const endpoint = type === "task"
            ? `/api/tasks/comments/${comment.id}/mark-read/`
            : `/api/tasks/submission-comments/${comment.id}/mark-read/`
          
          await apiClient.post(endpoint, {})
        }
      }
      
      // Update unread count
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark comments as read:', error)
    }
  }

  const getCurrentUserId = async () => {
    // This should come from your auth context
    // For now, return null
    return null
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const apiClient = getApiClient()
      const endpoint = type === "task"
        ? `/api/tasks/${entityId}/comments/`
        : `/api/tasks/submissions/${entityId}/comments/`
      
      const response = await apiClient.post(endpoint, { comment: newComment })
      
      if (response.data) {
        toast({
          title: "Comment Added",
          description: "Your comment has been posted successfully.",
        })
        
        setNewComment("")
        loadComments()
      }
    } catch (error: any) {
      console.error('Failed to submit comment:', error)
      toast({
        variant: "destructive",
        title: "Failed to Post Comment",
        description: error.message || "Could not post your comment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return dateString
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>{title || "Comments"}</span>
            {totalCount > 0 && (
              <Badge variant="secondary">{totalCount}</Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            {isOpen ? "Hide" : "Show"}
          </Button>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading comments...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {comment.user.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                          {!comment.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Be the first to comment
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !newComment.trim()}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}

