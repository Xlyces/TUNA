"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/features/rating/StarRating";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface RatingFormProps {
  onSubmit: (rating: number, feedback?: string) => Promise<void>;
  tutorName?: string;
}

export function RatingForm({ onSubmit, tutorName }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      await onSubmit(rating, feedback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Lesson</CardTitle>
        <CardDescription>
          {tutorName && `How was your lesson with ${tutorName}?`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <StarRating value={rating} onChange={setRating} />
            {rating === 0 && (
              <p className="text-sm text-muted-foreground">
                Please select a rating
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={rating === 0 || loading}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              "Submit Rating"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

