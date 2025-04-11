import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { RecentUsers } from "@/components/recent-users"

export default function Home() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardCards />
      <RecentUsers />
    </div>
  )
}
