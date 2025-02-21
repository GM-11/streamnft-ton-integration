import { ModalContext } from "@/context/ModalContext";
import { useContext, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import {
  associateHederaToken,
  expireUserLoan,
} from "@/utils/hashConnectProvider";
import { toast } from "react-toastify";
import { ChainContext } from "@/context/ChainContext";
import { evmClaim } from "@/utils/evmProvider";
import { useSigner } from "@/context/SignerContext";
import { UserNftContext } from "@/context/UserNftContext";
import Loader from "../Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const { default: Modal } = require("./Modal");

const ClaimModal = () => {
  const [loading, setLoading] = useState(false);
  const { claimData, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { address, isConnected } = useUserWalletContext();
  const { data, isFetched, isLoading } = useBalance({
    address: address,
  });
  const { isPaired } = useContext(HederaContext);
  const { setManagerSignal, managerSignal, poolSignal, setPoolSignal } =
    useContext(PoolManagerContext);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const { signer: walletSigner } = useSigner();

  const handleClaim = async () => {
    if (chainDetail?.chain_id == "solana") {
    } else if (chainDetail?.chain_id == "296") {
      try {
        setLoading(true);
        await expireUserLoan(
          claimData?.tokenAddress,
          claimData?.tokenId,
          chainDetail?.chain_id,
          claimData?.version,
          chainDetail?.contract_address,
          chainDetail?.native_address
        );
        setManagerSignal(managerSignal + 1);
        setUpdateCollectionsSignal(!updateCollectionsSignal);
        setPoolSignal(poolSignal + 1);
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        setLoading(false);
        toast.error("Transaction Failed!");
        console.error(error);
      }
    } else {
      try {
        setLoading(true);
        const signer = walletSigner;

        const resp = await evmClaim(
          claimData?.tokenAddress,
          claimData?.tokenId,
          claimData?.index ?? 0,
          chainDetail?.chain_id,
          signer,
          chainDetail?.contract_address,
          address
        );
        await reloadNftCacheCall();
        setManagerSignal(managerSignal + 1);
        setUpdateCollectionsSignal(!updateCollectionsSignal);
        setPoolSignal(poolSignal + 1);
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    }
  };

  const handleAssociate = async () => {
    if (chainDetail?.chain_id == "296") {
      try {
        await associateHederaToken(claimData.hederaAddress);
      } catch (e) {
        console.error("Failed to asociate");
      }
    }
  };
  const handleClose = () => {
    setOpenModal(false);
  };

  // console.log({ claimData });

  return (
    <Modal
      headerText="Claim your NFT"
      buttonText="Yes, Claim"
      buttonText2="No, Cancel"
      handelButton={() => handleClaim()}
      handelButton2={() => handleClose()}
    >
      <div className="h-fit w-full flex items-center justify-center">
        {loading ? (
          <Loader customMessage={"Claiming your nft"} />
        ) : (
          <div className="w-full !font-numans !font-light !text-sm">
            <div id="top-block" className="w-full">
              <h3 className="text-2xl font-black  text-[#5FD37A] my-4">
                {claimData?.name === "null"
                  ? claimData?.collection_name
                  : claimData?.name ?? `${claimData?.collection_name}`}
              </h3>
              <div className="flex w-full items-center flex-col">
                <div className="flex w-full items-center">
                  <div className="flex-col items-center w-1/4 ">
                    <img
                      src={claimData?.image ?? claimData?.collection_logo}
                      onError={(e) => {
                        e.target.src = claimData?.collection_logo;
                      }}
                      alt="#"
                      className="h-[120px] w-[120px] rounded-lg"
                    />
                    <p className="text-white ml-3 !text-sm">
                      {claimData?.hederaAddress}
                    </p>
                    <p className="text-white mt-2">
                      Token Id #{claimData?.tokenId}
                    </p>
                  </div>
                  {selectedChain?.toLowerCase()?.includes("hedera") ? (
                    <div className="w-3/4 text-white text-center !text-sm">
                      <p style={{ marginBottom: "20px" }}>
                        Please ensure that the tokenID -{" "}
                        {claimData?.hederaAddress} is associated with your
                        account.
                      </p>
                      <div className="!text-sm font-numans !font-normal">
                        Click{" "}
                        <span
                          className="underline cursor-pointer !text-sm"
                          style={{ color: "#00bb34" }}
                          onClick={() => handleAssociate()}
                        >
                          here
                        </span>{" "}
                        to associate NFT on Hashpack Wallet
                      </div>
                      <p className="!text-sm">or</p>
                      <p className="!text-sm">
                        Click{" "}
                        <a
                          href="https://docs.streamnft.tech/guides/haspack-token-association"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="!text-sm"
                          style={{
                            textDecoration: "underline",
                            color: "#00bb34",
                          }}
                        >
                          here
                        </a>{" "}
                        for manual guidance on associating a token
                      </p>
                    </div>
                  ) : (
                    <div className="w-2/4 text-white text-center !text-base">
                      <p style={{ marginBottom: "20px" }}>
                        do you really wish to proceed with claiming
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-0.5 w-full opacity-10 bg-grey my-2"></div>
            <div className="h-fit py-2 w-full text-white mb-2.5 !text-sm">
              Do you really wish to proceed with claiming this NFT?
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default ClaimModal;
