import React, { useContext, useEffect, useMemo, useState } from "react";
import { ExploreCategoryFilter, ExploreSearchBar } from "@/components/Utility";
import { utilityContext } from "@/context/UtilityContext";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import nftCalls from "@/services/utility/nftCalls";
import { CreateUtilityContext } from "@/context/CreateUtilityContext";
import utilityCalls from "@/services/utility/utilityCalls";
import { toast } from "react-toastify";
import {
  handleClaimRewardBackend,
  handleClaimUtilityBackend,
  handleRedeemRewardBackend,
} from "@/utils/BackendCalls";
import { checkPairing } from "@/utils/HederaContract";
import ClaimRedeemFromExploreModal from "@/components/Reusables/utility/Modals/ClaimRedeemFromExploreModal";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";

const index = () => {
  const [collectionUtilitiesData, setCollectionsUtilitiesData] = useState([]);
  const [collectionUtilitiesLoading, setCollectionUtilitiesLoading] =
    useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [selectedUtility, setSelectedUtility] = useState({});
  const [openRewardsModal, setOpenRewardsModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loadingForModal, setLoadingForModal] = useState(false);
  const [triggerDataRefresh, setTriggerDataRefresh] = useState(false);
  const [showRedeemButton, setShowRedeemButton] = useState(false);

  const { rewardsOptionsData } = useContext(CreateUtilityContext);
  const { exploreSelectedChain } = useContext(utilityContext);
  const { checkLoginValidity, setIsTransactionOngoing, setIsTokenValid } =
    useUserWalletContext();

  const [selectedNft, setSelectedNft] = useState({});

  const router = useRouter();
  const { signer } = useSigner();
  const { isConnected, address } = useUserWalletContext();
  const { chainDetail, chainId, selectedChain } = useContext(ChainContext);

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
        const utilityId = selectedUtility?.utilityId;
        let result;
        if (chainDetail?.evm && isConnected && address) {
          setLoadingForModal(true);
          result = await handleClaimUtilityBackend({
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: chainDetail,
            userAddress: chainDetail?.evm ? address : accountId,
            signer,
            type: selectedUtility?.selectionType.toLowerCase(),
            tokenAddress: selectedUtility?.target[0]?.collection,
          });

          if (result?.response?.data?.error) {
            setLoadingForModal(false);
            toast.error("Utility claim failed");
          } else {
            setLoadingForModal(false);
            fetchGeneratedCode();
            fetchUserNftData();
            toast.dismiss();
            toast.success(
              "Utility claimed successfully, You can redeem your rewards now"
            );
          }
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          const checkPair = checkPairing();
          if (!checkPair && accountId !== null) {
            toast.error("Connect your wallet");
            return;
          }
          setLoadingForModal(true);

          result = await handleClaimUtilityBackend({
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: chainDetail,
            userAddress: chainDetail?.evm ? address : accountId,
            signer,
            type: selectedUtility?.selectionType.toLowerCase(),
            tokenAddress: selectedUtility?.target[0]?.collection,
          });

          if (result?.response?.data?.error) {
            setLoadingForModal(false);
            toast.error("Utility claim failed");
          } else {
            setLoadingForModal(false);
            toast.dismiss();
            toast.success(
              "Utility claimed successfully, You can redeem your rewards now"
            );
          }
        }
      } catch (error) {
        console.error("Error claiming utility:", error);
        toast.error("An error occurred while claiming the utility.");
        setLoadingForModal(false);
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
        const utilityId = selectedUtility?.utilityId;
        let result;
        if (chainDetail?.evm && isConnected && address) {
          if (
            selectedUtility?.reward?.type === "nft" ||
            selectedUtility?.reward?.type === "ft"
          ) {
            setLoadingForModal(true);

            result = await handleClaimRewardBackend({
              tokenAddress: selectedUtility?.target?.[0]?.collection,
              tokenId: selectedNft?.tokenId,
              utilityId,
              chainDetail: chainDetail,
              userAddress: chainDetail?.evm ? address : accountId,
              signer,
              type: selectedUtility?.selectionType.toLowerCase(),
            });

            if (result?.response?.data?.error) {
              setLoadingForModal(false);
              toast.error("Utility redeem failed");
            } else {
              setLoadingForModal(false);
              fetchGeneratedCode();
              fetchUserNftData();
              toast.dismiss();
              toast.success("Utility redeemed successfully.");
            }
          } else {
            setLoadingForModal(true);
            result = await handleRedeemRewardBackend({
              tokenAddress: selectedUtility?.target?.[0]?.collection,
              tokenId: selectedNft?.tokenId,
              utilityId,
              chainDetail: chainDetail,
              userAddress: chainDetail?.evm ? address : accountId,
              signer,
            });
            if (result?.response?.data?.error) {
              setLoadingForModal(false);
              toast.error("Utility redeem failed");
            } else {
              setLoadingForModal(false);
              fetchGeneratedCode();
              fetchUserNftData();
              toast.dismiss();
              toast.success("Utility redeemed successfully.");
            }
          }
        } else if (selectedChain?.toLowerCase()?.includes("hedera")) {
          if (!isPaired && accountId !== null) {
            toast.error("Connect your wallet");
            return;
          }
          setLoadingForModal(true);

          result = await handleRedeemRewardBackend({
            tokenAddress: selectedUtility?.target?.[0]?.collection,
            tokenId: selectedNft?.tokenId,
            utilityId,
            chainDetail: chainDetail,
            userAddress: chainDetail?.evm ? address : accountId,
            signer,
          });
          if (result?.response?.data?.error) {
            setLoadingForModal(false);
            toast.error("Utility redeem failed");
          } else {
            setLoadingForModal(false);
            fetchGeneratedCode();
            toast.dismiss();
            toast.success("Utility redeemed successfully.");
          }
        }
      } catch (error) {
        console.error("Error redeeming reward:", error);
        toast.error("An error occurred while redeeming the reward.");
        setLoadingForModal(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    }
  };

  const verifyUserHoldNftCollectionCall = async (tokenAddress, utilityId) => {
    const response = await utilityCalls.verifyUserHoldNftCollection({
      taskType: "nft_owner",
      tokenAddress,
      chainId,
      wallet: address,
      utilityId,
      taskInfo: "Own a NFT",
    });

    if (response instanceof Error) {
      console.error("Error", response);
    } else {
    }
  };

  async function fetchUserNftData() {
    setCollectionUtilitiesLoading(true);

    const resp = await nftCalls.fetchUserNftData(
      exploreSelectedChain?.chain_id,
      router?.query?.id
    );

    let filteredCollections = [];

    if (resp?.data?.utilities?.length > 0) {
      for (const item of resp?.data?.utilities) {
        const eligibilityEntries = Object.entries(item?.eligible);

        if (eligibilityEntries?.length === 1) {
          const [key, value] = eligibilityEntries?.[0];

          if (value?.isTarget && !item?.userInfo?.isEligible) {
            verifyUserHoldNftCollectionCall(key, item?.utilityId);
            item.userInfo.isEligible = true;
          }
        }

        filteredCollections.push(item);
      }

      setCollectionsUtilitiesData({
        ...resp?.data,
        utilities: filteredCollections,
      });
      setCollectionUtilitiesLoading(false);
    } else {
      setCollectionsUtilitiesData({ ...resp?.data });
      setCollectionUtilitiesLoading(false);
    }
  }

  const UtilityImage = (utility) => {
    const utilityRewardTypeData = rewardsOptionsData?.find(
      (el) => el?.title === utility
    );

    return (
      <img
        src={utilityRewardTypeData?.image_url}
        alt="#"
        className="h-6 w-6 object-cover rounded-md"
      />
    );
  };

  const fetchGeneratedCode = async () => {
    if (selectedUtility?.utilityId && address?.length > 0) {
      const response = await utilityCalls.getUserWinnings(
        selectedUtility?.utilityId,
        address
      );
      if (response instanceof Error) {
        console.error("Error", response);
      } else {
        setGeneratedCode(response?.data);
      }
    }
  };

  const selectedNftUtilites = useMemo(() => {
    let finalArray = [];

    if (
      collectionUtilitiesData?.utilities?.length > 0 &&
      (selectedNft?.utilities ?? [])?.length > 0
    ) {
      finalArray = [
        ...collectionUtilitiesData.utilities,
        ...selectedNft.utilities,
      ];
    } else if (
      collectionUtilitiesData?.utilities?.length > 0 &&
      (selectedNft?.utilities ?? [])?.length <= 0
    ) {
      finalArray = [...collectionUtilitiesData.utilities];
    }

    return finalArray;
  }, [selectedNft, collectionUtilitiesData]);

  const filteredUtilites = useMemo(() => {
    if (selectedOptions?.length <= 0) {
      return selectedNftUtilites;
    } else {
      const filteredCollections = selectedNftUtilites?.filter((el) =>
        selectedOptions.includes(el?.utilityType)
      );

      return filteredCollections;
    }
  }, [selectedOptions, selectedNftUtilites]);

  const filteredNfts = useMemo(() => {
    let searchFilter = [];
    if (searchValue?.length <= 0) {
      searchFilter = collectionUtilitiesData?.tokens ?? [];
    } else {
      const filteredArray = collectionUtilitiesData?.tokens?.filter((el) => {
        const name = `${el?.name} #${el?.tokenId}`;
        return name?.includes(searchValue);
      });
      searchFilter = filteredArray ?? [];
    }

    return searchFilter;
  }, [searchValue, collectionUtilitiesData]);

  useEffect(() => {
    if (collectionUtilitiesData?.tokens?.length > 0) {
      const selectedNftInTokensArray = collectionUtilitiesData?.tokens?.find(
        (el) => el?.tokenId === selectedNft?.tokenId
      );

      if (selectedNftInTokensArray) {
        setSelectedNft(selectedNftInTokensArray);
      } else {
        setSelectedNft(collectionUtilitiesData?.tokens?.[0]);
      }
    }
  }, [collectionUtilitiesData]);

  useEffect(() => {
    if (chainDetail?.chain_id) {
      fetchUserNftData();
    } else {
      // router.push(`/explore`);
    }
  }, [router, isConnected, chainDetail, triggerDataRefresh]);

  useEffect(() => {
    fetchGeneratedCode();
  }, [selectedUtility, triggerDataRefresh, address]);

  const isAllRewardsClaimed = useMemo(() => {
    return false;
  }, []);

  return (
    <>
      {collectionUtilitiesLoading ? (
        <Loader customMessage={"Loading Data"} />
      ) : (
        <div className="w-full p-0 md:py-6 md:px-8 lg:px-20 grow flex flex-col">
          <div className="h-fit mb-8 mt-4 flex flex-row flex-wrap items-center justify-between text-[#F1FCF3] relative">
            <h1 className="md:text-xl hidden md:block sm:text-xl whitespace-nowrap mr-2  font-semibold  text-white font-numans">
              View all available rewards and redeem them.
            </h1>
            <div className="flex flex-row items-center justify-between w-full md:w-fit md:justify-center gap-3 px-2">
              <ExploreSearchBar
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e?.target?.value);
                }}
              />
              <ExploreCategoryFilter
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
              />
            </div>
          </div>

          {/* desktop component */}

          <div className="w-full gap-6 grow items-stretch hidden md:flex">
            <div className="h-full max-h-[60vh] w-full min-w-[300px] max-w-[300px] bg-black-3 rounded-md flex flex-col items-center p-3">
              <div className="h-full min-h-[60vh] max-h-[60vh] w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col">
                {filteredNfts?.length <= 0 ? (
                  <div className="h-full w-full">
                    {isConnected ? (
                      <div className="flex h-full w-full flex-col gap-6 items-center justify-center">
                        <h5 className="text-center">
                          You do not own any digital assets from this collection
                        </h5>
                        <div className="w-full px-4 text-xs text-white flex items-center justify-between">
                          <button
                            className="px-4 py-2 rounded-md bg-green-4 flex items-center justify-center"
                            onClick={() =>
                              window.open(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedChain}/discover`,
                                "_blank"
                              )
                            }
                          >
                            Buy Now
                          </button>
                          <button
                            className="px-4 py-2 rounded-md bg-green-4 flex items-center justify-center"
                            onClick={() =>
                              window.open(
                                `${process.env.NEXT_PUBLIC_BASE_URL}/${selectedChain}/rent`,
                                "_blank"
                              )
                            }
                          >
                            Rent Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <h5 className="text-center">
                        Please connect your wallet to see your NFTs
                      </h5>
                    )}
                  </div>
                ) : (
                  filteredNfts?.map((item, index) => {
                    return (
                      <div
                        className={`${
                          selectedNft?.tokenId === item?.tokenId
                            ? "bg-green-8"
                            : "bg-grayscale-13"
                        } p-3 mb-3 gap-6 flex items-center rounded-md cursor-pointer transition-all duration-300 h-full w-full`}
                        onClick={() => setSelectedNft(item)}
                      >
                        <img
                          src={item?.image}
                          alt="#"
                          className="h-[72px] w-[96px] object-cover rounded-md"
                        />
                        <div className="w-full flex flex-col gap-1 text-white text-2xs lg:text-sm">
                          <h5>{`${item?.name} #${item?.tokenId}`}</h5>
                          <p
                            className={`text-2xs ${
                              selectedNft?.tokenId === item?.tokenId
                                ? "text-white"
                                : "text-grayscale-6"
                            }`}
                          >
                            {item?.utilities?.length +
                              collectionUtilitiesData?.utilities?.length ??
                              0}{" "}
                            Rewards
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="h-full min-h-[60vh] max-h-[60vh] w-full grow bg-black-3 rounded-md flex flex-col items-center p-3">
              <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col">
                {filteredUtilites?.length <= 0 ? (
                  <h5 className="h-full w-full flex items-center justify-center">
                    No rewards available for this NFT collection
                  </h5>
                ) : (
                  filteredUtilites?.map((item) => {
                    return (
                      <div
                        className="bg-grayscale-12 w-full p-3 mb-3 gap-6 flex items-center justify-between rounded-md min-h-[72px] h-full"
                        key={item?.utilityId}
                      >
                        <div className="h-8 w-8 relative flex items-center justify-center overflow-hidden rounded">
                          <div className="h-12 w-2 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute right-0 opacity-5"></div>
                          <div className="h-12 w-3 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute -bottom-[18px] opacity-20 -right-2"></div>
                          <div className="h-12 w-5 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute -left-2 opacity-5"></div>
                          <div className="h-12 w-3 bg-grayscale-6 z-[6] rotate-[21.5deg] absolute -left-2 opacity-5"></div>

                          {UtilityImage(item?.utilityType)}
                        </div>
                        <h5 className="grow text-grayscale text-2xs lg:text-sm">
                          {item?.title}
                        </h5>
                        {!isAllRewardsClaimed && (
                          <button
                            className="h-fit w-fit px-4 py-2 whitespace-nowrap rounded text-2xs md:text-sm bg-grayscale-13 text-green-5"
                            onClick={() => {
                              if (item?.utilityType === "Existing Utility") {
                                // Navigate to the external URL for "Explore Now"
                                window.open(
                                  item?.reward?.details?.[0],
                                  "_blank"
                                );
                              } else {
                                if (item?.userInfo?.isEligible) {
                                  setSelectedUtility(item);
                                  setOpenRewardsModal(true);
                                } else {
                                  router.push(`/utility/${item?.utilityId}`);
                                }
                              }
                            }}
                          >
                            {item?.utilityType === "Existing Utility"
                              ? "Explore Now"
                              : "Redeem Now"}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* mobile component */}

          <div className="w-full gap-6 grow flex md:hidden relative pb-24">
            <div className="w-full h-24 fixed z-10 bottom-0 border-t-2 border-solid border-gray-2 bg-black-3 rounded-md p-3">
              <div className="h-full w-full flex flex-row gap-6  overflow-y-hidden overflow-x-auto scrollbar-hide">
                {filteredNfts?.map((item, index) => {
                  return (
                    <div
                      className={`${
                        selectedNft?.tokenId === item?.tokenId
                          ? "bg-green-8"
                          : "bg-grayscale-13"
                      } p-3 mb-3 gap-6 flex items-center rounded-md cursor-pointer transition-all duration-300 h-16 mr-3 md:mr-0 md:w-full w-fit min-w-fit md:min-w-[160px]`}
                      onClick={() => setSelectedNft(item)}
                    >
                      <img
                        src={item?.image}
                        alt="#"
                        className="h-full w-24 object-cover rounded-md"
                      />
                      <div className="w-full flex flex-col gap-1 text-white text-2xs lg:text-sm">
                        <h5>
                          {item?.name} #{item?.tokenId}
                        </h5>
                        <p
                          className={`text-2xs ${
                            selectedNft?.tokenId === item?.tokenId
                              ? "text-white"
                              : "text-grayscale-6"
                          }`}
                        >
                          {item?.utilities?.length +
                            collectionUtilitiesData?.utilities?.length ??
                            0}{" "}
                          Rewards
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-full w-full grow bg-black-3 rounded-md flex flex-col items-center p-3">
              <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
                {filteredUtilites?.length <= 0 ? (
                  <h5>No rewards available for this NFT collection</h5>
                ) : (
                  filteredUtilites?.map((item) => {
                    return (
                      <div className="bg-grayscale-12 w-full p-3 mb-3 gap-6 flex items-center justify-between rounded-md min-h-[72px] h-fit">
                        <div className="h-8 w-8 relative flex items-center justify-center overflow-hidden rounded">
                          <div className="h-12 w-2 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute right-0 opacity-5"></div>
                          <div className="h-12 w-3 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute -bottom-[18px] opacity-20 -right-2"></div>
                          <div className="h-12 w-5 bg-grayscale-6 z-[5] rotate-[21.5deg] absolute -left-2 opacity-5"></div>
                          <div className="h-12 w-3 bg-grayscale-6 z-[6] rotate-[21.5deg] absolute -left-2 opacity-5"></div>

                          {UtilityImage(item?.utilityType)}
                        </div>
                        <h5 className="grow text-grayscale text-2xs lg:text-sm">
                          {item?.title}
                        </h5>
                        <button
                          className="h-fit w-fit px-4 py-2 whitespace-nowrap rounded text-2xs md:text-sm bg-grayscale-13 text-green-5"
                          onClick={() => {
                            if (item?.selectionType === "raffle") {
                              router.push(`/utility/${item?.utilityId}`);
                            } else {
                              if (item?.userInfo?.isEligible) {
                                setSelectedUtility(item);
                                // handleClaimUtility(item?.utilityId);
                                setOpenRewardsModal(true);
                              } else {
                                router.push(`/utility/${item?.utilityId}`);
                              }
                            }
                          }}
                        >
                          Redeem Now
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ClaimRedeemFromExploreModal
        open={openRewardsModal}
        title="Rewards"
        backendData={selectedUtility}
        handleClose={() => {
          setLoadingForModal(false);
          setOpenRewardsModal(false);
        }}
        handleClaimUtility={handleClaimUtility}
        handleRedeemReward={handleRedeemReward}
        generatedCode={generatedCode}
        loadingForModal={loadingForModal}
        showRedeemButton={showRedeemButton}
        selectedNft={selectedNft}
      />
    </>
  );
};

export default index;
