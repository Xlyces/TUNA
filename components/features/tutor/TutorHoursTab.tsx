"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";

interface TutorHoursTabProps {
  tutor: Tutor;
}

export function TutorHoursTab({ tutor }: TutorHoursTabProps) {
  const totalHours = tutor.totalHours || 0;
  const lessonCount = tutor.lessonCount || 0;
  const averageHoursPerLesson = lessonCount > 0 ? (totalHours / lessonCount).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[hsl(var(--sky))]/10 to-[hsl(var(--cyan))]/5 border-[hsl(var(--sky))]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Total Hours
              </CardTitle>
              <Clock className="h-5 w-5 text-[hsl(var(--sky))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {totalHours}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Hours of teaching experience
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[hsl(var(--cyan))]/10 to-[hsl(var(--aqua))]/5 border-[hsl(var(--cyan))]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Total Lessons
              </CardTitle>
              <Calendar className="h-5 w-5 text-[hsl(var(--cyan))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {lessonCount}
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Lessons completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[hsl(var(--aqua))]/10 to-[hsl(var(--teal))]/5 border-[hsl(var(--aqua))]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                Avg. Per Lesson
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-[hsl(var(--aqua))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--foreground))]">
              {averageHoursPerLesson}h
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Average lesson duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Availability Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[hsl(var(--sky))]" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[hsl(var(--muted-foreground))]">
            This tutor has completed {lessonCount} lesson{lessonCount !== 1 ? "s" : ""} with a total of {totalHours} hour{totalHours !== 1 ? "s" : ""} of teaching experience.
            {averageHoursPerLesson !== 0 && (
              <> On average, each lesson lasts approximately {averageHoursPerLesson} hour{averageHoursPerLesson !== "1.0" ? "s" : ""}.</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

