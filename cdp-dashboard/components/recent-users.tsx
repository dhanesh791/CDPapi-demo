"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"

interface User {
  cookie: string
  email: string
  country: string
  age: number
  gender: string
  segments: string[]
  cohorts: string[]
}

export function RecentUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you would fetch this data from your API
    // For now, we'll simulate loading and then set some example data
    const timer = setTimeout(() => {
      setUsers([
        {
          cookie: "c_123456",
          email: "john.doe@example.com",
          country: "USA",
          age: 34,
          gender: "Male",
          segments: ["High Value", "Tech Enthusiast"],
          cohorts: ["New Users"],
        },
        {
          cookie: "c_789012",
          email: "jane.smith@example.com",
          country: "Canada",
          age: 28,
          gender: "Female",
          segments: ["Frequent Visitor"],
          cohorts: ["Active Users"],
        },
        {
          cookie: "c_345678",
          email: "robert.johnson@example.com",
          country: "UK",
          age: 42,
          gender: "Male",
          segments: ["High Value"],
          cohorts: ["Returning Customers"],
        },
        {
          cookie: "c_901234",
          email: "emily.williams@example.com",
          country: "Australia",
          age: 31,
          gender: "Female",
          segments: ["Tech Enthusiast"],
          cohorts: ["New Users"],
        },
        {
          cookie: "c_567890",
          email: "michael.brown@example.com",
          country: "Germany",
          age: 39,
          gender: "Male",
          segments: ["Frequent Visitor", "High Value"],
          cohorts: ["Active Users"],
        },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>You have {loading ? "..." : users.length} users in your database.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cookie</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Segments</TableHead>
                <TableHead>Cohorts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.cookie}>
                  <TableCell className="font-medium">{user.cookie}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.country}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.segments.map((segment) => (
                        <Badge key={segment} variant="outline">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.cohorts.map((cohort) => (
                        <Badge key={cohort} variant="secondary">
                          {cohort}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
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
