"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function PredictionsHeader() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>
        <p className="text-muted-foreground">Run machine learning predictions on your user cohorts</p>
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
