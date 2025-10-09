"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface InactivityMonitorProps {
  warningThreshold?: number // seconds before showing warning (default: 30 seconds)
}

export function InactivityMonitor({ warningThreshold = 30 }: InactivityMonitorProps) {
  const { isAuthenticated, logout, updateActivity, getInactivityTimeLeft } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [warningCountdown, setWarningCountdown] = useState(warningThreshold)

  useEffect(() => {
    if (!isAuthenticated) return

    const checkInactivity = () => {
      const inactivityTimeLeft = getInactivityTimeLeft()
      const inactivityTimeLeftSeconds = Math.floor(inactivityTimeLeft / 1000)
      
      setTimeLeft(inactivityTimeLeftSeconds)

      // Show warning when close to timeout
      if (inactivityTimeLeftSeconds <= warningThreshold && inactivityTimeLeftSeconds > 0) {
        if (!showWarning) {
          setShowWarning(true)
          setWarningCountdown(inactivityTimeLeftSeconds)
        } else {
          setWarningCountdown(inactivityTimeLeftSeconds)
        }
      } else if (inactivityTimeLeftSeconds <= 0) {
        // Time's up, logout
        logout()
      } else if (showWarning) {
        // Reset warning if user becomes active
        setShowWarning(false)
        setWarningCountdown(warningThreshold)
      }
    }

    // Check every second
    const interval = setInterval(checkInactivity, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, showWarning, warningThreshold, getInactivityTimeLeft, logout])

  const handleStayLoggedIn = () => {
    updateActivity()
    setShowWarning(false)
    setWarningCountdown(warningThreshold)
  }

  const handleLogout = () => {
    logout()
  }

  if (!isAuthenticated || !showWarning) {
    return null
  }

  const progressValue = (warningCountdown / warningThreshold) * 100

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
          <AlertDialogDescription>
            You have been inactive for a while. Your session will expire in{' '}
            <span className="font-semibold text-red-600">{warningCountdown}</span> seconds.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Time remaining</span>
            <span>{warningCountdown}s</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button
            onClick={handleStayLoggedIn}
            className="w-full sm:w-auto"
          >
            Stay Logged In
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default InactivityMonitor