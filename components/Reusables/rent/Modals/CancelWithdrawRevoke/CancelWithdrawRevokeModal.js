import React, { useContext, useEffect, useState } from "react";
import Modal from "../Modal";
import * as Styles from "./styles";
import { useWallet } from "@solana/wallet-adapter-react";
import { ModalContext } from "@/context/ModalContext";
import MobileModal from "../MobileModal";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  cancelRent as cancelRentSolana,
  expireRent as expireRentSolana,
} from "streamnft-sol-test";
import { PublicKey } from "@solana/web3.js";
import {
  cancelHederaRent,
  expireHederaRent,
} from "@/utils/hashConnectProvider";
import { expireRent } from "@/utils/evmSdkCalls";
import { expireTonRent } from "@/utils/tonProvider";
import {
  solanaCancelRent,
  solanaExpireRent,
  wait,
} from "@/services/rent/reusableFunctions";
import { UserNftContext } from "@/context/UserNftContext";
import { ChainContext } from "@/context/ChainContext";
import { HederaContext } from "@/context/HederaContext";
import { cancelEvmRent, switchUserChain } from "@/utils/evmProvider";
import { cancelTonRent } from "@/utils/tonProvider";
import { useAccount } from "wagmi";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { isTokenExpired } from "@/utils/generalUtils";
import { wagmiConfig } from "@/config/wagmiConfig";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { useConnection } from "@/hooks/useTonConnection";

