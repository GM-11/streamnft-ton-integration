import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import axios from "axios";
import { scoreAxiosInstance } from "@/services/axios";
import { switchUserChain } from "./evmProvider";

const parseSiweMessage = (messageString) => {
  const lines = messageString.split("\n");

  return lines?.[1];
};

const authenticationAdapter = createAuthenticationAdapter({
  // Step 1: Fetch the nonce from your backend
  getNonce: async () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  // Step 2: Create the SIWE message for the user to sign
  createMessage: ({ nonce, address, chainId }) => {
    return createSiweMessage({
      domain: window.location.host,
      address, // Wallet address
      statement: "Sign in with Ethereum to authenticate.",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce, // Nonce fetched from your API
    });
  },

  // Step 3: Verify the signed message with your login API
  verify: async ({ message, signature }) => {
    const address = parseSiweMessage(message);

    try {
      const body = {
        address,
        message,
        signature,
        referralId: localStorage.getItem("referralCode"), // Optional referral code
      };

      const response = await scoreAxiosInstance.post("/auth/login", body);

      console.log({ response });

      localStorage.setItem("token", response?.data?.token);
      localStorage.setItem("refreshToken", response?.data?.refreshToken);
      const selectedChain = localStorage.getItem("selectedChainId");
      if (selectedChain) {
        await switchUserChain(Number(selectedChain));
      }
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Login verification failed:", error);
      return false;
    }
  },

  // Step 4: Handle user logout
  signOut: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.dispatchEvent(new Event("storage"));
  },
});

export default authenticationAdapter;
