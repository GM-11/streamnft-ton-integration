"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ChainContext } from "./ChainContext";
import { getUserCollection } from "@/utils/evmProvider";
import { useUserWalletContext } from "./UserWalletContext";
import { getCollectionCategories } from "@/utils/apiRequests";

export const CollectionContext = createContext();

export const CollectionContextWrapper = ({ children }) => {
  const [userAllCollection, setUserAllCollection] = useState([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectionSignal, setCollectionSignal] = useState(0);
  const [collectionCategories, setCollectionCategories] = useState({});
  const [selectedTokenOnDiscover, setSelectedTokenOnDiscover] = useState({});

  const { address, isConnected } = useUserWalletContext();
  const { isTokenSet } = useUserWalletContext();

  useEffect(() => {
    const fetchUserCollection = async () => {
      setCollectionLoading(true);
      setError(null);

      try {
        const response = await getUserCollection(address);
        if (response && response.data) {
          const transformedData = response.data.map((collection) => ({
            ...collection,
            token_address: collection.collectionAddress,
          }));
          // console.log({ transformedData });
          setUserAllCollection(transformedData);
        } else {
          setError("No collection data available.");
        }
      } catch (error) {
        setError("Error fetching user collection.");
        console.error("Error fetching user collection:", error);
      } finally {
        setCollectionLoading(false);
      }
    };

    fetchUserCollection();
  }, [address, collectionSignal, isTokenSet, isConnected]);

  useEffect(() => {
    const fn = async () => {
      const categories = await getCollectionCategories();

      setCollectionCategories(categories || {});
    };

    fn();
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        userAllCollection,
        collectionLoading,
        error,
        collectionSignal,
        setCollectionSignal,
        collectionCategories,
        setCollectionCategories,
        selectedTokenOnDiscover,
        setSelectedTokenOnDiscover,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
