import React, { useContext, useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import { ModalContext } from "@/context/ModalContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { BN } from "@project-serum/anchor";
import { initBidManager } from "streamnft-sol-test";
import {
  getUserBalance,
  initializeLend,
  removeDeci,
} from "@/utils/hashConnectProvider";
import { useBalance, useAccount } from "wagmi";
import { ethers } from "ethers";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { addOffer, walletAddress } from "@/utils/xrpProvider";
import { RippleAPI } from "ripple-lib";
import { ChainContext } from "@/context/ChainContext";
import { addLendData } from "@/utils/evmProvider";
import { useRouter } from "next/router";
import { postSolanaLoanOffer } from "@/utils/apiRequests";
import { useSigner } from "@/context/SignerContext";
import { getERC20Balance } from "streamnft-evm-test";
import Loader from "../../Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";

const LendModal = () => {
  const [active, setActive] = useState(0);
  const { lendData, setOpenModal } = useContext(ModalContext);
  const [input, setInput] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();
  const { setIsTransactionOngoing, setIsTokenValid } = useUserWalletContext();
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { address } = useUserWalletContext();
  const { data, isFetched, isLoading, refetch, error } = useBalance({
    address: address,
  });
  const { isPaired } = useContext(HederaContext);
  const { setManagerSignal, managerSignal, poolSignal, setPoolSignal } =
    useContext(PoolManagerContext);
  const router = useRouter();
  const { signer: walletSigner } = useSigner();

  const setBal = async () => {
    if (chainDetail?.chain_id == "solana") {
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance((bal / LAMPORTS_PER_SOL).toFixed(5));
    } else if (chainDetail?.chain_id == "296") {
      const bal = await getUserBalance();
      setBalance(Number(bal).toFixed(2));
    } else if (selectedChain === "xrp") {
      const api = new RippleAPI({
        server: "wss://s.altnet.rippletest.net:51233",
      });
      api
        .connect()
        .then(() => {
          return api.getBalances(walletAddress);
        })
        .then((balances) => {
          setBalance(balances[0].value);
          // Fetch NFTs here (if applicable)
        })
        .catch(console.error);
    } else if (chainDetail?.evm && address) {
      let skaleBal = 0;

      if (lendData?.pool?.paymentToken?.length > 0) {
        skaleBal = await getERC20Balance(
          lendData?.pool?.paymentToken,
          address,
          chainDetail?.chain_id,
          chainDetail?.rpc_url
        );
      } else {
        skaleBal = ethers?.formatEther(data?.value);
      }

      setBalance(skaleBal);
    } else {
    }
  };

  useEffect(() => {
    refetch();
    if (
      wallet.publicKey ||
      isPaired ||
      address ||
      walletAddress ||
      data ||
      lendData
    ) {
      setBal();
    }
  }, [
    isFetched,
    isLoading,
    data,
    isPaired,
    address,
    wallet.publicKey,
    lendData,
  ]);

  const handelLend = async () => {
    const expired = await isTokenExpired();

    if (expired) {
      setIsTokenValid(false);
      return;
    }

    setLoading(true);
    setIsTransactionOngoing(true);
    if (chainDetail?.chain_id == "solana") {
      const amountInLamports = input * LAMPORTS_PER_SOL;
      if (!input || input <= 0 || input * (active + 1) > balance)
        return toast.error("Not enough SOL in wallet");
      const biddingAmountInLamports = new BN(amountInLamports);
      // const biddingPoolPda = new PublicKey(lendData?.collectionPda);
      const biddingPoolPda = new PublicKey(lendData?.bidPoolIndex);

      try {
        setLoading(true);
        const res = await initBidManager(
          biddingAmountInLamports,
          new BN(active + 1),
          biddingPoolPda
        );

        if (res.success) {
          await postSolanaLoanOffer(
            chainDetail?.chain_id,
            res.data.toString(),
            chainDetail?.contract_address,
            res?.loanOfferAddress,
            wallet.publicKey.toBase58(),
            amountInLamports,
            lendData?.bidPoolIndex,
            active + 1
          );
          setManagerSignal(managerSignal + 1);
          setPoolSignal(poolSignal + 1);
          setLoading(false);
          toast.success("Lend Transaction Successful");
        } else {
          throw new Error("Transaction Failed");
        }

        setOpenModal(false);
      } catch (error) {
        console.error("-----------------", error);
        toast.error("Something went wrong in transaction");
      } finally {
        setLoading(false);
      }
    } else if (chainDetail?.chain_id == "296") {
      const amountInHBAR = input;
      try {
        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error(
            `Not enough ${chainDetail?.currency_symbol} in wallet`
          );
        }

        const res = await initializeLend(
          Number(lendData.bidPoolIndex),
          amountInHBAR,
          active + 1,
          chainDetail.chain_id,
          router?.query?.ref,
          chainDetail.contract_address,
          chainDetail.native_address
        );

        setManagerSignal(managerSignal + 1);
        setPoolSignal(poolSignal + 1);
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        console.error("-----------------", error);
        setLoading(false);
        toast.error("Transaction Failed");
      }
    } else if (selectedChain === "xrp") {
      const amountInHBAR = input;
      try {
        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error("Not enough HBAR in wallet");
        }
        const res = addOffer(
          lendData.bidPoolIndex,
          amountInHBAR,
          active + 1
        ).then(() => {
          setManagerSignal(managerSignal + 1);
        });
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        console.error("-----------------", error);
        setLoading(false);
        toast.error("Transaction Failed");
      }
    } else if (chainDetail?.evm && selectedChain) {
      try {
        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error(
            `Not enough ${chainDetail?.currency_symbol} in wallet`
          );
        }

        const signer = walletSigner;

        await addLendData(
          Number(lendData?.loanPoolIndex),
          input,
          active + 1,
          chainDetail?.chain_id,
          signer,
          address,
          chainDetail?.currency_decimal,
          chainDetail?.contract_address,
          lendData?.pool?.paymentToken
        );
        setManagerSignal(managerSignal + 1);
        setPoolSignal(poolSignal + 1);
        setUpdateCollectionsSignal(!updateCollectionsSignal);
        setLoading(false);
        setOpenModal(false);
      } catch (error) {
        setLoading(false);
      }
    }
    setIsTransactionOngoing(false);
  };

  const priceErrorMessage = useMemo(() => {
    if (Number(input) > Number(balance)) {
      setDisabled(true);
      return (
        <div className="flex w-full text-[#e2e2e2] items-start text-xs font-medium !font-numans my-2">
          <span className="inline text-red mr-1 !font-numans">ERROR :</span>
          Insufficient
          <span className="inline text-red mx-1 !font-numans">funds</span>
          to add liquidity to the pool. Please refer to this
          <a
            href="https://portal.skale.space/bridge?from=mainnet&to=green-giddy-denebola&token=usdc&type=erc20"
            className="text-green-4 underline mx-0.5 !font-numans"
            target="_blank"
          >
            link
          </a>{" "}
          to add funds
        </div>
      );
    } else {
      setDisabled(false);
      return <></>;
    }
  }, [input, balance]);

  const calculateInterest = (input, active) => {
    const baseInterest =
      (input * (active + 1) * (lendData?.interestRateLender / 1000)) / 100;
    const total = baseInterest;
    return total?.toFixed(4);
  };

  return (
    <Modal
      headerText="Lend Details"
      buttonText="Lend"
      footerText={
        disabled
          ? priceErrorMessage
          : "Offers can be cancelled until it is taken by borrower"
      }
      handelButton={() => {
        handelLend();
        analytics.track(
          `dapp_loan_tab_lend_${
            lendData?.pool?.collectionName
          }_drop-down_offers_${lendData?.pool?.apy}_${
            lendData?.loanDurationInMinutes / 1440
          }_lend_${input}`
        );
        analytics.track(
          `dapp_loan_tab_lend_${
            lendData?.pool?.collectionName
          }_drop-down_offers_${lendData?.pool?.apy}_${
            lendData?.loanDurationInMinutes / 1440
          }_lend_place_offer`
        );
      }}
      trackingData={{
        pagename: "lend",
        collectionName: lendData?.pool?.collectionName,
        apy: lendData?.pool?.apy,
        duration: lendData?.loanDurationInMinutes / 1440,
        tab: "lend",
      }}
      disabled={disabled}
    >
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader />
        </div>
      ) : (
        <div className="w-full">
          <div id="top-block" className="w-full">
            <h3 className="text-2xl font-black text-poppins text-green my-4">
              {lendData?.pool?.collectionName}
            </h3>
            <div className="flex w-full items-center bg-modal-header-bg rounded-md p-1">
              <img
                src={lendData?.pool?.collectionLogo}
                alt="#"
                className="h-[120px] w-[120px] rounded-lg"
              />
              <div className="w-full ml-8 h-fit">
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    APY
                  </h5>
                  <p className="text-green text-poppins text-sm font-medium">
                    {lendData?.pool?.apy}%
                    <img
                      className="h-4 w-4 cursor-pointer fixed -translate-y-4 translate-x-10 "
                      src="/images/info-circle.svg"
                      title="test"
                    />
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Duration
                  </h5>
                  <p className="text-white text-poppins text-sm font-medium">
                    {removeDeci(Number(lendData?.loanDurationInMinutes) / 1440)}{" "}
                    D
                  </p>
                </div>
                <div className="flex items-center w-1/3 justify-between mb-2">
                  <h5 className="text-white text-poppins text-sm font-semibold">
                    Floor
                  </h5>
                  <p className="text-white text-poppins text-sm font-medium flex gap-2">
                    {lendData?.floor ? lendData.floor : 0}{" "}
                    <span className="text-white">
                      {chainDetail?.currency_symbol}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-0.5 w-full opacity-10 bg-grey my-4"></div>
          <div className="h-fit py-2 w-full">
            <div className="w-full flex items-center px-3 justify-between h-[60px] bg-modal-field-bg rounded-md">
              <div className="w-full h-fit flex items-center">
                <input
                  id="lend-amount-input"
                  type="number"
                  placeholder={"Enter Offer amount here"}
                  className="h-full placeholder:!text-row-dropdown-unselected !text-white"
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                />

                <p className="text-poppins text-sm text-[#c4cac8] whitespace-nowrap font-normal ml-4">
                  you have
                  <span className="text-white mx-1">
                    {Number(balance).toFixed(3)}{" "}
                    {lendData?.pool?.paymentTokenSymbol ??
                      chainDetail.currency_symbol}
                  </span>
                  left
                </p>
              </div>
            </div>
            <div className="flex items-center w-full mt-6 gap-4">
              <div className="w-full flex items-start whitespace-nowrap gap-2 grow h-fit flex-col">
                <h5 className="text-white text-sm font-semibold text-poppins">
                  Number of Loan offers
                </h5>
                <div className="w-full p-1 rounded-md h-fit flex items-center bg-modal-field-bg-2">
                  <div className="h-12 w-full flex justify-between px-4 py-2">
                    {[0, 1, 2].map((item, index) => (
                      <div
                        key={index}
                        id={`lend-offers-selector-${index + 1}`}
                        className={`flex items-center justify-center rounded-md px-8 cursor-pointer ${
                          active === item
                            ? "bg-table-header text-green"
                            : "text-white"
                        }`}
                        onClick={() => {
                          setActive(item);
                          analytics.track(
                            `dapp_loan_tab_lend_${
                              lendData?.pool?.collectionName
                            }_drop-down_offers_${lendData?.pool?.apy}_${
                              lendData?.loanDurationInMinutes / 1440
                            }_lend_${item + 1}`
                          );
                        }}
                      >
                        <h4>{item + 1}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full flex items-start whitespace-nowrap gap-2 grow h-fit flex-col">
                <h5 className="text-white text-sm font-semibold text-poppins">
                  Total Interest
                </h5>
                <div className="w-full h-fit flex items-center bg-modal-field-bg rounded-md">
                  <div className="h-[60px] w-[150px] flex items-center ">
                    <h5 className="text-green text-sm text-semibold text-poppins">
                      {lendData?.pool?.paymentTokenSymbol ??
                        chainDetail.currency_symbol}{" "}
                      {calculateInterest(input, active)}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LendModal;
