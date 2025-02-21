import { getWalletSigner } from "@/utils/getWalletEthersSigner";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";

const SignerContext = createContext();

export const SignerProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ account: address });
  const [walletChanged, setWalletChanged] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  const fetchAccounts = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accountsList = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setConnectedAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchAccounts();
    } else {
      setConnectedAccounts([]);
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchSigner = async () => {
      try {
        if (walletClient) {
          const walletSigner = await getWalletSigner(walletClient);

          setSigner(walletSigner);
        }
      } catch (error) {
        console.error("Failed to get wallet signer:", error);
      }
    };

    fetchSigner();
  }, [walletClient]);

  useEffect(() => {
    if (localStorage.getItem("token") && connectedAccounts.length > 0) {
      const walletAddressFromToken = jwtDecode(
        localStorage.getItem("token")
      )?.walletAddress;

      if (walletAddressFromToken !== address) {
        setWalletChanged(true);
      }
    }
  }, [address]);

  return (
    <SignerContext.Provider value={{ signer, walletChanged }}>
      {children}
    </SignerContext.Provider>
  );
};

export const useSigner = () => {
  return useContext(SignerContext);
};
