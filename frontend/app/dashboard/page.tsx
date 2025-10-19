'use client'

import { useState } from "react";
import { StatCard } from "./_components/StatCard";
import { TransactionsChart } from "./_components/TransactionsChart";
import { MRRChart } from "./_components/MRRChart";
import { useChartData } from "@/lib/hooks/useChartData";
import type { ChartPeriod } from "@/types/chart";

export default function DashboardPage() {
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const { transactions, mrr, loading, error } = useChartData(period)

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-press-start)", fontWeight: 400, fontSize: "2.5rem" }}>
          Dashboard
        </h1>
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

      {/* Period Toggle */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-muted">Period:</span>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-4 py-2 font-mono text-xs border-2 transition-all
                ${
                  period === p
                    ? 'bg-brand text-surface border-brand shadow-[2px_2px_0_0_rgba(79,70,229,1)]'
                    : 'bg-surface text-fg border-border hover:border-brand-300 hover:-translate-y-[2px]'
                }
              `}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-error/10 border-2 border-error p-4 text-error font-mono text-sm">
          Error loading data: {error}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TransactionsChart data={transactions} loading={loading} />
        <MRRChart data={mrr} loading={loading} />
      </div>
    </div>
  );
}
