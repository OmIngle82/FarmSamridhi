import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type DashboardCardProps = {
  title: string
  description?: string
  className?: string
  children: ReactNode
}

export function DashboardCard({ title, description, className, children }: DashboardCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow">
        {children}
      </CardContent>
    </Card>
  )
}
