"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function AuthBlocker() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after a moment
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/logo.svg" alt="LawCentrAI Logo" width={180} height={50} />
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Coming Soon</CardTitle>
          <CardDescription>
            Authentication features are temporarily unavailable while we make improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We're working hard to bring you the best experience. This page will be available soon!
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Redirecting to home page in a few seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





