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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, AlertTriangle } from "lucide-react"
import { getApiClient, extractErrorMessage } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface DesiredOutcome {
  id: number
  description: string
  created_by?: any
  created_at: string
  updated_at: string
  vector_db_indexed: boolean
  vector_db_indexed_at?: string
  vector_indexing_failed: boolean
}

interface DesiredOutcomeModalProps {
  caseId: string
  outcome?: DesiredOutcome
  onOutcomeChange: () => void
  trigger?: React.ReactNode
}

export function DesiredOutcomeModal({ caseId, outcome, onOutcomeChange, trigger }: DesiredOutcomeModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [description, setDescription] = useState(outcome?.description || "")
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!outcome

  // Ensure body is always clickable on mount and unmount
  useEffect(() => {
    document.body.style.pointerEvents = 'auto'
    return () => {
      document.body.style.pointerEvents = 'auto'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Description is required"
      })
      return
    }

    // Show confirmation dialog before saving
    setShowConfirmation(true)
  }

  const resetModalState = () => {
    setIsLoading(false)
    setShowConfirmation(false)
    setOpen(false)
    // Remove any potential pointer-events styling
    document.body.style.pointerEvents = 'auto'
  }

  const handleConfirmedSubmit = async () => {
    setIsLoading(true)
    setShowConfirmation(false)
    
    try {
      const apiClient = getApiClient()
      console.log(description, "11111GGGGGGGGGGG")
      const trimmedDescription = description.trim()

      console.log(trimmedDescription, "GGGGGGGGGGG")
      
      // Double-check that description is not empty
      if (!trimmedDescription) {
        throw new Error("Description cannot be empty")
      }
      
      if (isEditing) {
        // Update existing outcome
        const response = await apiClient.put(`/api/cases/desired-outcomes/${outcome.id}/`, {
          description: trimmedDescription
        })
        
        if (response.error) {
          throw new Error(extractErrorMessage(response.error))
        }
        
        toast({
          title: "Success",
          description: "Desired outcome updated successfully. It will be re-indexed in the vector database."
        })
      } else {
        // Create new outcome
        const response = await apiClient.post(`/api/cases/${caseId}/desired-outcomes/`, {
          description: trimmedDescription
        })
        
        if (response.error) {
          throw new Error(extractErrorMessage(response.error))
        }
        
        toast({
          title: "Success", 
          description: "Desired outcome added successfully. It will be indexed in the vector database and integrated with case memory."
        })
      }
      
      // Complete reset of modal state
      resetModalState()
      setDescription("")
      onOutcomeChange()
      
    } catch (error: any) {
      console.error('Failed to save desired outcome:', error)
      resetModalState() // Make sure all modals are closed on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} desired outcome`
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true)
      // Ensure body is clickable when opening
      document.body.style.pointerEvents = 'auto'
    } else {
      // Complete reset when closing
      resetModalState()
      if (!isEditing) {
        // setDescription("")
      }
    }
    console.log(newOpen, "newOpenddddd", description, isEditing)
  }

  const handleConfirmationChange = (newOpen: boolean) => {
    setShowConfirmation(newOpen)
    if (!newOpen) {
      setIsLoading(false)
      // Ensure body is clickable
      document.body.style.pointerEvents = 'auto'
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm">
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Outcome
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Outcome
                </>
              )}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Desired Outcome" : "Add Desired Outcome"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the desired outcome details below." 
                : "Define what you want to achieve with this case. This will be integrated into the case memory system."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the desired outcome for this case..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Be specific about what success looks like for this case. This information will be used by the AI system to provide better recommendations.
              </p>
            </div>
            
            {isEditing && (
              <div className="space-y-2">
                <Label>Vector Database Status</Label>
                <div className="flex items-center space-x-2">
                  {outcome.vector_db_indexed && (
                    <Badge variant="outline" className="text-green-600">
                      Indexed
                    </Badge>
                  )}
                  {outcome.vector_indexing_failed && (
                    <Badge variant="outline" className="text-red-600">
                      Index Failed
                    </Badge>
                  )}
                  {!outcome.vector_db_indexed && !outcome.vector_indexing_failed && (
                    <Badge variant="outline" className="text-yellow-600">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Update Outcome" : "Add Outcome"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={handleConfirmationChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm {isEditing ? "Update" : "Addition"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isEditing 
                ? "Are you sure you want to update this desired outcome? It will be re-indexed in the vector database and may affect AI recommendations."
                : "Are you sure you want to add this desired outcome? It will be indexed in the vector database and integrated with the case memory system."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update" : "Add"} Outcome
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
