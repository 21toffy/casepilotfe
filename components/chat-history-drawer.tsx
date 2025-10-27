'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Plus, Search, MessageSquare, X } from 'lucide-react'
import { ChatSession } from '@/types/chat'
import { getApiClient, isSuccessResponse } from '@/lib/api-client'

interface ChatHistoryDrawerProps {
  caseId: number
  currentSessionId?: number
  onSessionSelect: (session: ChatSession) => void
  onNewSession: () => void
}

export function ChatHistoryDrawer({ 
  caseId, 
  currentSessionId,
  onSessionSelect,
  onNewSession 
}: ChatHistoryDrawerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [caseId])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await getApiClient().getChatSessions(caseId)
      if (isSuccessResponse(response)) {
        setSessions(response.data || [])
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.last_message_preview?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat History
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          {/* Search and New Chat Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleNewChat} className="gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="h-[calc(100vh-180px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading sessions...</div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">No chat sessions found</p>
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  Start a new chat
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionSelect(session)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent ${
                      currentSessionId === session.id ? 'bg-accent border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{session.title || `Chat ${session.id}`}</div>
                        {session.last_message_preview && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {session.last_message_preview.content}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {session.formatted_date || formatTime(session.last_message_at || session.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )

  async function handleNewChat() {
    try {
      const response = await getApiClient().createChatSession(caseId, { title: `Chat Session ${sessions.length + 1}` })
      if (isSuccessResponse(response)) {
        const newSession = response.data
        setSessions([newSession, ...sessions])
        onSessionSelect(newSession)
        setIsOpen(false)
        onNewSession()
      }
    } catch (error) {
      console.error('Error creating new chat session:', error)
    }
  }

  function handleSessionSelect(session: ChatSession) {
    onSessionSelect(session)
    setIsOpen(false)
  }
}

