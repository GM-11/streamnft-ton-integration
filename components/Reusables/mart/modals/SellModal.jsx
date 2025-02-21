import React, { Fragment, useContext, useEffect, useState } from "react";
import * as Styles from "../../rent/Modals/LendModal/lendModalStyles";
import CartIcon from "../../../../public/images/cart.png";
import Image from "next/image";
import { useSigner } from "../../../../context/SignerContext";
import { useAccount, useBalance } from "wagmi";
import { toast } from "react-toastify";
import { sellNftCall } from "@/utils/evmProvider";
import { ModalContext } from "@/context/ModalContext";
import { ChainContext } from "@/context/ChainContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import Modal from "./Modal";
import MobileModal from "./MobileModal";
import Loader from "../../loan/Loader";
import { UserNftContext } from "@/context/UserNftContext";
import { removeQuery } from "@/utils/common";
import { isTokenExpired } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getUserBalance } from "@/utils/hashConnectProvider";
import { RippleAPI } from "ripple-lib";
import { getERC20Balance } from "@/utils/evmSdkCalls";
import { HederaContext } from "@/context/HederaContext";
import { ethers } from "ethers";
import { useRouter } from "next/router";

const SellModal = () => {
  const [loading, setLoading] = useState(false);
  const [sellingPrice, setSellingPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [currentCollection, setCurrentCollection] = useState({});
  const isBigScreen = useMediaQuery();
  const { modalData, setOpenModal } = useContext(ModalContext);
  const {
    selectedChain,
    chainDetail,
    userTransacted,
    setUserTransacted,
    collections,
  } = useContext(ChainContext);
  const { signer } = useSigner();
  const { address } = useUserWalletContext();
  const { reloadNftCacheCall, removeTokenFromNftArray } =
    useContext(UserNftContext);
  const { setIsTransactionOngoing, setIsTokenValid } = useUserWalletContext();
  const { data, isFetched, isLoading, refetch, error } = useBalance({
    address: address,
  });

  const cardsData = { cardsData: modalData };

  const handlePriceChange = (e) => {
    const input = e.target.value;
    const isValid = /^\d*\.?\d*$/.test(input);

    if (isValid) {
      setSellingPrice(input);
    }
  };

  const wallet = useWallet();

  const { connection } = useConnection();

  const { isPaired } = useContext(HederaContext);

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

  console.log({ currentCollection });

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
    if (
      wallet.publicKey ||
      isPaired ||
      address ||
      walletAddress ||
      data ||
      lendDataō
    ) {
      setBal();
    }
  }, [isFetched, data, isPaired, address, wallet.publicKey, currentCollection]);

  const sellHandler = async () => {
    if (!sellingPrice || isNaN(sellingPrice) || Number(sellingPrice) <= 0) {
      toast.error("Please enter a valid selling price.");
      return;
    }

    const expired = await isTokenExpired();

    if (expired) {
      setIsTokenValid(false);
      return;
    }

    setLoading(true);

    setIsTransactionOngoing(true);
    try {
      const response = await sellNftCall(
        cardsData?.cardsData?.tokenId,
        cardsData?.cardsData?.tokenAddress,
        (
          Number(sellingPrice) * Math.pow(10, chainDetail.currency_decimal)
        ).toFixed(0),
        address,
        chainDetail?.chain_id,
        signer,
        cardsData?.cardsData?.isErc1155,
        chainDetail?.contract_address
      );

      if (response) {
        removeTokenFromNftArray(cardsData.cardsData.tokenId);
        reloadNftCacheCall();
        setOpenModal(false);
        setUserTransacted(!userTransacted);
        toast.dismiss();
        toast.success("Listing created successfully");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
      setSellingPrice("");
      setIsTransactionOngoing(false);
    }
  };

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText="Sell NFT"
          buttonText="Sell"
          buttonHandler={() => {
            sellHandler();
          }}
          loading={loading}
          onClose={() => {
            setSellingPrice("");
          }}
        >
          <Styles.Wrapper className="!flex-col">
            {loading ? (
              <Fragment>
                <div className="h-full w-full flex items-center justify-center">
                  <Loader customMessage="Creating NFT listing" />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="w-full flex rounded-lg bg-[#2929294D] p-4 gap-6">
                  {cardsData.cardsData?.image?.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={removeQuery(cardsData?.cardsData?.image)}
                      type="video/mp4"
                      className="h-[150px] w-[150px] object-contain rounded-md"
                    ></video>
                  ) : (
                    <img
                      className="h-[150px] w-[150px] object-contain rounded-md"
                      src={removeQuery(cardsData?.cardsData?.image)}
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
                      <span className="owner-address-value !break-words text-xs">
                        {cardsData.cardsData.owner}
                      </span>
                    </h5>
                  </div>
                </div>

                <h5 className="text-white mt-8 mb-2 font-numans">
                  Selling Price
                </h5>
                <div className="w-full !min-h-[56px] !bg-[#191919] rounded-lg flex items-center px-4">
                  <input
                    placeholder="Enter selling price here"
                    value={sellingPrice}
                    onChange={handlePriceChange}
                    className="text-sm !w-full grow text-white placeholder:!text-white bg-transparent font-numans"
                  />
                  <span className="text-sm mr-2 text-white font-semibold">
                    {currentCollection?.payment_token_symbol ??
                      chainDetail.currency_symbol}{" "}
                  </span>
                </div>
              </Fragment>
            )}
          </Styles.Wrapper>
        </Modal>
      ) : (
        <MobileModal>
          <div className="h-fit w-full flex flex-col font-numans items-start text-white p-4 overflow-y-scroll max-h-full pb-36">
            {loading ? (
              <Fragment>
                <div className="h-full w-full flex items-center justify-center">
                  <Loader customMessage="Creating NFT listing" />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="flex flex-row items-center gap-3 bg-grayscale-8 rounded-md w-full p-2">
                  {cardsData.cardsData?.image?.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={cardsData.cardsData?.image}
                      type="video/mp4"
                      className="h-24 w-24 object-cover rounded-md"
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
                <div className="flex flex-col items-start w-full"></div>
              </Fragment>
            )}
          </div>
          {!loading && (
            <div className="h-20 px-4 border-t-2 border-solid border-grayscale-7 bg-black-6 w-full flex items-center justify-between fixed bottom-0">
              <button
                className="h-fit w-fit flex items-center gap-2 bg-green disabled:bg-transparent disabled:border border-solid border-gray-300 text-white px-4 py-2 cursor-pointer rounded-md transition-all duration-300"
                onClick={sellHandler}
              >
                Sell
                <Image height={16} width={16} src={CartIcon} alt="cart icon" />
              </button>
            </div>
          )}
        </MobileModal>
      )}
    </>
  );
};

export default SellModal;
