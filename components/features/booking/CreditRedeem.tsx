"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

interface CreditRedeemProps {
  availableCredits: number;
  onRedeem: (credits: number) => void;
  maxRedeemable?: number;
}

export function CreditRedeem({
  availableCredits,
  onRedeem,
  maxRedeemable,
}: CreditRedeemProps) {
  const [creditsToUse, setCreditsToUse] = useState(0);
  const maxCredits = maxRedeemable || Math.floor(availableCredits / 10) * 10; // Round down to nearest 10
  const discount = creditsToUse * 10; // 10 HKD per credit

  const handleRedeem = () => {
    if (creditsToUse > 0 && creditsToUse <= availableCredits) {
      onRedeem(creditsToUse);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-primary" />
          <CardTitle>Redeem Credits</CardTitle>
        </div>
        <CardDescription>
          You have {availableCredits} credits available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="credits">Credits to Use (10 credits = HKD 10 discount)</Label>
          <Input
            id="credits"
            type="number"
            min={0}
            max={maxCredits}
            step={10}
            value={creditsToUse}
            onChange={(e) => setCreditsToUse(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Maximum: {maxCredits} credits (HKD {maxCredits * 10} discount)
          </p>
        </div>

        {creditsToUse > 0 && (
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium">
              Discount: HKD {discount.toFixed(2)}
            </p>
          </div>
        )}

        <Button
          onClick={handleRedeem}
          disabled={creditsToUse === 0 || creditsToUse > availableCredits}
          className="w-full"
        >
          Apply Credits
        </Button>
      </CardContent>
    </Card>
  );
}

