import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChange, getUserProfile, UserProfile } from "@/lib/firebase/auth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const UserProfileContext = createContext<UserProfile | null>(null);

export const useUserProfile = () => useContext(UserProfileContext);

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <UserProfileContext.Provider value={userProfile}>
      <div className="p-8">{children}</div>
    </UserProfileContext.Provider>
  );
}

