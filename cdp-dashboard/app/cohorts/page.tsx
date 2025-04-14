import { CohortsList } from "@/components/cohorts/cohorts-list"
import { CohortsHeader } from "@/components/cohorts/cohorts-header"


export default function CohortsPage() {
  return (
    <div className="space-y-6">
      <CohortsHeader />
      <CohortsList />
    </div>
  )
}
