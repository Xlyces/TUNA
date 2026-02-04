"use client";

import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import { Calendar, Clock, User, MoreVertical, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Booking, EnhancedBooking } from "@/lib/types/booking";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  booking: Booking | EnhancedBooking;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function BookingCard({
  booking,
  onCancel,
  onReschedule,
  showActions = true,
  compact = false,
}: BookingCardProps) {
  const isRecurring = "isRecurring" in booking && booking.isRecurring;

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{booking.tutorName}</h4>
              {isRecurring && (
                <Repeat className="h-3 w-3 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{booking.subject}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{format(booking.scheduledAt, "h:mm a")}</span>
            </div>
          </div>
          <StatusBadge status={booking.status as any} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{booking.tutorName}</h3>
              {isRecurring && (
                <Repeat className="h-4 w-4 text-primary" title="Recurring booking" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{booking.subject}</p>
          </div>
          <StatusBadge status={booking.status as any} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(booking.scheduledAt, "EEEE, MMMM d, yyyy")}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{format(booking.scheduledAt, "h:mm a")} ({booking.duration} min)</span>
        </div>
        {booking.studentName && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{booking.studentName}</span>
          </div>
        )}
        <div className="pt-2 border-t">
          <p className="text-sm font-medium">HKD {booking.fee.toFixed(2)}</p>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to={`/bookings/${booking.id}`}>View Details</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {booking.status === "confirmed" && onReschedule && (
                <DropdownMenuItem onClick={() => onReschedule(booking.id)}>
                  Reschedule
                </DropdownMenuItem>
              )}
              {booking.status !== "cancelled" && booking.status !== "completed" && onCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(booking.id)}
                  className="text-destructive"
                >
                  Cancel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      )}
    </Card>
  );
}

