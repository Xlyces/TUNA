import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { PageHeader } from "@/components/layout/PageHeader";
import { ParentStats } from "@/components/features/parent/ParentStats";
import { UpcomingLessons } from "@/components/features/parent/UpcomingLessons";
import { PastLessons } from "@/components/features/parent/PastLessons";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/components/layouts/DashboardLayout";

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

async function fetchBookings(parentId: string): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("parentId", "==", parentId));
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

export default function ParentDashboard() {
  const userProfile = useUserProfile();

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", userProfile?.uid],
    queryFn: () => fetchBookings(userProfile?.uid || ""),
    enabled: !!userProfile?.uid && userProfile?.role === "parent",
  });

  const upcomingCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  ).length;

  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.fee, 0);

  return (
    <>
      <PageHeader
        title="Parent Dashboard"
        description="Manage your bookings and credits"
        actions={
          <Button asChild>
            <Link to="/search">Find Tutors</Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-8">
        <ParentStats
          credits={userProfile?.walletCredits || 0}
          upcomingLessons={upcomingCount}
          totalSpent={totalSpent}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingLessons bookings={bookings} />
          <PastLessons bookings={bookings} />
        </div>
      </div>
    </>
  );
}

