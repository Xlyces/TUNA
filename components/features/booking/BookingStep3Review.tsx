"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, User, DollarSign } from "lucide-react";

interface BookingStep3ReviewProps {
  tutorName: string;
  scheduledAt: Date;
  studentName: string;
  studentGrade?: string;
  subject: string;
  duration: number;
  fee: number;
  creditsUsed?: number;
}

export const BookingStep3Review = memo(function BookingStep3Review({
  tutorName,
  scheduledAt,
  studentName,
  studentGrade,
  subject,
  duration,
  fee,
  creditsUsed = 0,
}: BookingStep3ReviewProps) {
  const { creditsDiscount, total, formattedDate } = useMemo(() => {
    const discount = creditsUsed * 10; // 10 HKD per credit
    const totalAmount = fee - discount;
    const formatted = format(scheduledAt, "EEEE, MMMM d, yyyy 'at' h:mm a");
    return {
      creditsDiscount: discount,
      total: totalAmount,
      formattedDate: formatted,
    };
  }, [creditsUsed, fee, scheduledAt]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Booking Details</CardTitle>
        <CardDescription>Please review your booking before proceeding to payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Tutor</h3>
            <p className="text-muted-foreground">{tutorName}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date & Time
            </h3>
            <p className="text-muted-foreground">
              {formattedDate}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Student Information
            </h3>
            <div className="space-y-1 text-muted-foreground">
              <p>Name: {studentName}</p>
              {studentGrade && <p>Grade: {studentGrade}</p>}
              <div className="flex items-center gap-2">
                <span>Subject:</span>
                <Badge variant="outline">{subject}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Lesson Details
            </h3>
            <p className="text-muted-foreground">Duration: {duration} minutes</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lesson Fee</span>
                <span>HKD {fee.toFixed(2)}</span>
              </div>
              {creditsUsed > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Credits Applied ({creditsUsed} credits)</span>
                  <span>-HKD {creditsDiscount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>HKD {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

