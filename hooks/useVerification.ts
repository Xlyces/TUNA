"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import axios from "axios";

export interface VerificationStatus {
  status: "not_submitted" | "pending" | "approved" | "rejected";
  verificationId?: string;
  tutorTokenId?: number;
}

async function fetchVerificationStatus(userId: string, token: string): Promise<VerificationStatus> {
  const response = await axios.get("/api/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export function useVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["verification", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      return fetchVerificationStatus(user.uid, token);
    },
    enabled: !!user,
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      const response = await axios.post("/api/verify", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  return {
    status: data?.status || "not_submitted",
    verificationId: data?.verificationId,
    tutorTokenId: data?.tutorTokenId,
    isLoading,
    error,
    submitVerification: submitVerificationMutation.mutate,
    isSubmitting: submitVerificationMutation.isPending,
  };
}

