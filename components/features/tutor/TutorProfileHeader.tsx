"use client";

import { AvatarWithBadge } from "@/components/shared/AvatarWithBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Clock, Star, DollarSign, BookOpen } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";

interface TutorProfileHeaderProps {
  tutor: Tutor;
}

export function TutorProfileHeader({
  tutor,
}: TutorProfileHeaderProps) {
  // Helper to get env vars (supports both Vite and Next.js)
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

  const totalHours = tutor.totalHours || 0;
  const rating = tutor.averageRating;
  const hourlyRate = tutor.hourlyRate || 0;
  const lessonCount = tutor.lessonCount || 0;

  return (
    <Card className="bg-gradient-to-br from-[hsl(var(--sky))]/5 to-[hsl(var(--cyan))]/5 border-[hsl(var(--sky))]/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <AvatarWithBadge
              src={tutor.email}
              fallback={tutor.name?.charAt(0) || "T"}
              verified={!!tutor.tutorTokenId}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">{tutor.name}</h1>
                {tutor.tutorTokenId && (
                  <Badge variant="cyan" className="text-xs">
                    Verified
                  </Badge>
                )}
                {tutor.examType && (
                  <Badge variant="outline">{tutor.examType}</Badge>
                )}
              </div>
              {tutor.university && (
                <p className="text-[hsl(var(--muted-foreground))] text-lg mb-3">{tutor.university}</p>
              )}
              {tutor.tutorTokenId && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    Verification Badge #{tutor.tutorTokenId}
                  </Badge>
                  {etherscanUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-7 px-2 text-xs"
                    >
                      <a
                        href={etherscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        View on Blockchain
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--sky))]/20">
                <Clock className="h-5 w-5 text-[hsl(var(--sky))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalHours}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--cyan))]/20">
                <Star className="h-5 w-5 text-[hsl(var(--cyan))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {rating ? rating.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--aqua))]/20">
                <DollarSign className="h-5 w-5 text-[hsl(var(--aqua))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">HKD {hourlyRate}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Per hour</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--teal))]/20">
                <BookOpen className="h-5 w-5 text-[hsl(var(--teal))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{lessonCount}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Lessons</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

