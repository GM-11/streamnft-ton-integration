import { ModalContext } from "@/context/ModalContext";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cancelOffer, removeDeci } from "@/utils/hashConnectProvider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { cancelBidManager } from "streamnft-sol-test";
import Image from "next/image";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { LoanCard } from "@/components/MobileComponents/LoanCard/LoanCard";
import EditModal from "@/components/MobileComponents/Modals/EditModal/EditModal";
import { cancelxrpOffer } from "@/utils/xrpProvider";
import { ChainContext } from "@/context/ChainContext";
import { evmCancelOffer } from "@/utils/evmProvider";
import txnsIcon from "../../../public/images/Txns.svg";
import editIcon from "../../../public/images/editLogo.svg";
import { cancelProposedOffer, postCancelOffer } from "@/utils/apiRequests";
import { useSigner } from "@/context/SignerContext";
import { PublicKey } from "@metaplex-foundation/js";
import { TableButton } from "@/components/Reusables/loan/Button";
import { AccountId } from "@hashgraph/sdk";
import { UserNftContext } from "@/context/UserNftContext";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";

const OffersRow = ({ rowData, pagename, setLoading, rowCount }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const isBigScreen = useMediaQuery();
  const [showOffersEditModal, setShowOffersEditModal] = useState(false);
  const { setOpenModal, setModalType, setEditData, setClaimData } =
    useContext(ModalContext);
  const { setManagerSignal, managerSignal, poolSignal, setPoolSignal } =
    useContext(PoolManagerContext);
  const { chainDetail, setUpdateCollectionsSignal } = useContext(ChainContext);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const { checkLoginValidity, setIsTransactionOngoing, setIsTokenValid } =
    useUserWalletContext();
  const { address } = useUserWalletContext();
  const { signer: walletSigner } = useSigner();

  const wallet = useWallet();

  const handleClose = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      try {
        setIsTransactionOngoing(true);
        const { bidPoolIndex, bidManagerIndex } = rowData;
        setLoading(true);
        let response;

        switch (chainDetail?.chain_id) {
          case "solana": {
            const biddingPoolPda = new PublicKey(bidPoolIndex);
            const bidManagerPda = new PublicKey(bidManagerIndex);

            response = await cancelBidManager(bidManagerPda, biddingPoolPda);

            if (response?.success) {
              await postCancelOffer(
                bidPoolIndex,
                bidManagerIndex,
                chainDetail.chain_id,
                chainDetail.contract_address,
                response.data,
                wallet.publicKey.toBase58()
              );
              // toast.success("Offer Closed successfully!");
            } else {
              throw new Error("Transaction Failed!");
            }
            break;
          }

          case "296": {
            await cancelOffer(
              bidPoolIndex,
              bidManagerIndex,
              chainDetail.chain_id,
              chainDetail.contract_address,
              chainDetail.native_address
            );
            // toast.success("Offer Closed successfully!");
            break;
          }

          case "xrp": {
            const { bidPool, bidManager } = rowData;
            await cancelxrpOffer(
              bidPool?.bidPoolIndex,
              bidManager?.bidManagerIndex,
              bidManager?.bidAmount
            );
            // toast.success("Offer Closed successfully!");
            break;
          }

          default: {
            if (chainDetail?.evm) {
              const signer = walletSigner;

              await evmCancelOffer(
                bidPoolIndex,
                bidManagerIndex,
                chainDetail?.chain_id,
                signer,
                chainDetail?.contract_address,
                address,
                reloadNftCacheCall
              );
            }
          }
        }

        setIsTransactionOngoing(false);
        setManagerSignal(managerSignal + 1);
        setUpdateCollectionsSignal((prev) => !prev);
        setPoolSignal(poolSignal + 1);
      } catch (error) {
        setIsTransactionOngoing(false);
        setLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    setModalType("edit");
    setEditData(rowData);

    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      if (isBigScreen) {
        setOpenModal(true);
      } else {
        setShowOffersEditModal(true);
      }
    }
  };

  const handleClaim = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      setModalType("claim");
      setClaimData(rowData);
      setOpenModal(true);
    }
  };

  useEffect(() => {
    if (!rowData?.loanExpiry) return;

    const targetTime = rowData.loanExpiry * 1000;

    const updateCountdown = () => {
      const currentTime = Date.now();
      const diff = targetTime - currentTime;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      const time = `${days > 0 ? `${days}D ` : ""}${
        hours > 0 || days > 0 ? `${hours}H ` : ""
      }${minutes}M`;

      setTimeRemaining(time);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [rowData]);

  if (isBigScreen)
    return (
      <div className="bg-table-row-2 relative px-6 mt-3 -mb-1">
        <div className="w-1 h-full absolute left-0 bg-green" />
        <div className="w-full flex h-16 items-center">
          <div className="w-[210px] flex ">
            <img
              src={rowData?.collection_logo}
              alt=""
              className="h-8 w-8 object-cover rounded-full"
            />
            <span className="flex justify-center flex-col ml-3 md:whitespace-nowrap">
              <h5 className="text-white text-sm text-center font-numans">
                {rowData?.collection_name?.length > 15
                  ? `${rowData?.collection_name?.slice(0, 15)}...`
                  : rowData?.collection_name}
              </h5>

              <p className="text-xs font-normal text-table-row-subscript text-left md:whitespace-nowrap">
                Floor :{" "}
                {rowData?.floor ? rowData.floor : rowData?.bidPool?.floor}
              </p>
            </span>
          </div>
          <div className="text-white font-numans pl-6  w-[200px] text-center">
            <h5
              className={`font-normal text-xs md:whitespace-nowrap items-center ${
                rowData?.status === "Active"
                  ? "text-[#5FD37A]"
                  : rowData?.status === "Defaulted"
                  ? "text-[#FECA00]"
                  : "text-[#8AC4FF]"
              }`}
            >
              {rowData?.status === "Active" ? (
                <span>
                  <span className="text-white">Expires in </span>
                  <span className="text-[#faa2a2]">{timeRemaining}</span>
                </span>
              ) : (
                rowData?.status
              )}
            </h5>
          </div>
          <div className="text-white font-numans pl-12 text-center w-[160px] md:whitespace-nowrap ">
            <h5 className="font-normal text-sm text-white">
              {chainDetail?.chain_id == "solana"
                ? rowData?.offer / Math.pow(10, chainDetail?.currency_decimal)
                : chainDetail?.chain_id == "296"
                ? rowData?.status == "Awaiting buyer"
                  ? (rowData?.offer /
                      Math.pow(10, chainDetail?.currency_decimal)) *
                    (rowData?.totalBids
                      ? rowData.totalBids
                      : rowData?.bidManager?.totalBids
                      ? rowData.bidManager.totalBids
                      : 1)
                  : rowData?.offer / Math.pow(10, chainDetail?.currency_decimal)
                : rowData?.offer / Math.pow(10, chainDetail?.currency_decimal)}

              <img
                src={
                  chainDetail?.currency_image_url ??
                  "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                }
                alt="Chain symbol"
                className="ml-2 inline"
                height={chainDetail?.chain_id == "solana" ? 15 : 25}
                width={20}
              />
            </h5>
            <p className="text-xs font-normal text-table-row-subscript text-center">
              Total Offers :{" "}
              {rowData?.status === "Awaiting buyer"
                ? rowData?.totalBids
                  ? rowData.totalBids
                  : rowData?.bidManager?.totalBids
                  ? rowData.bidManager.totalBids
                  : 1
                : 1}
            </p>
          </div>

          <div className="  w-[160px] pl-12 text-white text-center font-numans  font-normal flex justify-center items-center text-sm ">
            <h5>{removeDeci(Number(rowData?.apy)) + " %"}</h5>
          </div>
          <div className="w-[160px] pl-16 text-white text-center font-normal text-sm">
            <h5>{removeDeci(Number(rowData?.duration) / 1440) + " D"}</h5>
          </div>
          <div className="w-[160px] pl-12 cursor-pointer text-white items-center flex justify-center font-normal">
            <a
              href={rowData?.txLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                // Track link click event
                analytics.track(
                  `dapp_loan_tab_offers_${rowData?.collection_name}_view_txn`,
                  {
                    txLink: rowData?.txLink,
                  }
                );
              }}
            >
              <Image src={txnsIcon} alt="txn" className="w-7 h-7" />
            </a>
          </div>

          <div className="flex flex-row items-center justify-end w-[200px]  ">
            {rowData.status == "Awaiting buyer" ? (
              <>
                <div className="gap-5 cursor-pointer text-white  flex justify-center items-center">
                  <Image
                    src={editIcon}
                    alt="edit"
                    className="w-7 h-7"
                    onClick={() => {
                      handleEdit();
                      analytics.track(
                        `dapp_loan_tab_offers_${rowData?.collection_name}_edit`
                      );
                    }}
                  />
                  <TableButton
                    onClick={() => {
                      handleClose();
                      analytics.track(
                        `dapp_loan_tab_offers_${rowData?.collection_name}_cancel`
                      );
                    }}
                    id={`${rowData?.btnVal}-${rowCount}`}
                    className="!border-none !bg-[#FA6F6F] !text-white py-2 px-4  !flex !flex-row !items-center !gap-3"
                  >
                    {rowData.btnVal}
                    <svg
                      width="21"
                      height="20"
                      viewBox="0 0 21 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.6667 14.1663H11.3333M17.9908 8.33301C18 8.81386 18 9.3634 18 9.99967C18 12.3332 18 13.5 17.5459 14.3913C17.1464 15.1753 16.509 15.8127 15.725 16.2122C14.8337 16.6663 13.6669 16.6663 11.3333 16.6663H9.66667C7.33311 16.6663 6.16634 16.6663 5.27504 16.2122C4.49103 15.8127 3.85361 15.1753 3.45414 14.3913C3 13.5 3 12.3332 3 9.99967C3 9.3634 3 8.81386 3.00921 8.33301M17.9908 8.33301C17.9662 7.05032 17.8762 6.25632 17.5459 5.60805C17.1464 4.82404 16.509 4.18662 15.725 3.78715C14.8337 3.33301 13.6669 3.33301 11.3333 3.33301H9.66667C7.33311 3.33301 6.16634 3.33301 5.27504 3.78715C4.49103 4.18662 3.85361 4.82404 3.45414 5.60805C3.12383 6.25632 3.03376 7.05032 3.00921 8.33301M17.9908 8.33301H3.00921"
                        stroke="#F1FCF3"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </TableButton>
                </div>
              </>
            ) : rowData.status == "Defaulted" ? (
              <div className="gap-10 cursor-pointer text-white  flex justify-end items-center ">
                <TableButton
                  onClick={() => handleClaim()}
                  className="!border-none !bg-[#39ba57] !text-white py-2 px-[1.4rem] !flex !flex-row !items-center  !gap-3"
                  id={`${rowData?.btnVal}-${rowCount}`}
                >
                  {rowData.btnVal}
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 14.1663H11.3333M17.9908 8.33301C18 8.81386 18 9.3634 18 9.99967C18 12.3332 18 13.5 17.5459 14.3913C17.1464 15.1753 16.509 15.8127 15.725 16.2122C14.8337 16.6663 13.6669 16.6663 11.3333 16.6663H9.66667C7.33311 16.6663 6.16634 16.6663 5.27504 16.2122C4.49103 15.8127 3.85361 15.1753 3.45414 14.3913C3 13.5 3 12.3332 3 9.99967C3 9.3634 3 8.81386 3.00921 8.33301M17.9908 8.33301C17.9662 7.05032 17.8762 6.25632 17.5459 5.60805C17.1464 4.82404 16.509 4.18662 15.725 3.78715C14.8337 3.33301 13.6669 3.33301 11.3333 3.33301H9.66667C7.33311 3.33301 6.16634 3.33301 5.27504 3.78715C4.49103 4.18662 3.85361 4.82404 3.45414 5.60805C3.12383 6.25632 3.03376 7.05032 3.00921 8.33301M17.9908 8.33301H3.00921"
                      stroke="#F1FCF3"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </TableButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  else {
    return (
      <>
        <LoanCard
          setShowOffersEditModal={setShowOffersEditModal}
          handleClose={handleClose}
          handleEdit={handleEdit}
          handleClaim={handleClaim}
          btnVal={rowData.btnVal}
          loanStatus={rowData.status}
          totalOffersByYou={
            rowData?.status == "Awaiting buyer"
              ? rowData?.totalBids
                ? rowData.totalBids
                : rowData?.bidManager?.totalBids
                ? rowData.bidManager.totalBids
                : 1
              : 1
          }
          key={rowData?.collection_name}
          apy={Number(rowData.apy)}
          image={rowData?.collection_logo}
          name={rowData?.collection_name}
          duration={Number(rowData.duration) / 1440}
          floorPrice={rowData?.floor ? rowData?.floor : rowData?.bidPool?.floor}
          rowData={rowData}
          yourOffer={
            chainDetail?.chain_id == "solana"
              ? rowData.offer
              : chainDetail?.chain_id == "296"
              ? rowData?.status == "Awaiting buyer"
                ? (rowData?.offer /
                    Math.pow(10, chainDetail?.currency_decimal)) *
                  (rowData?.totalBids
                    ? rowData.totalBids
                    : rowData?.bidManager?.totalBids
                    ? rowData.bidManager.totalBids
                    : 1)
                : rowData?.offer / Math.pow(10, chainDetail?.currency_decimal)
              : rowData?.offer / Math.pow(10, chainDetail?.currency_decimal)
          }
        />
        <EditModal
          showModal={showOffersEditModal}
          setShowModal={setShowOffersEditModal}
          totalOffersByYou={
            rowData?.status == "Awaiting buyer"
              ? rowData?.totalBids
                ? rowData.totalBids
                : rowData?.bidManager?.totalBids
                ? rowData.bidManager.totalBids
                : 1
              : 1
          }
        />
      </>
    );
  }
};

export const NftOffersRow = ({ rowData, rowCount }) => {
  const isBigScreen = useMediaQuery();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showOffersEditModal, setShowOffersEditModal] = useState(false);
  const { setOpenModal, setModalType, setEditData, setClaimData } =
    useContext(ModalContext);
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const { checkLoginValidity } = useUserWalletContext();

  const hashconnectData = JSON.parse(localStorage.getItem("hashconnectData"));
  let initializer = "0x";

  useEffect(() => {
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
          initializer =
            "0x" +
            AccountId.fromString(firstAccountId).toSolidityAddress().toString();
        }
      }
    }
  }, []);

  const handleClose = async (offerId) => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      if (chainDetail?.chain_id == "solana") {
      } else if (chainDetail?.chain_id == "296") {
        try {
          await cancelProposedOffer(offerId);
          toast.success("Offer Cancelled Succefull");
        } catch (error) {
          toast.error("Transaction Failed!");
          console.error(error);
        }
      } else if (selectedChain === "xrp") {
        try {
        } catch (error) {
          toast.error("Transaction Failed!");
          console.error(error);
        }
      } else {
      }
    }
  };

  const handleEdit = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      isBigScreen ? setOpenModal(true) : setShowOffersEditModal(true);
      setModalType("edit");
      setEditData(rowData);
    }
  };

  const handleClaim = async () => {
    const isUserValid = await checkLoginValidity();

    if (isUserValid) {
      setOpenModal(true);
      setModalType("claim");
      setClaimData(rowData);
    }
  };

  useEffect(() => {
    if (!rowData?.loanExpiry) return;

    // Convert loanExpiry to milliseconds
    const targetTime = rowData.loanExpiry * 1000;

    const updateCountdown = () => {
      const currentTime = Date.now();
      const diff = targetTime - currentTime; // Time difference in ms

      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      // Format the time remaining
      const time = `${days > 0 ? `${days}D ` : ""}${
        hours > 0 || days > 0 ? `${hours}H ` : ""
      }${minutes}M`;

      setTimeRemaining(time);
    };

    // Initialize countdown and update every minute
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [rowData]);

  if (isBigScreen)
    return (
      <div className="bg-table-row-2 relative px-6 mt-3 -mb-1 !font-numans !font-normal !text-sm">
        <div className="w-1 h-full absolute left-0 bg-green" />
        <div className="w-full flex h-16 items-center">
          <div className="w-[210px] flex ">
            <img
              src={rowData?.image}
              alt=""
              className="h-8 w-8 object-cover rounded-full"
            />
            <span className="flex justify-center flex-col ml-3 md:whitespace-nowrap">
              <h5 className="text-white text-sm  font-numans font-normal">
                {rowData?.name}
              </h5>
              <p className="text-xs font-normal text-table-row-subscript text-left md:whitespace-nowrap">
                TokenId : #{rowData?.tokenId}
              </p>
            </span>
          </div>
          <div className="text-white font-numans pl-6  w-[200px] text-center">
            <h5
              className={`font-normal text-xs md:whitespace-nowrap text-center items-center ${
                rowData?.status === "Active"
                  ? "text-[#5FD37A]"
                  : rowData?.status === "Defaulted"
                  ? "text-[#FECA00]"
                  : "text-[#8AC4FF]"
              }`}
            >
              {rowData?.status === "Active" ? (
                <span>
                  <span className="text-white">Expires in </span>
                  <span className="text-[#faa2a2]">{timeRemaining}</span>
                </span>
              ) : (
                rowData?.status
              )}
            </h5>
          </div>
          <div className="text-white font-numans pl-12 text-center w-[160px] md:whitespace-nowrap  ">
            <h5 className="font-normal text-sm text-white">
              {Number(rowData?.loanAmount) /
                Math.pow(10, chainDetail?.currency_decimal)}

              <img
                src={
                  chainDetail?.currency_image_url ??
                  "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                }
                alt="Chain symbol"
                className="ml-2 inline"
                height={chainDetail?.chain_id == "solana" ? 15 : 25}
                width={20}
              />
            </h5>
          </div>

          <div className="   w-[160px] pl-12 text-white text-center font-numans  font-normal flex justify-center items-center text-sm ">
            <h5>{removeDeci(Number(rowData?.apy)) + " %"}</h5>
          </div>
          <div className="w-[160px] pl-16 text-white text-center font-normal text-sm">
            <h5>
              {removeDeci(Number(rowData?.loanDurationInMinutes) / 1440) + " D"}
            </h5>
          </div>
          <div className="w-[160px] pl-12 cursor-pointer text-white items-center flex justify-center font-normal">
            <a
              href={rowData?.txLink ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={txnsIcon} alt="txn" className="w-7 h-7" />
            </a>
          </div>

          <div className="flex flex-row items-center justify-end w-[200px]  ">
            {rowData.status == "Defaulted" ? (
              <div className="gap-10 cursor-pointer text-white  flex justify-end items-center ">
                <TableButton
                  onClick={() => handleClaim()}
                  className="!border-none !bg-green-4 !text-white py-2 px-[1.4rem] !flex !flex-row !items-center  !gap-3"
                  id={`${rowData?.btnVal}-${rowCount}`}
                >
                  {rowData.btnVal}
                  <svg
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.6667 14.1663H11.3333M17.9908 8.33301C18 8.81386 18 9.3634 18 9.99967C18 12.3332 18 13.5 17.5459 14.3913C17.1464 15.1753 16.509 15.8127 15.725 16.2122C14.8337 16.6663 13.6669 16.6663 11.3333 16.6663H9.66667C7.33311 16.6663 6.16634 16.6663 5.27504 16.2122C4.49103 15.8127 3.85361 15.1753 3.45414 14.3913C3 13.5 3 12.3332 3 9.99967C3 9.3634 3 8.81386 3.00921 8.33301M17.9908 8.33301C17.9662 7.05032 17.8762 6.25632 17.5459 5.60805C17.1464 4.82404 16.509 4.18662 15.725 3.78715C14.8337 3.33301 13.6669 3.33301 11.3333 3.33301H9.66667C7.33311 3.33301 6.16634 3.33301 5.27504 3.78715C4.49103 4.18662 3.85361 4.82404 3.45414 5.60805C3.12383 6.25632 3.03376 7.05032 3.00921 8.33301M17.9908 8.33301H3.00921"
                      stroke="#F1FCF3"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </TableButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  else {
    return (
      <>
        <LoanCard
          setShowOffersEditModal={setShowOffersEditModal}
          handleClose={handleClose}
          handleEdit={handleEdit}
          handleClaim={handleClaim}
          btnVal={rowData.btnVal}
          loanStatus={rowData.status}
          totalOffersByYou={
            rowData.status == "Awaiting buyer"
              ? rowData?.bidManager.totalBids
              : 1
          }
          key={rowData?.collection_name}
          apy={Number(rowData.apy)}
          image={rowData?.collection_logo}
          name={rowData?.collection_name}
          duration={Number(rowData.loanDurationInMinutes) / 1440}
          floorPrice={rowData?.bidPool?.floor}
          yourOffer={
            Number(rowData?.loanAmount) /
            Math.pow(10, chainDetail?.currency_decimal)
          }
          daysRemaining={timeRemaining}
        />
        <EditModal
          showModal={showOffersEditModal}
          setShowModal={setShowOffersEditModal}
          image={rowData.collection_logo}
          name={rowData.collection_name}
        />
      </>
    );
  }
};

export default OffersRow;
