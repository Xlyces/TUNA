import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "./useAuth";
import axios from "axios";

export interface Booking {
  id: string;
  parentId: string;
  tutorId: string;
  tutorTokenId?: number;
  subject: string;
  duration: number;
  fee: number;
  originalFee?: number;
  creditsUsed?: number;
  scheduledAt: Date;
  studentName: string;
  studentGrade?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentIntentId?: string;
  paymentHash?: string;
  rating?: number;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

async function fetchBookings(userId: string, role: string): Promise<Booking[]> {
  const bookingsRef = collection(db, "bookings");
  const field = role === "parent" ? "parentId" : "tutorId";
  const q = query(bookingsRef, where(field, "==", userId));
  const querySnapshot = await getDocs(q);

  const bookings: Booking[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    bookings.push({
      id: doc.id,
      ...data,
      scheduledAt: data.scheduledAt?.toDate() || new Date(data.scheduledAt),
      createdAt: data.createdAt?.toDate() || new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate() || new Date(data.updatedAt),
    } as Booking);
  });

  return bookings.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
}

export function useBookings() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings", user?.uid, userProfile?.role],
    queryFn: () => fetchBookings(user?.uid || "", userProfile?.role || ""),
    enabled: !!user?.uid && !!userProfile?.role,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: Partial<Booking> }) => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.patch(
        `${API_BASE_URL}/bookings/${bookingId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return {
    bookings,
    isLoading,
    error,
    updateBooking: updateBookingMutation.mutate,
    isUpdating: updateBookingMutation.isPending,
  };
}

