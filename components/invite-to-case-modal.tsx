"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Loader2 } from "lucide-react"
import { getApiClient, extractErrorMessage } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface OrgUser {
  uid: string
  email: string
  full_name: string
  first_name: string
  last_name: string
  role: string
}

interface InviteToCaseModalProps {
  caseId: string
  trigger?: React.ReactNode
  onInviteSent?: () => void
}

export function InviteToCaseModal({ caseId, trigger, onInviteSent }: InviteToCaseModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [message, setMessage] = useState('')

  // Load organization users when modal opens
  useEffect(() => {
    if (open) {
      loadOrgUsers()
    } else {
      // Reset form when modal closes
      setSelectedUserId('')
      setMessage('')
    }
  }, [open])

  const loadOrgUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/users/organization/users/')
      
      if (response.data) {
        setOrgUsers(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load organization users:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load organization users.",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUserId) {
      toast({
        variant: "destructive",
        title: "User Required",
        description: "Please select a user to invite.",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const apiClient = getApiClient()
      const response = await apiClient.post(`/api/users/invitations/case/${caseId}/`, {
        user_uid: selectedUserId,
        message: message
      })
      
      if (response.data) {
        const selectedUser = orgUsers.find(u => u.uid === selectedUserId)
        toast({
          title: "Invitation Sent",
          description: `Invitation has been sent to ${selectedUser?.full_name || selectedUser?.email} successfully.`,
        })
        setOpen(false)
        if (onInviteSent) {
          onInviteSent()
        }
      } else if (response.error) {
        // Handle API error response
        const errorMessage = extractErrorMessage(response.error)
        toast({
          variant: "destructive",
          title: "Invitation Failed",
          description: errorMessage,
        })
      } else {
        throw new Error("Failed to send invitation.")
      }
    } catch (error: any) {
      console.error("Failed to send invitation:", error)
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: error.message || "Failed to send invitation. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite to Case
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User to Case</DialogTitle>
          <DialogDescription>
            Select a user from your organization to invite to this case. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select User *</Label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user to invite" />
                </SelectTrigger>
                <SelectContent>
                  {orgUsers.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No users available
                    </div>
                  ) : (
                    orgUsers.map((user) => (
                      <SelectItem key={user.uid} value={user.uid}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Welcome Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a welcome message for the invitee (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingUsers}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

