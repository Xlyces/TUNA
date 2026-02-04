"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Shield, Award, ExternalLink } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";
import { Button } from "@/components/ui/button";

interface TutorCredentialsTabProps {
  tutor: Tutor;
}

export function TutorCredentialsTab({ tutor }: TutorCredentialsTabProps) {
  // Helper to get env vars
  const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    return undefined;
  };
  
  const contractAddress = getEnv('VITE_CONTRACT_ADDRESS') || getEnv('NEXT_PUBLIC_CONTRACT_ADDRESS');
  const etherscanUrl = tutor.tutorTokenId && contractAddress
    ? `https://mumbai.polygonscan.com/token/${contractAddress}?a=${tutor.tutorTokenId}`
    : null;

  return (
    <div className="space-y-6">
      {/* Verification Badge */}
      {tutor.tutorTokenId && (
        <Card className="bg-gradient-to-br from-[hsl(var(--sky))]/10 to-[hsl(var(--cyan))]/5 border-[hsl(var(--sky))]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[hsl(var(--sky))]/20">
                  <Shield className="h-6 w-6 text-[hsl(var(--sky))]" />
                </div>
                <div>
                  <CardTitle className="text-lg">Verified Tutor</CardTitle>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    Blockchain verified credentials
                  </p>
                </div>
              </div>
              <Badge variant="cyan" className="text-sm">
                Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Verification Badge ID</p>
                  <p className="font-mono text-sm font-semibold text-[hsl(var(--foreground))]">
                    #{tutor.tutorTokenId}
                  </p>
                </div>
                {etherscanUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View on Blockchain
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                This tutor has been verified and their reputation is recorded on the blockchain.
                The Verification Badge is non-transferable and serves as a portable reputation record.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[hsl(var(--cyan))]" />
            <CardTitle>Education</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutor.university && (
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">University</p>
              <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                {tutor.university}
              </p>
            </div>
          )}
          {tutor.examType && (
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Exam Type</p>
              <Badge variant="sky" className="text-sm">
                {tutor.examType}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[hsl(var(--teal))]" />
            <CardTitle>Verification Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Admin Verification</span>
              <Badge variant="cyan">Verified</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Credentials Check</span>
              <Badge variant="cyan">Verified</Badge>
            </div>
            {tutor.tutorTokenId && (
              <div className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Blockchain Record</span>
                <Badge variant="cyan">Verified</Badge>
              </div>
            )}
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-4">
            This tutor has been verified by our admin team. Their credentials have been checked
            and their Verification Badge has been minted on-chain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

