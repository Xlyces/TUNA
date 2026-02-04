"use client";

import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  component: ReactNode;
}

interface VerificationWizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  initialData?: any;
}

export function VerificationWizard({
  steps,
  onComplete,
  initialData = {},
}: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);

  const updateFormData = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          {steps[currentStep].component}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>Submit for Review</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

