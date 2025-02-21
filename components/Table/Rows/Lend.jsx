import { ModalContext } from "@/context/ModalContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { removeDeci } from "@/utils/hashConnectProvider";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { HederaContext } from "@/context/HederaContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ChainContext } from "@/context/ChainContext";
import redDrop from "../../../public/images/redDrop.svg";
import greenDrop from "../../../public/images/greenDrop.svg";
import { TableButton } from "@/components/Reusables/loan/Button";
import { LoanCard } from "@/components/MobileComponents/LoanCard/LoanCard";
import Modals from "@/components/MobileComponents/Modals/Modals";
import { RowDropdown } from "../RowDropdown";
import { maxBy, sumBy } from "@/utils/helperFunction";
import Loader from "@/components/Reusables/loan/Loader";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { utilityContext } from "@/context/UtilityContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const LendRow = ({ rowData, bidManager, pagename, load, rowCount }) => {
  const [liquidity, setLiquidity] = useState(0);
  const [offers, setOffers] = useState(0);
  const [bestOffer, setBestOffer] = useState(0);
  const [offersTaken, setOffersTaken] = useState(0);
  const [lastLoan, setLastLoan] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedDays, setSelectedDays] = useState(-1);
  const { setOpenModal, setLendData, setModalType } = useContext(ModalContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mainRow, setMainRow] = useState({});
  const { isConnected } = useUserWalletContext();
  const wallet = useWallet();
  const { checkLoginValidity } = useUserWalletContext();
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const { isPaired } = useContext(HederaContext);
  const isBigScreen = useMediaQuery();
  const [selectedTab, setSelectedTab] = useState("offers");
  const { openConnectModal } = useConnectModal();

  const decimalFactor = useMemo(
    () => Math.pow(10, chainDetail?.currency_decimal || 0),
    [chainDetail?.currency_decimal]
  );

  const pdaDetails = useCallback(async () => {
    setLoading(true);

    let totalLiquidity = 0,
      totalOffers = 0,
      totalTaken = 0,
      bestOfferBidAmount = 0;
    let bestOffer;

    totalTaken = rowData.offersTaken;
    totalOffers = rowData.totalOffers;
    totalLiquidity = rowData.totalLiquidity;

    const maxLastBidAmount = rowData?.pool?.lastBidAmount;
    setLastLoan(removeDeci(maxLastBidAmount / decimalFactor));
    setOffers(totalOffers);
    setLiquidity(removeDeci(totalLiquidity / decimalFactor));
    setOffersTaken(totalTaken);

    if (rowData.offers && Array.isArray(rowData.offers)) {
      bestOffer = rowData.offers.reduce((best, current) => {
        if (
          BigInt(current.bidAmount) > BigInt(best.bidAmount) ||
          (BigInt(current.bidAmount) === BigInt(best.bidAmount) &&
            parseFloat(current.interestRate) < parseFloat(best.interestRate))
        ) {
          return current;
        }
        return best;
      });

      bestOfferBidAmount = bestOffer.bidAmount;
    }

    setBestOffer(removeDeci(bestOfferBidAmount / decimalFactor));

    setMainRow(bestOffer);
    setLoading(false);
  }, [rowData, chainDetail?.chain_id, decimalFactor]);

  useEffect(() => {
    pdaDetails();
  }, [pdaDetails]);

  const handleLendButton = useCallback(async () => {
    const eventName = `dapp_loan_tab_lend_${
      rowData?.pool?.collectionName || "unknown"
    }_lend`;

    try {
      analytics.track(eventName, { page: pagename || "unknown" });

      const showModal = (modalType, rowData) => {
        setOpenModal(true);
        setModalType(modalType);
        setLendData({ ...rowData, ...mainRow });
      };

      const userIsValid = await checkLoginValidity();

      if (userIsValid) {
        if (
          chainDetail?.chain_id === "solana" ||
          chainDetail?.chain_id === "296" ||
          selectedChain === "xrp"
        ) {
          showModal("lend", { ...mainRow, ...rowData });
        } else if (chainDetail?.evm) {
          showModal("lend", { ...mainRow, ...rowData });
        } else {
          toast.error("Unsupported chain or wallet connection");
        }
      }
    } catch (error) {
      console.error("Error handling lend button:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }, [
    rowData,
    wallet,
    chainDetail,
    isPaired,
    selectedChain,
    isConnected,
    setOpenModal,
    setModalType,
    setLendData,
    pagename,
    mainRow,
  ]);

  const handleDropdownToggle = useCallback(() => {
    const eventName = openDropdown
      ? `dapp_loan_tab_lend_${rowData?.pool?.collectionName}_drop-down_close`
      : `dapp_loan_tab_lend_${rowData?.pool?.collectionName}_drop-down_open`;

    analytics.track(eventName, { page: pagename });
    setOpenDropdown((prev) => !prev);
  }, [openDropdown, rowData?.pool?.collectionName, pagename]);

  const lastLoanText = useMemo(() => {
    const loanAmount =
      Number(mainRow?.lastLoanAmount) /
      Math.pow(10, chainDetail?.currency_decimal);

    return loanAmount === 0
      ? "No loans taken yet"
      : `${loanAmount} ${chainDetail?.currency_symbol} last loan taken`;
  }, [mainRow, chainDetail?.currency_decimal, chainDetail?.currency_symbol]);

  // console.log({ mainRow, rowData });

  if (loading || load) return <Loader />;

  if (isBigScreen) {
    return (
      <div className="bg-table-row-2 relative px-6 mt-3 -mb-1">
        <div className="w-1 h-full absolute left-0 bg-green"></div>
        <div className="w-full flex justify-between h-16 items-center">
          <div className="w-[190px] flex items-center">
            <img
              src={rowData?.pool?.collectionLogo}
              alt={rowData?.pool?.collectionName}
              className="h-8 w-8 object-cover rounded-full"
            />
            <span className="flex justify-center flex-col ml-3">
              <h5 className="text-white text-sm text-center font-numans md:whitespace-nowrap">
                {rowData?.pool?.collectionName?.length > 15
                  ? `${rowData?.pool?.collectionName?.slice(0, 15)}...`
                  : rowData?.pool?.collectionName}
              </h5>

              <p className="text-xs text-[#8a8f8e] text-left md:whitespace-nowrap">
                Floor : {rowData?.pool?.floor}
              </p>
            </span>
          </div>
          <div className="w-[400px] flex justify-center items-center">
            {Number(liquidity) !== 0 && Number(mainRow?.bidAmount) !== 0 ? (
              <>
                <div className="text-white font-numans text-sm w-[200px] text-center pr-8">
                  <h5 className=" text-sm text-white">
                    {liquidity?.toFixed(3)}
                    <Image
                      src={
                        chainDetail?.currency_image_url ??
                        "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png" ??
                        "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                      }
                      alt="Chain symbol"
                      className="ml-2 inline"
                      height={chainDetail?.chain_id == "solana" ? 15 : 25}
                      width={20}
                    />
                  </h5>
                  <p className="text-xs font-normal text-table-row-subscript">
                    {offersTaken} of {offers} taken
                  </p>
                </div>
                <div className="text-white font-numans text-sm w-[200px] text-center">
                  <h5 className="font-normal text-sm text-white">
                    {bestOffer}
                    <Image
                      src={
                        chainDetail?.currency_image_url ??
                        "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png" ??
                        "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
                      }
                      alt="Chain symbol"
                      className="ml-2 inline"
                      height={chainDetail?.chain_id == "solana" ? 15 : 25}
                      width={20}
                    />
                  </h5>
                  <p className="text-xs font-normal font-numans text-table-row-subscript">
                    {lastLoanText}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-white font-numans w-[200px] text-center">
                <h5 className="font-numans font-normal text-xl text-white text-center md:whitespace-nowrap">
                  Awaiting Lenders
                </h5>
                <p className="text-xs font-normal">{lastLoanText}</p>
              </div>
            )}
          </div>
          <div className="w-[200px]  items-center justify-center ">
            <h5 className="font-normal text-sm text-white text-center">
              {Number(rowData?.pool?.apy) + " %"}{" "}
            </h5>
          </div>
          <div className="w-[200px]">
            <h5 className="font-normal text-sm text-white text-center">
              {removeDeci(Number(mainRow?.loanDurationInMinutes / 1440)) + " D"}
            </h5>
          </div>
          <div className="w-[100px]">
            <TableButton
              onClick={() => handleLendButton()}
              pagename={pagename}
              id={`lend-button-${rowCount}`}
            >
              <div className="flex items-center gap-2 text-table-button-border p-2">
                <h5>Lend</h5>
                <img
                  src="/images/lendButtonIcon.png"
                  className="h-4 w-auto object-contain"
                />
              </div>
            </TableButton>
          </div>
          {openDropdown ? (
            <Image
              src={redDrop}
              className="h-6 w-auto object-contain cursor-pointer"
              onClick={handleDropdownToggle}
              alt="toggle"
              id={`close-row-dropdown-${rowCount}`}
            />
          ) : (
            <Image
              src={greenDrop}
              className="h-6 w-auto object-contain cursor-pointer"
              onClick={handleDropdownToggle}
              alt="toggle"
              id={`open-row-dropdown-${rowCount}`}
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
    );
  } else {
    return (
      <>
        <LoanCard
          lendData={{ ...rowData, ...mainRow }}
          setShowModal={setShowModal}
          key={rowData?.pool?.collectionName}
          offers={offers}
          offersTaken={offersTaken}
          availableNFTs={offers - offersTaken}
          totalNFTs={offers}
          lastLoanTaken={
            Number(mainRow?.lastLoanAmount) /
              Math.pow(10, chainDetail?.currency_decimal) ?? 0
          }
          apy={Number(rowData?.pool?.apy)}
          image={rowData?.pool?.collectionLogo}
          name={rowData?.pool?.collectionName}
          duration={mainRow?.loanDurationInMinutes / 1440}
          floorPrice={rowData?.pool?.floor}
          totalLiquidity={liquidity}
          bestOffer={bestOffer}
          selectedChain={selectedChain}
          setSelectedTab={setSelectedTab}
        />
        <Modals
          rowData={rowData}
          showModal={showModal}
          setShowModal={setShowModal}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </>
    );
  }
};

export default LendRow;
