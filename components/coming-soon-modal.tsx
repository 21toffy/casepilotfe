"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ComingSoonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Calculate 7 days from now
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 7)
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Coming Soon!</DialogTitle>
          <DialogDescription>
            We're putting the finishing touches on our authentication system. Check back soon!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* Countdown Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center mb-4">
            <p className="text-sm font-medium mb-4">Launching in:</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">{timeLeft.days}</div>
                <div className="text-xs opacity-90">Days</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs opacity-90">Hours</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs opacity-90">Minutes</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">{timeLeft.seconds}</div>
                <div className="text-xs opacity-90">Seconds</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Sign up and sign in features will be available soon. Stay tuned!
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}





