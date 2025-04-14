"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Edit,
  Trash2,
  BarChart3,
  ArrowRight,
} from "lucide-react"

interface UserProfile {
  cookie: string
  email?: string
  cohorts?: string
  created_at?: string
}

interface Cohort {
  id: string
  name: string
  description: string
  userCount: number
  createdAt: string
  criteria: string[]
}

export function CohortsList() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const res = await fetch("https://cdpapi-demo.onrender.com/api/users") // Fetch ALL users
        const data: UserProfile[] = await res.json()

        const cohortMap: Record<string, number> = {}

        data.forEach((user) => {
          const cohortList = (user.cohorts || "")
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)

          cohortList.forEach((cohort) => {
            cohortMap[cohort] = (cohortMap[cohort] || 0) + 1
          })
        })

        const finalList: Cohort[] = Object.entries(cohortMap).map(
          ([name, count], idx) => ({
            id: `c${idx + 1}`,
            name,
            description: `Users tagged under '${name}' cohort.`,
            userCount: count,
            createdAt: new Date().toISOString().slice(0, 10),
            criteria: ["Auto-generated from ML cohort prediction"],
          })
        )

        setCohorts(finalList)
      } catch (error) {
        console.error("Error fetching cohorts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCohorts()
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="opacity-50">
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 rounded animate-pulse" />
                <CardDescription className="h-4 bg-gray-200 rounded animate-pulse mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
              </CardFooter>
            </Card>
          ))
        : cohorts.map((cohort) => (
            <Card key={cohort.id}>
              <CardHeader>
                <CardTitle>{cohort.name}</CardTitle>
                <CardDescription>{cohort.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{cohort.userCount} users</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Created on {cohort.createdAt}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Criteria:</p>
                  <div className="flex flex-wrap gap-2">
                    {cohort.criteria.map((criterion, index) => (
                      <Badge key={index} variant="outline">
                        {criterion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                  <Button size="sm">
                    View
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
    </div>
  )
}
