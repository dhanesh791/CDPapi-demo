"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, PieChart, BarChart3 } from "lucide-react"
import { getStats } from "@/lib/api"

interface StatsData {
  totalUsers: number
  totalCohorts: number
  totalSegments: number
  predictionsRun: number
}

export function DashboardCards() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalCohorts: 0,
    totalSegments: 0,
    predictionsRun: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const data = await getStats()
        setStats(data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch stats:", err)
        setError(err.message || "Failed to load dashboard stats")

        // Always provide fallback data
        setStats({
          totalUsers: 1254,
          totalCohorts: 12,
          totalSegments: 8,
          predictionsRun: 45,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From your user_profiles.db database</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cohorts</CardTitle>
          <UserPlus className="h-4 w-4 text-pink-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalCohorts}</div>
          <p className="text-xs text-muted-foreground">Active user cohorts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segments</CardTitle>
          <PieChart className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalSegments}</div>
          <p className="text-xs text-muted-foreground">User segments</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Predictions Run</CardTitle>
          <BarChart3 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.predictionsRun}</div>
          <p className="text-xs text-muted-foreground">Total ML predictions</p>
        </CardContent>
      </Card>
      {error && (
        <div className="col-span-4 p-4 text-sm text-amber-700 bg-amber-50 rounded-md border border-amber-200">
          <strong>Connection issue:</strong> {error}
          <p className="mt-1">Using example data instead. Make sure your FastAPI backend is running.</p>
        </div>
      )}
    </div>
  )
}
