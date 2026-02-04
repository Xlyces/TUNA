import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TutorProfileHeader } from "@/components/features/tutor/TutorProfileHeader";
import { TutorSubjects } from "@/components/features/tutor/TutorSubjects";
import { TutorReviews } from "@/components/features/tutor/TutorReviews";
import { TutorHoursTab } from "@/components/features/tutor/TutorHoursTab";
import { TutorCredentialsTab } from "@/components/features/tutor/TutorCredentialsTab";
import { TutorBookingTab } from "@/components/features/tutor/TutorBookingTab";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, GraduationCap, BookOpen, Star } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";
import { useAuth } from "@/hooks/useAuth";

async function fetchTutor(id: string): Promise<Tutor | null> {
  try {
    console.log("[TutorProfilePage] Fetching tutor with ID:", id);
    const tutorDoc = await getDoc(doc(db, "users", id));
    console.log("[TutorProfilePage] Document exists:", tutorDoc.exists());
    if (!tutorDoc.exists()) {
      console.log("[TutorProfilePage] Document does not exist");
      return null;
    }
    const data = tutorDoc.data();
    console.log("[TutorProfilePage] Tutor data:", { id: tutorDoc.id, role: data.role, name: data.name });
    return { id: tutorDoc.id, ...data } as Tutor;
  } catch (error) {
    console.error("[TutorProfilePage] Error fetching tutor:", error);
    throw error;
  }
}

export default function TutorProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const tutorId = params.id as string;

  const { data: tutor, isLoading } = useQuery({
    queryKey: ["tutor", tutorId],
    queryFn: () => fetchTutor(tutorId),
  });


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner text="Loading tutor profile..." />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Tutor Not Found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={tutor.name || "Tutor Profile"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Search", href: "/search" },
          { label: tutor.name || "Tutor" },
        ]}
      />

      <div className="mt-8 space-y-8">
        {/* Header with Stats */}
        <TutorProfileHeader tutor={tutor} />

        {/* Main Content with Tabs */}
        <div>
          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="hours">
                <Clock className="h-4 w-4 mr-2" />
                Hours
              </TabsTrigger>
              <TabsTrigger value="credentials">
                <GraduationCap className="h-4 w-4 mr-2" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="subjects">
                <BookOpen className="h-4 w-4 mr-2" />
                Subjects
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="booking">
                <Calendar className="h-4 w-4 mr-2" />
                Booking
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hours" className="mt-6">
              <TutorHoursTab tutor={tutor} />
            </TabsContent>
            
            <TabsContent value="credentials" className="mt-6">
              <TutorCredentialsTab tutor={tutor} />
            </TabsContent>
            
            <TabsContent value="subjects" className="mt-6">
              <div className="max-w-4xl">
                <TutorSubjects tutor={tutor} />
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="max-w-4xl">
                <TutorReviews tutor={tutor} />
              </div>
            </TabsContent>
            
            <TabsContent value="booking" className="mt-6">
              <TutorBookingTab tutor={tutor} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

