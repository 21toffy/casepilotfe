"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import { useToast } from "@/lib/use-toast"

interface AddHearingModalProps {
  caseId: string
  onHearingAdded?: () => void
}

export function AddHearingModal({ caseId, onHearingAdded }: AddHearingModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.time || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const apiClient = getApiClient()
      
      // Combine date and time
      const datetime = `${formData.date}T${formData.time}:00`
      
      const payload = {
        date: datetime,
        location: formData.location,
        notes: formData.notes,
      }

      const response = await apiClient.post(`/api/cases/${caseId}/hearings/`, payload)

      if (response.data) {
        toast({
          title: "Success",
          description: "Hearing scheduled successfully!",
        })
        
        // Reset form
        setFormData({
          date: '',
          time: '',
          location: '',
          notes: '',
        })
        
        setIsOpen(false)
        onHearingAdded?.()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule hearing.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mt-2">
          <Plus className="h-4 w-4 mr-2" />
          Add Hearing
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule New Hearing
          </DialogTitle>
          <DialogDescription>
            Add a new court hearing or important date for this case.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Court room, address, or meeting location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the hearing..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Hearing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}














