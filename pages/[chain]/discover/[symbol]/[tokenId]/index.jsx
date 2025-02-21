import React, { useContext, useEffect, useState } from "react";
import CoinImage from "../../../../../public/images/coinImage.png";
import ArrowDownImage from "../../../../../public/images/arrow-down-nftDetails.png";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import { useRouter } from "next/router";
import { indexerAxiosInstance, nftCacheAxiosInstance } from "@/services/axios";
import {
  processMartMarketplaceListings,
  formatAssetsByDB,
} from "@/utils/assetInfo";
import Loader from "@/components/Reusables/loan/Loader";
import { isTokenExpired } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { useAccount, useBalance } from "wagmi";
import { useSigner } from "@/context/SignerContext";
import { buyNftCall } from "@/utils/evmProvider";
import { UserNftContext } from "@/context/UserNftContext";
import { toast } from "react-toastify";
import { formatEther } from "ethers";
import { HederaContext } from "@/context/HederaContext";
import { removeQuery } from "@/utils/common";
import { FaRegCopy } from "react-icons/fa";

const index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [openAttributes, setOpenAttributes] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [collectionData, setCollectionData] = useState([]);
  const [assetData, setAssetData] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const router = useRouter();

  const {
    chainDetail,
    selectedChain,
    collections,
    userTransacted,
    setUserTransacted,
  } = useContext(ChainContext);

  const { setIsTransactionOngoing, setIsTokenValid, checkLoginValidity } =
    useUserWalletContext();

  const { address } = useUserWalletContext();

  const { signer } = useSigner();

  const { data: userBalance } = useBalance({ address });

  const { reloadNftCacheCall, addTokenInNftArray } = useContext(UserNftContext);

  const { balanceSignal, setBalanceSignal } = useContext(HederaContext);

  async function getMarketPlaceDatas() {
    setIsLoading(true);
    const symbol = router.query.symbol?.replace(/-/g, " ");

    const formattedName = (str) => str.toLowerCase().replace(/[\s-]+/g, "");

    const matchingCollection = collections.find(
      (collection) => formattedName(collection.name) === formattedName(symbol)
    );

    setCollectionData(matchingCollection);
  }

  const buyHandler = async () => {
    try {
      const isUserValid = await checkLoginValidity();

      if (!isUserValid) {
        return;
      }
      if (expired) {
        setIsTokenValid(false);
        return;
      }

      setIsTransactionOngoing(true);
      setIsLoading(true);

      const userBal = Number(formatEther(userBalance?.value));
      const nftRate = Number(assetData?.rate);

      if (userBal < nftRate) {
        toast.dismiss();
        toast.error("Insufficient balance to buy this NFT.");
        return;
      }

      const response = await buyNftCall(
        assetData?.tokenId,
        assetData?.tokenAddress,
        chainDetail?.chain_id,
        signer,
        assetData?.isErc1155,
        chainDetail?.contract_address,
        address,
        1,
        assetData?.index
      );

      if (response) {
        addTokenInNftArray(assetData?.tokenId);
        reloadNftCacheCall();
        setBalanceSignal(balanceSignal + 1);
        toast.dismiss();
        toast.success("NFT Bought successfully");
        setUserTransacted(!userTransacted);
        setIsLoading(false);
        setIsTransactionOngoing(false);
        router.push(
          `/${selectedChain}/discover/${router?.query?.symbol}/marketplace`
        );
      }
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Failed to buy NFT. Please try again.");
      setIsLoading(false);
      setIsTransactionOngoing(false);
    }
  };

  useEffect(() => {
    getMarketPlaceDatas();
  }, [collections]);

  useEffect(() => {
    const fetchData = async () => {
      // setIsLoading(true);
      try {
        if (
          router.query.tokenId &&
          chainDetail?.chain_id &&
          collectionData?.token_address
        ) {
          const assetResponse = await indexerAxiosInstance.get(
            `/assetManager/${chainDetail?.chain_id}`,
            {
              params: { tokenId: router.query.tokenId },
            }
          );

          const formattedData = formatAssetsByDB(assetResponse?.data?.data);

          const processedData = processMartMarketplaceListings(
            formattedData,
            "sale",
            chainDetail
          );

          setAssetData(processedData?.[0]);

          const metadataResponse = await nftCacheAxiosInstance.get(
            `/metadata/${chainDetail.chain_id}/${collectionData?.token_address}/${router.query.tokenId}`
          );

          setMetadata(metadataResponse?.data?.data);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chainDetail?.chain_id, router, collectionData]);

  const textStyle = "text-jet-black text-xs font-semibold leading-[21.84px]";

  console.log({ assetData, collectionData, metadata });

  return (
    <>
      {isLoading ? (
        <div className="h-[480px] w-full flex items-center justify-center">
          <Loader customMessage={"Fetching your data ..."} />
        </div>
      ) : (
        <>
          <div className="w-full h-fit bg-grayscale-21 shadow-md">
            <h5 className="text-white text-xl px-8 py-4">
              {collectionData?.name} #{router?.query?.tokenId}
            </h5>
            <div className="flex items-center justify-start gap-8 px-8 pt-4 border-t border-solid border-[#24182f]">
              <div
                className="relative text-white text-xs font-semibold leading-[21.84px] cursor-pointer pb-4"
                onClick={() => setSelectedTab("overview")}
              >
                Overview
                {selectedTab === "overview" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-4"></div>
                )}
              </div>
              <div
                className="relative text-white text-xs font-semibold leading-[21.84px] cursor-pointer pb-4"
                onClick={() => setSelectedTab("listings")}
              >
                Listings
                {selectedTab === "listings" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-4"></div>
                )}
              </div>
              <div
                className="relative text-white text-xs font-semibold leading-[21.84px] cursor-pointer pb-4"
                onClick={() => setSelectedTab("offers")}
              >
                Offers
                {selectedTab === "offers" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-4"></div>
                )}
              </div>
              <div
                className="relative text-white text-xs font-semibold leading-[21.84px] cursor-pointer pb-4"
                onClick={() => setSelectedTab("activity")}
              >
                Activity
                {selectedTab === "activity" && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-4"></div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center p-6 max-w-[1200px] mx-auto h-full mt-8">
            {/* Left Side: Image and Details */}
            <div className="max-w-md min-w-[400px] relative h-fit">
              <img
                src={removeQuery(assetData?.image)}
                alt="Gorilla NFT"
                className="w-full h-full max-h-[480px] object-cover rounded-2xl"
              />
              {assetData?.initializer?.length > 0 && (
                <h5 className="mt-3 text-center font-semibold text-xs px-4 py-2 absolute top-4 left-6 bg-black/50 rounded-md text-white">
                  Owned by{" "}
                  {assetData?.initializer?.slice(0, 4) +
                    "..." +
                    assetData?.initializer?.slice(-4)}
                </h5>
              )}
              <div className="mt-3">
                <div
                  className={`bg-grayscale-21 rounded-md text-white overflow-hidden transition-all duration-300 cursor-pointer h-fit ${
                    openDescription ? "max-h-[500px]" : "max-h-[48px]"
                  }`}
                  onClick={() => setOpenDescription(!openDescription)}
                >
                  <div className="flex justify-between items-center min-h-12 max-h-12 px-4">
                    <p className="text-base font-semibold">
                      About {collectionData?.name}
                    </p>
                    <Image
                      src={ArrowDownImage}
                      className={`transition-transform duration-300 h-6 w-auto object-contain ${
                        openDescription ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <div className="p-4 pt-0 h-fit w-full">
                    <p className="text-xs leading-7 tracking-wide text-dim-gray">
                      {collectionData?.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Payment and Attributes */}
            <div className="ml-8 flex flex-col grow gap-3">
              {/* Payment Options */}

              {/* Pricing Information */}
              <div className="flex items-center justify-between min-h-[106px] max-h-[106px] bg-grayscale-21 rounded-2.5xl px-8">
                <div>
                  <div className="flex items-center gap-4">
                    <h5 className="text-2xl font-bold text-smoke">
                      {assetData?.saleprice /
                        Math.pow(10, chainDetail?.currency_decimal)}{" "}
                      {chainDetail?.currency_symbol}
                    </h5>
                  </div>
                  <p className="text-dim-gray">Best Price</p>
                </div>
                <button
                  className="px-6 py-2 text-white font-medium text-sm bg-green-4 rounded-full"
                  onClick={buyHandler}
                >
                  Buy
                </button>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: (
                      assetData?.saleprice /
                      Math.pow(10, chainDetail?.currency_decimal)
                    )?.toString(),
                    key: "List Price",
                  },
                  { value: collectionData?.floor, key: "Floor Price" },
                  { value: "", key: "Top Offer" },
                ].map((el, index) => (
                  <div
                    key={index}
                    className="py-2 px-4 bg-grayscale-21 min-h-[136px] max-h-[136px] rounded-lg text-center font-semibold text-white flex flex-col items-center justify-center"
                  >
                    <p className="text-xl font-semibold">
                      {el?.value?.length > 0 ? `${el?.value} EDU` : "---"}{" "}
                    </p>
                    <span className="text-xs text-dim-gray">{el?.key}</span>
                  </div>
                ))}
              </div>

              {/* Attributes Section */}
              <div>
                <div
                  className={`bg-grayscale-21 rounded-md text-white overflow-hidden transition-all duration-300 cursor-pointer h-fit ${
                    openAttributes ? "max-h-[500px]" : "max-h-[48px]"
                  }`}
                  onClick={() => setOpenAttributes(!openAttributes)}
                >
                  <div className="flex justify-between items-center min-h-12 max-h-12 px-4">
                    <p className="text-base font-semibold">Attributes</p>
                    <Image
                      src={ArrowDownImage}
                      className={`transition-transform duration-300 h-6 w-auto object-contain ${
                        openAttributes ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {(metadata?.attributes ?? [])?.length <= 0 ? (
                    <p className="font-semibold py-12 text-sm text-center">
                      No attributes found
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mt-1 px-4 pb-4">
                      {(metadata?.attributes ?? []).map((el, index) => (
                        <div
                          key={index}
                          className="py-2 px-4 bg-grayscale-21 border-2 border-solid border-gray-700 min-h-[80px] max-h-[80px] rounded-lg text-center font-semibold text-white flex flex-col items-center justify-center"
                        >
                          <p className="text-xl font-semibold">{el?.value}</p>
                          <span className="text-xs text-dim-gray">
                            {el?.trait_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div
                  className={`bg-grayscale-21 rounded-md text-white overflow-hidden transition-all duration-300 cursor-pointer h-fit ${
                    openDetails ? "max-h-[500px]" : "max-h-[48px]"
                  }`}
                  onClick={() => setOpenDetails(!openDetails)}
                >
                  <div className="flex justify-between items-center min-h-12 max-h-12 px-4">
                    <p className="text-base font-semibold">Details</p>
                    <Image
                      src={ArrowDownImage}
                      className={`transition-transform duration-300 h-6 w-auto object-contain ${
                        openDetails ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <div className="text-white font-medium text-sm p-0 px-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm">
                        Contract Address
                      </h5>
                      <p className="font-semibold text-xs flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              collectionData?.token_address
                            );
                            toast.dismiss();
                            toast.success("Address copied to clipboard");
                          }}
                        >
                          <FaRegCopy
                            size={14}
                            className="text-[#d6d6d6] hover:text-[#9f9f9f] transition-all duration-200"
                          />
                        </button>
                        {collectionData?.token_address?.slice(0, 6) +
                          "..." +
                          collectionData?.token_address?.slice(-6)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm">Token ID</h5>
                      <p className="font-semibold text-xs">
                        {router?.query?.tokenId}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm">Token Standard</h5>
                      <p className="font-semibold text-xs">
                        {collectionData?.erc1155 ? "ERC - 1155" : "ERC - 721"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-sm">Owner</h5>
                      <p className="font-semibold text-xs flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              assetData?.initializer
                            );
                            toast.dismiss();

                            toast.success("Address copied to clipboard");
                          }}
                        >
                          <FaRegCopy
                            size={14}
                            className="text-[#d6d6d6] hover:text-[#9f9f9f] transition-all duration-200"
                          />
                        </button>
                        {assetData?.initializer?.slice(0, 6) +
                          "..." +
                          assetData?.initializer?.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default index;
