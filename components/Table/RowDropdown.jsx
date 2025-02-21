"use client";
import { ModalContext } from "@/context/ModalContext";
import { useRouter } from "next/router";
import placeOffer from "../../public/images/placeOffer.svg";
import React, { useContext, useMemo, useState } from "react";
import { RowDropdownButton } from "../Reusables/loan/Button";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { HederaContext } from "@/context/HederaContext";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import {
  hederaAcceptOffer,
  hederaCancelOffer,
  removeDeci,
} from "@/utils/hashConnectProvider";
import { PoolManagerContext } from "@/context/PoolManagerContext";
// import { UserNftContext } from "@/context/UserNftContext";
import { AccountId } from "@hashgraph/sdk";
import { evmAcceptOffer, evmNftCancel } from "@/utils/evmProvider";
import { useSigner } from "@/context/SignerContext";
import Loader from "../Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

export const RowDropdown = ({
  open,
  selectedDays,
  setSelectedDays,
  rowData,
  mainRow,
  pagename,
}) => {
  const [offerState, setOfferState] = useState("avalible");
  const [showTooltip, setShowTooltip] = useState(true);
  const [showTooltip2, setShowTooltip2] = useState(true);
  const router = useRouter();
  const {
    setOpenModal,
    setLendData,
    setModalType,
    setBorrowData,
    setRequestBorrowData,
    setCounterData,
    setViewData,
  } = useContext(ModalContext);
  const { selectedChain, chainDetail, collections, setCollectionId } =
    useContext(ChainContext);
  const wallet = useWallet();
  const { isPaired } = useContext(HederaContext);
  const { isConnected, address } = useUserWalletContext();
  const [loading, setLoading] = useState(false);
  const { signer: walletSigner } = useSigner();
  const { checkLoginValidity } = useUserWalletContext();

  const {
    nftSignal,
    setNftSignal,
    nftPoolData,
    load,
    poolSignal,
    setPoolSignal,
  } = useContext(PoolManagerContext);

  const availableDuration = useMemo(() => {
    const durations = rowData.offers
      ?.map(({ loanDurationInMinutes }) => loanDurationInMinutes)
      ?.sort((a, b) => a - b);

    return [...new Set(durations)];
  }, [rowData.offers]);

  const handelModelOpen = async (item) => {
    const isUserValid = await checkLoginValidity();

    if (!isUserValid) return;
    if (chainDetail?.chain_id == "solana") {
      if (!wallet.connected) return toast.error("Please connect your wallet");
      if (router.pathname.includes("borrow")) {
        setModalType("borrow");
        setCollectionId(rowData?.pool?.tokenAddress);
        setBorrowData({ ...item, ...rowData });
        setOpenModal(true);
      }
      if (router.pathname.includes("lend")) {
        setModalType("lend");
        setLendData({ ...item, ...rowData });
        setOpenModal(true);
      }
    } else if (chainDetail?.chain_id == "296") {
      if (!isPaired) {
        return toast.error("Please connect your wallet");
      }
      if (router.pathname.includes("borrow")) {
        setModalType("borrow");
        setBorrowData({ ...item, ...rowData });
      } else if (router.pathname.includes("lend")) {
        setModalType("lend");
        setLendData({ ...item, ...rowData });
      }

      setOpenModal(true);
    } else if (selectedChain === "xrp") {
      if (router.pathname.includes("borrow")) {
        setModalType("borrow");
        setBorrowData({ ...item, ...rowData });
      } else if (router.pathname.includes("lend")) {
        setModalType("lend");
        setLendData({ ...item, ...rowData });
      }

      setOpenModal(true);
    } else {
      if (router.pathname.includes("borrow")) {
        setModalType("borrow");
        setCollectionId(rowData?.pool?.tokenAddress);
        setBorrowData({ ...item, ...rowData });
      } else if (router.pathname.includes("lend")) {
        setModalType("lend");
        setLendData({ ...item, ...rowData });
      }

      setOpenModal(true);
    }
  };

  const handleCounterOpen = async (item) => {
    const isUserValid = await checkLoginValidity();

    if (!isUserValid) return;

    if (chainDetail?.chain_id == "solana") {
      if (!wallet.connected) return toast.error("Please connect your wallet");
      if (router.pathname.includes("borrow")) {
        setModalType("view");
        setViewData(item);
        setOpenModal(true);
      }
      if (router.pathname.includes("lend")) {
        setModalType("counter");
        setCounterData(item);
        setOpenModal(true);
      }
    } else if (chainDetail?.chain_id == "296") {
      if (!isPaired) {
        return toast.error("Please connect your wallet");
      }
      if (router.pathname.includes("borrow")) {
        setModalType("view");
        setViewData(item);
      } else if (router.pathname.includes("lend")) {
        setModalType("counter");
        setCounterData(item);
      }

      setOpenModal(true);
    } else if (selectedChain === "xrp") {
      if (router.pathname.includes("borrow")) {
        setModalType("view");
        setViewData(item);
      } else if (router.pathname.includes("lend")) {
        setModalType("counter");
        setCounterData(item);
      }

      setOpenModal(true);
    } else {
      if (router.pathname.includes("borrow")) {
        setModalType("view");
        setViewData(item);
      } else if (router.pathname.includes("lend")) {
        setModalType("counter");
        setCounterData(item);
      }

      setOpenModal(true);
    }
  };

  const handelRequestModelOpen = async () => {
    const isUserValid = await checkLoginValidity();

    if (!isUserValid) return;

    if (chainDetail?.chain_id == "296") {
      if (!isPaired) {
        return toast.error("Please connect your wallet");
      } else {
        setModalType("request");
        setRequestBorrowData(rowData?.pool?.tokenAddress);
        setCollectionId(rowData?.pool?.tokenAddress);
        setOpenModal(true);
      }
    } else {
      setModalType("request");
      setRequestBorrowData(rowData?.pool?.tokenAddress);
      setCollectionId(rowData?.pool?.tokenAddress);
      setOpenModal(true);
    }
  };

  // console.log({ rowData });
  const handleAcceptOffer = async (nftPool) => {
    const isUserValid = await checkLoginValidity();

    if (!isUserValid) return;
    setLoading(true);
    try {
      const matchingCollection = collections.find(
        (collection) => collection.token_address == nftPool.tokenAddress
      );
      //
      if (chainDetail?.chain_id == "296") {
        await hederaAcceptOffer(
          nftPool.tokenAddress,
          nftPool.tokenId,
          Number(nftPool.bidAmount),
          nftPool.chainId,
          nftPool.loanDurationInMinutes * 60 +
            Math.floor(new Date().getTime() / 1000),
          chainDetail?.native_address
        );
      } else if (chainDetail?.evm && selectedChain) {
        const signer = walletSigner;

        const resp = await evmAcceptOffer(
          nftPool?.tokenAddress,
          nftPool?.tokenId,
          nftPool?.index,
          nftPool?.chainId,
          Number(nftPool?.bidAmount),
          nftPool.loanDurationInMinutes * 60 +
            Math.floor(new Date().getTime() / 1000),
          signer,
          address,
          chainDetail.contract_address,
          matchingCollection?.payment_token
        );

        if (resp) {
          setLoading(false);
          setPoolSignal(poolSignal + 1);
          setNftSignal(nftSignal + 1);
        }
      }
    } catch (error) {
      console.error("Error accepting offer:", { error });
      setLoading(false);
    }
  };

  const handleCancelOffer = async (nftPool) => {
    const isUserValid = await checkLoginValidity();

    if (!isUserValid) return;
    setLoading(true);
    try {
      if (chainDetail?.chain_id == "296") {
        await hederaCancelOffer(
          nftPool?.tokenAddress,
          nftPool?.tokenId,
          nftPool?.chainId,
          chainDetail?.native_address
        );
      } else {
        const signer = walletSigner;
        const res = await evmNftCancel(
          nftPool?.tokenAddress,
          nftPool?.tokenId,
          nftPool?.chainId,
          signer,
          chainDetail?.contract_address,
          Number(nftPool?.index)
        );

        if (res) {
          setPoolSignal(poolSignal + 1);
          setNftSignal(nftSignal + 1);
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);

      console.error("Error cancelling offer:", error);
    }
  };

  const hashconnectData = JSON.parse(localStorage.getItem("hashconnectData"));

  if (
    hashconnectData &&
    hashconnectData.pairingData &&
    hashconnectData.pairingData.length > 0
  ) {
    const length = hashconnectData.pairingData.length;
    const accountIds = hashconnectData.pairingData[length - 1]?.accountIds;

    if (accountIds && accountIds.length > 0) {
      const firstAccountId = accountIds[0];

      if (firstAccountId) {
        initializer1 =
          "0x" +
          AccountId.fromString(firstAccountId).toSolidityAddress().toString();
      }
    }
  }

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  const closeTooltip2 = () => {
    setShowTooltip2(false);
  };

  // console.log({ rowData, nftPoolData });

  return (
    <>
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div
          style={{
            height: open ? "400px" : "0",
          }}
          className={`${
            open ? " table-drop h-[300px] px-6 py-6 mb-12" : "h-0 py-0 px-6"
          } w-full origin-top h-20 transition-all duration-200 overflow-hidden bg-table-dropdown rounded-md`}
        >
          <div className="h-fit w-full flex justify-between items-center">
            <div className="flex flex-row gap-4 py-2">
              <h5
                className={`font-medium text-xl cursor-pointer font-numans ${
                  offerState == "avalible" ? "text-green" : "text-white"
                }`}
                onClick={() => {
                  setOfferState("avalible");
                  analytics.track(
                    `dapp_loan_tab_${pagename}_${rowData?.[0]?.collection_name}_drop-down_nft_listing_offers`
                  );
                }}
              >
                Offers
              </h5>

              <h5 className="font-numans font-medium  text-xl cursor-pointer text-green">
                /
              </h5>
              <h5
                onClick={() => {
                  setOfferState("request");
                  analytics.track(
                    `dapp_loan_tab_${pagename}_${rowData?.[0]?.collection_name}_drop-down_nft_listing`
                  );
                }}
                className={`flex flex-row items-center gap-3 font-numans font-medium text-xl cursor-pointer ${
                  offerState === "request" ? "text-green" : "text-white"
                }`}
              >
                NFT Listing
              </h5>
              <div className="tooltip">
                {router.pathname.includes("borrow")
                  ? showTooltip && (
                      <div className="tooltiptext">
                        <span onClick={closeTooltip} className="close-btn">
                          &#10006;
                        </span>
                        <p className="font-numans text-xs font-normal">
                          Didn't find preferred loan terms? Create a custom
                          offer here
                        </p>
                      </div>
                    )
                  : showTooltip2 && (
                      <div className="tooltiptext">
                        <span onClick={closeTooltip2} className="close-btn">
                          &#10006;
                        </span>
                        <p className="font-numans text-xs font-normal">
                          Check out custom loan requests from Borrowers here
                        </p>
                      </div>
                    )}
              </div>
            </div>
            {offerState == "avalible" ? (
              <div className="w-fit h-fit flex gap-2 p-2">
                <div
                  key={"All"}
                  className={`${
                    selectedDays === -1
                      ? "bg-green-4 text-white border-green-4"
                      : "bg-transparent text-row-dropdown-subscript border-row-dropdown-subscript text-[#656565] border-[#656565]"
                  } flex items-center justify-center px-3 py-1 border-solid border-2 rounded-full cursor-pointer  font-numans font-normal`}
                  onClick={() => {
                    setSelectedDays(-1);
                    analytics.track(
                      `dapp_loan_tab_${pagename}_${rowData?.[0]?.collection_name}_drop-down_offers_ALL`
                    );
                  }}
                >
                  <h5 className="text-base font-numans font-normal">ALL</h5>
                </div>
                {availableDuration.map((item, index) => (
                  <div
                    key={index}
                    className={`${
                      selectedDays === index
                        ? "bg-green-4 text-white border-green-4"
                        : "bg-transparent text-row-dropdown-subscript border-row-dropdown-subscript text-[#656565] border-[#656565]"
                    } flex items-center justify-center px-3 py-1 border-solid border-2  rounded-full cursor-pointer font-numans font-normal`}
                    onClick={() => {
                      analytics.track(
                        `dapp_loan_tab_${pagename}_${
                          rowData?.[index]?.collection_name
                        }_drop-down_offers_${availableDuration?.[index] / 1440}`
                      );
                      setSelectedDays(index);
                    }}
                  >
                    <h5 className="text-base font-numans font-normal">
                      {item / 1440} D
                    </h5>
                  </div>
                ))}
              </div>
            ) : router.pathname.includes("borrow") ? (
              <div className="my-3">
                <button
                  type="button"
                  className="text-white bg-[#30b750] font-numans  font-medium rounded-lg text-sm py-[10px] px-[12px] flex flex-row items-center gap-2"
                  onClick={() => {
                    handelRequestModelOpen(rowData);
                    analytics.track(
                      `dapp_loan_tab_borrow_${rowData?.[0]?.collection_name}_drop-down_nft_listing_new_offer`
                    );
                  }}
                >
                  Place Offer
                  <Image src={placeOffer} alt="place offer" />
                </button>
              </div>
            ) : null}
          </div>
          {offerState == "avalible" ? (
            <div className="h-64 overflow-auto w-full pr-8 mt-4">
              <div className="w-full bg-dark-gray sticky top-0 z-[100] rounded-t-xl">
                <div className="flex w-3/4 justify-between rounded-md p-4 text-white text-center">
                  {/* <h5 className="w-[200px] font-poppins text-sm font-semibold">
                Total Liquidity
              </h5> */}
                  <h5 className="w-[200px] font-numans text-sm font-normal">
                    Best Offer
                  </h5>
                  <h5 className="w-[100px] font-numans text-sm font-normal">
                    {router.pathname.includes("borrow") ? "Interest" : "APY"}
                  </h5>
                  <h5 className="w-[100px] font-numans text-sm font-normal">
                    Duration
                  </h5>
                </div>
              </div>
              {rowData?.offers
                ?.filter((item) => {
                  return (
                    (item.loanDurationInMinutes ==
                      availableDuration[selectedDays] ||
                      selectedDays === -1) &&
                    (Number(item.totalBids) > 0 ||
                      router.pathname.includes("lend"))
                  );
                })
                .map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-full justify-between py-4 px-4 bg-table-row-2 "
                    >
                      <div className="flex w-3/4 justify-between text-white font-normal pr-2">
                        <div
                          className={`text-white font-numans text-center pl-4 w-[200px]`}
                        >
                          {Number(item.bidAmount) !== 0 ? (
                            <>
                              <h5 className="font-normal text-sm text-white">
                                {selectedChain
                                  ?.toLowerCase()
                                  ?.includes("hedera")
                                  ? removeDeci(Number(item.bidAmount))
                                  : Number(item.bidAmount) /
                                    Math.pow(10, chainDetail?.currency_decimal)}
                                <img
                                  src={
                                    chainDetail?.currency_image_url ??
                                    "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                                  }
                                  alt="Chain symbol"
                                  className="ml-2 inline"
                                  height={
                                    chainDetail?.chain_id == "solana" ? 15 : 25
                                  }
                                  width={20}
                                />
                              </h5>
                              <p className="text-xs font-normal text-table-row-subscript">
                                {removeDeci(
                                  Number(item.lastLoanAmount) /
                                    Math.pow(10, chainDetail?.currency_decimal)
                                )}{" "}
                                last loan taken
                              </p>
                            </>
                          ) : (
                            <>
                              <h5
                                className={`font-numans font-semibold text-sm text-white `}
                              >
                                Awaiting Lenders
                              </h5>
                              <p className="text-xs font-normal text-table-row-subscript">
                                {removeDeci(
                                  Number(item.lastLoanAmount) /
                                    Math.pow(10, chainDetail?.currency_decimal)
                                )}{" "}
                                last loan taken
                              </p>
                            </>
                          )}
                        </div>
                        {router.pathname.includes("borrow") ? (
                          <div className="w-[100px] font-numans text-center">
                            {item.bidAmount && rowData?.totalLiquidity ? (
                              <h5 className="text-white text-sm font-normal">
                                {selectedChain == "Solana"
                                  ? item.interest /
                                    Math.pow(10, chainDetail?.currency_decimal)
                                  : chainDetail?.chain_id == "296"
                                  ? removeDeci(
                                      item.interest /
                                        Math.pow(
                                          10,
                                          chainDetail?.currency_decimal
                                        )
                                    )
                                  : item.interest /
                                    Math.pow(10, chainDetail?.currency_decimal)}
                              </h5>
                            ) : (
                              <h5>-</h5>
                            )}
                            <p className="text-xs font-normal text-table-row-subscript whitespace-nowrap">
                              {removeDeci(item.interestRate)} % interest
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-3 items-center w-[100px]">
                            <h5 className=" text-white text-sm">
                              {removeDeci(rowData?.pool?.apy)} %
                            </h5>
                          </div>
                        )}

                        <h5 className="w-[100px] text-center flex items-center justify-center text-sm">
                          {removeDeci(item.loanDurationInMinutes / 1440)} D
                        </h5>
                      </div>
                      {router.pathname.includes("borrow") ? (
                        item.bidAmount && item.loanDurationInMinutes ? (
                          <RowDropdownButton
                            onClick={() => {
                              const trackingParam =
                                pagename === "lend"
                                  ? rowData?.pool?.apy
                                  : pagename === "borrow"
                                  ? item.interest
                                  : "";

                              analytics.track(
                                `dapp_loan_tab_${pagename}_${
                                  rowData?.pool?.collectionName
                                }_drop-down_offers_${trackingParam}_${
                                  item.loanDurationInMinutes / 1440
                                }_${pagename}`
                              );

                              handelModelOpen(item);
                            }}
                            className="text-[#5FD37A] mr-24 text-center"
                          >
                            {pagename === "borrow" ? "Borrow" : "Lend"}
                          </RowDropdownButton>
                        ) : (
                          <h5 className="text-white grow flex items-center justify-center text-sm font-normal">
                            -
                          </h5>
                        )
                      ) : (
                        <RowDropdownButton
                          onClick={() => {
                            const trackingParam =
                              pagename === "lend"
                                ? item.apy
                                : pagename === "borrow"
                                ? item.interestRate
                                : "";
                            analytics.track(
                              `dapp_loan_tab_${pagename}_${
                                rowData?.pool?.collectionName
                              }_drop-down_offers_${trackingParam}_${
                                item.loanDurationInMinutes / 1440
                              }_${pagename}`
                            );

                            handelModelOpen(item);
                          }}
                          className="text-[#5FD37A] mr-24 text-center"
                        >
                          {item.btnVal ? item.btnVal : "Lend"}
                        </RowDropdownButton>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="h-64 w-full pr-8  ">
              <div className="font-numans text-sm text-white font-light py-2">
                NFT listings are offers put up by borrowers looking for a loan
                on their terms
              </div>

              <div className="w-full  bg-dark-gray sticky top-0 z-[100] rounded-t-xl">
                <div className="flex w-3/4 justify-between rounded-md p-4 text-white pl-[70px]">
                  <h5 className="w-[200px] font-numans text-sm font-normal">
                    NFT
                  </h5>
                  <h5 className="w-[100px] font-numans text-sm font-normal">
                    Best Offer
                  </h5>
                  <h5 className="w-[100px] font-numans text-sm font-normal">
                    Interest
                  </h5>
                  <h5 className="w-[100px] font-numans text-sm font-normal">
                    Duration
                  </h5>
                </div>
              </div>
              <div className="w-full h-[200px] overflow-y-auto">
                {nftPoolData?.map((nftPool, index) => {
                  if (nftPool?.active && address) {
                    if (
                      router.pathname.includes("borrow") &&
                      nftPool?.tokenAddress?.toLowerCase() ===
                        rowData?.pool?.tokenAddress.toLowerCase() &&
                      nftPool?.initializerKey?.toLowerCase() ===
                        address?.toLowerCase()
                    ) {
                      return (
                        <div
                          key={index}
                          className="flex w-full justify-between py-5 px-4 text-white bg-table-row-2"
                        >
                          <div className="flex w-3/4 justify-between rounded-md text-white pl-[50px]">
                            <div className="text-white font-numans items-start  w-[200px]  ">
                              <div className="flex-row items-center  flex">
                                <img
                                  src={nftPool?.image}
                                  className="h-[30px] w-[30px] rounded-full"
                                  alt="Chain symbol"
                                />
                                <div>
                                  <p className="ml-2 text-sm font-normal md:whitespace-nowrap">
                                    {nftPool.name === "null"
                                      ? null
                                      : nftPool.name}
                                  </p>
                                  <p className="ml-2 text-[10px] font-normal">
                                    TokenId: #{nftPool.tokenId}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="  text-white font-numans text-sm  w-[100px] pr-2 text-center flex items-center justify-center ">
                              <p>
                                {removeDeci(
                                  Number(nftPool.bidAmount) /
                                    Math.pow(10, chainDetail?.currency_decimal)
                                )}
                                <img
                                  src={
                                    chainDetail?.currency_image_url ??
                                    "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                                  }
                                  alt="Chain symbol"
                                  className="ml-2 inline"
                                  height={
                                    chainDetail?.chain_id == "solana" ? 15 : 25
                                  }
                                  width={20}
                                />
                              </p>
                            </div>
                            <div className="text-white font-numans text-sm  w-[100px]  flex items-center justify-center pr-10  ">
                              <p>
                                {router.pathname.includes("borrow")
                                  ? removeDeci(
                                      Number(nftPool.interestRateLender) / 1000
                                    )
                                  : removeDeci(
                                      Number(nftPool.interestRateLender) / 1000
                                    )}{" "}
                                %
                              </p>
                            </div>
                            <div className="text-white font-numans flex items-center justify-center text-sm  pr-12 w-[100px]">
                              <p>
                                {removeDeci(
                                  nftPool.loanDurationInMinutes / 1440
                                )}{" "}
                                D
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-[30px] mr-6">
                            {router.pathname.includes("borrow") ? (
                              <>
                                <RowDropdownButton
                                  onClick={() => {
                                    handleCounterOpen(nftPool);
                                  }}
                                  className="text-[#5FD37A]"
                                >
                                  View
                                </RowDropdownButton>
                                <RowDropdownButton
                                  onClick={() => handleCancelOffer(nftPool)}
                                  className="text-[#FDA4A4]"
                                >
                                  Cancel
                                </RowDropdownButton>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    } else if (
                      !router.pathname.includes("borrow") &&
                      nftPool?.tokenAddress?.toLowerCase() ===
                        rowData?.pool?.tokenAddress.toLowerCase()
                    ) {
                      return (
                        <div
                          key={index}
                          className="flex w-full justify-between py-5 px-4 text-white bg-table-row-2"
                        >
                          <div className="flex w-3/4 justify-between rounded-md text-white pl-[50px]">
                            <div className="text-white font-numans items-start  w-[200px]  ">
                              <div className="flex-row items-center  flex">
                                <img
                                  src={nftPool.image}
                                  className="h-[30px] w-[30px] rounded-full"
                                  alt="Chain symbol"
                                />
                                <div>
                                  <p className="ml-2 text-sm font-normal">
                                    {nftPool.name === "null"
                                      ? null
                                      : nftPool.name}
                                  </p>
                                  <p className="ml-2 text-[10px] font-normal">
                                    TokenId: #{nftPool.tokenId}
                                  </p>{" "}
                                </div>
                              </div>
                            </div>
                            <div className="  text-white font-numans text-sm  w-[100px] pr-2 text-center flex items-center justify-center ">
                              <p>
                                {removeDeci(
                                  Number(nftPool.bidAmount) /
                                    Math.pow(10, chainDetail?.currency_decimal)
                                )}
                                <img
                                  src={
                                    chainDetail?.currency_image_url ??
                                    "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                                  }
                                  alt="Chain symbol"
                                  className="ml-2 inline"
                                  height={
                                    chainDetail?.chain_id == "solana" ? 15 : 25
                                  }
                                  width={20}
                                />
                              </p>
                            </div>
                            <div className="text-white font-numans text-sm  w-[120px]  flex items-center justify-center pr-12  ">
                              <p>
                                {removeDeci(nftPool.interestRateLender) / 1000}{" "}
                                %
                              </p>
                            </div>
                            <div className="text-white font-numans  w-[100px] flex items-center justify-center text-sm  pr-12">
                              <p>
                                {removeDeci(
                                  nftPool.loanDurationInMinutes / 1440
                                )}{" "}
                                D
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-center gap-[30px] mr-24">
                            {!router.pathname.includes("borrow") &&
                              nftPool?.initializerKey?.toLowerCase() !==
                                address?.toLowerCase() && (
                                <>
                                  <RowDropdownButton
                                    onClick={() => handleAcceptOffer(nftPool)}
                                    className="text-[#5FD37A]"
                                  >
                                    Accept
                                  </RowDropdownButton>
                                  {/* <RowDropdownButton
                                onClick={() => {
                                  handleCounterOpen(nftPool);
                                }}
                                className="text-[#FDA4A4]"
                              >
                                Counter
                              </RowDropdownButton> */}
                                </>
                              )}
                          </div>
                        </div>
                      );
                    }
                  } else {
                    return <></>;
                  }
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
