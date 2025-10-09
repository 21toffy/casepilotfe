"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface DeleteConfirmationProps {
  type: "fact" | "outcome"
  id: number
  title: string
  onDelete: () => void
  trigger?: React.ReactNode
}

export function DeleteConfirmation({ type, id, title, onDelete, trigger }: DeleteConfirmationProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleDelete = async () => {
    setIsLoading(true)
    
    try {
      const apiClient = getApiClient()
      const endpoint = type === "fact" 
        ? `/api/cases/facts/${id}/`
        : `/api/cases/desired-outcomes/${id}/`
      
      const response = await apiClient.delete(endpoint)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      toast({
        title: "Success",
        description: `${type === "fact" ? "Fact" : "Desired outcome"} deleted successfully`
      })
      
      // Complete reset of modal state
      resetModalState()
      onDelete()
      
    } catch (error: any) {
      console.error(`Failed to delete ${type}:`, error)
      resetModalState() // Make sure modal is closed on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to delete ${type}`
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
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="ghost">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {type === "fact" ? "Fact" : "Desired Outcome"}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {type === "fact" ? "fact" : "desired outcome"}? 
            This action cannot be undone.
            {type === "outcome" && " The outcome will also be removed from the vector database and case memory."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
