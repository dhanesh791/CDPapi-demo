"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users } from "lucide-react"

interface Segment {
  id: string
  name: string
  userCount: number
  criteria: string
  status: "active" | "inactive" | "draft"
}

export function SegmentsList() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    setTimeout(() => {
      setSegments([
        {
          id: "s1",
          name: "High Value",
          userCount: 312,
          criteria: "Income > $75,000 OR Purchase Value > $500",
          status: "active",
        },
        {
          id: "s2",
          name: "Tech Enthusiast",
          userCount: 254,
          criteria: 'Interests include "Technology" OR "Gadgets"',
          status: "active",
        },
        {
          id: "s3",
          name: "Frequent Visitor",
          userCount: 187,
          criteria: "Visit Count > 10 in last 30 days",
          status: "active",
        },
        {
          id: "s4",
          name: "New Visitor",
          userCount: 156,
          criteria: "First Visit < 7 days ago",
          status: "active",
        },
        {
          id: "s5",
          name: "Inactive",
          userCount: 98,
          criteria: "Last Visit > 30 days ago",
          status: "inactive",
        },
        {
          id: "s6",
          name: "Premium Subscribers",
          userCount: 0,
          criteria: 'Subscription Type = "Premium"',
          status: "draft",
        },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Segments List</CardTitle>
        <CardDescription>Manage your user segments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading segments...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">
                    {segment.name}
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{segment.criteria}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {segment.userCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        segment.status === "active"
                          ? "default"
                          : segment.status === "inactive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {segment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
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
