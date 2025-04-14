"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers } from "@/lib/api"

interface SegmentData {
  name: string
  value: number
  color: string
}

export function SegmentsChart() {
  const [segments, setSegments] = useState<SegmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSegmentData() {
      try {
        setLoading(true)
        // Fetch all users to analyze segments
        const data = await getUsers(1, 1000) // Get a large batch of users

        // Count segments
        const segmentCounts: Record<string, number> = {}
        let totalSegments = 0

        data.users.forEach((user: any) => {
          if (user.segments && Array.isArray(user.segments)) {
            user.segments.forEach((segment: string) => {
              if (segment) {
                segmentCounts[segment] = (segmentCounts[segment] || 0) + 1
                totalSegments++
              }
            })
          } else if (typeof user.segments === "string" && user.segments) {
            const segments = user.segments
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
            segments.forEach((segment: string) => {
              segmentCounts[segment] = (segmentCounts[segment] || 0) + 1
              totalSegments++
            })
          }
        })

        // Convert to percentage and format for chart
        const colors = [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ]

        const segmentData = Object.entries(segmentCounts)
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / Math.max(totalSegments, 1)) * 100),
            color: colors[index % colors.length],
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6) // Take top 6 segments

        if (segmentData.length === 0) {
          // Fallback to example data if no segments found
          setSegments([
            { name: "High Value", value: 25, color: "rgb(54, 162, 235)" },
            { name: "Tech Enthusiast", value: 20, color: "rgb(255, 99, 132)" },
            { name: "Frequent Visitor", value: 18, color: "rgb(255, 205, 86)" },
            { name: "New Visitor", value: 15, color: "rgb(75, 192, 192)" },
            { name: "Inactive", value: 12, color: "rgb(153, 102, 255)" },
            { name: "Other", value: 10, color: "rgb(201, 203, 207)" },
          ])
        } else {
          setSegments(segmentData)
        }

        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch segment data:", err)
        setError(err.message || "Failed to load segment data")

        // Fallback to example data
        setSegments([
          { name: "High Value", value: 25, color: "rgb(54, 162, 235)" },
          { name: "Tech Enthusiast", value: 20, color: "rgb(255, 99, 132)" },
          { name: "Frequent Visitor", value: 18, color: "rgb(255, 205, 86)" },
          { name: "New Visitor", value: 15, color: "rgb(75, 192, 192)" },
          { name: "Inactive", value: 12, color: "rgb(153, 102, 255)" },
          { name: "Other", value: 10, color: "rgb(201, 203, 207)" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchSegmentData()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Segment Distribution</CardTitle>
        <CardDescription>User distribution across different segments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading segment data...</p>
          </div>
        ) : (
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Simple SVG pie chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {
                    segments.reduce(
                      (acc, segment, i) => {
                        const total = segments.reduce((sum, s) => sum + s.value, 0)
                        const startAngle = acc.angle
                        const sliceAngle = (segment.value / total) * 360
                        const endAngle = startAngle + sliceAngle

                        // Convert angles to radians for calculations
                        const startRad = ((startAngle - 90) * Math.PI) / 180
                        const endRad = ((endAngle - 90) * Math.PI) / 180

                        // Calculate the SVG arc path
                        const x1 = 50 + 50 * Math.cos(startRad)
                        const y1 = 50 + 50 * Math.sin(startRad)
                        const x2 = 50 + 50 * Math.cos(endRad)
                        const y2 = 50 + 50 * Math.sin(endRad)

                        // Determine if the slice is more than 180 degrees
                        const largeArcFlag = sliceAngle > 180 ? 1 : 0

                        const pathData = [
                          `M 50 50`,
                          `L ${x1} ${y1}`,
                          `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `Z`,
                        ].join(" ")

                        acc.paths.push(
                          <path key={i} d={pathData} fill={segment.color} stroke="#fff" strokeWidth="0.5" />,
                        )

                        acc.angle = endAngle
                        return acc
                      },
                      { paths: [] as React.ReactNode[], angle: 0 },
                    ).paths
                  }
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 w-full">
              <div className="flex flex-wrap justify-center gap-4">
                {segments.map((segment, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-xs">
                      {segment.name} ({segment.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="absolute top-0 left-0 right-0 p-2 text-xs text-amber-700 bg-amber-50 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
