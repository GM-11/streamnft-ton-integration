"use client";
import { ModalContext } from "@/context/ModalContext";
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { TableButton } from "@/components/Reusables/loan/Button";
import { RowDropdown } from "../RowDropdown";
import { maxBy } from "@/utils/helperFunction";
import { toast } from "react-toastify";
import { removeDeci } from "@/utils/hashConnectProvider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { HederaContext } from "@/context/HederaContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { LoanCard } from "@/components/MobileComponents/LoanCard/LoanCard";
import { ChainContext } from "@/context/ChainContext";
import redDrop from "../../../public/images/redDrop.svg";
import greenDrop from "../../../public/images/greenDrop.svg";
import Modals from "@/components/MobileComponents/Modals/Modals";
import Loader from "@/components/Reusables/loan/Loader";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { utilityContext } from "@/context/UtilityContext";
import { isTokenExpired } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";

const BorrowRow = ({ rowData, pagename, load, rowCount }) => {
  const isBigScreen = useMediaQuery();
  const [showModal, setShowModal] = useState(false);
  const { setOpenModal, setBorrowData, setModalType } =
    useContext(ModalContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedDays, setSelectedDays] = useState(-1);
  const [liquidity, setLiquidity] = useState(0);
  const [offers, setOffers] = useState(0);
  const [offersTaken, setOffersTaken] = useState(0);
  const [bestOffer, setBestOffer] = useState(0);
  const [interest, setInterest] = useState(0);
  const wallet = useWallet();
  const { selectedChain, chainDetail, setCollectionId } =
    useContext(ChainContext);
  const { isConnected } = useUserWalletContext();
  const { isPaired } = useContext(HederaContext);
  const [mainRow, setMainRow] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("offers");
  const { openConnectModal } = useConnectModal();
  const { checkLoginValidity } = useUserWalletContext();

  const decimalFactor = useMemo(
    () => Math.pow(10, chainDetail?.currency_decimal || 0),
    [chainDetail?.currency_decimal]
  );

  useEffect(() => {
    const calculateData = () => {
      let totalOffer = 0;
      let totalTaken = 0;
      let totalliq = 0;
      let bestOfferBidAmount = 0;
      let bestOffer;
      totalTaken = rowData.offersTaken;
      totalOffer = rowData.totalOffers;
      totalliq = rowData.totalLiquidity;

      if (rowData.offers && Array.isArray(rowData.offers)) {
        bestOffer = rowData.offers.reduce((best, current) => {
          if (
            BigInt(current.bidAmount) > BigInt(best.bidAmount) ||
            (BigInt(current.bidAmount) === BigInt(best.bidAmount) &&
              current.interestRate < best.interestRate)
          ) {
            return current;
          }
          return best;
        });

        bestOfferBidAmount = bestOffer.bidAmount;
      }
      const intr = bestOffer?.interest;

      setMainRow(bestOffer);
      setInterest(Math.round(intr * 100) / 100);

      setLiquidity(removeDeci(totalliq / decimalFactor));
      setOffers(totalOffer);
      setOffersTaken(totalTaken);

      if (chainDetail?.evm || chainDetail?.chain_id === "solana") {
        const bestOffer = Number(bestOfferBidAmount);
        setBestOffer(removeDeci(bestOffer / decimalFactor));
      }
    };

    setLoading(true);

    if (
      chainDetail?.chain_id === "296" ||
      chainDetail?.evm ||
      chainDetail?.chain_id === "solana"
    ) {
      calculateData();
    }

    setLoading(false);
  }, [chainDetail, rowData, selectedChain]);

  const handleBorrowButton = useCallback(async () => {
    const eventName = `dapp_loan_tab_borrow_${rowData?.pool?.collectionName}_borrow`;

    analytics.track(eventName, {
      page: pagename,
    });

    const handleBorrowConditions = async () => {
      const userIsValid = await checkLoginValidity();

      if (!userIsValid) {
        return;
      } else {
        setBorrowData({ ...mainRow, ...rowData });
        setCollectionId(rowData?.pool?.tokenAddress);
        setModalType("borrow");
        setOpenModal(true);
      }
    };

    if (chainDetail?.chain_id === "solana") {
      if (!wallet.connected) return toast.error("Please connect your wallet");
      handleBorrowConditions();
    } else if (chainDetail?.chain_id === "296" && !isPaired) {
      toast.error("Connect your wallet");
    } else if (selectedChain === "xrp") {
      handleBorrowConditions();
    } else if (chainDetail?.evm && !isConnected) {
      openConnectModal();
    } else {
      handleBorrowConditions();
    }
  }, [
    mainRow,
    chainDetail,
    wallet,
    isPaired,
    isConnected,
    selectedChain,
    rowData,
  ]);

  const handleDropdownToggle = useCallback(() => {
    const eventName = openDropdown
      ? `dapp_loan_tab_borrow_${rowData?.pool?.collectionName}_drop-down_close`
      : `dapp_loan_tab_borrow_${rowData?.pool?.collectionName}_drop-down_open`;

    analytics.track(eventName, {
      page: pagename,
    });

    setOpenDropdown((prev) => !prev);
  }, [openDropdown, mainRow, pagename]);

  const lastLoanText = useMemo(() => {
    const loanAmount =
      Number(mainRow?.lastLoanAmount) /
      Math.pow(10, chainDetail?.currency_decimal);

    return loanAmount === 0
      ? "No loans taken yet"
      : `${loanAmount} ${chainDetail?.currency_symbol} last loan taken`;
  }, [mainRow, chainDetail?.currency_decimal, chainDetail?.currency_symbol]);

  if (loading || load) return <Loader />;
  if (isBigScreen)
    return (
      <>
        <div className="bg-table-row-2 relative px-6 mt-3 -mb-1">
          <div className="w-1 h-full absolute left-0 bg-green"></div>
          <div className="w-full flex justify-between h-16 items-center">
            <div className="w-[190px] flex items-center">
              <img
                src={rowData?.pool?.collectionLogo}
                alt="collection logo"
                className="h-8 w-8 object-cover rounded-full"
              />
              <span className="flex justify-center flex-col ml-3 md:whitespace-nowrap">
                <h5 className="text-white text-sm text-center font-numans">
                  {rowData?.pool?.collectionName?.length > 15
                    ? `${rowData?.pool?.collectionName?.slice(0, 15)}...`
                    : rowData?.pool?.collectionName}
                </h5>
                <p className="text-xs font-normal text-table-row-subscript text-left md:whitespace-nowrap">
                  Floor : {rowData?.pool?.floor}
                </p>
              </span>
            </div>
            <div className="w-[420px] flex text-center items-center justify-center">
              {liquidity && bestOffer ? (
                <>
                  <div className="text-white font-numans w-[200px] text-center pr-6">
                    <h5 className="text-sm text-white">
                      {liquidity?.toFixed(3)}
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
                    <p className="text-xs font-normal text-table-row-subscript font-numans text-center whitespace-nowrap">
                      {offersTaken} of {offers} taken
                    </p>
                  </div>
                  <div className="text-white font-numans text-sm w-[200px] text-center pr-2">
                    <h5 className="font-normal text-sm text-white">
                      {bestOffer}

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
                    <p className="text-xs font-normal text-table-row-subscript font-numans">
                      {lastLoanText}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-white font-numans w-[200px] text-center pl-3">
                  <h5 className="font-numans font-normal text-xl text-white md:whitespace-nowrap">
                    Awaiting Lenders
                  </h5>
                  <p className="text-xs font-normal whitespace-nowrap">
                    {lastLoanText}
                  </p>
                </div>
              )}
            </div>
            <div className="w-[180px] text-center font-normal justify-center">
              <div className="text-green text-sm text-center font-normal">
                {interest / decimalFactor}

                {interest ? (
                  <img
                    src={
                      chainDetail?.currency_image_url ??
                      "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                    }
                    alt="Chain symbol"
                    className="inline ml-2"
                    height={
                      chainDetail?.chain_id == "solana"
                        ? 15
                        : chainDetail?.chain_id == "296"
                        ? 25
                        : 20
                    }
                    width={20}
                  />
                ) : (
                  " "
                )}
              </div>

              <p className="text-table-row-subscript text-xs font-normal">
                {removeDeci(mainRow?.interestRate)}{" "}
                {mainRow?.interestRate ? <> % interest </> : ""}
              </p>
            </div>
            <div className="w-[180px] font-numans text-center font-normal">
              <h5 className="text-white pl-4 text-sm">
                {mainRow?.loanDurationInMinutes
                  ? `${removeDeci(
                      Number(mainRow?.loanDurationInMinutes / 1440)
                    )} D`
                  : " "}
              </h5>
            </div>

            <div className="w-[120px]">
              <TableButton
                id={`borrow-button-${rowCount}`}
                onClick={() => {
                  handleBorrowButton();
                  analytics.track(
                    `dapp_loan_tab_borrow_${rowData?.pool?.collectionName}_borrow`
                  );
                }}
                className={
                  "text-table-button-border  border-solid border-table-button-border p-2 flex items-center gap-3"
                }
              >
                Borrow
                <img
                  src="/images/lendButtonIcon.png"
                  className="h-4 w-auto object-contain"
                />
              </TableButton>
            </div>
            {openDropdown ? (
              <Image
                src={redDrop}
                className="h-6 w-auto object-contain cursor-pointer"
                onClick={handleDropdownToggle}
                alt="red dropdown"
                id={`close-dropdown-${rowCount}`}
              />
            ) : (
              <Image
                src={greenDrop}
                className="h-6 w-auto object-contain cursor-pointer"
                onClick={handleDropdownToggle}
                alt="green drop"
                id={`open-dropdown-${rowCount}`}
              />
            )}
          </div>
          <RowDropdown
            open={openDropdown}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            rowData={rowData}
            pagename={pagename}
          />
        </div>
      </>
    );
  else
    return (
      <>
        <LoanCard
          borrowData={{ ...rowData, ...mainRow }}
          rateOfInterest={removeDeci(mainRow?.interestRate)}
          interestAmount={removeDeci(
            Number(mainRow?.interest) /
              Math.pow(10, chainDetail?.currency_decimal)
          )}
          lastLoanTaken={
            Number(mainRow?.lastLoanAmount) /
            Math.pow(10, chainDetail?.currency_decimal)
          }
          bestOffer={bestOffer}
          availableNFTs={offers - offersTaken}
          offersTaken={offersTaken}
          offers={offers}
          totalNFTs={offers}
          setShowModal={setShowModal}
          key={rowData?.pool?.collectionName}
          image={rowData?.pool?.collectionLogo}
          name={rowData?.pool?.collectionName}
          duration={mainRow?.loanDurationInMinutes / 1440}
          floorPrice={rowData?.pool?.floor}
          setSelectedTab={setSelectedTab}
          totalLiquidity={liquidity}
        />
        <Modals
          rowData={rowData}
          showModal={showModal}
          setShowModal={setShowModal}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          mainRow={{ ...rowData, ...mainRow }}
        />
      </>
    );
};

export default BorrowRow;
