import { CohortsHeader } from "@/components/cohorts/cohorts-header"
import { CohortsList } from "@/components/cohorts/cohorts-list"

export default function CohortsPage() {
  return (
    <div className="space-y-6">
      <CohortsHeader />
      <CohortsList />
    </div>
  )
}
