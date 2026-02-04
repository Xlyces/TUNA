import { Badge, BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "confirmed" | "cancelled" | "completed" | "active" | "inactive" | "payment_held" | "awaiting_confirmation";

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: Status;
}

const statusConfig: Record<Status, { label: string; variant: BadgeProps["variant"] }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  confirmed: { label: "Confirmed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "default" },
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  payment_held: { label: "Payment Held", variant: "secondary" },
  awaiting_confirmation: { label: "Awaiting Confirmation", variant: "secondary" },
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  // Fallback for unknown statuses (shouldn't happen with TypeScript, but safety check)
  if (!config) {
    return (
      <Badge variant="secondary" className={cn(className)} {...props}>
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant={config.variant} className={cn(className)} {...props}>
      {config.label}
    </Badge>
  );
}

