"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Scale, Search, Bell, Settings, LogOut, User, Plus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

export function DashboardHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  
  const [notifications] = useState([
    { id: 1, title: "New document uploaded", case: "Smith vs. Johnson", time: "5m ago" },
    { id: 2, title: "Task deadline approaching", case: "TechCorp Merger", time: "1h ago" },
    { id: 3, title: "Court date reminder", case: "State vs. Williams", time: "2h ago" },
  ])

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      const apiClient = getApiClient()
      await apiClient.post('/api/users/auth/logout/')
    } catch (error: any) {
      console.error('Logout error:', error)
    } finally {
      // Clear frontend state and redirect
      logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push('/login')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_user':
        return 'Super User'
      case 'case_owner':
        return 'Case Owner'
      case 'invitee':
        return 'Invitee'
      default:
        return role?.replace('_', ' ') || 'User'
    }
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">LawCentrAI</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/cases" className="text-sm font-medium hover:text-blue-600">
                Cases
              </Link>
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search cases, documents..." className="pl-10 w-64" />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link href="/cases/new">
                <Button size="sm" className="hidden sm:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </Link>

              <Link href="/ai-assistant">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
              </Link>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.case}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center">
                  <Link href="/notifications" className="w-full">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>{getInitials(user?.full_name || user?.first_name + ' ' + user?.last_name || 'U')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.full_name || user?.first_name + ' ' + user?.last_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'No email'}
                    </p>
                    <Badge variant="secondary" className="w-fit mt-1">
                      {getRoleDisplayName(user?.role || '')}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
