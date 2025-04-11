"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, UserPlus, PieChart, BarChart3, Upload, Database, Settings, Home } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-violet-500",
  },
  {
    label: "Cohorts",
    icon: UserPlus,
    href: "/cohorts",
    color: "text-pink-700",
  },
  {
    label: "Segments",
    icon: PieChart,
    href: "/segments",
    color: "text-orange-500",
  },
  {
    label: "Predictions",
    icon: BarChart3,
    href: "/predictions",
    color: "text-emerald-500",
  },
  {
    label: "Data Ingestion",
    icon: Upload,
    href: "/ingest",
    color: "text-blue-500",
  },
  {
    label: "Database",
    icon: Database,
    href: "/database",
    color: "text-amber-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-full w-64 border-r bg-gray-50 dark:bg-gray-900">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Customer Data Platform</h1>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                pathname === route.href
                  ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
