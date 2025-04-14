"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getUsers } from "@/lib/api"

interface User {
  cookie: string
  email: string | null
  phone_number: string | null
  city: string | null
  state: string | null
  country: string | null
  age: number | null
  gender: string | null
  income: string | null
  education: string | null
  interests: string[]
  segments: string[]
  cohorts: string[]
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const limit = 10

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        const data = await getUsers(page, limit)
        setUsers(data.users || [])
        setTotalUsers(data.total || 0)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch users:", err)
        setError(err.message || "Failed to load users")
        // Fallback to example data
        setUsers([
          {
            cookie: "c_123456",
            email: "john.doe@example.com",
            phone_number: "+1 555-123-4567",
            city: "New York",
            state: "NY",
            country: "USA",
            age: 34,
            gender: "Male",
            income: "$75,000",
            education: "Bachelor",
            interests: ["Technology", "Sports", "Travel"],
            segments: ["High Value", "Tech Enthusiast"],
            cohorts: ["New Users"],
          },
          // ... other example users
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page])

  const totalPages = Math.ceil(totalUsers / limit) || 1

  // Helper function to safely parse array fields
  const parseArrayField = (field: any): string[] => {
    if (!field) return []
    if (Array.isArray(field)) return field
    if (typeof field === "string") {
      // Try to parse as comma-separated values
      return field
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        ) : (
          <>
            {error && <div className="p-4 text-sm text-red-500 bg-red-50">{error}. Using example data instead.</div>}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead>Segments</TableHead>
                    <TableHead>Cohorts</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.cookie}>
                      <TableCell className="font-medium">{user.cookie}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone_number || "-"}</TableCell>
                      <TableCell>{[user.city, user.state, user.country].filter(Boolean).join(", ") || "-"}</TableCell>
                      <TableCell>{user.age || "-"}</TableCell>
                      <TableCell>{user.gender || "-"}</TableCell>
                      <TableCell>{user.income || "-"}</TableCell>
                      <TableCell>{user.education || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {parseArrayField(user.interests).map((interest, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {parseArrayField(user.segments).map((segment, i) => (
                            <Badge key={i} variant="default" className="text-xs">
                              {segment}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {parseArrayField(user.cohorts).map((cohort, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
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
            </div>
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink onClick={() => setPage(pageNum)} isActive={page === pageNum}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  {totalPages > 5 && <PaginationEllipsis />}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
