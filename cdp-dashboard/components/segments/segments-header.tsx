"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle, Download, RefreshCw } from "lucide-react"

export function SegmentsHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
        <p className="text-muted-foreground">View and manage user segments based on behavior and attributes</p>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>
    </div>
  )
}
