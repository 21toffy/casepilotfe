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
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"
import { useRouter } from "next/navigation"

interface RegenerateCaseDialogProps {
  caseId: string
  caseTitle: string
  trigger?: React.ReactNode
}

export function RegenerateCaseDialog({ caseId, caseTitle, trigger }: RegenerateCaseDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
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

  const handleRegenerate = async () => {
    setIsLoading(true)
    
    try {
      const apiClient = getApiClient()
      const response = await apiClient.post(`/api/cases/${caseId}/regenerate/`)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const newCase = response.data
      
      toast({
        title: "Success",
        description: `Case "${caseTitle}" has been regenerated successfully. All AI services are being reprocessed.`
      })
      
      // Complete reset of modal state
      resetModalState()
      
      // Redirect to the new case
      router.push(`/cases/${newCase.id}`)
      
    } catch (error: any) {
      console.error('Failed to regenerate case:', error)
      resetModalState() // Make sure modal is closed on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to regenerate case"
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
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Case
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Regenerate Case
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will <strong>delete the current case</strong> and recreate it with the same details.
            <br /><br />
            <strong>What will be regenerated:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AI-generated case facts</li>
              <li>AI recommendations</li>
              <li>Case strategies</li>
              <li>Case memory and summaries</li>
              <li>Vector database indexing</li>
            </ul>
            <br />
            <strong>What will be preserved:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>Case title, description, and details</li>
              <li>Case participants and roles</li>
              <li>Case settings and metadata</li>
            </ul>
            <br />
            <strong className="text-red-600">Warning:</strong> All manually added tasks, submissions, 
            hearings, and custom facts will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRegenerate} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Regenerate Case
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
