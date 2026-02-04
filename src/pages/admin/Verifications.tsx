import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";

interface Verification {
  id: string;
  tutorId: string;
  tutorName?: string;
  examType: "DSE" | "IB";
  status: "pending" | "approved" | "rejected";
  pdfUrl: string;
  selfieUrl: string;
  ipfsHash?: string;
  ocrScores?: Record<string, string>;
  submittedAt: Date;
  tutorWalletAddress?: string;
}

export default function AdminVerificationsPage() {
  const navigate = useNavigate();
  const userProfile = useUserProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) {
      navigate("/login");
      return;
    }

    if (userProfile.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchVerifications();
  }, [userProfile, navigate]);

  const fetchVerifications = async () => {
    try {
      const verificationsRef = collection(db, "verifications");
      const q = query(verificationsRef, orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);

      const verificationsList: Verification[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Get tutor name
        let tutorName = "Unknown";
        try {
          const tutorDoc = await getDoc(doc(db, "users", data.tutorId));
          if (tutorDoc.exists()) {
            tutorName = tutorDoc.data().name || "Unknown";
          }
        } catch (error) {
          console.error("Error fetching tutor name:", error);
        }

        verificationsList.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(data.submittedAt),
        } as Verification);
      }

      setVerifications(verificationsList);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string, tutorWalletAddress: string) => {
    if (!tutorWalletAddress) {
      toast({
        title: "Error",
        description: "Tutor wallet address is required",
        variant: "destructive",
      });
      return;
    }

    setProcessing(verificationId);
    try {
      const token = await user?.getIdToken();
      const response = await axios.post(
        "/api/verify/approve",
        {
          verificationId,
          action: "approve",
          tutorWalletAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Verification approved and SBT minted",
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve verification",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (verificationId: string, reason?: string) => {
    if (!user) return;

    setProcessing(verificationId);
    try {
      const token = await user.getIdToken();
      await axios.post(
        "/api/verify/approve",
        {
          verificationId,
          action: "reject",
          rejectionReason: reason || "Verification rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Verification rejected",
      });

      fetchVerifications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject verification",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return null;
  }

  const pendingVerifications = verifications.filter((v) => v.status === "pending");
  const processedVerifications = verifications.filter((v) => v.status !== "pending");

  return (
    <>
      <PageHeader
        title="Verification Queue"
        description="Review and approve tutor verifications"
      />

      <div className="mt-8 space-y-8">
        {/* Pending Verifications */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Pending ({pendingVerifications.length})
          </h2>
          {pendingVerifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending verifications
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingVerifications.map((verification) => (
                <Card key={verification.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{verification.tutorName || "Tutor"}</CardTitle>
                        <CardDescription>
                          Submitted {format(verification.submittedAt, "PPp")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge>{verification.examType}</Badge>
                        <StatusBadge status={verification.status} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {verification.ocrScores && (
                      <div>
                        <p className="text-sm font-medium mb-2">OCR Extracted Scores:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(verification.ocrScores).map(([subject, score]) => (
                            <Badge key={subject} variant="outline">
                              {subject}: {score}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          const walletAddress = prompt("Enter tutor wallet address:");
                          if (walletAddress) {
                            handleApprove(verification.id, walletAddress);
                          }
                        }}
                        disabled={processing === verification.id}
                      >
                        {processing === verification.id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(verification.id)}
                        disabled={processing === verification.id}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(verification.pdfUrl, "_blank")}
                      >
                        View Certificate
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(verification.selfieUrl, "_blank")}
                      >
                        View Selfie
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Processed Verifications */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Processed ({processedVerifications.length})
          </h2>
          {processedVerifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No processed verifications
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {processedVerifications.map((verification) => (
                <Card key={verification.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{verification.tutorName || "Tutor"}</CardTitle>
                        <CardDescription>
                          {format(verification.submittedAt, "PPp")}
                        </CardDescription>
                      </div>
                      <StatusBadge status={verification.status} />
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

