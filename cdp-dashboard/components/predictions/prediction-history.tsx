"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"

interface PredictionJob {
  id: string
  cohort: string
  model: string
  timestamp: string
  status: "completed" | "running" | "failed"
  accuracy: number
}

export function PredictionHistory() {
  const [jobs, setJobs] = useState<PredictionJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    setTimeout(() => {
      setJobs([
        {
          id: "pred1",
          cohort: "New Users",
          model: "Churn Prediction",
          timestamp: "2023-11-15 10:45",
          status: "completed",
          accuracy: 0.87,
        },
        {
          id: "pred2",
          cohort: "Active Users",
          model: "Lifetime Value",
          timestamp: "2023-11-12 14:30",
          status: "completed",
          accuracy: 0.92,
        },
        {
          id: "pred3",
          cohort: "High-Value Customers",
          model: "Next Purchase",
          timestamp: "2023-11-10 09:15",
          status: "failed",
          accuracy: 0,
        },
        {
          id: "pred4",
          cohort: "Tech Enthusiasts",
          model: "Segment Assignment",
          timestamp: "2023-11-05 16:20",
          status: "completed",
          accuracy: 0.78,
        },
        {
          id: "pred5",
          cohort: "Returning Customers",
          model: "Churn Prediction",
          timestamp: "2023-11-01 11:30",
          status: "completed",
          accuracy: 0.85,
        },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prediction History</CardTitle>
        <CardDescription>Recent prediction jobs and their results</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading prediction history...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cohort</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.cohort}</TableCell>
                  <TableCell>{job.model}</TableCell>
                  <TableCell>{job.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          job.status === "completed" ? "default" : job.status === "running" ? "outline" : "destructive"
                        }
                      >
                        {job.status}
                      </Badge>
                      {job.status === "completed" && (
                        <span className="text-xs">{(job.accuracy * 100).toFixed(1)}% accuracy</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
