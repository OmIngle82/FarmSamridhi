import { DashboardCard } from "@/components/dashboard-card";

export default function FarmerFinancesPage() {
  return (
    <DashboardCard
      title="Financial Overview"
      description="Manage your finances, loans, and subsidies."
    >
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Financial management features are coming soon.</p>
      </div>
    </DashboardCard>
  )
}
