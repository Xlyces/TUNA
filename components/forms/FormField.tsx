import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReactNode } from "react";

interface FormFieldWrapperProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormFieldWrapper({
  label,
  description,
  error,
  required,
  children,
}: FormFieldWrapperProps) {
  return (
    <FormItem>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
      )}
      <FormControl>{children}</FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}