const WithdrawModal = (cardsData) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { reloadNftCacheCall, addTokenInNftArray } = useContext(UserNftContext);
  const { setOpenModal } = useContext(ModalContext);
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const [point, setPoint] = useState(3);
  const conn = useConnection();

  const {
    accountId,
    nftSignal,
    setNftSignal,
    balanceSignal,
    setBalanceSignal,
  } = useContext(HederaContext);
  const isBigScreen = useMediaQuery();
  const { signer } = useSigner();

  const text = chainDetail.currency_symbol;

  useEffect(() => {
    if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      setPoint(2);
    } else {
      setPoint(3);
    }
  }, [selectedChain]);

  const withdrawCall = async () => {
    setLoading(true);
    if (selectedChain === "Solana") {
      setLoading(true);
      try {
        const nftMint = new PublicKey(cardsData.cardsData.id);

        const val = await expireRentSolana(nftMint);
        if (val) {
          try {
            await solanaExpireRent(cardsData.cardsData.id);

            addTokenInNftArray(cardsData.cardsData.id);

            reloadNftCacheCall();

            toast.success("Transaction Successful");
            setNftSignal(nftSignal + 1);
            setOpenModal(false);
            cardsData.setUserTransacted(!cardsData.userTransacted);
          } catch (e) {
            console.eroor(e);
            toast.error(
              e.message || "An error occurred during Solana rent expiration",
            );
          }
        } else {
          toast.error("Transaction Failed");
          console.error("Transaction Failed");
        }
      } catch (e) {
        console.error(e);
        toast.error(e.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    } else if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      try {
        const res = await expireHederaRent(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.id,
          chainDetail.chain_id,
          accountId,
          chainDetail.contract_address,
          chainDetail.native_address,
        );
        if (res === "SUCCESS") {
          addTokenInNftArray(cardsData.cardsData.id);

          reloadNftCacheCall();

          toast.success("Transaction Successful");
          setNftSignal(nftSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Something went wrong");
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        toast.error(
          "NFT is rented out at the moment. Please try to withdraw after rental expiry.",
        );
        setLoading(false);
      }
    } else if (selectedChain === "ton") {
      const res = await expireTonRent(
        cardsData.cardsData.tokenAddress,
        conn.sender,
      );

      if (res === "SUCCESS") {
        toast.success("Rental expired successfully");
        addTokenInNftArray(cardsData.cardsData.id);

        reloadNftCacheCall();
        setNftSignal(nftSignal + 1);
        setBalanceSignal(balanceSignal + 1);
        setLoading(false);
        setOpenModal(false);
        cardsData.setUserTransacted(!cardsData.userTransacted);
        await refreshData();
      } else {
        toast.error("Failed to expire rental");
      }
    } else {
      try {
        const walletSigner = signer;
        await switchUserChain(chainDetail.chain_id, wagmiConfig);
        const res = await expireRent(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.id,
          null,
          chainDetail.chain_id,
          walletSigner,
          "",
          chainDetail?.contract_address,
        );
        if (res.success) {
          addTokenInNftArray(cardsData.cardsData.id);

          reloadNftCacheCall();
          toast.success("Transaction Successful");
          setNftSignal(nftSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Something went wrong");
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        toast.error(e.message);
        setLoading(false);
      }
    }
  };

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText="Withdraw Details"
          buttonText="Withdraw"
          buttonHandler={() => withdrawCall()}
          loading={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <Loader customMessage="Withdrawing NFT" />
            </div>
          ) : (
            <Styles.Wrapper>
              <div className="image-container">
                {cardsData.cardsData?.image.includes(".mp4") ? (
                  <video
                    className="video-rectangle"
                    autoPlay
                    loop
                    muted
                    src={cardsData.cardsData?.image}
                    type="video/mp4"
                  ></video>
                ) : (
                  <img
                    src={cardsData.cardsData.image}
                    alt={cardsData.cardsData.name}
                  />
                )}
                <h5 className="collection-name">{cardsData.cardsData.name}</h5>
                <span>Duration: 3D</span>
                <span>
                  <span className="owner-address-label">Owner: </span>
                  <span className="owner-address-value">
                    {cardsData.cardsData.owner}
                  </span>
                </span>
              </div>
              <div className="content-section">
                <table>
                  <tr>
                    <th>Contract Type</th>
                    <td>
                      {cardsData.cardsData.ownerShare &&
                      Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0
                        ? " Hybrid"
                        : Number(cardsData.cardsData.rate) > 0
                          ? "Fixed Price"
                          : "Reward Sharing"}
                    </td>
                  </tr>
                  <tr>
                    <th>Rent Type</th>
                    <td>
                      {cardsData.cardsData.rentType === "Variable"
                        ? "Max Duration"
                        : "Fixed Duration"}
                    </td>
                  </tr>
                  <tr>
                    {(Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0) ||
                    Number(cardsData.cardsData.rate) > 0 ? (
                      <>
                        <th>Rent Price</th>
                        <td>
                          {text}
                          <span className="mx-1">
                            {(cardsData.cardsData.rate * 60).toFixed(point)}
                          </span>
                          / Hour
                        </td>{" "}
                      </>
                    ) : (
                      <>
                        <th>Reward Share Owner</th>
                        <td>
                          <span className="mx-1">
                            {cardsData.cardsData.ownerShare}%
                          </span>
                        </td>
                        <th>Reward Share Renter</th>
                        <td>
                          <span className="mx-1">
                            {100 - Number(cardsData.cardsData.ownerShare)}%
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                  {cardsData.cardsData.rentType === "Variable" ? (
                    <tr>
                      <th>Max Duration</th>
                      <td>{cardsData.cardsData.timeLeft} </td>
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <th> Rent Duration</th>
                        <td>{cardsData.cardsData.maxTimeString} </td>
                      </tr>
                      <tr>
                        <th>Duration</th>
                        <td>{cardsData.cardsData.timeLeft} </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <th>Available Duration</th>
                    <td>{cardsData.cardsData.timeLeft} </td>
                  </tr>
                  <tr>
                    <th>Rental Time Left</th>
                    <td>{cardsData.cardsData.rentalTimeLeft} </td>
                  </tr>
                  <tr>
                    <th>Total Profits </th>
                    <td>
                      <p>
                        {cardsData.cardsData.profit}{" "}
                        {chainDetail.currency_symbol}
                      </p>
                    </td>
                  </tr>
                </table>
                <div className="content-row"></div>
              </div>
            </Styles.Wrapper>
          )}
        </Modal>
      ) : (
        <MobileModal>
          {loading ? (
            <Loader customMessage="Withdrawing NFT" />
          ) : (
            <div className="max-h-full overflow-y-auto">
              <div className="flex flex-col h-fit items-start text-white !font-numans p-4 pb-24">
                <h5 className="text-sm mb-2">Withdraw</h5>
                <div className="flex flex-row h-fit w-full bg-black-6 rounded-md gap-4 p-4">
                  {cardsData.cardsData?.image.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={cardsData.cardsData?.image}
                      type="video/mp4"
                      className="h-24 w-24 object-cover rounded-md video-rectangle"
                    ></video>
                  ) : (
                    <img
                      src={cardsData.cardsData.image}
                      alt={cardsData.cardsData.name}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col items-start gap-1">
                    <h5 className="text-sm">
                      {cardsData.cardsData.name}
                      <span className="text-white font-numans text-xs ml-2">
                        #{cardsData.cardsData?.tokenId}
                      </span>
                    </h5>
                    <div className="text-xs flex items-center gap-2">
                      <h5 className="text-gray-4 min-w-24 text-left">
                        Duration
                      </h5>
                      <h5>:</h5>
                      <h5>{cardsData.cardsData.duration}</h5>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <h5 className="text-gray-4 min-w-24 text-left">Owner</h5>
                      <h5>:</h5>
                      <h5> {cardsData.cardsData.owner}</h5>
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-black-6 rounded-md p-4 w-full mt-6">
                  <>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Contract Type</th>
                      <td>
                        {cardsData.cardsData.ownerShare &&
                        Number(cardsData.cardsData.ownerShare) !== 100 &&
                        Number(cardsData.cardsData.ownerShare) !== 0 &&
                        Number(cardsData.cardsData.rate) > 0
                          ? " Hybrid"
                          : Number(cardsData.cardsData.rate) > 0
                            ? "Fixed Price"
                            : "Reward Sharing"}
                      </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Rent Type</th>
                      <td>
                        {cardsData.cardsData.rentType === "Variable"
                          ? "Max Duration"
                          : "Fixed Duration"}
                      </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      {(Number(cardsData.cardsData.ownerShare) !== 100 &&
                        Number(cardsData.cardsData.ownerShare) !== 0 &&
                        Number(cardsData.cardsData.rate) > 0) ||
                      Number(cardsData.cardsData.rate) > 0 ? (
                        <>
                          <th className="text-gray-4">Rent Price</th>
                          <td>
                            {text}
                            <span className="mx-1">
                              {(cardsData.cardsData.rate * 60).toFixed(point)}
                            </span>
                            / Hour
                          </td>{" "}
                        </>
                      ) : (
                        <>
                          <th className="text-gray-4">Reward Share Owner</th>
                          <td>
                            <span className="mx-1">
                              {cardsData.cardsData.ownerShare}%
                            </span>
                          </td>
                          <th className="text-gray-4">Reward Share Renter</th>
                          <td>
                            <span className="mx-1">
                              {100 - Number(cardsData.cardsData.ownerShare)}%
                            </span>
                          </td>
                        </>
                      )}
                    </div>
                    {cardsData.cardsData.rentType === "Variable" ? (
                      <div className="flex w-full items-center justify-between mb-2">
                        <th className="text-gray-4">Max Duration</th>
                        <td>{cardsData.cardsData.duration} </td>
                      </div>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4"> Rent Duration</th>
                          <td>{cardsData.cardsData.maxTimeString} </td>
                        </div>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4">Duration</th>
                          <td>{cardsData.cardsData.timeLeft} </td>
                        </div>
                      </>
                    )}
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Available Duration</th>
                      <td>{cardsData.cardsData.timeLeft} </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Rental Time Left</th>
                      <td>{cardsData.cardsData.rentalTimeLeft} </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Total Profits </th>
                      <td>
                        <p>
                          {cardsData.cardsData.profit}{" "}
                          {chainDetail.currency_symbol}
                        </p>
                      </td>
                    </div>
                  </>
                </div>
              </div>
              <div className="h-20 px-4 border-t-2 border-solid border-grayscale-7 bg-black-6 w-full flex items-center justify-end fixed bottom-0">
                <button
                  id="withdraw-button"
                  className="h-fit w-fit flex items-center gap-2 bg-green disabled:bg-transparent disabled:border border-solid border-gray-300 text-white px-4 py-2 cursor-pointer rounded-md transition-all duration-300"
                  onClick={() => withdrawCall()}
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </MobileModal>
      )}
    </>
  );
};

const CancelModal = (cardsData) => {
  const wallet = useWallet();
  const isBigScreen = useMediaQuery();
  const [loading, setLoading] = useState(false);
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const [point, setPoint] = useState(3);

  const text = chainDetail.currency_symbol;
  const { reloadNftCacheCall, addTokenInNftArray } = useContext(UserNftContext);
  const { setOpenModal } = useContext(ModalContext);
  const { setIsTransactionOngoing, setIsTokenValid } = useUserWalletContext();

  const {
    accountId,
    nftSignal,
    setNftSignal,
    balanceSignal,
    setBalanceSignal,
  } = useContext(HederaContext);
  const { address } = useUserWalletContext();
  const { signer } = useSigner();

  useEffect(() => {
    if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      setPoint(2);
    } else {
      setPoint(3);
    }
  }, [selectedChain]);

  const cancelNFT = async () => {
    const expired = await isTokenExpired();

    if (expired) {
      setIsTokenValid(false);
      return;
    }

    setLoading(true);
    setIsTransactionOngoing(true);
    const chainSelection = chainDetail.chain_id;

    if (selectedChain === "Solana") {
      try {
        const nftMint = new PublicKey(cardsData.cardsData.id);
        setLoading(true);

        const val = await cancelRentSolana(nftMint);

        if (val) {
          await solanaCancelRent(
            cardsData.cardsData.id,
            cardsData.cardsData.tokenAddress,
            wallet.publicKey,
          );
          toast.success("Transaction Successful");
          addTokenInNftArray(cardsData.cardsData.id);

          reloadNftCacheCall();
          setNftSignal(nftSignal + 1);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Transaction Failed");
        }
      } catch (e) {
        toast.error(e.message); // Display the error message
      } finally {
        setLoading(false); // Ensure loading state is reset in both success and error cases
        setIsTransactionOngoing(false);
      }
    } else if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      try {
        const res = await cancelHederaRent(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.id,
          chainSelection,
          accountId,
          chainDetail.contract_address,
          chainDetail.native_address,
        );
        if (res === "SUCCESS") {
          toast.success("Transaction Successful");
          addTokenInNftArray(cardsData.cardsData.id);

          reloadNftCacheCall();
          setNftSignal(nftSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Something went wrong");
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        toast.error(e.message);
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    } else if (chainDetail?.evm) {
      try {
        await switchUserChain(chainSelection, wagmiConfig);
        const res = await cancelEvmRent(
          cardsData?.cardsData?.tokenAddress,
          cardsData?.cardsData?.id,
          chainSelection,
          "dev",
          chainDetail?.contract_address,
          address,
          cardsData?.cardsData?.index,
          cardsData?.cardsData?.rentState?.masterIndex,
          signer,
        );
        if (res === "SUCCESS") {
          addTokenInNftArray(cardsData.cardsData.id);

          reloadNftCacheCall();
          setNftSignal(nftSignal + 1);
          setBalanceSignal(balanceSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    } else if (selectedChain === "ton") {
      const res = await cancelTonRent(
        cardsData.cardsData.tokenAddress,
        conn.sender,
      );

      if (res === "SUCCESS") {
        toast.success("Rental cancelled successfully");
        addTokenInNftArray(cardsData.cardsData.id);

        reloadNftCacheCall();
        setNftSignal(nftSignal + 1);
        setBalanceSignal(balanceSignal + 1);
        setLoading(false);
        setOpenModal(false);
        cardsData.setUserTransacted(!cardsData.userTransacted);
        await refreshData();
      } else {
        toast.error("Failed to cancel rental");
      }
    }
  };

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText="Cancel Details"
          buttonText="Cancel"
          buttonHandler={() => cancelNFT()}
          loading={loading}
        >
          {loading ? (
            <div className="h-fit w-full flex items-center justify-center">
              <Loader customMessage="Cancelling NFT Listing" />
            </div>
          ) : (
            <Styles.Wrapper>
              <div className="image-container">
                {cardsData?.cardsData?.image?.includes(".mp4") ? (
                  <video
                    className="video-rectangle"
                    autoPlay
                    loop
                    muted
                    src={cardsData.cardsData?.image}
                    type="video/mp4"
                  ></video>
                ) : (
                  <img
                    src={cardsData.cardsData.image}
                    alt={cardsData.cardsData.name}
                  />
                )}
                <h5 className="collection-name ">
                  {cardsData.cardsData.name}
                  <span className="text-white font-numans text-sm ml-2">
                    #{cardsData.cardsData?.tokenId}
                  </span>
                </h5>
                <span>Duration: {cardsData.cardsData.timeLeft}</span>
                <span>
                  <span className="owner-address-label">Owner: </span>
                  <span className="owner-address-value">
                    {cardsData.cardsData.owner}
                  </span>
                </span>
              </div>
              <div className="content-section">
                <table>
                  <tr>
                    <th>Contract Type</th>
                    <td>
                      {cardsData.cardsData.ownerShare &&
                      Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0
                        ? " Hybrid"
                        : Number(cardsData.cardsData.rate) > 0
                          ? "Fixed Price"
                          : "Reward Sharing"}
                    </td>
                  </tr>
                  <tr>
                    <th>Rent Type</th>
                    <td>
                      {cardsData.cardsData.rentType === "Variable"
                        ? "Max Duration"
                        : "Fixed Duration"}
                    </td>
                  </tr>

                  {(Number(cardsData.cardsData.ownerShare) !== 100 &&
                    Number(cardsData.cardsData.ownerShare) !== 0 &&
                    Number(cardsData.cardsData.rate) > 0) ||
                  Number(cardsData.cardsData.rate) > 0 ? (
                    <tr>
                      <th>Rent Price</th>
                      <td>
                        {text}
                        <span className="mx-1">
                          {(cardsData.cardsData.rate * 60).toFixed(point)}
                        </span>
                        / Hour
                      </td>{" "}
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <th>Reward Share Owner</th>
                        <td>
                          <span className="mx-1">
                            {cardsData.cardsData.ownerShare}%
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Reward Share Renter</th>
                        <td>
                          <span className="mx-1">
                            {100 - Number(cardsData.cardsData.ownerShare)}%
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                  {cardsData.cardsData.rentType === "Variable" ? (
                    <tr>
                      <th>Max Duration</th>
                      <td>{cardsData.cardsData.duration} </td>
                    </tr>
                  ) : (
                    <>
                      <tr>
                        <th>Duration</th>
                        <td>{cardsData.cardsData.timeLeft} </td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <th>Available Duration</th>
                    <td>{cardsData.cardsData.timeLeft} </td>
                  </tr>
                  <tr>
                    <th>Total Profits </th>
                    <td>
                      <p>
                        {cardsData.cardsData.profit}{" "}
                        {chainDetail.currency_symbol}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </Styles.Wrapper>
          )}
        </Modal>
      ) : (
        <MobileModal>
          {loading ? (
            <Loader customMessage="Cancelling NFT listing" />
          ) : (
            <>
              <div className="flex flex-col items-start text-white !font-numans p-4">
                <h5 className="text-sm mb-2">Cancel</h5>
                <div className="flex flex-row h-fit w-full bg-black-6 rounded-md gap-4 p-4">
                  {cardsData.cardsData?.image.includes(".mp4") ? (
                    <video
                      autoPlay
                      loop
                      muted
                      src={cardsData.cardsData?.image}
                      type="video/mp4"
                      className="h-24 w-24 object-cover rounded-md video-rectangle"
                    ></video>
                  ) : (
                    <img
                      src={cardsData.cardsData.image}
                      alt={cardsData.cardsData.name}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex flex-col items-start gap-1">
                    <h5 className="text-sm mb-2 text-left">
                      {cardsData.cardsData.name} #{cardsData.cardsData?.tokenId}
                    </h5>
                    <div className="text-xs flex items-center gap-2">
                      <h5 className="text-grayscale-4 min-w-16 text-left">
                        Duration
                      </h5>
                      <h5>:</h5>
                      <h5>{cardsData.cardsData.timeLeft}</h5>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <h5 className="text-grayscale-4 min-w-16 text-left">
                        Owner
                      </h5>
                      <h5>:</h5>
                      <h5>
                        {" "}
                        {cardsData.cardsData.owner.slice(0, 6)}...
                        {cardsData.cardsData.owner.slice(-6)}
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-black-6 rounded-md p-4 w-full mt-6">
                  <>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Contract Type</th>
                      <td>
                        {cardsData.cardsData.ownerShare &&
                        Number(cardsData.cardsData.ownerShare) !== 100 &&
                        Number(cardsData.cardsData.ownerShare) !== 0 &&
                        Number(cardsData.cardsData.rate) > 0
                          ? " Hybrid"
                          : Number(cardsData.cardsData.rate) > 0
                            ? "Fixed Price"
                            : "Reward Sharing"}
                      </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Rent Type</th>
                      <td>
                        {cardsData.cardsData.rentType === "Variable"
                          ? "Max Duration"
                          : "Fixed Duration"}
                      </td>
                    </div>

                    {(Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0) ||
                    Number(cardsData.cardsData.rate) > 0 ? (
                      <div className="flex w-full items-center justify-between mb-2">
                        <th className="text-gray-4">Rent Price</th>
                        <td>
                          {text}
                          <span className="mx-1">
                            {(cardsData.cardsData.rate * 60).toFixed(point)}
                          </span>
                          / Hour
                        </td>{" "}
                      </div>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4">Reward Share Owner</th>
                          <td>
                            <span className="mx-1">
                              {cardsData.cardsData.ownerShare}%
                            </span>
                          </td>
                        </div>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4">Reward Share Renter</th>
                          <td>
                            <span className="mx-1">
                              {100 - Number(cardsData.cardsData.ownerShare)}%
                            </span>
                          </td>
                        </div>
                      </>
                    )}
                    {cardsData.cardsData.rentType === "Variable" ? (
                      <div className="flex w-full items-center justify-between mb-2">
                        <th className="text-gray-4">Max Duration</th>
                        <td>{cardsData.cardsData.duration} </td>
                      </div>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4">Duration</th>
                          <td>{cardsData.cardsData.timeLeft} </td>
                        </div>
                      </>
                    )}
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Available Duration</th>
                      <td>{cardsData.cardsData.timeLeft} </td>
                    </div>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Total Profits </th>
                      <td>
                        <p>
                          {cardsData.cardsData.profit}{" "}
                          {chainDetail.currency_symbol}
                        </p>
                      </td>
                    </div>
                  </>
                </div>
              </div>
              <div className="h-fit py-3 px-4 border-t-2 border-solid border-grayscale-7 bg-black-6 w-full flex items-center justify-start fixed bottom-0">
                <button
                  className="h-fit w-fit flex items-center gap-2 bg-green disabled:bg-transparent disabled:border border-solid border-gray-300 text-white px-4 py-2 cursor-pointer rounded-md transition-all duration-300"
                  onClick={() => cancelNFT()}
                >
                  Cancel
                  {/* <Image height={16} width={16} src={CartIcon} /> */}
                </button>
              </div>
            </>
          )}
        </MobileModal>
      )}
    </>
  );
};

const RevokeModal = () => {
  const { chainDetail } = useContext(ChainContext);
  return (
    <Modal headerText="Revoke Details" buttonText="Revoke">
      <Styles.Wrapper>
        <img src="/images/gun.png" alt="" />

        <div className="content-section">
          <div className="content-row">
            <h5>Contract Type</h5>
            <p>Fixed price</p>
          </div>
          <div className="content-row">
            <h5>Duration</h5>
            <p>10 Days</p>
          </div>
          <div className="content-row">
            <h5>Rent Price</h5>
            <p> 40% : 60% ( Owner : Renter )</p>
          </div>
          <div className="content-row">
            <h5>Available for </h5>
            <p>XD: YH: ZM: AS </p>
          </div>
          <div className="content-row">
            <h5>Rental Period </h5>
            <h5>XD: YH: ZM: AS</h5>
          </div>
          <div className="content-row">
            <h5>Revenue Generated </h5>

            <p>{chainDetail.currency_symbol} XYZ</p>
          </div>
        </div>
      </Styles.Wrapper>
    </Modal>
  );
};

export { WithdrawModal, CancelModal, RevokeModal };
