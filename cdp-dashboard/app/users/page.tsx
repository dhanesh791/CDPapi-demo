import { UsersHeader } from "@/components/users/users-header"
import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <UsersHeader />
      <UsersTable />
    </div>
  )
}
