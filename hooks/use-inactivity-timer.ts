"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour in milliseconds
const WARNING_TIME = 59 * 60 * 1000 + 30 * 1000 // 59 minutes 30 seconds
const COUNTDOWN_DURATION = INACTIVITY_TIMEOUT - WARNING_TIME // 30 seconds

export function useInactivityTimer() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const handleLogout = useCallback(async () => {
    clearAllTimers()
    setShowWarning(false)
    
    // Save current URL before logout
    const currentPath = window.location.pathname + window.location.search
    sessionStorage.setItem('redirectAfterLogin', currentPath)
    
    await logout()
    
    // Add redirect parameter to login URL
    const redirectParam = encodeURIComponent(currentPath)
    router.push(`/login?reason=inactivity&redirect=${redirectParam}`)
  }, [logout, router, clearAllTimers])

  const startCountdown = useCallback(() => {
    setShowWarning(true)
    setCountdown(30)
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [handleLogout])

  const resetTimer = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)
    setCountdown(30)

    if (!isAuthenticated) return

    // Set warning timer (59 minutes 30 seconds)
    warningTimeoutRef.current = setTimeout(() => {
      startCountdown()
    }, WARNING_TIME)

    // Set logout timer (1 hour)
    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_TIMEOUT)
  }, [isAuthenticated, startCountdown, handleLogout, clearAllTimers])

  const dismissWarning = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers()
      return
    }

    // Activity events to monitor
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Reset timer on any activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    // Start initial timer
    resetTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      clearAllTimers()
    }
  }, [isAuthenticated, resetTimer, clearAllTimers])

  return {
    showWarning,
    countdown,
    dismissWarning,
  }
}

