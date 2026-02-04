"use client";

import { StatsCard } from "@/components/cards/StatsCard";
import { Wallet, Calendar, DollarSign } from "lucide-react";

interface ParentStatsProps {
  credits: number;
  upcomingLessons: number;
  totalSpent: number;
}

export function ParentStats({
  credits,
  upcomingLessons,
  totalSpent,
}: ParentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Wallet Credits"
        value={credits}
        description="Available credits"
        icon={Wallet}
      />
      <StatsCard
        title="Upcoming Lessons"
        value={upcomingLessons}
        description="Scheduled bookings"
        icon={Calendar}
      />
      <StatsCard
        title="Total Spent"
        value={`HKD ${totalSpent.toLocaleString()}`}
        description="This month"
        icon={DollarSign}
      />
    </div>
  );
}

