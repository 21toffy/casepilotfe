"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Send,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/lib/use-toast"
import { getApiClient, isSuccessResponse } from "@/lib/api-client"

interface Task {
  id: number
  uid: string
  title: string
  description: string
  status: string
  case_id: number
  case_title: string
}

interface TaskSubmissionModalProps {
  task: Task
  onSubmissionUpdate?: () => void
}

interface FileUpload {
  file: File
  preview?: string
  type: 'text' | 'image' | 'document'
  extractedText?: string
}

export function TaskSubmissionModal({ task, onSubmissionUpdate }: TaskSubmissionModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [submissionData, setSubmissionData] = useState({
    title: `Submission for: ${task.title}`,
    description: '',
    content: '',
    notes: ''
  })
  
  // File handling
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
        })
        return
      }

      // Determine file type
      let fileType: 'text' | 'image' | 'document' = 'document'
      if (file.type.startsWith('image/')) {
        fileType = 'image'
      } else if (file.type.includes('text/') || file.name.endsWith('.txt')) {
        fileType = 'text'
      }

      const fileUpload: FileUpload = {
        file,
        type: fileType
      }

      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.file === file ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      }

      // Extract text from text files
      if (fileType === 'text') {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.file === file ? { ...f, extractedText: e.target?.result as string } : f
          ))
        }
        reader.readAsText(file)
      }

      setUploadedFiles(prev => [...prev, fileUpload])
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (fileToRemove: FileUpload) => {
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove))
  }

  const handleInputChange = (field: string, value: string) => {
    setSubmissionData(prev => ({ ...prev, [field]: value }))
  }

  const saveAsDraft = async () => {
    try {
      setIsSaving(true)
      const apiClient = getApiClient()
      
      const dataToSend = {
        title: submissionData.title,
        description: submissionData.description,
        content: submissionData.content,
        notes: submissionData.notes,
        status: 'draft'
      }
      
      let response
      
      if (uploadedFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData()
        Object.keys(dataToSend).forEach(key => {
          formData.append(key, dataToSend[key as keyof typeof dataToSend])
        })
        
        // Add files
        uploadedFiles.forEach((fileUpload, index) => {
          formData.append(`files`, fileUpload.file)
          if (fileUpload.extractedText) {
            formData.append(`file_${index}_extracted_text`, fileUpload.extractedText)
          }
        })

        // Don't set Content-Type header for FormData - let the browser set it
        response = await apiClient.post(`/api/tasks/${task.id}/submit/`, formData)
      } else {
        // Use JSON for text-only submissions
        response = await apiClient.post(`/api/tasks/${task.id}/submit/`, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      if (isSuccessResponse(response)) {
        toast({
          title: "Draft Saved",
          description: "Your work has been saved as a draft. You can continue working on it later.",
        })
      } else {
        throw new Error(response.error || 'Failed to save draft')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save draft",
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const submitForReview = async () => {
    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      
      // Validate required fields
      if (!submissionData.content.trim() && uploadedFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Content Required",
          description: "Please provide either text content or upload files before submitting.",
        })
        return
      }

      const dataToSend = {
        title: submissionData.title,
        description: submissionData.description,
        content: submissionData.content,
        notes: submissionData.notes,
        status: 'pending_review'
      }
      
      let response
      
      if (uploadedFiles.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData()
        Object.keys(dataToSend).forEach(key => {
          formData.append(key, dataToSend[key as keyof typeof dataToSend])
        })
        
        // Add files
        uploadedFiles.forEach((fileUpload, index) => {
          formData.append(`files`, fileUpload.file)
          if (fileUpload.extractedText) {
            formData.append(`file_${index}_extracted_text`, fileUpload.extractedText)
          }
        })

        // Don't set Content-Type header for FormData - let the browser set it
        response = await apiClient.post(`/api/tasks/${task.id}/submit/`, formData)
      } else {
        // Use JSON for text-only submissions
        response = await apiClient.post(`/api/tasks/${task.id}/submit/`, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      if (isSuccessResponse(response)) {
        toast({
          title: "Submitted for Review",
          description: "Your work has been submitted successfully and is now pending review.",
        })
        
        setIsOpen(false)
        onSubmissionUpdate?.()
        
        // Reset form
        setSubmissionData({
          title: `Submission for: ${task.title}`,
          description: '',
          content: '',
          notes: ''
        })
        setUploadedFiles([])
      } else {
        throw new Error(response.error || 'Failed to submit for review')
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (fileType.includes('document') || fileType.includes('word')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Submit Work
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Work for Review</DialogTitle>
          <DialogDescription>
            Submit your work for task: <strong>{task.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content & Text</TabsTrigger>
            <TabsTrigger value="files">Files & Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Submission Title</Label>
              <Input
                id="title"
                value={submissionData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief title for your submission"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={submissionData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of what you're submitting"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Work Content</Label>
              <Textarea
                id="content"
                value={submissionData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Provide detailed information about your work, findings, research, or any relevant content..."
                rows={8}
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={submissionData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or comments (optional)"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>File Uploads</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: PDF, DOC, DOCX, TXT, Images (Max 10MB per file)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label>Uploaded Files ({uploadedFiles.length})</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((fileUpload, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(fileUpload.file.type)}
                          <div>
                            <p className="text-sm font-medium">{fileUpload.file.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(fileUpload.file.size)}</span>
                              <Badge variant="outline" className="text-xs">
                                {fileUpload.type}
                              </Badge>
                              {fileUpload.extractedText && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Text Extracted
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileUpload)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={saveAsDraft}
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitForReview}
              disabled={isLoading || isSaving}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
