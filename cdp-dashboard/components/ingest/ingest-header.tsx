"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function IngestHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Ingestion</h1>
        <p className="text-muted-foreground">Upload and manage user data for your CDP</p>
      </div>
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
