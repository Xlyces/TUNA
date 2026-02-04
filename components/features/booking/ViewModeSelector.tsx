"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Grid3x3, List, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ViewMode = "calendar" | "week" | "list" | "patterns";

interface ViewModeSelectorProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
  patternCount?: number;
}

export function ViewModeSelector({
  value,
  onValueChange,
  patternCount = 0,
}: ViewModeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ViewMode)}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Calendar</span>
        </TabsTrigger>
        <TabsTrigger value="week" className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4" />
          <span className="hidden sm:inline">Week</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">List</span>
        </TabsTrigger>
        <TabsTrigger value="patterns" className="flex items-center gap-2 relative">
          <Repeat className="h-4 w-4" />
          <span className="hidden sm:inline">Patterns</span>
          {patternCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {patternCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

