import { ChainContext } from "@/context/ChainContext";
import { ModalContext } from "@/context/ModalContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import {
  hederaAcceptOffer,
  hederaCancelOffer,
} from "@/utils/hashConnectProvider";
import { evmNftCancel } from "@/utils/evmProvider";
import React, { useContext } from "react";
import { toast } from "react-toastify";
import { acceptOffer } from "@/utils/evmSdkCalls";
import { useSigner } from "@/context/SignerContext";
import { useAccount } from "wagmi";
import { useUserWalletContext } from "@/context/UserWalletContext";

const ListingCard = ({ data, rowData }) => {
  const { nftSignal, setNftSignal } = useContext(PoolManagerContext);

  const { selectedChain, chainDetail } = useContext(ChainContext);
  const { signer: walletSigner } = useSigner();
  const { address } = useUserWalletContext();

  const handleAcceptOffer = async (nftPool) => {
    try {
      if (chainDetail?.chain_id == "296") {
        await hederaAcceptOffer(
          nftPool.tokenAddress,
          nftPool.tokenId,
          Number(nftPool.bidAmount),
          nftPool.chainId,
          nftPool.loanDurationInMinutes * 60 +
            Math.floor(new Date().getTime() / 1000),
          chainDetail.native_address
        );
      } else {
        await acceptOffer(
          nftPool.tokenAddress,
          nftPool.tokenId,
          nftPool.chainId,
          signer,
          address
        );
      }
    } catch (error) {
      toast.error("Transaction failed");
      console.error("Error accepting offer:", error);
    } finally {
      setNftSignal(nftSignal + 1);
    }
  };

  const handleCancelOffer = async (nftPool) => {
    setLoading(true);
    try {
      if (chainDetail?.chain_id == "296") {
        await hederaCancelOffer(
          nftPool?.tokenAddress,
          nftPool?.tokenId,
          nftPool?.chainId
        );
      } else {
        const signer = walletSigner;
        await evmNftCancel(
          nftPool?.tokenAddress,
          nftPool?.tokenId,
          nftPool?.chainId,
          signer,
          address
        );
      }
    } catch (error) {
      console.error("Error cancelling offer:", error);
    } finally {
      setNftSignal(nftSignal + 1);
    }
  };

  return (
    <div className="h-fit w-full max-w-full xs:!max-w-[220px] p-2 bg-[#191919] rounded-md">
      <div className="h-fit w-full flex items-center gap-2">
        <img src={data?.image} alt="#" className="h-10 w-10 rounded-full" />
        <div>
          <h5 className="text-2xs">{data?.name}</h5>
          <p className="text-[8px]">Token Id : {data?.tokenId}</p>
        </div>
      </div>

      <div className="h-[1px] my-2 w-full bg-[#29292980]"></div>
      <div className="w-full h-fit pt-2 flex justify-between text-2xs">
        <h5>Best offer</h5>
        <p className="text-xs">
          {Number(data?.bidAmount) /
            Math.pow(10, chainDetail?.currency_decimal)}
          <span className="ml-1">{chainDetail?.currency_symbol}</span>
        </p>
      </div>
      <div className="w-full h-fit pt-2 flex justify-between text-2xs">
        <h5>Interest</h5>
        <p className="text-xs">
          {Number(data?.interestRateLender) / 1000}{" "}
          <span className="ml-1">%</span>{" "}
        </p>
      </div>
      <div className="w-full h-fit py-2 flex justify-between text-2xs">
        <h5>Duration</h5>
        <p className="text-xs">
          {Number(data?.loanDurationInMinutes / 1440)?.toFixed(0)} D
        </p>
      </div>
      <div className="h-fit w-full flex gap-4">
        {/* <div
          className="grow text-2xs rounded-md text-red bg-[#292929] cursor-pointer p-3"
          onClick={() => handleCancelOffer(data)}
        >
          Cancel
        </div> */}
        <div
          className="grow text-2xs rounded-md text-green flex items-center justify-center bg-[#292929] cursor-pointer p-3"
          onClick={() => handleAcceptOffer(data)}
        >
          Accept
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
