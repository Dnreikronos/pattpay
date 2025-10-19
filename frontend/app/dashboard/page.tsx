'use client'

import { StatCard } from "./_components/StatCard";
import { TransactionsChart } from "./_components/TransactionsChart";
import { MRRChart } from "./_components/MRRChart";
import { FilterButton } from "./_components/FilterButton";
import { useChartData } from "@/lib/hooks/useChartData";
import { useFilterStore } from "@/lib/stores/filter-store";
import type { ChartPeriod } from "@/types/chart";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { dateFilter } = useFilterStore();

  // Map filter preset to chart period
  const period: ChartPeriod =
    dateFilter.preset === 'last-7-days' ? '7d' :
    dateFilter.preset === 'last-90-days' ? '90d' : '30d';

  const { transactions, mrr, loading, error } = useChartData(period)

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-press-start)", fontWeight: 400, fontSize: "2.5rem" }}>
          Dashboard
        </h1>
        <p className="font-mono text-muted text-sm">
          Overview of your payment activity and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Subscriptions"
          value="0"
          icon="/person1.png"
          accentColor="#4F46E5"
        />
        <StatCard
          title="Total Revenue"
          value="0 SOL"
          icon="/person2.png"
          accentColor="#F2B94B"
        />
        <StatCard
          title="Payments Today"
          value="0"
          icon="/person3.png"
          accentColor="#818CF8"
        />
      </div>

      {/* Filter System */}
      <FilterButton />

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border-2 border-error p-4 text-error font-mono text-sm">
          Error loading data: {error}
        </div>
      )}

      {/* Charts Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <TransactionsChart data={transactions} loading={loading} />
        <MRRChart data={mrr} loading={loading} />
      </motion.div>
    </div>
  );
}
