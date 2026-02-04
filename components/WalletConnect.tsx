"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

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

// Check if WalletConnect is properly configured
const projectId = getEnv('VITE_WALLETCONNECT_PROJECT_ID') || getEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
const hasWalletConnect = projectId && 
                        projectId !== 'your-project-id' &&
                        projectId.length > 10;

export function WalletConnect() {
  const { isConnected, address } = useAccount();

  // Don't render if WalletConnect is not configured
  if (!hasWalletConnect) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
      <ConnectButton />
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Secure blockchain connection
        </div>
      </div>
      {isConnected && (
        <div className="text-sm text-muted-foreground">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      )}
    </div>
  );
}

