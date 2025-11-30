"use client"

import { useEffect, useRef } from "react"

interface CloudflareTurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: (error: string) => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'error-callback'?: (error: string) => void
        theme?: "light" | "dark" | "auto"
        size?: "normal" | "compact"
      }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export function CloudflareTurnstile({
  siteKey,
  onVerify,
  onError,
  theme = "auto",
  size = "normal",
  className = ""
}: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    // Skip Turnstile in development
    if (!isProduction) {
      // Auto-verify with a dummy token in development
      setTimeout(() => {
        onVerify('dev-token')
      }, 100)
      return
    }

    // Load Turnstile script
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (containerRef.current && window.turnstile) {
        try {
          const widgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token)
            },
            'error-callback': (error: string) => {
              if (onError) {
                onError(error)
              }
            },
            theme: theme,
            size: size
          })
          widgetIdRef.current = widgetId
        } catch (error) {
          console.error('Turnstile render error:', error)
          if (onError) {
            onError('Failed to initialize Turnstile')
          }
        }
      }
    }
    
    script.onerror = () => {
      if (onError) {
        onError('Failed to load Turnstile script')
      }
    }
    
    document.body.appendChild(script)
    
    return () => {
      // Cleanup
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (error) {
          console.error('Turnstile cleanup error:', error)
        }
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [siteKey, onVerify, onError, theme, size, isProduction])

  // Hide widget in development
  if (!isProduction) {
    return null
  }

  return <div ref={containerRef} className={className} />
}

