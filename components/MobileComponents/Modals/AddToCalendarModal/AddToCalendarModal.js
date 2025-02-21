import { ModalContext } from "@/context/ModalContext";
import { Metaplex } from "@metaplex-foundation/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button2, ModalButton } from "@/components/MobileComponents/Button";
import { repayLoan } from "streamnfttechtest";
import { getNFTDetail, repayUserLoan } from "@/utils/hashConnectProvider";
import { AccountId } from "@hashgraph/sdk";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { repayUserLoanXRP } from "@/utils/xrpProvider";
import { FaPlus } from "react-icons/fa6";
import CalendarImage from "../../../../public/images/calendar.png";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import { evmRepay } from "@/utils/evmProvider";
import { useCountdown } from "@/hooks/useCountdown";
import { AiOutlineClose } from "react-icons/ai";
import ReactPortal from "@/components/Reusables/loan/Portal";
import { useGoogleLogin } from "@react-oauth/google";
import { useSigner } from "@/context/SignerContext";
import { UserNftContext } from "@/context/UserNftContext";
import { useAccount } from "wagmi";
import { postRepayLoan } from "@/utils/apiRequests";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const AddToCalendarModal = ({ showModal, setShowModal }) => {
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState({});
  const [countdown, setCountdown] = useState("");
  const { loanData, openModal, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { connection } = useConnection();
  const { address } = useUserWalletContext();
  const { signer: walletSigner } = useSigner();
  const { reloadNftCacheCall } = useContext(UserNftContext);

  const {
    setManagerSignal,
    managerSignal,
    poolSignal,
    setPoolSignal,
    nftSignal,
    setNftSignal,
  } = useContext(PoolManagerContext);

  useEffect(() => {
    if (chainDetail?.chain_id == "solana") {
      setCountdown(loanData?.loan?.loan_expiry * 1000);
    } else {
      setCountdown(loanData?.loan?.loan_expiry * 1000);
    }
  }, [chainDetail, loanData]);

  const [days, hours, minutes] = useCountdown(countdown);
  const wallet = useWallet();

  const getNFTImage = async () => {
    if (chainDetail?.chain_id == "solana") {
      try {
        setLoading(true);
        const response = await nftCacheAxiosInstance.get(
          `/metadata/${chainDetail?.chain_id}/${loanData?.mint}/${loanData?.mintID}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        //
        setNftData(data.data);
      } catch (error) {
        console.error("Error fetching metadata:", error.message);
        return null;
      } finally {
        setLoading(false);
      }
    } else if (chainDetail?.chain_id == "296") {
      const nft = await getNFTDetail(
        AccountId.fromSolidityAddress(
          loanData?.loan?.token_address
        )?.toString(),
        loanData?.loan?.token_id
      );
      setNftData(nft);
    }
  };

  useEffect(() => {
    if (true) {
      setLoading(true);
      getNFTImage().then((res) => setLoading(false));
    }
  }, [loanData, openModal]);

  const handelRepaySDK = async () => {
    setLoading(true);
    try {
      if (chainDetail?.chain_id == "solana") {
        try {
          const res = await repayLoan(
            new PublicKey(loanData.loan.loan_offer_index),
            new PublicKey(loanData.mintID),
            new PublicKey(loanData.loan.loan_pool_index),
            undefined,
            false
          );

          if (res.success) {
            // After successful repayment, post the repayment details
            await postRepayLoan(
              loanData.loan?.loan_pool_index,
              loanData.loan?.loan_offer_index,
              loanData?.mint,
              loanData?.mintID,
              chainDetail?.chain_id,
              chainDetail?.contract_address,
              "0",
              res?.data,
              wallet.publicKey.toBase58()
            );
            toast.success("Repayed successfully");
            setManagerSignal(managerSignal + 1);
            setPoolSignal(poolSignal + 1);
            setNftSignal(nftSignal + 1);
            setOpenModal(false);
          } else {
            throw new Error("Transaction Failed");
          }
        } catch (error) {
          toast.error("Something went wrong in transaction");
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else if (chainDetail?.chain_id == "296") {
        await repayUserLoan(
          loanData?.loan.token_address,
          loanData?.loan.token_id,
          loanData?.repayment,
          chainDetail?.chain_id,
          loanData?.version,
          chainDetail?.contract_address,
          chainDetail?.native_address
        );
      } else if (selectedChain === "xrp") {
        let amount = loanData.manager.bidAmount;
        const interestRateLender = loanData.bidPool.interestRateLender;
        const interestRateProtocol = loanData.bidPool.interestRateProtocol;
        const interestR = parseFloat(
          interestRateLender + (interestRateLender * interestRateProtocol) / 100
        );
        let interest = (amount * interestR) / 100;
        let payableAmount = amount + interest;
        await repayUserLoanXRP(
          loanData.loan.tokenAddress,
          loanData.loan.tokenId,
          payableAmount.toFixed(2)
        );
      } else if (chainDetail?.evm) {
        const signer = walletSigner;

        await evmRepay(
          loanData?.bidPool?.loan_pool_index,
          loanData?.loan?.loan_offer?.loan_offer_index,
          loanData?.loan?.token_address,
          loanData?.loan?.token_id,
          chainDetail?.chain_id,
          signer,
          chainDetail?.contract_address,
          loanData?.isErc1155,
          loanData?.loan?.index,
          address,
          loanData?.paymentToken
        );
        await reloadNftCacheCall();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setManagerSignal(managerSignal + 1);
      setUpdateCollectionsSignal(!updateCollectionsSignal);
      setPoolSignal(poolSignal + 1);
      setNftSignal(nftSignal + 1);
      setLoading(false);
      setOpenModal(false);
      document.body.style.overflow = "auto";
    }
  };

  const scheduleEvent = async (token) => {
    const eventData = {
      summary: `Streamnft Loan Expiring for ${loanData?.loan.name} ${loanData?.loan.token_id}`,
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + days);
    startDate.setHours(startDate.getHours() + hours - 1);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    const newEvent = {
      summary: eventData.summary || "New Event", // Use provided summary or default
      ...eventData, // Include other event data from the object
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
    };

    const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    });

    if (response.ok) {
      const eventData = await response.json();
      const link = new URL(eventData.htmlLink);
      const params = new URLSearchParams(link.search);
      const eid = params.get("eid");
      const editUrl = ` https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=${eid}&tmsrc=${eventData.creator.email.toString()}`;
      toast.success(
        `Event added to your calender on ${eventData.creator.email.toString()}`
      );
      window.open(editUrl, "_blank");
    } else {
      toast.error("Failed to create the event", response.statusText);
    }
  };

  const handleCalendar = async () => {
    login();
    console.debug("Event update successful!");
  };

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/calendar.events",
    onSuccess: (tokenResponse) => {
      scheduleEvent(tokenResponse.access_token);
    },
  });

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  return (
    <ReactPortal wrapperId="react-portal-modal-container">
      <div
        style={{ backgroundColor: "rgba(0,0,0, 0.8)" }}
        className="overflow-y-auto overflow-x-hidden h-screen fixed top-0 right-0 left-0 justify-center items-center w-full md:inset-0 max-h-full z-[10000]"
      >
        <div className="relative w-full flex flex-col justify-end min-h-full">
          <div className="h-fit w-full flex items-center justify-center">
            <button
              type="button"
              className="rounded-full h-8 w-8 bg-mobile-modal-bg flex items-center justify-center"
              onClick={() => {
                setShowModal(false);
                document.body.style.overflow = "auto";
              }}
            >
              <AiOutlineClose color="#fff" size={21} />
            </button>
          </div>
          <div className="relative max-h-[420px] pb-24 min-h-[420px] overflow-y-auto rounded-t-3xl shadow text-white bg-mobile-modal-bg">
            {loading ? (
              <Loader />
            ) : (
              <div id="topBlockWithBackdrop" className="h-fit w-full relative">
                <div className="relative h-52 w-full">
                  <div className="flex flex-col items-start gap-3">
                    <img
                      src={loanData.image}
                      alt=""
                      className="h-52 w-full object-cover align-middle absolute z-[10]"
                    />
                  </div>
                  <div className="w-full h-fit z-[11] absolute flex flex-row items-end justify-start !text-white gap-6 pt-16 pb-6 px-14 lg:px-10 bg-blackBlurred backdrop-blur-sm lg:backdrop-blur-0">
                    <div className="bg-black rounded-md flex w-full px-4 py-2">
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={loanData.image}
                          alt=""
                          className="h-24 rounded-md w-full"
                        />
                        <p className="!text-xs text-white font-numans !font-normal">
                          TokenID: #{loanData?.loan?.token_id}
                        </p>
                      </div>
                      <div className="flex flex-col items-start">
                        <h5 className="  font-bold text-white text-lg ml-4 lg:ml-0">
                          {nftData?.name?.length > 25
                            ? nftData.name.slice(0, 25) + "..."
                            : nftData.name}
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full pt-16 gap-6 h-fit items-center justify-center">
                  <div className="w-fit h-fit flex flex-col items-start justify-center">
                    <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4   font-extrabold rounded-lg">
                      <p>{days}</p>
                    </div>
                    <h5 className="  font-medium text-sm text-row-dropdown-unselected mt-1">
                      Days
                    </h5>
                  </div>
                  <div className="w-fit h-fit flex flex-col items-start justify-center">
                    <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4   font-extrabold rounded-lg">
                      <p>{hours}</p>
                    </div>
                    <h5 className="  font-medium text-sm text-row-dropdown-unselected mt-1">
                      Hours
                    </h5>
                  </div>

                  <div className="w-fit h-fit flex flex-col items-start justify-center">
                    <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4   font-extrabold rounded-lg">
                      <p>{minutes}</p>
                    </div>
                    <h5 className="  font-medium text-sm text-row-dropdown-unselected mt-1">
                      Minutes
                    </h5>
                  </div>
                </div>
                <div
                  id="buttonBlock"
                  className="w-fit h-fit flex items-center text-white justify-center my-4 relative ml-auto cursor-pointer pr-11"
                >
                  <div className="w-[80%] h-[1px] bg-white rounded-md absolute -bottom-1"></div>
                  <div
                    className="w-fit flex gap-0"
                    onClick={() => handleCalendar()}
                  >
                    <FaPlus />
                    <span className="text-xs ml-2 mr-4 md:!text-base">
                      Add To Calendar
                    </span>
                    <Image
                      src={CalendarImage}
                      height={16}
                      width={16}
                      alt="calenderImg"
                    />
                  </div>
                </div>
                <div className="w-full h-fit flex bg-gray-7 fixed bottom-0 items-center py-2 justify-between border-t border-solid border-row-dropdown-unselected px-5">
                  <div className="h-fit flex items-start flex-col">
                    <p className="text-white text-xs md:!text-base">
                      Amount Owed
                    </p>
                    <h5 className="text-base md:!text-lg text-green-5">
                      {loanData?.repayment?.toFixed(2)}
                      {chainDetail.currency_symbol}
                    </h5>
                  </div>
                  <Button2 onClick={() => handelRepaySDK()}>
                    <h5 className="text-xs md:!text-base">Repay Capital</h5>
                  </Button2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ReactPortal>
  );
};

export default AddToCalendarModal;
