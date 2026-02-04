"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import { Tutor } from "@/hooks/useTutors";

interface TutorCredentialsProps {
  tutor: Tutor;
}

export function TutorCredentials({ tutor }: TutorCredentialsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle>Credentials</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tutor.examType && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Exam Type</p>
            <Badge variant="secondary">{tutor.examType}</Badge>
          </div>
        )}
        {tutor.university && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">University</p>
            <p className="font-medium">{tutor.university}</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          This tutor has been verified by our admin team. Their credentials
          have been checked and their SBT has been minted on-chain.
        </p>
      </CardContent>
    </Card>
  );
}

