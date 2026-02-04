"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tutor } from "@/hooks/useTutors";

interface TutorSubjectsProps {
  tutor: Tutor;
}

export function TutorSubjects({ tutor }: TutorSubjectsProps) {
  const subjects = tutor.subjects || [];

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">No subjects listed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[hsl(var(--foreground))]">Subjects & Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[hsl(var(--muted-foreground))]">Subject</TableHead>
              <TableHead className="text-right text-[hsl(var(--muted-foreground))]">Rate (HKD/hr)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject}>
                <TableCell>
                  <Badge variant="outline">{subject}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-[hsl(var(--foreground))]">
                  {tutor.hourlyRate || "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

