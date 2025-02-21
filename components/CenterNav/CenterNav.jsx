import React, { useContext, useMemo } from "react";
import Link from "next/link";
import SearchBar from "./Searchbar";
import { ChainContext } from "@/context/ChainContext";
import { removeDeci } from "@/utils/hashConnectProvider";
import Image from "next/image";

const CenterNav = ({
  searchString,
  setSearchString,
  totalLoans = 0,
  totalVolume = 0,
  pagename,
}) => {
  const { selectedChain, chainDetail } = useContext(ChainContext);

  const handleLinkClick = () => {
    analytics.track(`dapp_loan_tab_${pagename}_add_collection`, {
      page: pagename,
    });
  };

  const processedLoanVolume = useMemo(() => {
    if (isNaN(totalLoans) || !chainDetail?.currency_decimal) return "0";

    const loanValue = Number(
      totalLoans / Math.pow(10, chainDetail.currency_decimal)
    );

    let [_, decimalPart] = loanValue.toString().split(".");

    return selectedChain.toLowerCase().includes("hedera")
      ? removeDeci(loanValue)
      : decimalPart?.length > 5
      ? loanValue.toFixed(5)
      : loanValue.toString();
  }, [selectedChain, totalLoans, chainDetail]);

  const processedTotalVolume = useMemo(() => {
    if (isNaN(totalVolume) || !chainDetail?.currency_decimal) return "0";

    const loanValue = Number(
      totalVolume / Math.pow(10, chainDetail.currency_decimal)
    );

    let [_, decimalPart] = loanValue.toString().split(".");
    return selectedChain.toLowerCase().includes("hedera")
      ? removeDeci(loanValue)
      : decimalPart?.length > 5
      ? loanValue.toFixed(5)
      : loanValue.toString();
  }, [selectedChain, totalVolume, chainDetail]);

  return (
    <div className="h-fit p-4 w-full max-w-[1200px] mx-auto flex justify-between items-center flex-wrap gap-3">
      <SearchBar
        changeHandler={setSearchString}
        state={searchString}
        pagename={pagename}
      />
      {!isNaN(totalLoans) && (pagename === "borrow" || pagename === "Lend") && (
        <div className="flex gap-3 font-numans">
          <div className="text-white font-semibold text-xs sm:text-sm sm:font-medium flex flex-row items-center gap-2">
            Loan volume :
            <span className="text-[#5FD37A]">{processedLoanVolume}</span>
            <Image
              src={
                chainDetail?.currency_image_url ??
                "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
              }
              alt="Chain symbol"
              className="inline"
              height={chainDetail?.chain_id == "solana" ? 15 : 20}
              width={20}
            />
          </div>
          <div className="h-[35px] w-[2px] bg-[#a8abcb] opacity-20 rotate-[15deg]"></div>
          <div className="text-white font-semibold text-xs sm:text-sm sm:font-medium flex flex-row items-center gap-2">
            TVL : <span className="text-[#5FD37A]">{processedTotalVolume}</span>
            <Image
              src={
                chainDetail?.currency_image_url ??
                "https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"
              }
              alt="Chain symbol"
              className="inline"
              height={chainDetail?.chain_id == "solana" ? 15 : 20}
              width={20}
            />
          </div>
        </div>
      )}

      <div className="text-white text-xs sm:text-sm sm:font-medium">
        Want to add your collection.
        <Link
          href={"https://tally.so/r/nWE8dP"}
          target="_blank"
          onClick={handleLinkClick}
          className="text-[#5FD37A] ml-1 underline underline-offset-[4px]"
          pagename={pagename}
        >
          List here.
        </Link>
      </div>
    </div>
  );
};

export default CenterNav;
