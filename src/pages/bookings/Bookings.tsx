import { useEffect, useState, useMemo } from "react";
// #region agent log
fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Bookings.tsx:1',message:'Bookings page module loading',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/components/layouts/DashboardLayout";
// #region agent log
fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Bookings.tsx:6',message:'Before component imports',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
// #endregion
import { BookingCard } from "@/components/features/booking/BookingCard";
import { CalendarView } from "@/components/features/booking/CalendarView";
import { WeekView } from "@/components/features/booking/WeekView";
import { PatternView } from "@/components/features/booking/PatternView";
import { ViewModeSelector, ViewMode } from "@/components/features/booking/ViewModeSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Booking } from "@/lib/types/booking";
import { detectPatterns, enhanceBookingsWithPatterns } from "@/lib/utils/booking-patterns";
import { Repeat } from "lucide-react";

async function fetchBookings(userId: string, role: string): Promise<Booking[]> {
  if (!userId || !role) {
    console.warn("⚠️ fetchBookings called without userId or role:", { userId, role });
    return [];
  }

  const bookingsRef = collection(db, "bookings");
  const field = role === "parent" ? "parentId" : "tutorId";
  const q = query(bookingsRef, where(field, "==", userId));
  
  console.log("🔍 Fetching bookings:", { userId, role, field, query: `where(${field}, ==, ${userId})` });
  
  let querySnapshot;
  try {
    querySnapshot = await getDocs(q);
  } catch (error: any) {
    console.error("❌ Error fetching bookings from Firestore:", error);
    
    // Handle offline error specifically
    if (error.message?.includes("offline") || error.code === "unavailable" || error.code === "failed-precondition") {
      console.warn("⚠️ Firestore appears to be offline. Checking emulator connection...");
      // Check if we're in development and should be using emulator
      if (import.meta.env.MODE === 'development') {
        console.log("💡 Make sure Firebase emulators are running: npm run emulators");
        throw new Error("Firestore is offline. Please check your connection and ensure Firebase emulators are running if in development mode.");
      } else {
        throw new Error("Firestore is offline. Please check your internet connection.");
      }
    }
    
    // Re-throw other errors
    throw error;
  }
  
  console.log("📊 Query results:", { 
    totalDocs: querySnapshot.size,
    docs: querySnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }))
  });
  
  const bookings: Booking[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const booking = {
      id: doc.id,
      tutorName: data.tutorName || "Tutor",
      ...data,
      scheduledAt: data.scheduledAt?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Booking;
    bookings.push(booking);
    console.log("✅ Added booking:", { id: booking.id, status: booking.status, tutorName: booking.tutorName });
  });
  
  const sorted = bookings.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  console.log("📋 Returning bookings:", sorted.length, "bookings");
  return sorted;
}

