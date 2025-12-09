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

// Global flag to track if Turnstile script is already loaded
let turnstileScriptLoaded = false
let turnstileScriptElement: HTMLScriptElement | null = null

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
  const isRenderedRef = useRef(false)
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    // Skip Turnstile in development
    if (!isProduction) {
      // Auto-verify with a dummy token in development
      if (!isRenderedRef.current) {
        setTimeout(() => {
          onVerify('dev-token')
        }, 100)
        isRenderedRef.current = true
      }
      return
    }

    // Prevent multiple renders
    if (isRenderedRef.current) {
      return
    }

    // Cleanup any existing widget first
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch (error) {
        console.error('Turnstile cleanup error:', error)
      }
      widgetIdRef.current = null
    }

    // Check if script is already loaded
    if (turnstileScriptLoaded && window.turnstile) {
      // Script already loaded, just render the widget
      if (containerRef.current && !widgetIdRef.current) {
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
          isRenderedRef.current = true
        } catch (error) {
          console.error('Turnstile render error:', error)
          if (onError) {
            onError('Failed to initialize Turnstile')
          }
        }
      }
      return
    }

    // Load Turnstile script only once
    if (!turnstileScriptElement) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.id = 'cloudflare-turnstile-script'
      
      script.onload = () => {
        turnstileScriptLoaded = true
        if (containerRef.current && window.turnstile && !widgetIdRef.current) {
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
            isRenderedRef.current = true
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
      turnstileScriptElement = script
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (turnstileScriptLoaded && window.turnstile && containerRef.current && !widgetIdRef.current) {
          clearInterval(checkInterval)
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
            isRenderedRef.current = true
          } catch (error) {
            console.error('Turnstile render error:', error)
            if (onError) {
              onError('Failed to initialize Turnstile')
            }
          }
        }
      }, 100)

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000)
    }
    
    return () => {
      // Cleanup widget only, not the script
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
          isRenderedRef.current = false
        } catch (error) {
          console.error('Turnstile cleanup error:', error)
        }
      }
    }
  }, [siteKey, theme, size, isProduction]) // Removed onVerify and onError from dependencies

  // Hide widget in development
  if (!isProduction) {
    return null
  }

  return <div ref={containerRef} className={className} />
}

