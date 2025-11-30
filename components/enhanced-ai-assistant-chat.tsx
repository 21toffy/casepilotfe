'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { ChatMessage } from '@/types/chat'
import { getApiClient, isSuccessResponse } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface EnhancedAIAssistantChatProps {
  caseId: number
  sessionId?: number | null
  onSessionChange?: (sessionId: number) => void
}

// Simple markdown formatter without external dependencies
function formatMarkdown(text: string): string {
  if (!text) return ''
  
  let html = text
  
  // Code blocks (```code```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted p-3 rounded-md my-2 overflow-x-auto"><code>${escapeHtml(code.trim())}</code></pre>`
  })
  
  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
  
  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Headers (# to ######)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-semibold mt-3 mb-2">$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-sm font-semibold mt-3 mb-2">$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-semibold mt-3 mb-2">$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-lg font-semibold mt-3 mb-2">$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-2">$1</h1>')
  
  // Unordered lists (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-2">$&</ul>')
  
  // Ordered lists (1. item)
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside my-2">$&</ol>')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="my-2">')
  html = html.replace(/\n/g, '<br />')
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="my-2">${html}</p>`
  }
  
  return html
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

interface AISuggestionsProps {
  suggestions: {
    follow_up_questions?: string[]
    pdf_export?: boolean
    additional_help?: string[]
  }
  onQuestionClick: (question: string) => void
  onPDFExport: () => void
}

function AISuggestions({ suggestions, onQuestionClick, onPDFExport }: AISuggestionsProps) {
  if (!suggestions.follow_up_questions?.length && !suggestions.pdf_export && !suggestions.additional_help?.length) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="text-xs font-semibold mb-2 text-muted-foreground">Suggested Actions:</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.follow_up_questions?.map((question, idx) => (
          <Button
            key={`question-${idx}`}
            variant="outline"
            size="sm"
            onClick={() => onQuestionClick(question)}
            className="h-auto py-1.5 px-3 text-xs whitespace-normal"
          >
            {question}
          </Button>
        ))}
        {suggestions.pdf_export && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPDFExport}
            className="h-auto py-1.5 px-3 text-xs"
          >
            📄 Export as PDF
          </Button>
        )}
      </div>
    </div>
  )
}

export function EnhancedAIAssistantChat({ 
  caseId,
  sessionId,
  onSessionChange 
}: EnhancedAIAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId || null)
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (sessionId !== undefined && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId)
    }
  }, [sessionId])

  // Load messages when session changes or on initial mount
  useEffect(() => {
    const sessionToLoad = currentSessionId || sessionId
    if (sessionToLoad) {
      console.log('📥 Loading messages for session:', sessionToLoad)
      loadMessages()
    }
  }, [currentSessionId, sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    const sessionToLoad = currentSessionId || sessionId
    if (!sessionToLoad) {
      console.log('⚠️ No session ID to load messages from')
      return
    }
    
    try {
      console.log('📡 Fetching messages for session:', sessionToLoad)
      const response = await getApiClient().getChatMessages(caseId, sessionToLoad)
      if (isSuccessResponse(response)) {
        const loadedMessages = response.data || []
        console.log('✅ Loaded messages:', loadedMessages.length)
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    }
  }

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    console.log('🚀 handleSend called with:', { userMessage, currentSessionId, caseId })
    
    let sessionToUse = currentSessionId
    
    // Create session if needed
    if (!sessionToUse) {
      console.log('No session ID, creating new session...')
      try {
        const response = await getApiClient().createChatSession(caseId, {})
        console.log('Session creation response:', response)
        if (isSuccessResponse(response)) {
          const newSession = response.data
          console.log('New session created:', newSession)
          sessionToUse = newSession.id
          setCurrentSessionId(newSession.id)
          onSessionChange?.(newSession.id)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to create chat session',
            variant: 'destructive',
          })
          return
        }
      } catch (error) {
        console.error('Error creating session:', error)
        return
      }
    }

    // Send the message
    try {
      setLoading(true)
      console.log('Sending message to API with session:', sessionToUse)
      
      // Update current session ID BEFORE sending to ensure polling uses correct session
      if (sessionToUse !== currentSessionId) {
        console.log('Updating currentSessionId from', currentSessionId, 'to', sessionToUse)
        setCurrentSessionId(sessionToUse)
      }
      
      const sendResponse = await getApiClient().sendChatMessage(caseId, sessionToUse, userMessage)
      console.log('Send response:', sendResponse)
      
      if (isSuccessResponse(sendResponse)) {
        // Immediately add the user message to state
        const newMessage = sendResponse.data
        setMessages(prev => [...prev, newMessage])
        
        // Poll for AI response using the correct session
        console.log('Starting to poll for AI response with session:', sessionToUse)
        setIsStreaming(true)
        await pollForAIResponse(sessionToUse)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setIsStreaming(false)
    }
  }

  const pollForAIResponse = async (sessionId: number) => {
    let attempts = 0
    const maxAttempts = 60 // Poll for up to 60 seconds
    const baseMessageCount = messages.filter(m => m.sender === 'ai').length
    
    console.log('🔄 Starting to poll for AI response...', { baseMessageCount, sessionId })
    
    const poll = async (): Promise<boolean> => {
      try {
        console.log(`📡 Polling attempt ${attempts + 1}/${maxAttempts} for session ${sessionId}`)
        const response = await getApiClient().getChatMessages(caseId, sessionId)
        
        if (isSuccessResponse(response)) {
          const messageList = response.data as ChatMessage[]
          const currentAiMessages = messageList.filter(m => m.sender === 'ai' && m.is_complete)
          
          console.log(`📊 AI messages - Base: ${baseMessageCount}, Current: ${currentAiMessages.length}`)
          
          // Check if we have a new AI message
          if (currentAiMessages.length > baseMessageCount) {
            console.log('✅ AI response detected! Updating messages...')
            setMessages(messageList)
            toast({
              title: 'Success',
              description: 'AI response received',
            })
            return true
          }
          
          // If we have any AI messages but not complete, keep polling
          const streamingMessages = messageList.filter(m => m.sender === 'ai' && m.is_streaming)
          if (streamingMessages.length > 0) {
            console.log('⏳ AI is still generating response...')
          }
        }
      } catch (error) {
        console.error('❌ Error polling for response:', error)
      }
      
      attempts++
      return false
    }

    while (attempts < maxAttempts) {
      const done = await poll()
      if (done) {
        console.log('✅ Polling complete - AI response received')
        return true
      }
      
      // Wait 1 second between polls
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('⏱️ Polling timeout after', attempts, 'attempts')
    toast({
      title: 'No Response Yet',
      description: 'The AI is taking longer than expected. The response may appear shortly. You can also try sending your message again.',
      variant: 'destructive',
    })
    return false
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Messages - Responsive with proper constraints */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0" ref={scrollRef}>
        <div className="space-y-4 max-w-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Start a conversation with Rhoda AI
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 rounded-full bg-primary text-primary-foreground p-2 h-fit">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className={`flex-1 min-w-0 ${message.sender === 'user' ? 'max-w-[85%] sm:max-w-[75%]' : 'max-w-[85%] sm:max-w-[75%]'}`}>
                <Card className={`${message.sender === 'user' ? 'bg-primary text-primary-foreground' : ''} w-full`}>
                  <CardContent className="p-3">
                    <div className="font-medium text-sm mb-1">
                      {message.sender_name}
                    </div>
                    <div className="text-sm break-words">
                      {message.sender === 'ai' ? (
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    {message.is_streaming && (
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Rhoda AI is typing...</span>
                      </div>
                    )}
                    {message.metadata?.suggestions && (
                      <AISuggestions 
                        suggestions={message.metadata.suggestions} 
                        onQuestionClick={async (question) => {
                          if (!currentSessionId) {
                            toast({
                              title: 'Error',
                              description: 'No active chat session',
                              variant: 'destructive',
                            })
                            return
                          }
                          
                          try {
                            setLoading(true)
                            setInput(question)
                            const response = await getApiClient().sendFollowUpQuestion(caseId, currentSessionId, question)
                            
                            if (isSuccessResponse(response)) {
                              // Add both messages to the chat
                              const { user_message, ai_message } = response.data
                              setMessages(prev => [...prev, user_message, ai_message])
                              
                              toast({
                                title: 'Follow-up sent',
                                description: 'AI is processing your follow-up question',
                              })
                            }
                          } catch (error) {
                            console.error('Error sending follow-up:', error)
                            toast({
                              title: 'Error',
                              description: 'Failed to send follow-up question',
                              variant: 'destructive',
                            })
                          } finally {
                            setLoading(false)
                          }
                        }}
                        onPDFExport={async () => {
                          if (!currentSessionId) {
                            toast({
                              title: 'Error',
                              description: 'No active chat session',
                              variant: 'destructive',
                            })
                            return
                          }
                          
                          try {
                            setLoading(true)
                            toast({
                              title: 'Generating PDF',
                              description: 'Please wait while we prepare your document...',
                            })
                            
                            // Fetch markdown content from backend
                            const response = await getApiClient().exportChatToPDF(caseId, currentSessionId)
                            
                            if (isSuccessResponse(response)) {
                              const { pdf_content } = response.data
                              
                              console.log('📄 Received markdown content from backend')
                              
                              // Import libraries dynamically
                              const { marked } = await import('marked')
                              const html2pdf = (await import('html2pdf.js')).default
                              
                              // Convert markdown to HTML
                              const htmlContent = marked(pdf_content)
                              
                              // Create a temporary element with the HTML content
                              const element = document.createElement('div')
                              element.innerHTML = htmlContent
                              
                              // Apply styling to the element
                              element.style.padding = '40px'
                              element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                              element.style.lineHeight = '1.6'
                              element.style.color = '#2c3e50'
                              element.style.fontSize = '14px'
                              
                              // Add CSS for better formatting
                              const style = document.createElement('style')
                              style.textContent = `
                                h1 { font-size: 24px; color: #1a1a1a; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-top: 20px; margin-bottom: 15px; }
                                h2 { font-size: 20px; color: #2c3e50; margin-top: 25px; margin-bottom: 12px; }
                                h3 { font-size: 18px; color: #34495e; margin-top: 20px; margin-bottom: 10px; }
                                h4 { font-size: 16px; color: #34495e; margin-top: 15px; margin-bottom: 8px; }
                                p { margin: 12px 0; }
                                code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; }
                                pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; border-left: 4px solid #3498db; margin: 15px 0; }
                                pre code { background: transparent; padding: 0; }
                                blockquote { border-left: 4px solid #3498db; padding-left: 20px; margin: 15px 0; color: #555; font-style: italic; }
                                strong { font-weight: 600; color: #1a1a1a; }
                                em { font-style: italic; }
                                ul, ol { padding-left: 30px; margin: 12px 0; }
                                li { margin: 6px 0; }
                                table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                th { background-color: #f8f8f8; font-weight: 600; }
                                a { color: #3498db; text-decoration: none; }
                                hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }
                              `
                              element.appendChild(style)
                              
                              // Configure PDF options
                              const opt = {
                                margin: [15, 15, 15, 15],
                                filename: `chat-export-${new Date().toISOString().slice(0, 10)}.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { 
                                  scale: 2,
                                  useCORS: true,
                                  letterRendering: true,
                                  logging: false
                                },
                                jsPDF: { 
                                  unit: 'mm', 
                                  format: 'a4', 
                                  orientation: 'portrait',
                                  compress: true
                                },
                                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                              }
                              
                              // Generate and download PDF
                              await html2pdf().set(opt).from(element).save()
                              
                              toast({
                                title: 'PDF Downloaded',
                                description: `Your chat has been exported successfully`,
                              })
                              setLoading(false)
                            }
                          } catch (error) {
                            console.error('Error exporting PDF:', error)
                            toast({
                              title: 'Error',
                              description: 'Failed to export PDF. Please try again.',
                              variant: 'destructive',
                            })
                            setLoading(false)
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {message.sender === 'user' && (
                <div className="flex-shrink-0 rounded-full bg-muted p-2 h-fit">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex gap-2 justify-start">
              <div className="flex-shrink-0 rounded-full bg-primary text-primary-foreground p-2 h-fit">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[85%] sm:max-w-[75%]">
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Rhoda AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input - Responsive with proper constraints */}
      <div className="border-t p-3 sm:p-4 bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={loading}
            className="flex-1 min-w-0"
          />
          <Button 
            onClick={handleSend} 
            disabled={loading || !input.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

