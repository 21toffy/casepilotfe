"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { AIAssistantChat } from "@/components/ai-assistant-chat"

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Legal Assistant</h1>
          <p className="text-gray-600 mt-2">
            Get intelligent legal insights, research assistance, and strategic recommendations
          </p>
        </div>

        <AIAssistantChat caseId={1} />
      </main>
    </div>
  )
}
