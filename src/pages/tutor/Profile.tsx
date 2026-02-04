import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/components/layouts/DashboardLayout";
import { ProfileEditForm } from "@/components/features/tutor/ProfileEditForm";
import { useToast } from "@/hooks/useToast";
import { updateUserProfile, UserProfile } from "@/lib/firebase/auth";
import { TutorProfileFormData } from "@/lib/validations/tutor-profile";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export default function TutorProfilePage() {
  const navigate = useNavigate();
  const userProfile = useUserProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!userProfile || userProfile.role !== "tutor") {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (data: TutorProfileFormData) => {
    if (!userProfile) return;

    setLoading(true);
    try {
      let profilePictureUrl = userProfile.profilePicture;

      // Upload profile picture if provided
      if (data.profilePicture) {
        const storageRef = ref(storage, `profiles/${userProfile.uid}/${data.profilePicture.name}`);
        await uploadBytes(storageRef, data.profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      // Update profile
      await updateUserProfile(userProfile.uid, {
        bio: data.bio,
        subjects: data.subjects,
        hourlyRate: data.hourlyRate,
        profilePicture: profilePictureUrl,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      navigate("/dashboard/tutor");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Edit Profile"
        description="Update your tutor profile information"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard/tutor" },
          { label: "Edit Profile" },
        ]}
      />

      <div className="mt-8 max-w-3xl">
        <ProfileEditForm
          initialData={{
            bio: userProfile.bio,
            subjects: userProfile.subjects,
            hourlyRate: userProfile.hourlyRate,
            profilePicture: userProfile.profilePicture,
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}

