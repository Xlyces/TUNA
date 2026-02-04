"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface TutorFilters {
  examType?: "DSE" | "IB";
  subjects?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minHours?: number;
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  tutorTokenId?: number;
  subjects?: string[];
  hourlyRate?: number;
  university?: string;
  examType?: "DSE" | "IB";
  // On-chain stats (from The Graph)
  totalHours?: number;
  averageRating?: number;
  lessonCount?: number;
}

async function fetchTutors(filters: TutorFilters = {}): Promise<Tutor[]> {
  try {
    console.log("[useTutors] Starting fetchTutors with filters:", filters);
    console.log("[useTutors] DB instance:", db);
    const tutorsRef = collection(db, "users");
    let q = query(tutorsRef, where("role", "==", "tutor"));
    console.log("[useTutors] Query created, executing...");

    if (filters.examType) {
      // Note: This would need to be handled differently in production
      // as Firestore doesn't support querying by nested examType
      // This is a simplified version
    }

    const querySnapshot = await getDocs(q);
    const tutors: Tutor[] = [];

    console.log(`[useTutors] Found ${querySnapshot.size} users with role=tutor`);

    querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`[useTutors] Processing tutor: ${data.name} (${data.email}), role: ${data.role}, tutorTokenId: ${data.tutorTokenId}`);
    
    // Include all tutors (verified and unverified) for development
    // In production, you might want to filter to only verified tutors: if (data.tutorTokenId)
    
    // Apply client-side filtering
    let include = true;

    if (filters.examType && data.examType !== filters.examType) {
      include = false;
    }

    if (filters.subjects && filters.subjects.length > 0) {
      const tutorSubjects = data.subjects || [];
      if (!filters.subjects.some((s) => tutorSubjects.includes(s))) {
        include = false;
      }
    }

    if (filters.minPrice && (data.hourlyRate || 0) < filters.minPrice) {
      include = false;
    }

    if (filters.maxPrice && (data.hourlyRate || 0) > filters.maxPrice) {
      include = false;
    }

    if (include) {
      tutors.push({
        id: doc.id,
        ...data,
      } as Tutor);
      console.log(`[useTutors] Added tutor: ${data.name}`);
    } else {
      console.log(`[useTutors] Filtered out tutor: ${data.name}`);
    }
  });

    console.log(`[useTutors] Returning ${tutors.length} tutors`);
    return tutors;
  } catch (error) {
    console.error("[useTutors] Error fetching tutors:", error);
    throw error;
  }
}

export function useTutors(filters: TutorFilters = {}) {
  return useQuery({
    queryKey: ["tutors", filters],
    queryFn: () => fetchTutors(filters),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0, // Don't cache empty results (React Query v5 uses gcTime instead of cacheTime)
  });
}

