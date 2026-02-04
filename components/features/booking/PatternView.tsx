"use client";

import { BookingPattern } from "@/lib/types/booking";
import { PatternCard } from "./PatternCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Repeat, Plus } from "lucide-react";

interface PatternViewProps {
  patterns: BookingPattern[];
  onBookNext?: (pattern: BookingPattern, weeks: number) => void;
  onManageSeries?: (pattern: BookingPattern) => void;
  onCreateRecurring?: () => void;
}

export function PatternView({
  patterns,
  onBookNext,
  onManageSeries,
  onCreateRecurring,
}: PatternViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recurring Schedules</h3>
        {onCreateRecurring && (
          <Button onClick={onCreateRecurring}>
            <Plus className="h-4 w-4 mr-2" />
            Create Recurring Booking
          </Button>
        )}
      </div>

      {patterns.length === 0 ? (
        <Card className="p-8 text-center">
          <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <EmptyState
            title="No recurring patterns detected"
            description="Book lessons at the same time to create patterns. We'll automatically detect when you have 3+ lessons at the same time."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              onBookNext={onBookNext}
              onManageSeries={onManageSeries}
            />
          ))}
        </div>
      )}
    </div>
  );
}

