"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield } from "lucide-react";

interface SBTDisplayProps {
  tokenId: number;
  contractAddress?: string;
}

export function SBTDisplay({ tokenId, contractAddress }: SBTDisplayProps) {
  // Helper to get env vars (supports both Vite and Next.js)
  const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    return undefined;
  };
  
  const defaultContractAddress = getEnv('VITE_CONTRACT_ADDRESS') || getEnv('NEXT_PUBLIC_CONTRACT_ADDRESS') || '';
  const etherscanUrl = contractAddress
    ? `https://mumbai.polygonscan.com/token/${contractAddress}?a=${tokenId}`
    : `https://mumbai.polygonscan.com/token/${defaultContractAddress}?a=${tokenId}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-[hsl(var(--coral))]" />
          <CardTitle>Verification Badge</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Badge ID</p>
          <Badge variant="coral" className="text-lg px-3 py-1">
            #{tokenId}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          This tutor has been verified and their reputation is securely recorded on the blockchain.
          This badge cannot be transferred and serves as a permanent, trustworthy reputation record.
        </p>
        <Button variant="outline" asChild>
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <span>View on Etherscan</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

