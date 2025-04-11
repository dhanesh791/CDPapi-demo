import { PredictionsHeader } from "@/components/predictions/predictions-header"
import { PredictionForm } from "@/components/predictions/prediction-form"
import { PredictionHistory } from "@/components/predictions/prediction-history"

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <PredictionsHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <PredictionForm />
        <PredictionHistory />
      </div>
    </div>
  )
}
