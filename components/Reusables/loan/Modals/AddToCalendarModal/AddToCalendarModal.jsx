import { ModalContext } from "@/context/ModalContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ModalButton } from "../../Button";
import Modal from "../Modal";
import { useCountdown } from "@/hooks/useCountdown";
import { useGoogleLogin } from "@react-oauth/google";
import { repayLoan } from "streamnft-sol-test";
import {
  getNFTDetail,
  removeDeci,
  repayUserLoan,
} from "@/utils/hashConnectProvider";
import { AccountId } from "@hashgraph/sdk";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { repayUserLoanXRP } from "@/utils/xrpProvider";
import { FaPlus } from "react-icons/fa6";
import CalendarImage from "../../../../../public/images/calendar.png";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import { evmRepay } from "@/utils/evmProvider";
import { postRepayLoan } from "@/utils/apiRequests";
import { useAccount } from "wagmi";
import { useSigner } from "@/context/SignerContext";
import { PublicKey } from "@solana/web3.js";
import { UserNftContext } from "@/context/UserNftContext";
import Loader from "../../Loader";
import { nftCacheAxiosInstance } from "@/services/axios";
import { useUserWalletContext } from "@/context/UserWalletContext";

const AddToCalendarModal = () => {
  const [loading, setLoading] = useState(false);
  const { loanData, openModal } = useContext(ModalContext);
  const { setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { connection } = useConnection();
  const { address } = useUserWalletContext();
  const [nftData, setNftData] = useState({});
  const { signer: walletSigner } = useSigner();
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const [countdown, setCountdown] = useState(
    loanData?.loan?.loan_expiry * 1000
  );

  const {
    setManagerSignal,
    managerSignal,
    poolSignal,
    setPoolSignal,
    nftSignal,
    setNftSignal,
  } = useContext(PoolManagerContext);

  useEffect(() => {
    setCountdown(loanData?.loan?.loan_expiry * 1000);
  }, [loanData]);

  const [days, hours, minutes] = useCountdown(
    loanData?.loan?.loan_expiry * 1000,
    [loanData]
  );
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

  return (
    <Modal type="noHeaderAndFooter">
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader />
        </div>
      ) : (
        <>
          <div
            id="topBlockWithBackdrop"
            className="h-[280px] w-full overflow-hidden relative"
          >
            {/* Close Button */}
            <div
              className="absolute top-4 right-4 cursor-pointer text-white text-2xl font-bold z-[30]"
              onClick={() => {
                setOpenModal(false);
              }}
            >
              &times;
            </div>
            <div className="flex flex-col items-start gap-3">
              <img
                src={loanData.collection_logo}
                alt=""
                className="h-full w-full object-cover absolute z-[10]"
              />
            </div>
            <div className="w-full h-full absolute z-[20] flex flex-row items-end justify-start gap-6 pt-16 pb-6 px-14 lg:px-10 bg-blackBlurred backdrop-blur-sm lg:backdrop-blur-0">
              <div className="flex flex-col items-center gap-3">
                <img
                  src={loanData?.image || nftData?.image}
                  alt=""
                  className="h-20 w-20 object-cover rounded-lg lg:h-40 lg:w-40"
                />
                <p className="!text-xs text-white font-numans !font-normal">
                  TokenID: #
                  {loanData?.loan?.token_id?.length > 7
                    ? `${loanData.loan.token_id.slice(0, 7)}...`
                    : loanData?.loan?.token_id}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h5 className="font-bold text-white text-lg ml-4 lg:ml-0">
                  {nftData?.name?.length > 25
                    ? nftData.name.slice(0, 25) + "..."
                    : nftData.name}
                </h5>
                <button className="-ml-10 lg:ml-0 h-fit px-2 border border-solid border-green w-full font-bold text-base py-1 text-green bg-black rounded-lg mt-1">
                  Must be repaid
                </button>
              </div>
            </div>
          </div>

          <div
            id="timerBlock"
            className="flex items-start justify-center w-full gap-8 py-4"
          >
            <div className="w-fit h-fit flex flex-col items-start justify-center">
              <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4 font-extrabold rounded-lg">
                <p>{days}</p>
              </div>
              <h5 className="font-medium text-sm text-row-dropdown-unselected mt-1">
                Days
              </h5>
            </div>

            <div className="w-fit h-fit flex flex-col items-start justify-center">
              <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4 font-extrabold rounded-lg">
                <p>{hours}</p>
              </div>
              <h5 className="font-medium text-sm text-row-dropdown-unselected mt-1">
                Hours
              </h5>
            </div>

            <div className="w-fit h-fit flex flex-col items-start justify-center">
              <div className="border border-solid px-8 bg-modal-field-bg text-green-5 border-modal-field-border p-4 font-extrabold rounded-lg">
                <p>{minutes}</p>
              </div>
            </div>
          </div>
          <p id="middleText" className="text-base text-white px-10 text-center">
            {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Est adipisci
          voluptates ipsum. Magnam libero itaque enim perferendis optio. Atque
          eveniet ducimus asperiores ex porro? Excepturi. */}
          </p>

          <div
            id="buttonBlock"
            className="w-fit h-fit flex items-center text-white justify-center my-4 relative ml-auto cursor-pointer pr-11"
            onClick={() => handleCalendar()}
          >
            <div className="w-[80%] h-[1px] bg-white rounded-md absolute -bottom-1"></div>
            <FaPlus />
            <span className="mx-1">Add To Calendar</span>
            <Image
              src={CalendarImage}
              height={16}
              width={16}
              alt="calendar img"
            />
          </div>

          <div className="w-full h-fit flex items-center pt-2 justify-between border-t border-solid border-row-dropdown-unselected my-5 px-9">
            <div className="h-fit flex items-start flex-col">
              <p className="font-medium text-white text-base">Amount Owed</p>
              <h5 className="font-extrabold text-lg text-green-5">
                {removeDeci(Number(loanData?.repayment))}
                {chainDetail.currency_symbol}
              </h5>
            </div>
            <ModalButton
              id="repay-loan"
              onClick={() => {
                handelRepaySDK();
                analytics.track(
                  `dapp_loan_tab_loans_${loanData?.collection_name}_repay_button_repay`
                );
              }}
            >
              Repay Loan
            </ModalButton>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddToCalendarModal;
