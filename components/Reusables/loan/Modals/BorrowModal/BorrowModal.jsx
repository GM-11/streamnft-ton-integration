import React, { useContext, useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { ModalContext } from "@/context/ModalContext";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import { UserNftContext } from "@/context/UserNftContext";
import { getMintMetadataById } from "@/utils/helperFunction";

import { processLoan as processSolanaLoan } from "streamnft-sol-test";
import { AccountId } from "@hashgraph/sdk";
import {
  borrowLoan,
  getUserReward,
  removeDeci,
} from "@/utils/hashConnectProvider";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { borrowLoanXrp } from "@/utils/xrpProvider";
import { ChainContext } from "@/context/ChainContext";
import { evmBorrowLoan } from "@/utils/evmProvider";
import { useAccount } from "wagmi";
import { postSolanaProcessLoan } from "@/utils/apiRequests";
import { useSigner } from "@/context/SignerContext";
import { formatTokenId } from "@/utils/solanaProvider";
import Loader from "../../Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const BorrowModal = () => {
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

        let mail = email === "Enter Email" ? "" : email;

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
          borrowData?.pool?.erc1155
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

  const selectedCollectionTokens = useMemo(() => {
    if (chainDetail?.chain_id == "solana") {
      return userNfts?.find((item) => {
        return (
          borrowData?.tokenAddress?.toLowerCase() ===
          item?.collection?.toLowerCase()
        );
      })?.tokenId;
    } else {
      return userNfts?.[0]?.tokenId;
    }
  }, [userNfts, borrowData, selectedChain]);

  // console.log({ borrowData });

  if (!openModal) return <></>;
  if (openModal)
    return (
      <>
        <Modal
          headerText={borrowData?.pool?.collectionName}
          buttonText="Borrow Capital"
          footerText={
            "If loan is not paid then NFT will get transferred to Lender"
          }
          setBorrowData
          handelButton={handelBorrowSDK}
        >
          {loading ? (
            <div className="w-full items-center justify-center flex">
              <Loader />
            </div>
          ) : (
            <div className="w-full px-4">
              <div className="w-full h-fit max-h-[180px] py-4 flex items-start gap-8 overflow-x-auto whitespace-nowrap">
                {selectedCollectionTokens?.length < 0 ? (
                  <div className="min-h-fit min-w-fit">
                    <h4 className="font-numans font-semibold text-xl mb-2 text-white">
                      No NFTs Found.
                    </h4>
                  </div>
                ) : (
                  selectedCollectionTokens?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="min-h-fit min-w-fit flex overflow-x-auto"
                        id={`${item?.tokenId}`}
                      >
                        <div
                          className="min-h-fit min-w-fit mr-4 mb-4"
                          onClick={() => setSelected(item)}
                          title={item.name}
                        >
                          <img
                            src={item?.image}
                            className={`h-[128px] w-[128px] object-cover rounded-xl ${
                              selected.tokenId === item.tokenId
                                ? "border-green border-4"
                                : "border-4x"
                            }`}
                            height={128}
                            width={128}
                            alt="item img"
                          />
                          <p className="font-numans text-white text-base mt-2 text-center">
                            {chainDetail?.chain_id == "solana"
                              ? formatTokenId(item?.tokenId)
                              : item?.tokenId}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-white py-3 w-full">
                <h5 className="text-modal-footer-text text-xs mb-2">
                  Updated 40 minutes ago
                </h5>
                <div className="w-full flex gap-2">
                  <div className="grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                    <h4 className="font-numans text-modal-footer-text font-normal text-sm">
                      Borrow
                    </h4>
                    <div>
                      <h5 className="font-numas text-green-5 font-semibold text-sm my-1">
                        {chainDetail.currency_symbol}{" "}
                        {Number(borrowData?.bidAmount) /
                          Math.pow(10, chainDetail?.currency_decimal)}{" "}
                      </h5>
                      <p className="font-numans font-normal text-xs">
                        {removeDeci(borrowData?.interestRate)}% Interest
                      </p>
                    </div>
                  </div>
                  <div className="grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                    <h4 className="font-numans text-modal-footer-text font-normal text-sm">
                      Duration
                    </h4>
                    <h5 className="font-numans text-white font-semibold text-sm my-1">
                      {removeDeci(borrowData?.loanDurationInMinutes / 1440)} D
                    </h5>
                  </div>
                  <div className="grow bg-modal-field-bg-2 flex items-center flex-row-reverse justify-between px-4 py-3 rounded-md">
                    <h4 className="font-numans text-modal-footer-text font-normal text-sm">
                      Floor
                    </h4>
                    <h5 className="font-numans text-white font-semibold text-sm my-1">
                      {borrowData?.floor}
                    </h5>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row-reverse bg-modal-field-bg-2 items-center h-[60px] my-8 px-6">
                <h5 className="text-modal-footer-text text-sm font-normal font-numans">
                  Total Repay Loan Amount
                </h5>
                <div className="h-fit flex items-center grow">
                  <div className="text-green-5">
                    {chainDetail.currency_symbol}
                  </div>
                  <input
                    type="text"
                    placeholder="Type Here"
                    className="h-full !w-full text-lg font-numans font-semibold !text-green-5 !placeholder-green"
                    readOnly
                    value={
                      chainDetail?.chain_id == "solana"
                        ? Number(
                            (borrowData?.bidAmount + borrowData?.interest) /
                              Math.pow(10, chainDetail?.currency_decimal)
                          )?.toFixed(4)
                        : chainDetail?.chain_id == "296"
                        ? removeDeci(
                            (borrowData?.bidAmount + borrowData?.interest) /
                              Math.pow(10, chainDetail?.currency_decimal)
                          )
                        : selectedChain === "xrp"
                        ? Number(
                            borrowData?.bidAmount + borrowData.interest
                          )?.toFixed(3)
                        : Number(
                            (Number(borrowData?.bidAmount) +
                              borrowData?.interest) /
                              Math.pow(10, chainDetail?.currency_decimal)
                          )?.toFixed(4)
                    }
                  />
                </div>
              </div>

              <div className="w-full flex flex-row-reverse bg-modal-field-bg-2 items-center h-[60px] my-8 px-6">
                <h5 className="text-modal-footer-text text-sm font-normal font-numans">
                  To receive repay alerts
                </h5>
                <div className="h-fit flex items-center grow">
                  <input
                    type="text"
                    id="user-email-input"
                    placeholder="Your Email"
                    className="h-full !w-full font-numans !placeholder-white placeholder:font-numans placeholder:text-md"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </>
    );
};

export default BorrowModal;
