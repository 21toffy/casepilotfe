"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskCreationDialog } from "@/components/task-creation-dialog"
import {
  Send,
  Bot,
  User,
  FileText,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BookOpen,
  Scale,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  attachments?: Array<{
    type: "document" | "analysis" | "briefing"
    title: string
    description: string
  }>
}

interface AIAssistantChatProps {
  caseId: number
}

export function AIAssistantChat({ caseId }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hello! I'm your AI legal assistant for the Smith vs. Johnson case. I can help you with case analysis, legal research, document review, and strategic recommendations. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "Analyze contract breach elements",
        "Research similar cases in California",
        "Generate motion template",
        "Review damages calculation",
      ],
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: [
          "Tell me more about this",
          "Generate a document",
          "Find related cases",
          "Create a task from this",
        ],
        attachments: inputMessage.toLowerCase().includes("analysis")
          ? [
              {
                type: "analysis",
                title: "Contract Breach Analysis",
                description: "Detailed legal analysis of breach elements and potential remedies",
              },
            ]
          : undefined,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("contract") || input.includes("breach")) {
      return `Based on the Smith vs. Johnson case documents, I've identified the following key elements for the contract breach claim:

**Essential Elements Present:**
1. **Valid Contract**: The service agreement dated March 15, 2023, establishes clear terms and obligations
2. **Performance by Plaintiff**: Smith fulfilled initial payment obligations ($500,000 advance payment)
3. **Breach by Defendant**: Johnson Corporation failed to deliver services by the agreed deadline (September 30, 2023)
4. **Damages**: Quantifiable losses including lost revenue ($1.2M) and additional costs ($300,000)

**Recommended Strategy:**
- Focus on the clear timeline violations documented in email correspondence
- Emphasize the specific performance standards outlined in Section 4.2 of the agreement
- Consider demanding specific performance in addition to monetary damages

**Jurisdiction Considerations:**
Under California Civil Code § 1549, the remedy for breach includes both compensatory and consequential damages when foreseeable.

Would you like me to generate a motion template or research similar cases in your jurisdiction?`
    }

    if (input.includes("research") || input.includes("cases")) {
      return `I've found 12 relevant cases in California courts with similar contract breach scenarios:

**Most Relevant Precedents:**
1. **TechCorp v. ServicePro (2022)** - Similar service agreement breach, $2.1M awarded
2. **Manufacturing Inc. v. Solutions LLC (2021)** - Timeline violations, specific performance granted
3. **Global Services v. Regional Corp (2020)** - Consequential damages calculation methodology

**Key Insights:**
- Courts favor specific performance when monetary damages are insufficient
- Email communications are heavily weighted as evidence of breach
- Average settlement in similar cases: 65-75% of claimed damages

**Strategic Recommendations:**
- Emphasize the unique nature of services (supports specific performance claim)
- Document all mitigation efforts to strengthen damages claim
- Consider mediation before trial (85% success rate in similar cases)

Would you like detailed case summaries or help drafting discovery requests?`
    }

    if (input.includes("motion") || input.includes("template")) {
      return `I'll help you create a motion for summary judgment. Based on the case facts, here's the recommended structure:

**Motion for Summary Judgment - Key Arguments:**

1. **Undisputed Material Facts**
   - Contract execution and terms are clear
   - Defendant's failure to perform is documented
   - Plaintiff's damages are calculable

2. **Legal Standard**
   - No genuine issue of material fact exists
   - Plaintiff is entitled to judgment as a matter of law

3. **Supporting Evidence**
   - Service Agreement (Exhibit A)
   - Email correspondence showing breach (Exhibit B)
   - Financial impact documentation (Exhibit C)

**Timeline Recommendation:**
- File motion 30 days before discovery cutoff
- Request expedited hearing due to ongoing damages
- Prepare for potential cross-motion

I can generate the complete motion document with proper formatting and citations. Would you like me to create the full template now?`
    }

    return `I understand you're asking about "${userInput}". Let me analyze this in the context of your case and provide relevant legal insights and recommendations. 

Based on the case documents and current status, I can help you with:
- Legal research and precedent analysis
- Document drafting and templates  
- Strategic recommendations
- Jurisdiction-specific insights
- Timeline and deadline management

What specific aspect would you like me to focus on?`
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <CardTitle>AI Legal Assistant</CardTitle>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-4">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                      <div
                        className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === "user" ? "bg-blue-600" : "bg-gray-100"
                          }`}
                        >
                          {message.type === "user" ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                          {message.attachments && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="bg-white/10 rounded p-2 border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4" />
                                      <div>
                                        <p className="text-xs font-medium">{attachment.title}</p>
                                        <p className="text-xs opacity-75">{attachment.description}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {message.suggestions && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs bg-white/10 hover:bg-white/20"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Task Creation from AI Response */}
                          {message.type === "assistant" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <TaskCreationDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs bg-white/10 hover:bg-white/20"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Create Task
                                  </Button>
                                }
                                initialContent={message.content}
                                onTaskCreated={(task) => console.log("Task created from AI response:", task)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs bg-white/10 hover:bg-white/20"
                                onClick={() => {
                                  navigator.clipboard.writeText(message.content)
                                }}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
                            {message.type === "assistant" && (
                              <div className="flex items-center space-x-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex space-x-2">
              <Textarea
                placeholder="Ask about case strategy, legal research, document analysis..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                className="flex-1 min-h-[40px] max-h-[120px]"
                rows={1}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleSuggestionClick("Analyze the contract breach elements in detail")}
            >
              <Scale className="h-4 w-4 mr-2" />
              Contract Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleSuggestionClick("Research similar cases in our jurisdiction")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Case Research
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleSuggestionClick("Generate a motion for summary judgment template")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Draft Motion
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => handleSuggestionClick("What are the key deadlines and next steps?")}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Timeline Review
            </Button>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <CardDescription>Based on case analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-sm text-blue-900">Strong Case Elements</h4>
              <p className="text-sm text-blue-800 mt-1">
                Clear contract terms and documented breach timeline support your position.
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-medium text-sm text-orange-900">Areas to Strengthen</h4>
              <p className="text-sm text-orange-800 mt-1">
                Consider additional evidence for consequential damages calculation.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-sm text-green-900">Strategic Opportunity</h4>
              <p className="text-sm text-green-800 mt-1">
                Recent precedent in similar cases favors specific performance remedies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Case Context */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Case Type:</span>
              <span>Contract Dispute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jurisdiction:</span>
              <span>California</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Documents:</span>
              <span>4 uploaded</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Sessions:</span>
              <span>12 completed</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
