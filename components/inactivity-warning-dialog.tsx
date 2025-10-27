"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface InactivityWarningDialogProps {
  open: boolean
  countdown: number
  onDismiss: () => void
}

export function InactivityWarningDialog({
  open,
  countdown,
  onDismiss,
}: InactivityWarningDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              You've been inactive for a while. For your security, you will be logged out in:
            </p>
            <div className="text-center py-4">
              <span className="text-4xl font-bold text-orange-500">{countdown}</span>
              <p className="text-sm text-muted-foreground mt-1">seconds</p>
            </div>
            <p className="text-sm">
              Click "Stay Logged In" to continue your session, or you'll be automatically logged out.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onDismiss}>
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}





