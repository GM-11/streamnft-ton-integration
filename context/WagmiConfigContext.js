import React, { createContext, useContext, useEffect, useState } from "react";
import { WagmiProvider, createConfig } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { indexerAxiosInstance } from "@/services/axios";
import { http } from "wagmi";
import { chainArray } from "@/constants/chainConstants";

// Create a context for WagmiConfig
const WagmiConfigContext = createContext();

// Initialize QueryClient for react-query
const queryClient = new QueryClient();

// Define project ID for wallet connection
const projectId = "261a21a2f72ba68cabf78bdbfb18043a";

// Define wallet connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [rainbowWallet, metaMaskWallet],
    },
    {
      groupName: "Other",
      wallets: [walletConnectWallet],
    },
  ],
  {
    appName: "StreamNFT",
    projectId,
  }
);

// Function to fetch chains from the local JSON file
async function fetchChains() {
  try {
    return chainArray;
  } catch (error) {
    console.error("Failed to load chains from JSON:", error);
    return []; // Fallback to an empty array or predefined chains
  }
}

// WagmiConfigProvider component
export const WagmiConfigProvider = ({ children }) => {
  const [wagmiConfig, setWagmiConfig] = useState(null); // Start with null to indicate "loading"

  useEffect(() => {
    async function initializeWagmiConfig() {
      try {
        const chains = await fetchChains();

        let transports = {};

        transports = chains.forEach((chain) => {
          if (!transports[chain.id]) {
            transports[chain.id] = http();
          }
        });

        const newWagmiConfig = createConfig({
          connectors,
          chains,
          transports,
          ssr: true,
        });

        // console.log({ newWagmiConfig });

        setWagmiConfig(newWagmiConfig); // Update wagmiConfig once ready
      } catch (error) {
        console.error("Failed to initialize Wagmi config:", error);
      }
    }

    initializeWagmiConfig();
  }, []);

  // Show loading state until wagmiConfig is initialized
  if (!wagmiConfig) {
    return <div>Loading...</div>;
  }

  return (
    <WagmiConfigContext.Provider value={{ wagmiConfig }}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </WagmiConfigContext.Provider>
  );
};

// Hook to use WagmiConfigContext
export const useWagmiConfig = () => useContext(WagmiConfigContext);
