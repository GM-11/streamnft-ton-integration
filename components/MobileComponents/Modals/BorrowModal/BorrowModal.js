import { ChainContext } from "@/context/ChainContext";
import { ModalContext } from "@/context/ModalContext";
import React, { useContext, useEffect, useState } from "react";
import NFTSlider from "../components/NFTSlider/NFTSlider";
import { useRouter } from "next/router";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { Connection } from "ripple-lib/dist/npm/common";
import { UserNftContext } from "@/context/UserNftContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { borrowLoan, getUserReward } from "@/utils/hashConnectProvider";
import { getMintMetadataById } from "@/utils/helperFunction";
import { AccountId } from "@hashgraph/sdk";
import { PublicKey } from "@metaplex-foundation/js";
import { processLoan as processSolanaLoan } from "streamnft-sol-test";
import { postSolanaProcessLoan } from "@/utils/apiRequests";
import { toast } from "react-toastify";
import { borrowLoanXrp } from "@/utils/xrpProvider";
import { evmBorrowLoan } from "@/utils/evmProvider";
import { useAccount } from "wagmi";
import { clusterApiUrl } from "@solana/web3.js";
import { Button2 } from "@/components/MobileComponents/Button";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const BorrowModal = ({ setShowModal }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const { address } = useUserWalletContext();
  const { userNfts, fetching, reloadNftCacheCall } = useContext(UserNftContext);

  const [mint, setMint] = useState(false);
  const [mintData, setMintData] = useState({});

  const { borrowData, openModal } = useContext(ModalContext);
  const { setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { setManagerSignal, managerSignal, poolSignal, setPoolSignal } =
    useContext(PoolManagerContext);
  const [email, setEmail] = useState("Enter Email");
  const router = useRouter();
  const wallet = useWallet();
  const { signer: walletSigner } = useSigner();

  const reward = async () => {
    if (JSON.parse(localStorage.getItem("hashconnectData"))) {
      const length = JSON.parse(localStorage.getItem("hashconnectData"))
        .pairingData.length;
      const reward = await getUserReward(
        JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
          length - 1
        ].accountIds[0],
        chainDetail.chain_id
      );
      if (reward.data?.email === null || reward.data?.email === "") {
        setEmail("Enter Email");
      } else {
        setEmail(reward?.data?.email);
      }
    }
  };

  useEffect(() => {
    setMint(false);
    if (!loading) {
      if (chainDetail?.chain_id == "solana") {
        const value = userNfts?.filter((item) => {
          return (
            item.collection === borrowData?.pool?.tokenAddress.toLowerCase()
          );
        });
        setMint(value.length === 0);
        const data = getMintMetadataById(borrowData.collection_name);
        setMintData(data);
      } else if (
        chainDetail?.chain_id == "296" &&
        borrowData?.poolPDA?.tokenAddress
      ) {
        reward();
        const value = userNfts?.filter((item) => {
          return (
            item.token_id ==
            AccountId.fromSolidityAddress(
              borrowData?.poolPDA.tokenAddress
            ).toString()
          );
        });
      } else if (borrowData?.pool?.tokenAddress) {
        const value = userNfts?.filter((item) => {
          return (
            item?.collection?.toLowerCase() ===
            borrowData?.pool?.tokenAddress.toLowerCase()
          );
        });
      }
    }
  }, [userNfts, borrowData]);

  useEffect(() => {
    setLoading(fetching);
  }, [fetching]);

  const handelBorrowSDK = async () => {
    if (chainDetail?.chain_id == "solana") {
      try {
        if (!selected.tokenId) {
          toast.error("Select NFT to borrow");
          return;
        }
        setLoading(true);

        let mail = email;

        if (mail === "Enter Email") {
          mail = null;
        }

        const res = await processSolanaLoan(
          new PublicKey(borrowData?.offerEscrow?.bidManagerIndex),
          new PublicKey(selected?.tokenId),
          new PublicKey(borrowData?.offerEscrow?.bidPoolIndex)
        );

        if (res.success) {
          const postResp = await postSolanaProcessLoan(
            borrowData?.tokenAddress,
            selected.tokenId,
            borrowData?.offerEscrow?.bidManagerIndex, //loan offer address
            borrowData?.offerEscrow?.bidPoolIndex, // loan pool address
            wallet.publicKey.toBase58(),
            mail,
            res.data,
            chainDetail?.chain_id,
            router?.query?.ref || null,
            chainDetail?.contract_address
          );
          if (postResp.success) {
            toast.success("Loan Borrowed Successfully");
            setLoading(false);
            setOpenModal(false);
          } else {
            toast.error("Loan Borrowed Failed");
            setLoading(false);
            setOpenModal(false);
          }
        } else {
          toast.error("Loan Borrowed Failed");
          setLoading(false);
          setOpenModal(false);
        }
      } catch (error) {
        console.error(error, "error");
        toast.error("Something went wrong");
        setLoading(false);
        setOpenModal(false);
      }
    } else if (chainDetail?.chain_id == "296") {
      if (!selected.serial_number) {
        toast.error("Select NFT to borrow");
      } else {
        try {
          setLoading(true);
          const bidPoolIndex = borrowData.poolPDA.bidPoolIndex;
          const bidManagerIndex = borrowData.offerEscrow.bidManagerIndex;
          const tokenID = selected.token_id;

          let mail = email === "Enter Email" ? "" : email;

          await borrowLoan(
            bidPoolIndex,
            bidManagerIndex,
            tokenID,
            selected.serial_number,
            mail,
            chainDetail.chain_id,
            router?.query?.ref,
            chainDetail.contract_address,
            chainDetail.native_address
          );
          await reloadNftCacheCall();
          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
        } catch (err) {
          console.error(err, "err");
          toast.error("Something went wrong in transaction");
        } finally {
          setLoading(false);
          setOpenModal(false);
        }
      }
    } else if (selectedChain === "xrp") {
      if (!selected.serial_number) {
        toast.error("Select NFT to borrow");
      } else {
        try {
          setLoading(true);
          const bidPoolIndex = borrowData.poolPDA.bidPoolIndex;
          const bidManagerIndex = borrowData.offerEscrow.bidManagerIndex;
          const tokenID = selected.token_id;

          await borrowLoanXrp(
            bidPoolIndex,
            bidManagerIndex,
            tokenID,
            selected.serial_number,
            borrowData.offerEscrow.bidAmount
          );

          await reloadNftCacheCall();
          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
        } catch (err) {
          console.error(err, "err");
          toast.error("Something went wrong in transaction");
        } finally {
          setLoading(false);
          setOpenModal(false);
        }
      }
    } else {
      try {
        if (!selected.tokenId) {
          toast.error("Select NFT to borrow");
          return;
        }

        setLoading(true);
        const bidPoolIndex = borrowData.loanPoolIndex;
        const bidManagerIndex = Number(borrowData.loanOfferIndex);
        const tokenID = Number(selected.tokenId);
        const tokenAddress = borrowData?.pool?.tokenAddress;

        let mail = email === "Enter Your Email" ? "" : email;

        await evmBorrowLoan(
          bidPoolIndex,
          bidManagerIndex,
          tokenID,
          tokenAddress,
          chainDetail?.chain_id,
          walletSigner,
          address,
          mail,
          chainDetail?.contract_address,
          false
        );
        await reloadNftCacheCall();
        setManagerSignal(managerSignal + 1);
        setUpdateCollectionsSignal(!updateCollectionsSignal);
        setPoolSignal(poolSignal + 1);
        setOpenModal(false);
      } catch (err) {
        console.error("request offer error poly", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div>
        {loading ? (
          <Loader />
        ) : (
          <div className="flex justify-center items-center flex-col">
            <NFTSlider selected={selected} setSelected={setSelected} />
            <div className="h-fit w-full p-2 flex flex-col">
              <div className="w-full h-full overflow-auto">
                <div className="w-full flex bg-field-bg-3 items-center p-4 my-3 rounded-md">
                  <div className="w-full flex justify-between items-center grow">
                    <p className="text-green text-left text-sm font-bold">
                      {chainDetail?.currency_symbol}
                      <span className="mx-1">{borrowData?.bestOffer}</span>
                      <span className="text-2xs text-table-row-subscript ml-1">
                        {borrowData?.interest_rate?.toFixed(3)}% interest
                      </span>
                    </p>
                  </div>
                  <p className="text-poppins text-2xs w-fit text-white font-normal whitespace-nowrap">
                    Borrow
                  </p>
                </div>
                <div className="w-full flex gap-4 justify-between">
                  <div className="grow p-4 bg-field-bg-3 flex items-center justify-between text-2xs text-table-header-text ">
                    <h5 className="text-xs">
                      {borrowData?.loanDurationInMinutes / 1440} Days
                    </h5>
                    <p>Duration</p>
                  </div>
                  <div className="grow p-4 bg-field-bg-3 flex items-center justify-between text-xs text-table-header-text ">
                    <h5 className="text-xs">{borrowData?.floor}</h5>
                    <p>Floor</p>
                  </div>
                </div>
                <div className="flex items-center p-4 justify-between bg-field-bg-3 my-4">
                  <p className="text-green flex flex-col text-left text-sm font-bold">
                    <span>
                      {chainDetail?.currency_symbol}
                      <span className="mx-1">{borrowData?.bestOffer}</span>
                    </span>
                    <span className="text-2xs text-table-row-subscript ml-1">
                      {borrowData?.interest_rate?.toFixed(3)}% interest
                    </span>
                  </p>
                  <p className="text-2xs text-table-header-text">
                    Total loan amount
                  </p>
                </div>
                <div className="flex items-center p-4 justify-between bg-field-bg-3 my-4 mb-20">
                  <input
                    id="email-id"
                    type="text"
                    placeholder={`Enter email`}
                    className="h-full rounded-lg bg-transparent text-2xs grow focus:!outline-none focus:!border-none"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  <p className="text-2xs text-table-header-text">
                    to receive repay alerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="w-full fixed p-4 flex items-center gap-4 justify-between bottom-0 bg-gray-7 border-t-2 border-solid border-modal-footer-text">
        <h5 className="text-table-row-subscript text-2xs">
          Offers can be cancelled until it is taken by borrower
        </h5>

        <Button2
          onClick={() => {
            handelBorrowSDK();
          }}
        >
          Borrow
        </Button2>
      </div>
    </>
  );
};

export default BorrowModal;
