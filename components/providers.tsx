import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/blockchain/config";
import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";

// Check if WalletConnect is properly configured
const hasWalletConnect = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID && 
                        import.meta.env.VITE_WALLETCONNECT_PROJECT_ID !== 'your-project-id' &&
                        import.meta.env.VITE_WALLETCONNECT_PROJECT_ID.length > 10;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {hasWalletConnect ? (
          <RainbowKitProvider>{children}</RainbowKitProvider>
        ) : (
          <>{children}</>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

