"use client";

import { useQuery } from "@tanstack/react-query";
import { getTutorStats, getMultipleTutorStats } from "@/lib/graphql/queries";

export interface TutorReputation {
  totalHours: number;
  totalEarnings: number;
  averageRating: number;
  lessonCount: number;
  lessons: Array<{
    id: string;
    timestamp: number;
    durationMins: number;
    feeHkd: number;
    subjectId: number;
    rating: number;
  }>;
}

/**
 * Hook to fetch tutor reputation data from The Graph
 */
export function useTutorReputation(tutorTokenId?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tutorReputation", tutorTokenId],
    queryFn: async () => {
      if (!tutorTokenId) return null;
      const stats = await getTutorStats(tutorTokenId.toString());
      if (!stats) return null;

      return {
        totalHours: parseFloat(stats.totalHours) || 0,
        totalEarnings: parseFloat(stats.totalEarnings) || 0,
        averageRating: parseFloat(stats.averageRating) || 0,
        lessonCount: parseInt(stats.lessonCount) || 0,
        lessons: stats.lessons.map((lesson) => ({
          id: lesson.id,
          timestamp: parseInt(lesson.timestamp),
          durationMins: lesson.durationMins,
          feeHkd: parseFloat(lesson.feeHkd),
          subjectId: lesson.subjectId,
          rating: lesson.rating,
        })),
      } as TutorReputation;
    },
    enabled: !!tutorTokenId,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    reputation: data || null,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch multiple tutors' reputation data
 */
export function useMultipleTutorReputations(tutorTokenIds: number[]) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["multipleTutorReputations", tutorTokenIds],
    queryFn: async () => {
      if (tutorTokenIds.length === 0) return [];
      const stats = await getMultipleTutorStats(
        tutorTokenIds.map((id) => id.toString())
      );

      return stats.map((stat) => ({
        tutorTokenId: parseInt(stat.id),
        totalHours: parseFloat(stat.totalHours) || 0,
        totalEarnings: parseFloat(stat.totalEarnings) || 0,
        averageRating: parseFloat(stat.averageRating) || 0,
        lessonCount: parseInt(stat.lessonCount) || 0,
        lessons: stat.lessons.map((lesson) => ({
          id: lesson.id,
          timestamp: parseInt(lesson.timestamp),
          durationMins: lesson.durationMins,
          feeHkd: parseFloat(lesson.feeHkd),
          subjectId: lesson.subjectId,
          rating: lesson.rating,
        })),
      }));
    },
    enabled: tutorTokenIds.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    reputations: data || [],
    isLoading,
    error,
  };
}

