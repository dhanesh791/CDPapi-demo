"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { uploadFile } from "@/lib/api"

export function IngestUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [dryRun, setDryRun] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv") {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dry_run", dryRun.toString())

      const response = await uploadFile(formData)

      if (response.status === "success") {
        setUploadStatus("success")

        // Reset after 3 seconds
        setTimeout(() => {
          setFile(null)
          setUploadStatus("idle")
        }, 3000)
      } else {
        setUploadStatus("error")
        setErrorMessage(response.detail || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage("Network error or server unavailable")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload User Data</CardTitle>
        <CardDescription>Upload a CSV file with user data to ingest into the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {uploadStatus === "idle" ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-medium">Drag and drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                <input
                  type="file"
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>
        ) : uploadStatus === "success" ? (
          <div className="flex flex-col items-center p-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="font-medium">Upload Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">Your data is being processed</p>
          </div>
        ) : (
          <div className="flex flex-col items-center p-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="font-medium">Upload Failed</p>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage || "Please try again or contact support"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="dry-run" checked={dryRun} onCheckedChange={(checked) => setDryRun(checked as boolean)} />
          <Label htmlFor="dry-run">Dry run (validate without saving)</Label>
        </div>
        <Button onClick={handleUpload} disabled={!file || isUploading || uploadStatus !== "idle"} className="w-full">
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </CardFooter>
    </Card>
  )
}
