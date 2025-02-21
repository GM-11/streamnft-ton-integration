import { ModalContext } from "@/context/ModalContext";
import React, { useContext, useEffect, useState } from "react";
import { removeDeci } from "@/utils/hashConnectProvider";
import Image from "next/image";
import useMediaQuery from "@/hooks/useMediaQuery";
import { LoanCard } from "@/components/MobileComponents/LoanCard/LoanCard";
import { ChainContext } from "@/context/ChainContext";
import txnsIcon from "../../../public/images/Txns.svg";
import AddToCalendarModal from "@/components/MobileComponents/Modals/AddToCalendarModal/AddToCalendarModal";

import { TableButton } from "@/components/Reusables/loan/Button";
import ProgressBar from "@/components/Reusables/loan/ProgressBar";

import { useCountdown } from "@/hooks/useCountdown";
import { useUserWalletContext } from "@/context/UserWalletContext";

const LoansRow = ({ rowData }) => {
  const [showModal, setShowModal] = useState(false);

  const isBigScreen = useMediaQuery();

  const { chainDetail } = useContext(ChainContext);

  const { checkLoginValidity } = useUserWalletContext();

  const [loanDuration, setLoanDuration] = useState(0);

  const [countdown, setCountdown] = useState(0);

  const [progressPercentage, setProgressPercentage] = useState(0);

  const [timeRemaining, setTimeRemaining] = useState("");

  const [days, hours, minutes] = useCountdown(countdown, [rowData]);

  const { setOpenModal, setModalType, setLoanData, loanData } =
    useContext(ModalContext);

  useEffect(() => {
    const loanExpiry = rowData?.loan?.loan_expiry * 1000;
    setCountdown(loanExpiry);
  }, [rowData]);

  useEffect(() => {
    const durationInMinutes =
      Number(rowData?.bidPool?.loanDurationInMinutes) ??
      Number(rowData?.bidPool?.loan_duration_in_minutes);

    setLoanDuration(durationInMinutes);

    if (loanDuration) {
      const totalMinutesElapsed = days * 1440 + hours * 60 + minutes;
      const percentage = (totalMinutesElapsed / loanDuration) * 100;
      setProgressPercentage(percentage);
    } else {
      setProgressPercentage(0);
    }

    const formattedTimeRemaining = `${days > 0 ? `${days}D ` : ""}${
      hours > 0 || days > 0 ? `${hours}H ` : ""
    }${minutes > 0 || hours > 0 || days > 0 ? `${minutes}M` : ""}`;

    setTimeRemaining(formattedTimeRemaining);
  }, [days, hours, minutes, loanDuration, rowData]);

  if (isBigScreen)
    return (
      <>
        <div className="bg-table-row-2 relative px-6 mt-3 -mb-1">
          <div className="w-1 h-full absolute left-0 bg-green"></div>
          <div className="w-full flex h-16 items-center">
            <div className="w-[210px] flex">
              <img
                src={rowData?.image}
                alt=""
                className="h-8 w-8 object-cover rounded-full"
              />
              <span className="flex justify-center flex-col ml-3 md:whitespace-nowrap">
                <h5 className="text-white text-sm text-left font-numans">
                  {rowData?.name?.length > 15
                    ? `${rowData?.name?.slice(0, 15)}...`
                    : rowData?.name}
                </h5>

                <p className="text-xs font-normal text-table-row-subscript text-left md:whitespace-nowrap">
                  #
                  {rowData?.loan.token_id.length > 10
                    ? rowData?.loan.token_id.slice(0, 10)
                    : rowData?.loan.token_id}
                </p>
              </span>
            </div>
            <>
              <div className="text-white font-numans pl-10  w-[200px] text-center">
                <h5 className="font-normal text-sm  md:whitespace-nowrap text-center items-center">
                  {removeDeci(Number(rowData?.borrow_amount))}
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
              <div className="text-white font-numans pl-[4.5rem] text-center w-[160px] md:whitespace-nowrap text-sm">
                <h5>{removeDeci(rowData?.apy)} %</h5>
              </div>
            </>

            <div className="w-[180px] font-numans pl-[6rem] text-center md:whitespace-nowrap">
              <h5 className="text-white text-sm font-normal">
                {removeDeci(Number(rowData?.repayment))}
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
            <div className="w-[200px] font-numans text-center pl-12 md:whitespace-nowrap">
              {!rowData?.expired ? (
                <>
                  <h5 className="text-white text-sm font-normal">
                    {timeRemaining === "" ? "calculating" : timeRemaining}
                  </h5>
                  <div className="w-2/3 h-1 mt-2 mx-auto">
                    <ProgressBar value={`${progressPercentage}%`} />
                  </div>
                </>
              ) : (
                <h5 className="text-white text-sm font-normal">Expired</h5>
              )}
            </div>
            <div className="w-[160px] cursor-pointer text-white items-center flex justify-center font-normal">
              <a
                href={rowData?.txLink ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Track link click event
                  analytics.track(
                    `dapp_loan_tab_loans_${rowData?.collection_name}_view_txn`,
                    {
                      txLink: rowData?.txLink,
                    }
                  );
                }}
              >
                <Image src={txnsIcon} alt="txn" className="w-7 h-7" />
              </a>
            </div>
            <div className="w-[150px] flex justify-center items-center ">
              {!rowData?.expired ? (
                <TableButton
                  onClick={async () => {
                    const userIsValid = await checkLoginValidity();

                    if (userIsValid) {
                      setModalType("loan");
                      setLoanData(rowData);
                      setOpenModal(true);
                    }
                  }}
                  className="flex items-center gap-2  border-solid rounded-md p-2 border-table-button-border text-white"
                >
                  {rowData.btnVal}
                  <img
                    src="/images/lendButtonIcon.png"
                    className="h-4 w-auto object-contain"
                  />
                </TableButton>
              ) : (
                <TableButton
                  onClick={() => {}}
                  className="!border-none !bg-red p-2 !text-white !font-xs"
                >
                  Defaulted
                </TableButton>
              )}
            </div>
          </div>
        </div>
      </>
    );
  else {
    return (
      <>
        <LoanCard
          loansData={rowData}
          isExpired={rowData?.expired}
          setShowModal={setShowModal}
          key={rowData?.collection_name}
          apy={Number(rowData.apy)}
          image={rowData?.image}
          name={rowData?.name}
          duration={loanDuration}
          floorPrice={rowData?.bidPool.floor}
          borrowedAmount={rowData.borrow_amount}
          repaymentAmount={rowData.repayment}
          daysRemaining={timeRemaining}
          tokenId={rowData?.loan.token_id}
        />
        {showModal && (
          <AddToCalendarModal
            loanData={loanData}
            showModal={showModal}
            setShowModal={setShowModal}
          />
        )}
      </>
    );
  }
};

export default LoansRow;
