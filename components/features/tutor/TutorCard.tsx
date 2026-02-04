"use client";

import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, DollarSign } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";
import { AvatarWithBadge } from "@/components/shared/AvatarWithBadge";

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const rating = tutor.averageRating || 0;
  const hours = tutor.totalHours || 0;
  const rate = tutor.hourlyRate || 0;

  return (
    <Link to={`/tutors/${tutor.id}`}>
      <Card className="hover:shadow-xl bg-[hsl(var(--card))] border-[hsl(var(--sky))]/30 hover:border-[hsl(var(--cyan))]/60 transition-all duration-300 cursor-pointer h-full relative overflow-hidden group hover:scale-[1.02]">
        {/* Subtle wave pattern at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--sky))] via-[hsl(var(--cyan))] to-[hsl(var(--aqua))] opacity-40" />
        
        {/* Shimmer effect for verified tutors */}
        {tutor.tutorTokenId && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <AvatarWithBadge
                src={tutor.email}
                fallback={tutor.name?.charAt(0) || "T"}
                verified={!!tutor.tutorTokenId}
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-lg text-[hsl(var(--foreground))]">{tutor.name}</h3>
                {tutor.university && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {tutor.university}
                  </p>
                )}
                {tutor.examType && (
                  <Badge variant="secondary" className="mt-1">
                    {tutor.examType}
                  </Badge>
                )}
              </div>
            </div>
            {tutor.tutorTokenId && (
              <Badge variant="cyan" className="text-xs relative">
                <span className="relative z-10">Verified Badge</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(var(--web3))] rounded-full animate-pulse opacity-75" />
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {rating > 0 ? rating.toFixed(1) : "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[hsl(var(--muted-foreground))]">
                <Clock className="h-4 w-4" />
                <span>{hours} hours</span>
              </div>
              <div className="flex items-center space-x-1 text-[hsl(var(--muted-foreground))]">
                <DollarSign className="h-4 w-4" />
                <span>HKD {rate}/hr</span>
              </div>
            </div>
            {tutor.subjects && tutor.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.slice(0, 3).map((subject) => (
                  <Badge key={subject} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {tutor.subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tutor.subjects.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            <span className="text-sm font-medium text-[hsl(var(--sky))] group-hover:text-[hsl(var(--cyan))] transition-colors">View Profile</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