export default function BookingsPage() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Bookings.tsx:94',message:'BookingsPage component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const userProfile = useUserProfile();
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Bookings.tsx:98',message:'After useUserProfile',data:{hasUserProfile:!!userProfile,userId:userProfile?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings", userProfile?.uid, userProfile?.role],
    queryFn: () => fetchBookings(userProfile?.uid || "", userProfile?.role || ""),
    enabled: !!userProfile?.uid,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Refresh query when component mounts or user changes
  useEffect(() => {
    if (userProfile?.uid) {
      queryClient.invalidateQueries({ queryKey: ["bookings", userProfile.uid, userProfile.role] });
    }
  }, [userProfile?.uid, userProfile?.role, queryClient]);

  // Pattern detection (memoized for performance)
  const patterns = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d0f9d9f1-6e4f-4156-b431-e47d122c4d10',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Bookings.tsx:123',message:'Detecting patterns',data:{bookingsCount:bookings.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return detectPatterns(bookings);
  }, [bookings]);

  // Enhance bookings with pattern info
  const enhancedBookings = useMemo(() => {
    return enhanceBookingsWithPatterns(bookings, patterns);
  }, [bookings, patterns]);

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("📋 Bookings query debug:", { 
      userId: userProfile?.uid, 
      role: userProfile?.role, 
      bookingsCount: bookings.length,
      patternsCount: patterns.length,
      bookings: bookings.map(b => ({
        id: b.id,
        status: b.status,
        tutorName: b.tutorName,
        scheduledAt: b.scheduledAt,
        parentId: (b as any).parentId,
        tutorId: (b as any).tutorId,
      })),
      isLoading,
      error: error ? String(error) : null,
    });
  }

  // Show loading state
  if (isLoading) {
    return (
      <>
        <PageHeader title="My Bookings" description="Manage your lesson bookings" />
        <div className="mt-8">
          <LoadingSpinner text="Loading bookings..." />
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <PageHeader title="My Bookings" description="Manage your lesson bookings" />
        <div className="mt-8">
          <EmptyState
            title="Error loading bookings"
            description={error instanceof Error ? error.message : "Failed to load bookings"}
          />
        </div>
      </>
    );
  }

  // Filter bookings by status for list view
  const upcomingBookings = enhancedBookings.filter(
    (b) => 
      b.status === "confirmed" || 
      b.status === "pending" || 
      b.status === "payment_held" || 
      b.status === "awaiting_confirmation"
  );
  const pastBookings = enhancedBookings.filter(
    (b) => b.status === "completed"
  );
  const cancelledBookings = enhancedBookings.filter(
    (b) => b.status === "cancelled"
  );

  const handleBookingClick = (booking: Booking) => {
    // Navigate to booking details
    navigate(`/bookings/${booking.id}`);
  };

  const handleBookNext = (pattern: any, weeks: number) => {
    // TODO: Implement booking next N weeks
    console.log("Book next", weeks, "weeks for pattern", pattern.id);
  };

  const handleManageSeries = (pattern: any) => {
    // TODO: Implement pattern management dialog
    console.log("Manage series for pattern", pattern.id);
  };

  return (
    <>
      <PageHeader
        title="My Bookings"
        description="Manage your lesson bookings"
        actions={
          userProfile?.role === "parent" && (
            <Button asChild>
              <Link to="/search">Find Tutors</Link>
            </Button>
          )
        }
      />

      <div className="mt-8 space-y-6">
        {/* View Mode Selector */}
        <ViewModeSelector
          value={viewMode}
          onValueChange={setViewMode}
          patternCount={patterns.length}
        />

        {/* Pattern Sidebar Banner */}
        {patterns.length > 0 && viewMode !== "patterns" && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary" />
                <span className="font-medium">Recurring Patterns Detected</span>
              </div>
              <Badge>{patterns.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              You have {patterns.length} recurring lesson schedule{patterns.length > 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm" onClick={() => setViewMode("patterns")}>
              View Patterns
            </Button>
          </Card>
        )}

        {/* View Content */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsContent value="calendar" className="mt-0">
            <CalendarView
              bookings={enhancedBookings}
              patterns={patterns}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onBookingClick={handleBookingClick}
            />
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <WeekView
              bookings={enhancedBookings}
              selectedDate={selectedDate}
              onBookingClick={handleBookingClick}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastBookings.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-6">
                {upcomingBookings.length === 0 ? (
                  <EmptyState
                    title="No upcoming bookings"
                    description="You don't have any scheduled lessons."
                    action={
                      userProfile?.role === "parent"
                        ? {
                            label: "Find a Tutor",
                            href: "/search",
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                {pastBookings.length === 0 ? (
                  <EmptyState title="No past bookings" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} showActions={false} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="mt-6">
                {cancelledBookings.length === 0 ? (
                  <EmptyState title="No cancelled bookings" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cancelledBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} showActions={false} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="patterns" className="mt-0">
            <PatternView
              patterns={patterns}
              onBookNext={handleBookNext}
              onManageSeries={handleManageSeries}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
