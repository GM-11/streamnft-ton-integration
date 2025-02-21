import { ChainContext } from "@/context/ChainContext";
import { ModalContext } from "@/context/ModalContext";
import { getUserBalance } from "@/utils/hashConnectProvider";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Button2 } from "@/components/MobileComponents/Button";
import { HederaContext } from "@/context/HederaContext";
import { PoolManagerContext } from "@/context/PoolManagerContext";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { addLendData } from "@/utils/evmProvider";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { getERC20Balance } from "@/utils/evmSdkCalls";
import { useUserWalletContext } from "@/context/UserWalletContext";

const LendModal = ({ setShowModal }) => {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const { lendData, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    setUpdateCollectionsSignal,
    updateCollectionsSignal,
  } = useContext(ChainContext);
  const { isPaired } = useContext(HederaContext);
  const { setManagerSignal, managerSignal, poolSignal, setPoolSignal } =
    useContext(PoolManagerContext);

  const wallet = useWallet();
  const { connection } = useConnection();
  const { address, isConnected } = useUserWalletContext();
  const router = useRouter();
  const { data, isFetched, isLoading } = useBalance({
    address: address,
  });
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

  const handleLend = async () => {
    setLoading(true);

    try {
      // Solana Chain
      if (chainDetail?.chain_id == "solana") {
        const amountInLamports = input * LAMPORTS_PER_SOL;

        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error("Not enough SOL in wallet");
        }

        const biddingAmountInLamports = new BN(amountInLamports);
        const biddingPoolPda = new PublicKey(lendData.loanPDA);

        try {
          await initBidManager(
            biddingAmountInLamports,
            new BN(active + 1),
            biddingPoolPda
          );

          await postLoanOffer(
            wallet.publicKey.toBase58(),
            amountInLamports,
            active + 1,
            lendData.bidPoolIndex + 1,
            null,
            "solana",
            null,
            chainDetail.contract_address,
            null
          );

          toast.success("Transaction Successful");
        } catch (err) {
          console.error("Error in Solana transaction:", err);
          toast.error("Something went wrong in transaction");
        }
      }
      // Hedera Chain
      else if (chainDetail?.chain_id == "296") {
        const amountInHBAR = input;

        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error(
            `Not enough ${chainDetail?.currency_symbol} in wallet`
          );
        }

        try {
          await initializeLend(
            Number(lendData.bidPoolIndex),
            amountInHBAR,
            active + 1,
            chainDetail.chain_id,
            router?.query?.ref,
            chainDetail.contract_address,
            chainDetail.native_address
          );

          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
          setPoolSignal(poolSignal + 1);
        } catch (err) {
          console.error("Error in Hedera transaction:", err);
          toast.error("Transaction Failed");
        }
      }
      // XRP Chain
      else if (selectedChain === "xrp") {
        const amountInHBAR = input;

        if (!input || input <= 0 || input * (active + 1) > balance) {
          setLoading(false);
          return toast.error("Not enough HBAR in wallet");
        }

        try {
          await addOffer(lendData.bidPoolIndex, amountInHBAR, active + 1);

          setManagerSignal(managerSignal + 1);
          setUpdateCollectionsSignal(!updateCollectionsSignal);
        } catch (err) {
          console.error("Error in XRP transaction:", err);
          toast.error("Transaction Failed");
        }
      }
      // EVM Chains
      else if (chainDetail?.evm && selectedChain) {
        if (!isConnected) {
          setLoading(false);
          return toast.error("Please connect your wallet");
        }

        if (!input || input <= 0) {
          setLoading(false);
          return toast.error("Amount must be greater than 0");
        }

        if (input * (active + 1) > balance) {
          setLoading(false);
          return toast.error(
            `Not enough ${chainDetail?.currency_symbol} in wallet`
          );
        }

        try {
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
          setShowModal(false);
        } catch (err) {
          console.error("Error in EVM transaction:", err);
          toast.error("Failed to perform lending offer");
        }
      }
    } catch (error) {
      console.error("Error in lending process:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const calculateInterest = (input, active) => {
    const baseInterest =
      (input * (active + 1) * (lendData?.interestRateLender / 1000)) / 100;
    const total = baseInterest;
    return total?.toFixed(4);
  };

  return (
    <>
      {loading ? (
        <div className="w-full items-center justify-center flex">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex justify-center items-center pb-24 min-h-full">
            <div className="h-fit w-full p-2 flex flex-col">
              <div className="h-fit w-full flex gap-4 p-2 bg-field-bg-3 rounded-md">
                <img
                  src={lendData?.pool?.collectionLogo || "/images/cuteape.png"}
                  height={90}
                  width={90}
                  alt="NFT"
                  className="rounded-lg"
                />
                <div className="flex flex-col gap-y-2 font-bold text-xs h-full my-auto">
                  <h5>{lendData?.pool?.collectionName}</h5>
                  <div className="flex items-center">
                    <div className="text-row-dropdown-unselected min-w-[75px] max-w-[75px] text-xs font-medium">
                      APY:
                    </div>
                    <span className="font-normal">{lendData?.pool?.apy}%</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="text-row-dropdown-unselected min-w-[75px] max-w-[75px] text-xs font-medium">
                        Duration:{" "}
                      </div>
                      <span className="font-normal">
                        {!Number.isInteger(lendData?.loanDurationInMinutes)
                          ? lendData?.loanDurationInMinutes / 1440
                          : lendData?.loanDurationInMinutes / 1440}
                        D
                      </span>{" "}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="text-row-dropdown-unselected min-w-[75px] max-w-[75px] text-xs font-medium">
                        FP:{" "}
                      </div>
                      <span className="font-normal">
                        {lendData.floor}
                        <img
                          src={chainDetail.currency_image_url}
                          width={20}
                          height={20}
                          alt="Hedera"
                          className="inline-block m-1"
                        />
                      </span>{" "}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex items-center bg-field-bg-3 my-4 justify-between rounded-md py-4 px-2 focus:!border-none focus:!outline-none !bg-black-6">
                <input
                  id="offer-amount"
                  type="number"
                  placeholder={`Enter Amount in ${chainDetail.currency_symbol}`}
                  className="h-full rounded-lg bg-transparent text-xs grow max-w-[50%] xs:!max-w-full focus:!outline-none focus:!border-none "
                  onChange={(e) => {
                    setInput(Number(e.target.value));
                  }}
                />
                <p className="text-poppins text-right grow text-xs whitespace-nowrap text-table-header-text font-normal">
                  You have {Number(balance).toFixed(3)}{" "}
                  {chainDetail.currency_symbol} left
                </p>
              </div>
              <div className="flex w-full gap-3">
                <div className="grow max-w-[50%]">
                  <label
                    htmlFor="number-of-offers"
                    className="m-2 font-medium text-xs"
                  >
                    Number of Loan offers
                  </label>
                  <div className="bg-field-bg-3 rounded-md">
                    <div
                      className="h-12 grow flex justify-between p-2"
                      id="number-of-offers"
                    >
                      {[0, 1, 2].map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-center rounded-md px-3 cursor-pointer ${
                            active === item ? " bg-green-7" : ""
                          }`}
                          onClick={() => setActive(item)}
                        >
                          <h4>{item + 1}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grow max-w-[50%]">
                  <label
                    htmlFor="total-interest"
                    className="m-2 font-medium text-xs"
                  >
                    Total Interest
                  </label>
                  <h5 className="text-green h-12 flex items-center p-2 rounded-md bg-field-bg-3 text-xs font-semibold text-poppins">
                    {chainDetail.currency_symbol}{" "}
                    <span className="text-white ml-1" id="total-interest">
                      {calculateInterest(input, active)}
                    </span>
                  </h5>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full absolute p-4 flex items-center gap-4 justify-between bottom-0 bg-gray-7 border-t-2 border-solid border-modal-footer-text">
            <h5 className="text-table-row-subscript text-2xs">
              Offers can be cancelled until it is taken by borrower
            </h5>

            <Button2 onClick={handleLend}>Lend</Button2>
          </div>
        </>
      )}
    </>
  );
};

export default LendModal;
