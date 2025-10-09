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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit } from "lucide-react"
import { getApiClient, extractErrorMessage } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface CaseFact {
  id: number
  fact_text: string
  source_type: string
  is_modified: boolean
  modified_by?: any
  created_by?: any
  created_at: string
  updated_at: string
}

interface CaseFactModalProps {
  caseId: string
  fact?: CaseFact
  onFactChange: () => void
  trigger?: React.ReactNode
}

export function CaseFactModal({ caseId, fact, onFactChange, trigger }: CaseFactModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [factText, setFactText] = useState(fact?.fact_text || "")
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!fact

  // Ensure body is always clickable on mount and unmount
  useEffect(() => {
    document.body.style.pointerEvents = 'auto'
    return () => {
      document.body.style.pointerEvents = 'auto'
    }
  }, [])

  const resetModalState = () => {
    setIsLoading(false)
    setOpen(false)
    // Remove any potential pointer-events styling
    document.body.style.pointerEvents = 'auto'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!factText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Fact text is required"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const apiClient = getApiClient()
      
      if (isEditing) {
        // Update existing fact
        const response = await apiClient.put(`/api/cases/facts/${fact.id}/`, {
          fact_text: factText.trim()
        })
        
        if (response.error) {
          throw new Error(extractErrorMessage(response.error))
        }
        
        toast({
          title: "Success",
          description: "Fact updated successfully"
        })
      } else {
        // Create new fact
        const response = await apiClient.post(`/api/cases/${caseId}/facts/`, {
          fact_text: factText.trim()
        })
        
        if (response.error) {
          throw new Error(extractErrorMessage(response.error))
        }
        
        toast({
          title: "Success", 
          description: "Fact added successfully"
        })
      }
      
      // Complete reset of modal state
      resetModalState()
      setFactText("")
      onFactChange()
      
    } catch (error: any) {
      console.error('Failed to save fact:', error)
      resetModalState() // Make sure modal is closed on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'add'} fact`
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
        setFactText("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            {isEditing ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Fact
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Fact
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Case Fact" : "Add Case Fact"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the fact details below." 
              : "Add a new fact about this case. Facts help organize key information."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fact-text">Fact Text</Label>
            <Textarea
              id="fact-text"
              placeholder="Enter the fact details..."
              value={factText}
              onChange={(e) => setFactText(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
          
          {isEditing && (
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {fact.source_type === 'AI_GENERATED' ? 'AI Generated' : 
                   fact.source_type === 'USER_GENERATED' ? 'User Generated' :
                   'User Modified'}
                </Badge>
                {fact.is_modified && (
                  <Badge variant="secondary">Modified</Badge>
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
              {isEditing ? "Update Fact" : "Add Fact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
