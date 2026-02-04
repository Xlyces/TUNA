import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/components/layouts/DashboardLayout";
import { db } from "@/lib/firebase/config";
import { collection, query, getDocs, where } from "firebase/firestore";
import { StatsCard } from "@/components/cards/StatsCard";

interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalParents: number;
  verifiedTutors: number;
  totalBookings: number;
  totalGMV: number;
  pendingVerifications: number;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const userProfile = useUserProfile();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) {
      navigate("/login");
      return;
    }

    if (userProfile.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchStats();
  }, [userProfile, navigate]);

  const fetchStats = async () => {
    try {
      // Get user counts
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let totalTutors = 0;
      let totalParents = 0;
      let verifiedTutors = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        totalUsers++;
        if (data.role === "tutor") {
          totalTutors++;
          if (data.tutorTokenId) {
            verifiedTutors++;
          }
        } else if (data.role === "parent") {
          totalParents++;
        }
      });

      // Get booking stats
      const bookingsRef = collection(db, "bookings");
      const bookingsSnapshot = await getDocs(bookingsRef);
      
      let totalBookings = 0;
      let totalGMV = 0;

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalBookings++;
        if (data.status === "completed" || data.status === "confirmed") {
          totalGMV += data.fee || 0;
        }
      });

      // Get pending verifications
      const verificationsRef = collection(db, "verifications");
      const verificationsQuery = query(verificationsRef, where("status", "==", "pending"));
      const verificationsSnapshot = await getDocs(verificationsQuery);
      const pendingVerifications = verificationsSnapshot.size;

      setStats({
        totalUsers,
        totalTutors,
        totalParents,
        verifiedTutors,
        totalBookings,
        totalGMV,
        pendingVerifications,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and statistics"
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
        />
        <StatsCard
          title="Tutors"
          value={stats.totalTutors}
          description={`${stats.verifiedTutors} verified`}
        />
        <StatsCard
          title="Parents"
          value={stats.totalParents}
          description="Registered parents"
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          description="All time bookings"
        />
        <StatsCard
          title="GMV"
          value={`HKD ${stats.totalGMV.toLocaleString()}`}
          description="Gross Merchandise Value"
        />
        <StatsCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          description="Awaiting review"
        />
      </div>
    </>
  );
}

