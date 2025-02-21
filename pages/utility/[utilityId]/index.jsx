"use client";
import React, { useContext, useEffect, useState } from "react";
const UtilityDetailsDesktop = dynamic(
  () => import("@/components/Utility/UtilityDetails/UtilityDetailsDesktop"),
  { ssr: false }
);
const UtilityDetailsMobile = dynamic(
  () => import("@/components/Utility/UtilityDetails/UtilityDetailsMobile"),
  { ssr: false }
);

import useMediaQuery from "@/hooks/useMediaQuery";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import dynamic from "next/dynamic";
import utilityCalls from "@/services/utility/utilityCalls";
import { toast } from "react-toastify";
import { ChainContext } from "@/context/ChainContext";
import {
  handleClaimRewardBackend,
  handleClaimUtilityBackend,
  handleRedeemRewardBackend,
  joinRaffle,
} from "@/utils/BackendCalls";
import { HederaContext } from "@/context/HederaContext";
import { checkPairing } from "@/utils/HederaContract";
import { useSigner } from "@/context/SignerContext";
import { ImSpinner2 } from "react-icons/im";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";

const index = () => {
  const isBigScreen = useMediaQuery();

  const [selectedNft, setSelectedNft] = useState({});
  const { query } = useRouter();
  const [currentData, setCurrentData] = useState({});
  const { address, isConnected, chainId: userChainId } = useUserWalletContext();
  const [entryUpdated, setEntryUpdated] = useState(false);
  const [openRewardsModal, setOpenRewardsModal] = useState(false);
  const [storedUserid, setStoredUserid] = useState("");
  const [generatedCode, setGeneratedCode] = useState([]);
  const [loading, setLoading] = useState(false);
  const { accountId, isPaired } = useContext(HederaContext);
  const [utilityChain, setUtilityChain] = useState({});

  const { selectedChain, chainDetails } = useContext(ChainContext);
  const { checkLoginValidity, setIsTransactionOngoing, setIsTokenValid } =
    useUserWalletContext();

  useEffect(() => {
    if (query?.utilityId?.length > 0) {
      const selectedUtilityChain = query?.utilityId?.split("-")?.[0];
      const currentChain = chainDetails?.find(
        (el) => Number(el?.chain_id) === Number(selectedUtilityChain)
      );
      setUtilityChain(currentChain);
    }
  }, [chainDetails, query]);

  const { signer } = useSigner();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    setStoredUserid(userId);
  }, []);

  const getPageData = async () => {
    try {
      const response = await utilityCalls.getUtilityDetails(
        query?.utilityId,
        address
      );

      setCurrentData(response.data);
    } catch (e) {}
  };

  const handleEnterDraw = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      try {
        setIsTransactionOngoing(true);
        const utilityId = query.utilityId;
        let result;
        if (utilityChain?.evm && isConnected && address) {
          toast(
            <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
              <ImSpinner2 className="animate-spin text-white" />
              <span>Please wait, while we enter you into raffle</span>
            </div>,
            {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 5000000,
              className: "!bg-green-6",
              bodyClassName: "!bg-green-6",
            }
          );

          result = await joinRaffle({
            entries: null,
            utilityId,
            chainDetail: utilityChain,
            userAddress: utilityChain?.evm ? address : accountId,
            signer,
          });
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          const checkPair = checkPairing();
          if (!checkPair && accountId !== null) {
            toast.error("Connect your wallet");
            setIsTransactionOngoing(false);
            return;
          }
          setLoading(true);
          result = await joinRaffle(
            entries,
            utilityId,
            null,
            utilityChain?.chain_id,
            accountId,
            utilityChain?.treasury_account,
            signer
          );
        }
        if (result === "success") {
          setEntryUpdated(!entryUpdated);
          toast.dismiss();
          toast.success("Entered raffle successfully");
        }
      } catch (error) {
        console.error("Error joining raffle:", error);
        toast.dismiss();
        toast.error("Entering raffle failed, please try again");
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    }
  };

  const handleClaimUtility = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      try {
        setIsTransactionOngoing(true);
        const utilityId = query.utilityId;
        let result;
        // console.log(Number(utilityChain?.chain_id), Number(userChainId));
        if (utilityChain?.evm && isConnected && address) {
          setLoading(true);
          result = await handleClaimUtilityBackend({
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: utilityChain,
            userAddress: utilityChain?.evm ? address : accountId,
            signer,
            type: currentData?.collectionUtility?.selectionType.toLowerCase(),
            tokenAddress: currentData?.collectionUtility?.target[0]?.collection,
          });
          if (result?.response?.data?.error) {
            setLoading(false);
            toast.error("Utility claim failed");
          } else {
            setEntryUpdated(!entryUpdated);
            toast.dismiss();
            toast.success("Utility claimed! Added to your account.");
          }
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          const checkPair = checkPairing();
          if (!checkPair && accountId !== null) {
            toast.error("Connect your wallet");
            setIsTransactionOngoing(false);
            return;
          }
          setLoading(true);

          result = await handleClaimUtilityBackend({
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: utilityChain,
            userAddress: utilityChain?.evm ? address : accountId,
            signer,
            type: currentData?.collectionUtility?.selectionType.toLowerCase(),
            tokenAddress: currentData?.collectionUtility?.target[0]?.collection,
          });
          if (result?.response?.data?.error) {
            setLoading(false);
            toast.error("Utility claim failed");
          } else {
            setEntryUpdated(!entryUpdated);
            toast.dismiss();
            toast.success(
              "Utility claimed successfully, You can redeem your rewards now"
            );
          }
        }
      } catch (error) {
        console.error("Error claiming utility:", error);
        toast.error("An error occurred while claiming the utility.");
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    }
  };

  const handleRedeemReward = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      try {
        setIsTransactionOngoing(true);
        const utilityId = query.utilityId;
        let result;
        if (utilityChain?.evm && isConnected && address) {
          if (
            currentData?.collectionUtility?.reward?.type === "nft" ||
            currentData?.collectionUtility?.reward?.type === "ft"
          ) {
            setLoading(true);

            result = await handleClaimRewardBackend({
              tokenAddress:
                currentData?.collectionUtility?.target?.[0]?.collection,
              tokenId: selectedNft?.tokenId,
              utilityId,
              chainDetail: utilityChain,
              userAddress: utilityChain?.evm ? address : accountId,
              signer,
              type: currentData?.collectionUtility?.selectionType.toLowerCase(),
            });

            if (result?.response?.data?.error) {
              setLoading(false);
              toast.error("Utility redeem failed");
            } else {
              setEntryUpdated(!entryUpdated);
              toast.dismiss();
              toast.success("Utility redeemed successfully.");
            }
          } else {
            setLoading(true);
            result = await handleRedeemRewardBackend({
              tokenAddress:
                currentData?.collectionUtility?.target?.[0]?.collection,
              tokenId: selectedNft?.tokenId,
              utilityId,
              chainDetail: utilityChain,
              userAddress: utilityChain?.evm ? address : accountId,
              signer,
            });

            if (result?.response?.data?.error) {
              setLoading(false);
              toast.error("Utility redeem failed");
            } else {
              setEntryUpdated(!entryUpdated);
              toast.dismiss();
              toast.success("Utility redeemed successfully.");
            }
          }
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          if (!isPaired && accountId !== null) {
            toast.error("Connect your wallet");
            setIsTransactionOngoing(false);
            return;
          }
          setLoading(true);

          result = await handleRedeemRewardBackend({
            tokenAddress:
              currentData?.collectionUtility?.target?.[0]?.collection,
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: utilityChain,
            userAddress: utilityChain?.evm ? address : accountId,
            signer,
          });
          if (result?.response?.data?.error) {
            setLoading(false);
            toast.error("Utility redeem failed");
          } else {
            setEntryUpdated(!entryUpdated);
            toast.dismiss();
            toast.success("Utility redeemed successfully.");
          }
        }
      } catch (error) {
        console.error("Error redeeming reward:", { error });
        toast.error("An error occurred while redeeming the reward.");
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    }
  };

  useEffect(() => {
    const fetchPageData = async () => {
      if (query?.utilityId) {
        setLoading(true);
        await getPageData();
        setLoading(false);
      }
    };

    fetchPageData();
  }, [query.utilityId, address, entryUpdated, accountId]);

  const getCollectionName = async (collectionId) => {
    const getResponse = await utilityCalls.getCollectionName(collectionId);
    const data = getResponse.data;

    return data;
  };

  useEffect(() => {
    getCollectionName("0xC49ABBF449e9b49DAC3BCb17fD5215cb8d349eEB");
  }, []);

  const fetchGeneratedCode = async () => {
    try {
      const userAddress =
        Number(utilityChain?.chain_id) === 295 ? accountId : address;

      if (query?.utilityId && userAddress?.length > 0) {
        const response = await utilityCalls.getUserWinnings(
          query.utilityId,
          userAddress
        );
        setGeneratedCode(response?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fn = async () => {
      setLoading(true);
      await fetchGeneratedCode();
      setLoading(false);
    };

    fn();
  }, [address, query, entryUpdated, accountId, utilityChain]);

  if (isBigScreen) {
    return (
      <UtilityDetailsDesktop
        backendData={currentData}
        handleEnterDraw={handleEnterDraw}
        handleClaimUtility={handleClaimUtility}
        handleRedeemReward={handleRedeemReward}
        openRewardsModal={openRewardsModal}
        setOpenRewardsModal={setOpenRewardsModal}
        generatedCode={generatedCode}
        selectedNft={selectedNft}
        setSelectedNft={setSelectedNft}
        setEntryUpdated={setEntryUpdated}
        entryUpdated={entryUpdated}
        loadingForModal={loading}
      />
    );
  } else if (!isBigScreen) {
    return (
      <UtilityDetailsMobile
        backendData={currentData}
        handleEnterDraw={handleEnterDraw}
        handleClaimUtility={handleClaimUtility}
        handleRedeemReward={handleRedeemReward}
        openRewardsModal={openRewardsModal}
        setOpenRewardsModal={setOpenRewardsModal}
        generatedCode={generatedCode}
        selectedNft={selectedNft}
        setSelectedNft={setSelectedNft}
        setEntryUpdated={setEntryUpdated}
        entryUpdated={entryUpdated}
        loadingForModal={loading}
      />
    );
  } else return <></>;
};

export default index;
