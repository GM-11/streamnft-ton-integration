import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig } from "wagmi";

import { chainArray, transportsObject } from "@/constants/chainConstants";

export const projectId = "261a21a2f72ba68cabf78bdbfb18043a";

export const connectors = connectorsForWallets(
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
    projectId: projectId,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: chainArray,
  transports: transportsObject,
});
