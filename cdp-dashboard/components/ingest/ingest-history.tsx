"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

interface IngestJob {
  id: string
  filename: string
  timestamp: string
  status: "completed" | "processing" | "failed"
  recordsProcessed: number
  errors: number
}

export function IngestHistory() {
  const [jobs, setJobs] = useState<IngestJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    setTimeout(() => {
      setJobs([
        {
          id: "job1",
          filename: "users_batch_1.csv",
          timestamp: "2023-11-15 14:32",
          status: "completed",
          recordsProcessed: 1245,
          errors: 0,
        },
        {
          id: "job2",
          filename: "users_batch_2.csv",
          timestamp: "2023-11-10 09:15",
          status: "completed",
          recordsProcessed: 876,
          errors: 12,
        },
        {
          id: "job3",
          filename: "users_batch_3.csv",
          timestamp: "2023-11-05 16:45",
          status: "failed",
          recordsProcessed: 0,
          errors: 1,
        },
        {
          id: "job4",
          filename: "users_batch_4.csv",
          timestamp: "2023-11-01 11:20",
          status: "completed",
          recordsProcessed: 543,
          errors: 5,
        },
        {
          id: "job5",
          filename: "users_batch_5.csv",
          timestamp: "2023-10-28 13:10",
          status: "completed",
          recordsProcessed: 1102,
          errors: 0,
        },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingestion History</CardTitle>
        <CardDescription>Recent data ingestion jobs and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading ingestion history...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{job.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell>{job.timestamp}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "completed" ? "default" : job.status === "processing" ? "outline" : "destructive"
                      }
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.recordsProcessed.toLocaleString()}
                    {job.errors > 0 && <span className="text-red-500 text-xs ml-2">({job.errors} errors)</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Log
                    </Button>
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
