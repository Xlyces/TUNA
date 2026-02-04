import axios from "axios";

export interface CreateBookingRequest {
  tutorId: string;
  tutorTokenId?: number;
  subject: string;
  duration: number;
  fee: number;
  scheduledAt: string;
  studentName: string;
  studentGrade?: string;
  creditsUsed?: number;
}

export interface BookingResponse {
  bookingId: string;
  paymentIntentId?: string | null;
  clientSecret?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function createBooking(
  data: CreateBookingRequest,
  authToken: string
): Promise<BookingResponse> {
  const response = await axios.post(`${API_BASE_URL}/bookings`, data, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}

export async function getBooking(
  bookingId: string,
  authToken: string
): Promise<any> {
  const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data;
}

