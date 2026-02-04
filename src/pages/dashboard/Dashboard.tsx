import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChange, getUserProfile, UserProfile } from "@/lib/firebase/auth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          // Redirect based on role
          if (profile.role === "tutor") {
            navigate("/dashboard/tutor");
          } else if (profile.role === "parent") {
            navigate("/dashboard/parent");
          } else if (profile.role === "admin") {
            navigate("/admin/dashboard");
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

