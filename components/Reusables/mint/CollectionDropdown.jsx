import React, { useState, useEffect, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/router";
import NFTCollectionDropdown from "./NftCollectionDropwdown";
import { useAccount } from "wagmi";
import { CollectionContext } from "@/context/CollectionContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const CollectionDropdown = () => {
  const { setValue, formState } = useFormContext();
  const [searchString, setSearchString] = useState("");
  const [collectionOptions, setCollectionOptions] = useState([]);
  const { query } = useRouter();
  const { address, isConnected } = useUserWalletContext();
  const { userAllCollection, collectionSignal, collectionLoading } =
    useContext(CollectionContext);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!isConnected || !address) return;

      try {
        const formattedCollections = userAllCollection.map((collection) => ({
          image: collection?.image || "https://example.com/default-image.png",
          tokenType: collection?.tokenType ?? "",
          name: collection?.name,
          address: collection?.collectionAddress,
          type: collection?.category,
        }));

        setCollectionOptions(formattedCollections);
        // console.log("Formatted collections:", formattedCollections);
      } catch (error) {
        console.error("Failed to load collections:", error);
      }
    };

    fetchCollections();
  }, [isConnected, address, collectionSignal, collectionLoading]);

  return (
    <>
      <h5 className="text-white mb-4">Choose Collection</h5>
      <div className="w-full h-fit">
        {query?.id?.length > 0 && (
          <div className="absolute top-0 left-0 h-full w-full angled-lines z-[100] rounded-lg"></div>
        )}

        <NFTCollectionDropdown
          items={collectionOptions}
          onSelect={(e) => {
            setValue("collection", e);
            setValue("tokenAddress", "");
          }}
          searchString={searchString}
          setSearchString={setSearchString}
          placeholder={"Select collection"}
          isMint={true}
        />

        {!!formState?.errors?.collection && (
          <p className="text-remDays-block">
            {formState?.errors?.collection?.message}
          </p>
        )}
      </div>
    </>
  );
};

export default CollectionDropdown;
