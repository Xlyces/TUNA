"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  parentName: string;
  date: Date;
}

import { Tutor } from "@/hooks/useTutors";

interface TutorReviewsProps {
  tutor?: Tutor;
  reviews?: Review[];
}

export function TutorReviews({ tutor, reviews = [] }: TutorReviewsProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No reviews yet"
            description="This tutor hasn't received any reviews yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[hsl(var(--foreground))]">Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-[hsl(var(--border))] last:border-0 pb-4 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">{review.parentName}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {review.date.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[hsl(var(--muted-foreground))]"
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{review.comment}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

