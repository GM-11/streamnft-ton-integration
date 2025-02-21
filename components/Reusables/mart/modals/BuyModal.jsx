"use client";
import React, {
  Fragment,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import CartIcon from "../../../../public/images/cart.png";
import Image from "next/image";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ModalContext } from "@/context/ModalContext";
import { useSigner } from "@/context/SignerContext";
import { toast } from "react-toastify";
import { HederaContext } from "@/context/HederaContext";
import { useBalance } from "wagmi";
import { buyNftCall } from "@/utils/evmProvider";
import { ChainContext } from "@/context/ChainContext";
import { UserNftContext } from "@/context/UserNftContext";
import { removeQuery } from "@/utils/common";
import Modal from "./Modal";
import MobileModal from "./MobileModal";
import Loader from "../../loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { isTokenExpired } from "@/utils/generalUtils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getUserBalance } from "@/utils/hashConnectProvider";
import { RippleAPI } from "ripple-lib";
import { getERC20Balance } from "@/utils/evmSdkCalls";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const BuyModal = () => {
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currentCollection, setCurrentCollection] = useState({});
  const isBigScreen = useMediaQuery();
  const { address } = useUserWalletContext();
  const { modalData, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    userTransacted,
    setUserTransacted,
    collections,
  } = useContext(ChainContext);
  const { balanceSignal, setBalanceSignal } = useContext(HederaContext);
  const { reloadNftCacheCall, addTokenInNftArray } = useContext(UserNftContext);

  const cardsData = { cardsData: modalData };
  const { signer } = useSigner();
  const { setIsTransactionOngoing, setIsTokenValid } = useUserWalletContext();

  const wallet = useWallet();

  const { connection } = useConnection();

  const { isPaired } = useContext(HederaContext);

  const { data, isFetched, refetch } = useBalance({
    address: address,
  });

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

      if (currentCollection?.payment_token?.length > 0) {
        skaleBal = await getERC20Balance(
          currentCollection?.payment_token,
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
    if (wallet.publicKey || isPaired || address || data) {
      setBal();
    }
  }, [isFetched, data, isPaired, address, wallet.publicKey, currentCollection]);

  const router = useRouter();

  const symbol = router.query;

  async function getCollection() {
    const _collection = collections.filter((obj) => {
      const modifyObjName = obj.name.toLowerCase().replace(/[\s-]/g, "");
      const modifySymbol = symbol.symbol.toLowerCase().replace(/[\s-]/g, "");

      return modifyObjName === modifySymbol;
    });
    if (!(_collection === "undefined" || _collection.length === 0)) {
      setCurrentCollection(_collection[0]);
    }
  }

  useEffect(() => {
    getCollection();
  }, [router]);

  const buyHandler = async () => {
    try {
      const expired = await isTokenExpired();

      if (expired) {
        setIsTokenValid(false);
        return;
      }

      setIsTransactionOngoing(true);
      setLoading(true);
      setDisable(true);

      const nftRate = Number(cardsData?.cardsData?.rate);

      if (balance < nftRate) {
        toast.dismiss();
        toast.error("Insufficient balance to buy this NFT.");
        return;
      }

      const response = await buyNftCall(
        cardsData?.cardsData?.tokenId,
        cardsData?.cardsData?.tokenAddress,
        chainDetail?.chain_id,
        signer,
        cardsData?.cardsData?.isErc1155,
        chainDetail?.contract_address,
        address,
        1,
        0
      );

      if (response) {
        addTokenInNftArray(cardsData?.cardsData?.tokenId);
        reloadNftCacheCall();
        setOpenModal(false);
        setBalanceSignal(balanceSignal + 1);
        toast.dismiss();
        toast.success("NFT Bought successfully");

        setUserTransacted(!userTransacted);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to buy NFT. Please try again.");
    } finally {
      setLoading(false);
      setDisable(false);
      setIsTransactionOngoing(false);
    }
  };

  useEffect(() => {
    const nftRate = Number(cardsData?.cardsData?.rate);
    const userBal = Number(balance);

    if (nftRate < userBal && !loading) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [cardsData, balance, loading]);

  const bottomMessage = useMemo(() => {
    const nftRate = Number(cardsData?.cardsData?.rate);
    const userBal = Number(balance);
    if (nftRate > userBal) {
      return (
        <div className="flex w-full text-[#e2e2e2] items-start text-xs font-medium !font-numans">
          Insufficient
          <span className="inline text-red mx-1 !font-numans">balance</span>
          to buy this NFT.
        </div>
      );
    }
  }, [cardsData, balance]);

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText="Buy NFT"
          buttonText="Buy"
          buttonHandler={buyHandler}
          loading={loading}
          disable={disable}
          error={bottomMessage}
        >
          <div className="flex-col h-full w-full flex pt-4 min-h-[350px]">
            {loading ? (
              <Fragment>
                <div className="h-full w-full flex items-center justify-center">
                  <Loader customMessage="Processing Transaction" />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="w-full flex rounded-lg bg-[#2929294D] p-4 gap-4">
                  {cardsData.cardsData?.image?.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={removeQuery(cardsData.cardsData?.image)}
                      type="video/mp4"
                      className="h-[150px] w-[150px] object-contain rounded-md"
                    ></video>
                  ) : (
                    <img
                      className="h-[150px] w-[150px] object-contain rounded-md"
                      src={removeQuery(cardsData.cardsData.image)}
                      alt={cardsData.cardsData.name}
                    />
                  )}
                  <div className="flex flex-col gap-4">
                    <h5 className="flex items-center gap-2 text-white">
                      <p>{cardsData.cardsData.name}</p>
                      <span className="text-white font-numans text-sm ">
                        #{cardsData.cardsData?.tokenId}
                      </span>
                    </h5>
                    <h5 className="flex items-center gap-2 text-white">
                      <span className="owner-address-label">Owner: </span>
                      <span className="owner-address-value !break-words text-sm">
                        {cardsData.cardsData.owner}
                      </span>
                    </h5>
                  </div>
                </div>
                <h5 className="text-white mt-8 font-numans">Buying Price</h5>
                <div className="w-full !min-h-[56px] !bg-[#191919] rounded-lg flex items-center px-4">
                  <input
                    disabled={true}
                    value={
                      cardsData?.cardsData?.rate !== undefined &&
                      cardsData?.cardsData?.rate !== null
                        ? cardsData.cardsData.rate.toString().includes("e")
                          ? cardsData.cardsData.rate
                              .toFixed(10)
                              .replace(/\.?0+$/, "")
                          : cardsData.cardsData.rate
                        : ""
                    }
                    className="text-sm !w-full grow text-white placeholder:!text-white bg-transparent font-numans"
                  />
                  <p className="text-poppins text-xs text-[#c4cac8] whitespace-nowrap font-normal ml-4">
                    you have
                    <span className="text-white mx-1">
                      {Number(balance).toFixed(3)}{" "}
                      {currentCollection?.payment_token_symbol ??
                        chainDetail.currency_symbol}
                    </span>
                    left
                  </p>
                </div>
              </Fragment>
            )}
          </div>
        </Modal>
      ) : (
        <MobileModal>
          <div className="h-fit w-full flex flex-col font-numans items-start text-white p-4 overflow-y-scroll max-h-full pb-36">
            {loading ? (
              <Fragment>
                <div className="h-full w-full flex items-center justify-center">
                  <Loader customMessage="Processing Transaction" />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <h5 className="mb-2 text-xs">NFT Details</h5>
                <div className="flex flex-row items-center gap-3 bg-grayscale-8 rounded-md w-full p-2">
                  {cardsData.cardsData?.image?.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={cardsData.cardsData?.image}
                      type="video/mp4"
                      className="h-24 w-24 object-cover rounded-md video-rectangl"
                    ></video>
                  ) : (
                    <img
                      src={cardsData.cardsData.image}
                      alt={cardsData.cardsData.name}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col items-start">
                    <h5 className="text-sm mb-2">
                      {cardsData.cardsData.name}
                      <span className="text-white font-numans text-sm ml-2">
                        #{cardsData.cardsData?.tokenId}
                      </span>
                    </h5>
                    <div className="w-full flex items-center">
                      <span className="w-16 text-gray-4 text-xs text-left">
                        Owner:{" "}
                      </span>
                      <span className="text-xs break-all">
                        {cardsData.cardsData.owner}
                      </span>
                    </div>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
          {!loading && (
            <div className="h-20 px-4 border-t-2 border-solid border-grayscale-7 bg-black-6 w-full flex items-center justify-between fixed bottom-0">
              <button
                className="h-fit w-fit flex items-center gap-2 bg-green disabled:bg-transparent disabled:border border-solid border-gray-300 text-white px-4 py-2 cursor-pointer rounded-md transition-all duration-300"
                onClick={buyHandler}
                disabled={disable}
              >
                <Image
                  className="w-4 h-4 object-contain"
                  src={CartIcon}
                  alt="cart"
                />
                Buy Now
              </button>
            </div>
          )}
        </MobileModal>
      )}
    </>
  );
};

export default BuyModal;
