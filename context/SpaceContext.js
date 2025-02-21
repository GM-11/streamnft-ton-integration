"use client";
import { getSpacesByOwner } from "@/utils/BackendCalls";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify"; // Import toast
import { ChainContext } from "./ChainContext";
import { useUserWalletContext } from "./UserWalletContext";

export const SpaceContext = createContext();

export const SpaceContextWrapper = ({ children }) => {
  const { address } = useUserWalletContext();
  const [spaces, setSpaces] = useState([]);
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spaceSignal, setSpaceSignal] = useState(0);
  const { isTokenSet } = useUserWalletContext();
  const [showSpaceForm, setShowSpaceForm] = useState(false);

  const fetchSpaces = async (wallet) => {
    setSpaceLoading(true);
    setError(null);
    try {
      const spaceResponse = await getSpacesByOwner(wallet);

      if (spaceResponse.status !== 200) {
        throw new Error("Failed to fetch spaces");
      }

      setSpaces(spaceResponse.data);
    } catch (error) {
      setError("Failed to fetch spaces");
      console.error("Error fetching spaces:", error);
    } finally {
      setSpaceLoading(false);
    }
  };

  useEffect(() => {
    if (address && isTokenSet) {
      fetchSpaces(address);
    }
  }, [address, spaceSignal, isTokenSet]);

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        spaceLoading,
        error,
        fetchSpaces,
        spaceSignal,
        setSpaceSignal,
        showSpaceForm,
        setShowSpaceForm,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};
