import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/components/layouts/DashboardLayout";
import { TutorVerificationBanner } from "@/components/features/tutor/TutorVerificationBanner";
import { TutorStats } from "@/components/features/tutor/TutorStats";
import { TutorEarnings } from "@/components/features/tutor/TutorEarnings";
import { TutorUpcomingLessons } from "@/components/features/tutor/TutorUpcomingLessons";
import { SBTDisplay } from "@/components/features/tutor/SBTDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Tutor } from "@/hooks/useTutors";

interface Booking {
  id: string;
  tutorName: string;
  tutorId: string;
  scheduledAt: Date;
  subject: string;
  duration: number;
  fee: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  studentName?: string;
}

async function fetchBookings(tutorId: string): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("tutorId", "==", tutorId));
  const querySnapshot = await getDocs(q);
  
  const bookings: Booking[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    bookings.push({
      id: doc.id,
      ...data,
      scheduledAt: data.scheduledAt?.toDate() || new Date(),
    } as Booking);
  });
  
  return bookings;
}

export default function TutorDashboard() {
  const userProfile = useUserProfile();

  const { data: bookings = [] } = useQuery({
    queryKey: ["tutor-bookings", userProfile?.uid],
    queryFn: () => fetchBookings(userProfile?.uid || ""),
    enabled: !!userProfile?.uid && userProfile?.role === "tutor",
  });

  // Create a tutor object for stats display
  const tutorData: Tutor = {
    id: userProfile?.uid || "",
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    tutorTokenId: userProfile?.tutorTokenId,
    subjects: userProfile?.subjects,
    hourlyRate: userProfile?.hourlyRate,
    totalHours: 0, // Would come from on-chain data
    averageRating: 0, // Would come from on-chain data
    lessonCount: bookings.filter((b) => b.status === "completed").length,
  };

  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.fee * 0.8, 0); // 80% to tutor

  return (
    <>
      <PageHeader
        title="Tutor Dashboard"
        description="Manage your profile and bookings"
        actions={
          !userProfile?.tutorTokenId ? (
            <Button asChild>
              <Link to="/tutor/verify">Verify Credentials</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/tutor/profile">Edit Profile</Link>
            </Button>
          )
        }
      />

      <div className="mt-8 space-y-8">
        <TutorVerificationBanner userProfile={userProfile} />

        {userProfile?.tutorTokenId && (
          <SBTDisplay tokenId={userProfile.tutorTokenId} />
        )}

        <TutorStats tutor={tutorData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TutorUpcomingLessons bookings={bookings} />
          <TutorEarnings
            earnings={bookings
              .filter((b) => b.status === "completed")
              .map((b) => ({
                id: b.id,
                date: b.scheduledAt,
                amount: b.fee * 0.8,
                lessonId: b.id,
                studentName: b.studentName,
              }))}
            totalEarnings={totalEarnings}
          />
        </div>
      </div>
    </>
  );
}

