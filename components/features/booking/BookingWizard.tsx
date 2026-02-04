import { useState, ReactNode, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  component: ReactNode;
  validate?: (data: any) => { isValid: boolean; error?: string };
}

interface BookingWizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  initialData?: any;
  onStepChange?: (stepIndex: number) => void;
  canComplete?: boolean; // Whether the booking can be completed (i.e., booking was created)
}

export function BookingWizard({
  steps,
  onComplete,
  initialData = {},
  onStepChange,
  canComplete = false,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync formData with initialData when it changes (from parent updates)
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Move to payment step when booking is ready
  useEffect(() => {
    if (canComplete && currentStep === steps.length - 2) {
      // Booking was created, move to payment step
      setCurrentStep(steps.length - 1);
    }
  }, [canComplete, currentStep, steps.length]);

  const validateCurrentStep = useCallback((): boolean => {
    const step = steps[currentStep];
    if (!step) {
      return false;
    }
    if (step.validate) {
      try {
      const validation = step.validate(formData);
      if (!validation.isValid) {
        setValidationError(validation.error || "Please complete all required fields");
          return false;
        }
      } catch (error: any) {
        setValidationError(error?.message || "Validation error");
        return false;
      }
    }
    setValidationError(null);
    return true;
  }, [steps, currentStep, formData]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }
    
    // If moving to payment step (last step), check if booking can be completed
    if (currentStep === steps.length - 2) {
      // Trigger step change callback to let parent create booking
      // Parent will handle moving to payment step after booking is created
      if (onStepChange) {
        onStepChange(currentStep + 1);
      }
      // Only move to payment step if booking was already created
      if (canComplete && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) {
        onStepChange(newStep);
      }
    }
  }, [currentStep, steps.length, validateCurrentStep, onStepChange, canComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    onComplete(formData);
  }, [onComplete, formData]);

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep, steps.length]);
  
  const currentStepData = useMemo(() => steps[currentStep], [steps, currentStep]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>{currentStepData.title}</CardTitle>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        <div>
          {currentStepData.component}
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
            <Button onClick={handleComplete} disabled={!canComplete}>
              {canComplete ? "Complete Booking" : "Waiting for booking..."}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

