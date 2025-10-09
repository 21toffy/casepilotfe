"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, FileText, Scale } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { useToast } from "@/lib/use-toast"
import { getApiClient } from "@/lib/api-client"

// Interface for case creation form
interface CaseFormData {
  title: string
  case_type: string
  jurisdiction: string
  court_location: string
  description: string
  summary: string
  metadata: Record<string, any>
}

// Interface for case type option
interface CaseTypeOption {
  value: string
  label: string
}

export default function NewCasePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<CaseFormData>({
    title: "",
    case_type: "",
    jurisdiction: "",
    court_location: "",
    description: "",
    summary: "",
    metadata: {}
  })
  
  const [caseTypes, setCaseTypes] = useState<CaseTypeOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load case types on component mount
  useEffect(() => {
    loadCaseTypes()
  }, [])

  const loadCaseTypes = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/api/dropdowns/constants/case-types/')
      
      if (response.data) {
        setCaseTypes(response.data)
      } else {
        console.warn('No case types received from API')
        setCaseTypes([])
      }
    } catch (error: any) {
      console.error('Failed to load case types:', error)
      toast({
        variant: "destructive",
        title: "Failed to load case types",
        description: "Using default options. Please refresh the page to try again.",
      })
      // Provide fallback case types
      setCaseTypes([
        { value: 'corporate', label: 'Corporate' },
        { value: 'criminal', label: 'Criminal' },
        { value: 'civil', label: 'Civil' },
        { value: 'family', label: 'Family' },
        { value: 'real_estate', label: 'Real Estate' },
      ])
    } finally {
      setIsLoadingTypes(false)
    }
  }

  const handleInputChange = (field: keyof CaseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }
    
    setIsSubmitting(true)
    setError("")
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError("Case title is required")
        return
      }
      
      if (!formData.case_type) {
        setError("Case type is required")
        return
      }
      
      if (!formData.jurisdiction.trim()) {
        setError("Jurisdiction is required")
        return
      }
      
      if (!formData.court_location.trim()) {
        setError("Court location is required")
        return
      }
      
      if (!formData.description.trim()) {
        setError("Description is required")
        return
      }
      
      if (formData.description.trim().length < 10) {
        setError("Description must be at least 10 characters long")
        return
      }

      // Prepare submission data
      const submissionData = {
        title: formData.title.trim(),
        case_type: formData.case_type,
        jurisdiction: formData.jurisdiction.trim(),
        court_location: formData.court_location.trim(),
        description: formData.description.trim() || undefined,
        summary: formData.summary.trim() || undefined,
        metadata: formData.metadata
      }

      const apiClient = getApiClient()
      const response = await apiClient.post('/api/cases/create/', submissionData)

      if (response.data) {
        toast({
          variant: "default",
          title: "Case Created Successfully!",
          description: `Case "${formData.title}" has been created and you've been added as the case owner.`,
        })
        
        // Redirect to the new case detail page or cases list
        const caseId = response.data.id
        if (caseId) {
          router.push(`/cases/${caseId}`)
        } else {
          router.push('/cases')
        }
      } else {
        setError(response.error || "Failed to create case")
      }

    } catch (error: any) {
      console.error('Case creation error:', error)
      setError(error.message || "An unexpected error occurred while creating the case")
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  } 

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Case</h1>
                <p className="text-gray-600">Add a new case to your firm's portfolio</p>
              </div>
            </div>
          </div>

          {/* Centered Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="h-5 w-5 mr-2 text-blue-600" />
                Case Information
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new case. You will automatically be assigned as the case owner.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Case Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Case Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Smith vs. Johnson Contract Dispute"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Case Type */}
                <div className="space-y-2">
                  <Label htmlFor="case_type">Case Type *</Label>
                  {isLoadingTypes ? (
                    <div className="flex items-center space-x-2 p-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading case types...</span>
                    </div>
                  ) : (
                    <Select 
                      value={formData.case_type} 
                      onValueChange={(value) => handleInputChange('case_type', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Jurisdiction and Court Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Input
                      id="jurisdiction"
                      type="text"
                      value={formData.jurisdiction}
                      onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                      placeholder="e.g., Federal, New York State"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="court_location">Court Location *</Label>
                    <Input
                      id="court_location"
                      type="text"
                      value={formData.court_location}
                      onChange={(e) => handleInputChange('court_location', e.target.value)}
                      placeholder="e.g., Southern District of NY"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the case (minimum 10 characters)..."
                    rows={4}
                    disabled={isLoading}
                    required
                    minLength={10}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/10 characters minimum
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Brief summary for quick reference..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Case...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Create Case
                      </>
                    )}
                  </Button>
                  
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}