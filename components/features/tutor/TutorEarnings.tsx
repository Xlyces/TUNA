"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

interface EarningsEntry {
  id: string;
  date: Date;
  amount: number;
  lessonId: string;
  studentName?: string;
}

interface TutorEarningsProps {
  earnings: EarningsEntry[];
  totalEarnings?: number;
}

export function TutorEarnings({
  earnings = [],
  totalEarnings = 0,
}: TutorEarningsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>Earnings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-2xl font-bold">HKD {totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total earnings</p>
        </div>
        {earnings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.slice(0, 10).map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>{format(earning.date, "MMM d, yyyy")}</TableCell>
                  <TableCell>{earning.studentName || "N/A"}</TableCell>
                  <TableCell className="text-right font-medium">
                    HKD {earning.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No earnings yet</p>
        )}
      </CardContent>
    </Card>
  );
}

