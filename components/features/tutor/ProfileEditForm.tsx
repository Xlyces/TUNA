"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/forms/FileUpload";
import { SubjectsSelect } from "@/components/features/tutor/SubjectsSelect";
import { tutorProfileSchema, TutorProfileFormData } from "@/lib/validations/tutor-profile";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ProfileEditFormProps {
  initialData?: {
    bio?: string;
    subjects?: string[];
    hourlyRate?: number;
    profilePicture?: string;
  };
  onSubmit: (data: TutorProfileFormData) => Promise<void>;
}

export function ProfileEditForm({ initialData, onSubmit }: ProfileEditFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TutorProfileFormData>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      bio: initialData?.bio || "",
      subjects: initialData?.subjects || [],
      hourlyRate: initialData?.hourlyRate || 500,
    },
  });

  const selectedSubjects = watch("subjects");

  const handleFormSubmit = async (data: TutorProfileFormData) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your public profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell parents about yourself, your teaching style, and experience..."
              rows={6}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <FileUpload
              accept="image/*"
              maxSize={5}
              onChange={(file) => setValue("profilePicture", file || undefined)}
              label="Upload Profile Picture"
              description="Recommended: Square image, at least 400x400px"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Details</CardTitle>
          <CardDescription>Set your subjects and rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SubjectsSelect
            value={selectedSubjects || []}
            onChange={(subjects) => setValue("subjects", subjects)}
            error={errors.subjects?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (HKD) *</Label>
            <Input
              id="hourlyRate"
              type="number"
              {...register("hourlyRate", { valueAsNumber: true })}
              min={100}
              max={2000}
              step={50}
            />
            {errors.hourlyRate && (
              <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Platform commission: 20% (You receive 80%)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

