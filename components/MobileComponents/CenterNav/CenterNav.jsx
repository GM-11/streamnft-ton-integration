import React, { useContext, useState } from "react";
import { Wrapper } from "./styles";
import Link from "next/link";
import Image from "next/image";
import { ChainContext } from "@/context/ChainContext";
import { removeDeci } from "@/utils/hashConnectProvider";

const CenterNavMobile = ({
  serachString,
  setSerachString,
  totalLoans = 0,
  totalVolume = 0,
  totalLiquidity = 0,
}) => {
  const [dropdownValue, setDropdownValue] = useState("Option One");
  const { selectedChain, chainDetail } = useContext(ChainContext);

  const changeHandler = (item) => {
    setDropdownValue(item);
  };

  return (
    <Wrapper>
      <div className="totals-container">
        <div className="total-volume-text text-white font-semibold font-numans">
          Loan Volume :{" "}
          <span className="text-green">
            {removeDeci(
              totalVolume / Math.pow(10, chainDetail?.currency_decimal)
            )}{" "}
            <Image
              src={chainDetail?.currency_image_url??"https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"}
              alt="Chain symbol"
              className="inline"
              height={chainDetail?.chain_id == "solana" ? 15 : 20}
              width={20}
            />
          </span>
        </div>
        <div className="seperator"></div>
        <div className="total-volume-text text-white font-semibold font-size-large font-numans">
          TVL :{" "}
          <span className="text-green">
            {removeDeci(
              totalLiquidity / Math.pow(10, chainDetail?.currency_decimal)
            )}
            <Image
              src={chainDetail?.currency_image_url??"https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"}
              alt="Chain symbol"
              className="ml-2 inline"
              height={chainDetail?.chain_id == "solana" ? 15 : 25}
            />
          </span>
        </div>
      </div>
      <div className="collection-link text-white font-numans font-normal text-lg">
        Want to add your collection ?
        <Link
          href={"https://tally.so/r/nWE8dP"}
          target="_blank"
          className="text-[#19FB9B] underline underline-offset-[4px]"
        >
          List here.
        </Link>
      </div>
    </Wrapper>
  );
};

export default CenterNavMobile;
