"use client"

import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Crown, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  FolderOpen,
  Zap
} from "lucide-react"
import { useBilling } from "@/contexts/billing-context"
import Link from 'next/link'

interface SubscriptionStatusProps {
  compact?: boolean
}

export function SubscriptionStatus({ compact = false }: SubscriptionStatusProps) {
  const { subscriptionStatus, isLoading } = useBilling()

  if (isLoading || !subscriptionStatus) {
    return null
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const isNearLimit = (used: number, limit: number) => {
    if (limit === -1) return false
    return (used / limit) >= 0.8 // 80% or more
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? '∞' : limit.toString()
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {subscriptionStatus.plan_code === 'professional' && (
          <Crown className="h-4 w-4 text-yellow-500" />
        )}
        <Badge variant={subscriptionStatus.is_active ? "default" : "destructive"}>
          {subscriptionStatus.plan_name}
        </Badge>
        
        {!subscriptionStatus.is_active && (
          <Link href="/billing">
            <Button size="sm" variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {subscriptionStatus.plan_code === 'professional' && (
              <Crown className="h-5 w-5 text-yellow-500" />
            )}
            <h3 className="font-semibold">{subscriptionStatus.plan_name}</h3>
            <Badge variant={subscriptionStatus.is_active ? "default" : "destructive"}>
              {subscriptionStatus.status}
            </Badge>
          </div>
          
          {subscriptionStatus.plan_code === 'free' && (
            <Link href="/billing">
              <Button size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Cases</span>
              </div>
              <span className="text-xs text-gray-500">
                {subscriptionStatus.current_counts.total_cases} / {formatLimit(subscriptionStatus.limits.max_cases)}
              </span>
            </div>
            
            {subscriptionStatus.limits.max_cases !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(
                    subscriptionStatus.current_counts.total_cases, 
                    subscriptionStatus.limits.max_cases
                  )} 
                  className="h-2"
                />
                {isNearLimit(subscriptionStatus.current_counts.total_cases, subscriptionStatus.limits.max_cases) && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Near limit</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Users */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Team</span>
              </div>
              <span className="text-xs text-gray-500">
                {subscriptionStatus.current_counts.total_users} / {formatLimit(subscriptionStatus.limits.max_users)}
              </span>
            </div>
            
            {subscriptionStatus.limits.max_users !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(
                    subscriptionStatus.current_counts.total_users, 
                    subscriptionStatus.limits.max_users
                  )} 
                  className="h-2"
                />
                {isNearLimit(subscriptionStatus.current_counts.total_users, subscriptionStatus.limits.max_users) && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Near limit</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Daily Chats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Daily Chats</span>
              </div>
              <span className="text-xs text-gray-500">
                {subscriptionStatus.usage_today.chat_messages_sent} / {formatLimit(subscriptionStatus.limits.daily_chat_limit)}
              </span>
            </div>
            
            {subscriptionStatus.limits.daily_chat_limit !== -1 && (
              <div className="space-y-1">
                <Progress 
                  value={getUsagePercentage(
                    subscriptionStatus.usage_today.chat_messages_sent, 
                    subscriptionStatus.limits.daily_chat_limit
                  )} 
                  className="h-2"
                />
                {isNearLimit(subscriptionStatus.usage_today.chat_messages_sent, subscriptionStatus.limits.daily_chat_limit) && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Near limit</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}





