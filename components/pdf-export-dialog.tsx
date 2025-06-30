"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, FileText, Loader2 } from "lucide-react"

interface PDFExportDialogProps {
  trigger?: React.ReactNode
  caseData?: any
}

export function PDFExportDialog({ trigger, caseData }: PDFExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeOverview: true,
    includeTasks: true,
    includeDocuments: true,
    includeTeam: true,
    includeCourtDates: true,
    includeReports: true,
    includeStrategies: true,
    includeArtifacts: true,
    includeTimeline: true,
    format: "detailed",
    orientation: "portrait",
  })

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, this would generate and download the PDF
    console.log("Exporting PDF with options:", exportOptions)

    // Create a mock download
    const link = document.createElement("a")
    link.href = "#"
    link.download = `case-${caseData?.caseNumber || "details"}-${new Date().toISOString().split("T")[0]}.pdf`
    link.click()

    setIsExporting(false)
    setOpen(false)
  }

  const toggleOption = (option: string) => {
    setExportOptions((prev) => ({
      ...prev,
      [option]: !prev[option as keyof typeof prev],
    }))
  }

  const selectAllSections = () => {
    setExportOptions((prev) => ({
      ...prev,
      includeOverview: true,
      includeTasks: true,
      includeDocuments: true,
      includeTeam: true,
      includeCourtDates: true,
      includeReports: true,
      includeStrategies: true,
      includeArtifacts: true,
      includeTimeline: true,
    }))
  }

  const deselectAllSections = () => {
    setExportOptions((prev) => ({
      ...prev,
      includeOverview: false,
      includeTasks: false,
      includeDocuments: false,
      includeTeam: false,
      includeCourtDates: false,
      includeReports: false,
      includeStrategies: false,
      includeArtifacts: false,
      includeTimeline: false,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Case Details to PDF
          </DialogTitle>
          <DialogDescription>Select the sections and format options for your PDF export</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Format Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value) => setExportOptions((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                      <SelectItem value="executive">Executive Summary</SelectItem>
                      <SelectItem value="court-ready">Court-Ready Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select
                    value={exportOptions.orientation}
                    onValueChange={(value) => setExportOptions((prev) => ({ ...prev, orientation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Selection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Include Sections</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllSections}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllSections}>
                  Deselect All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overview"
                      checked={exportOptions.includeOverview}
                      onCheckedChange={() => toggleOption("includeOverview")}
                    />
                    <Label htmlFor="overview">Case Overview</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tasks"
                      checked={exportOptions.includeTasks}
                      onCheckedChange={() => toggleOption("includeTasks")}
                    />
                    <Label htmlFor="tasks">Tasks & Assignments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="documents"
                      checked={exportOptions.includeDocuments}
                      onCheckedChange={() => toggleOption("includeDocuments")}
                    />
                    <Label htmlFor="documents">Documents</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="team"
                      checked={exportOptions.includeTeam}
                      onCheckedChange={() => toggleOption("includeTeam")}
                    />
                    <Label htmlFor="team">Team Members</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timeline"
                      checked={exportOptions.includeTimeline}
                      onCheckedChange={() => toggleOption("includeTimeline")}
                    />
                    <Label htmlFor="timeline">Case Timeline</Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="court-dates"
                      checked={exportOptions.includeCourtDates}
                      onCheckedChange={() => toggleOption("includeCourtDates")}
                    />
                    <Label htmlFor="court-dates">Court Dates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reports"
                      checked={exportOptions.includeReports}
                      onCheckedChange={() => toggleOption("includeReports")}
                    />
                    <Label htmlFor="reports">Team Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="strategies"
                      checked={exportOptions.includeStrategies}
                      onCheckedChange={() => toggleOption("includeStrategies")}
                    />
                    <Label htmlFor="strategies">Published Strategies</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="artifacts"
                      checked={exportOptions.includeArtifacts}
                      onCheckedChange={() => toggleOption("includeArtifacts")}
                    />
                    <Label htmlFor="artifacts">Case Artifacts</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>File name:</strong> case-{caseData?.caseNumber || "details"}-
                  {new Date().toISOString().split("T")[0]}.pdf
                </p>
                <p className="mb-2">
                  <strong>Estimated pages:</strong>{" "}
                  {Object.values(exportOptions).filter((v) => v === true).length * 2 + 3} pages
                </p>
                <p>
                  <strong>Format:</strong>{" "}
                  {exportOptions.format.charAt(0).toUpperCase() + exportOptions.format.slice(1)} Report (
                  {exportOptions.orientation})
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
