import { GraphQLClient } from "graphql-request";

const GRAPH_URL = import.meta.env.VITE_GRAPH_URL || process.env.NEXT_PUBLIC_GRAPH_URL;

if (!GRAPH_URL) {
  throw new Error("VITE_GRAPH_URL or NEXT_PUBLIC_GRAPH_URL is not set");
}

const client = new GraphQLClient(GRAPH_URL);

export interface TutorStats {
  id: string;
  totalHours: string;
  totalEarnings: string;
  averageRating: string;
  lessonCount: string;
  lessons: Array<{
    id: string;
    timestamp: string;
    durationMins: number;
    feeHkd: string;
    subjectId: number;
    rating: number;
  }>;
}

/**
 * Get tutor statistics from The Graph
 * @param tutorId The SBT token ID
 * @returns Tutor statistics
 */
export async function getTutorStats(tutorId: string): Promise<TutorStats | null> {
  const query = `
    query GetTutorStats($id: ID!) {
      tutor(id: $id) {
        id
        totalHours
        totalEarnings
        averageRating
        lessonCount
        lessons(first: 100, orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          durationMins
          feeHkd
          subjectId
          rating
        }
      }
    }
  `;

  try {
    const data = await client.request<{ tutor: TutorStats | null }>(query, {
      id: tutorId,
    });
    return data.tutor;
  } catch (error) {
    console.error("Error fetching tutor stats:", error);
    return null;
  }
}

/**
 * Get multiple tutors' statistics
 * @param tutorIds Array of SBT token IDs
 * @returns Array of tutor statistics
 */
export async function getMultipleTutorStats(
  tutorIds: string[]
): Promise<TutorStats[]> {
  const query = `
    query GetMultipleTutorStats($ids: [ID!]!) {
      tutors(where: { id_in: $ids }) {
        id
        totalHours
        totalEarnings
        averageRating
        lessonCount
        lessons(first: 10, orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          durationMins
          feeHkd
          subjectId
          rating
        }
      }
    }
  `;

  try {
    const data = await client.request<{ tutors: TutorStats[] }>(query, {
      ids: tutorIds,
    });
    return data.tutors;
  } catch (error) {
    console.error("Error fetching multiple tutor stats:", error);
    return [];
  }
}

