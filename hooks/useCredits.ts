import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import axios from "axios";

export interface CreditTransaction {
  id: string;
  userId: string;
  type: "earn" | "redeem";
  amount: number;
  reason: string;
  balance: number;
  createdAt: Date;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchCredits(userId: string, token: string) {
  const response = await axios.get(`${API_BASE_URL}/credits`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export function useCredits() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["credits", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      return fetchCredits(user.uid, token);
    },
    enabled: !!user,
  });

  const earnCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/credits`,
        {
          action: "earn",
          amount,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const redeemCreditsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/credits`,
        {
          action: "redeem",
          amount,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  return {
    balance: data?.balance || userProfile?.walletCredits || 0,
    transactions: data?.transactions || [],
    isLoading,
    error,
    earnCredits: earnCreditsMutation.mutate,
    redeemCredits: redeemCreditsMutation.mutate,
    isEarning: earnCreditsMutation.isPending,
    isRedeeming: redeemCreditsMutation.isPending,
  };
}

