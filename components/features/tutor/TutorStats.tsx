"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star, DollarSign, BookOpen } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";
import { cn } from "@/lib/utils";

interface TutorStatsProps {
  tutor: Tutor;
}

export function TutorStats({ tutor }: TutorStatsProps) {
  const totalHours = tutor.totalHours || 0;
  const rating = tutor.averageRating;
  const hourlyRate = tutor.hourlyRate || 0;
  const lessonCount = tutor.lessonCount || 0;

  return (
    <Card className="bg-gradient-to-r from-[hsl(var(--sky))]/5 via-[hsl(var(--cyan))]/5 to-[hsl(var(--aqua))]/5 border-[hsl(var(--sky))]/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--sky))]/20">
              <Clock className="h-5 w-5 text-[hsl(var(--sky))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalHours}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--cyan))]/20">
              <Star className="h-5 w-5 text-[hsl(var(--cyan))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {rating ? rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Rating</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--aqua))]/20">
              <DollarSign className="h-5 w-5 text-[hsl(var(--aqua))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">HKD {hourlyRate}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Per hour</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--teal))]/20">
              <BookOpen className="h-5 w-5 text-[hsl(var(--teal))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{lessonCount}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Lessons</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

