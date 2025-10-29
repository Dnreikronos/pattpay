'use client'

import { useState, useEffect, useMemo } from "react";
import { StatCard } from "./_components/StatCard";
import { TransactionsChart } from "./_components/TransactionsChart";
import { MRRChart } from "./_components/MRRChart";
import { FilterButton } from "./_components/FilterButton";
import { useChartData } from "@/lib/hooks/useChartData";
import { useFilterStore } from "@/lib/stores/filter-store";
import type { ChartPeriod } from "@/types/chart";
import { motion } from "framer-motion";
import { mockSubscriptions } from "@/mocks/data";
import { mockPayments } from "@/mocks/data";

export default function DashboardPage() {
  const { dateFilter } = useFilterStore();
  const [mounted, setMounted] = useState(false);

  // Map filter preset to chart period
  const period: ChartPeriod =
    dateFilter.preset === 'last-7-days' ? '7d' :
    dateFilter.preset === 'last-90-days' ? '90d' : '30d';

  const { transactions, mrr, loading, error } = useChartData(period)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate stats from mock data (only on client to avoid hydration issues)
  const activeSubscriptions = useMemo(() => {
    if (!mounted) return 0; // Return 0 during SSR
    return mockSubscriptions.filter(s => s.status === 'active').length;
  }, [mounted]);

  const totalRevenueUSD = useMemo(() => {
    if (!mounted) return 0; // Return 0 during SSR
    return mockPayments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amountUSD, 0);
  }, [mounted]);

  const paymentsToday = useMemo(() => {
    if (!mounted) return 0; // Return 0 during SSR

    return mockPayments.filter(p => {
      const paymentDate = new Date(p.createdAt)
      const today = new Date()
      return paymentDate.toDateString() === today.toDateString()
    }).length;
  }, [mounted]);

  // Helper function to format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-press-start)", fontWeight: 400, fontSize: "2.5rem" }}>
          Dashboard
        </h1>
        <p className="font-mono text-muted-foreground text-sm">
          Overview of your payment activity and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.toString()}
          icon="/person1.png"
          accentColor="#4F46E5"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenueUSD)}
          icon="/person2.png"
          accentColor="#10b981"
        />
        <StatCard
          title="Payments Today"
          value={paymentsToday.toString()}
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
