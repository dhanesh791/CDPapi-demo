"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart3, Loader2 } from "lucide-react"

export function PredictionForm() {
  const [cohort, setCohort] = useState("")
  const [model, setModel] = useState("")
  const [confidence, setConfidence] = useState("0.7")
  const [saveResults, setSaveResults] = useState(true)
  const [isRunning, setIsRunning] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRunning(true)

    // In a real implementation, you would call your API
    // try {
    //   const response = await fetch('http://localhost:8000/predict-cohort', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       cohort_id: cohort,
    //       model_name: model,
    //       confidence_threshold: parseFloat(confidence),
    //       save_results: saveResults,
    //     }),
    //   })
    //   const data = await response.json()
    // } catch (error) {
    //   console.error('Error running prediction:', error)
    // }

    // Simulated API call
    setTimeout(() => {
      setIsRunning(false)
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Prediction</CardTitle>
        <CardDescription>Select a cohort and model to run predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cohort">Cohort</Label>
            <Select value={cohort} onValueChange={setCohort}>
              <SelectTrigger id="cohort">
                <SelectValue placeholder="Select a cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c1">New Users</SelectItem>
                <SelectItem value="c2">Active Users</SelectItem>
                <SelectItem value="c3">High-Value Customers</SelectItem>
                <SelectItem value="c4">Tech Enthusiasts</SelectItem>
                <SelectItem value="c5">Returning Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Prediction Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="churn">Churn Prediction</SelectItem>
                <SelectItem value="ltv">Lifetime Value</SelectItem>
                <SelectItem value="next_purchase">Next Purchase</SelectItem>
                <SelectItem value="segment">Segment Assignment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confidence">Confidence Threshold</Label>
            <Input
              id="confidence"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum confidence level (0-1) for predictions</p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="save-results"
              checked={saveResults}
              onCheckedChange={(checked) => setSaveResults(checked as boolean)}
            />
            <Label htmlFor="save-results">Save results to user profiles</Label>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} disabled={!cohort || !model || isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Prediction...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              Run Prediction
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
