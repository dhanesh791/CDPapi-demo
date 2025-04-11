import { SegmentsHeader } from "@/components/segments/segments-header"
import { SegmentsChart } from "@/components/segments/segments-chart"
import { SegmentsList } from "@/components/segments/segments-list"

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <SegmentsHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <SegmentsChart />
        <SegmentsList />
      </div>
    </div>
  )
}
