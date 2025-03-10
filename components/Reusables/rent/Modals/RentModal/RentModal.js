import React, {
  Fragment,
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";
import Modal from "../Modal";
import * as Styles from "./rentModalStyles";
import { processRent as processSolanaRent } from "streamnft-sol-test";
import Dropdown from "../../Dropdown/Dropdown";
import { getMinutes, getSeconds, removeQuery, url } from "@/utils/common";
import { toast } from "react-toastify";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Mixpanel } from "@/utils/mixpanel";
import { getUserBalance, processHederaRent } from "@/utils/hashConnectProvider";
import { delay, solanaProcessRent } from "@/services/rent/reusableFunctions";
import { UserNftContext } from "@/context/UserNftContext";
import { ModalContext } from "@/context/ModalContext";
import { ChainContext } from "@/context/ChainContext";
import { HederaContext } from "@/context/HederaContext";
import { useRouter } from "next/router";
import { processEvmRent } from "@/utils/evmProvider";
import { processTonRent } from "@/utils/tonProvider";
import { useAccount, useBalance } from "wagmi";
import useMediaQuery from "@/hooks/useMediaQuery";
import MobileModal from "../MobileModal";
import { useSigner } from "@/context/SignerContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { RippleAPI } from "ripple-lib";
import { getERC20Balance } from "@/utils/evmSdkCalls";
import { ethers } from "ethers";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { wagmiConfig } from "@/config/wagmiConfig";
import { isTokenExpired } from "@/utils/generalUtils";
import { useTonConnection } from "@/hooks/useTonConnection";
import { useTonWallet, useTonAddress } from "@tonconnect/ui-react";

const RentModal = (cardsData) => {
  const [duration, setDuration] = useState(0);
  const [timeScale, setTimeScale] = useState("Hours");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [rentRate, setRentRate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [point, setPoint] = useState(4);
  const [balance, setBalance] = useState("");
  const conn = useTonConnection();

  const { chainDetail, selectedChain } = useContext(ChainContext);
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const { setOpenModal } = useContext(ModalContext);
  const {
    accountId,
    nftSignal,
    setNftSignal,
    balanceSignal,
    setBalanceSignal,
  } = useContext(HederaContext);
  const router = useRouter();
  const isBigScreen = useMediaQuery();
  const wallet = useWallet();
  const { connection } = useConnection();
  const { isConnected, address } = useUserWalletContext();
  const { setIsTransactionOngoing, setIsTokenValid } = useUserWalletContext();
  const { signer } = useSigner();
  const { data } = useBalance({
    address: address,
    config: wagmiConfig,
  });
  const tonwallet = useTonWallet();
  const friendlyAddress = useTonAddress(true);

  useEffect(() => {
    if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      setPoint(2);
    } else {
      setPoint(4);
    }
  }, [selectedChain]);

  useEffect(() => {
    const calculateRentRate = () => {
      if (selectedChain.toString().toUpperCase() === "TON") {
      } else {
        const { rate, fixedDuration } = cardsData.cardsData;

        if (rentType === "Fixed") {
          const r = rate * fixedDuration;

          setRentRate(r.toFixed(point || 2));
          setDisable(false);
        } else {
          setRentRate(rate);
          setDisable(false);
        }
      }
    };

    calculateRentRate();
    setMsg("");
  }, [cardsData]);

  // TODO: complete  discounting in rent
  // const getDiscount = async (chainId) => {
  //   const values = await fetch(`${url}/nftdiscount/296/1/RENT`); //not needed
  //   // const userAddress = getSolidityAddress();
  //   //const discount = await fetch(`${url}/nftdiscount/${chainDetail.chain_id}/${userAddress}/RENT`);
  //   if (values) {
  //     const discount = await values.json();
  //     if (
  //       discount &&
  //       discount[0] &&
  //       discount[0].discount &&
  //       discount[0].discount > 0
  //     ) {
  //       setDiscount(discount[0].discount);
  //     }
  //   }
  // };

  const rentCall = async () => {
    const expired = await isTokenExpired();

    console.log(cardsData.cardsData);

    if (expired) {
      setIsTokenValid(false);
      return;
    }
    // setLoading(true);
    setIsTransactionOngoing(true);
    const chainSelection = chainDetail?.chain_id;
    analytics.track(
      `dapp_rent_${cardsData?.cardsData?.name}_mkt_available_rent_${duration}_place_order`,
    );
    if (selectedChain === "Solana") {
      try {
        let durationInMint = 0;

        // Calculate duration and price based on rent type
        if (cardsData.cardsData.rentType === "Fixed") {
          durationInMint = cardsData.cardsData.fixedDuration;
          price = durationInMint * cardsData.cardsData.rateValue;
          totalRate = cardsData.cardsData.rateValue;
        } else {
          durationInMint = getMinutes(timeScale, duration);
          price = cardsData.cardsData.rate * getSeconds(timeScale, duration);
          totalRate =
            cardsData.cardsData.rateValue * getSeconds(timeScale, duration);
        }
        const nftMint = new PublicKey(cardsData.cardsData.id);

        const processResult = await processSolanaRent(
          new BN(durationInMint),
          nftMint,
          null,
          undefined,
          undefined,
        );

        if (processResult) {
          await solanaProcessRent(
            cardsData?.cardsData?.tokenAddress,
            cardsData?.cardsData?.id,
            durationInMint,
            chainSelection,
            chainDetail?.contract_address,
            router?.query?.ref,
            wallet.publicKey.toString(),
            cardsData?.cardsData?.index,
            cardsData?.cardsData?.initializer,
            processResult,
          );
          reloadNftCacheCall();
          setNftSignal(nftSignal + 1);
          setBalanceSignal(balanceSignal + 1);
          setLoading(false);
          setOpenModal(false);
          toast.success("Transaction Successful");
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Transaction Failed");
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        toast.error(e.message);
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    } else if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      try {
        let durationInMint = 0;

        if (cardsData.cardsData.rentType === "Fixed") {
          durationInMint = cardsData.cardsData.fixedDuration;
        } else {
          durationInMint = getMinutes(timeScale, duration);
        }

        const rateWithInterest =
          Number(cardsData.cardsData.rateValue) +
          Number(cardsData.cardsData.rateValue * 0.1);

        let payableAmount = rateWithInterest * durationInMint;
        payableAmount = payableAmount.toFixed(8) / 100000000;

        const res = await processHederaRent(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.id,
          payableAmount,
          durationInMint,
          chainSelection,
          accountId,
          router?.query?.ref,
          chainDetail.contract_address,
          chainDetail.native_address,
        );
        if (res === "SUCCESS") {
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
      } finally {
        setIsTransactionOngoing(false);
      }
    } else if (chainDetail?.evm && selectedChain) {
      try {
        if (!isConnected) {
          setLoading(false);
          toast.error("Connect your wallet");
          setIsTransactionOngoing(false);
          return;
        }
        let durationInMint = 0;

        if (cardsData.cardsData.rentType === "Fixed") {
          durationInMint = cardsData.cardsData.rentState?.fixedMinutes;
        } else {
          durationInMint = getMinutes(timeScale, duration);
        }

        const res = await processEvmRent(
          cardsData?.cardsData?.tokenAddress,
          cardsData?.cardsData?.id,
          durationInMint,
          chainSelection,
          "dev",
          chainDetail?.contract_address,
          router?.query?.ref,
          address,
          cardsData?.cardsData?.index,
          cardsData?.cardsData?.initializer,
          cardsData?.cardsData?.rentState?.masterIndex,
          cardsData?.cardsData?.state,
          signer,
          cardsData?.cardsData?.paymentToken,
        );
        if (res === "SUCCESS") {
          reloadNftCacheCall();
          setNftSignal(nftSignal + 1);
          setBalanceSignal(balanceSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          console.error(res);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        // const { reason } = await errorDecoder.decode(e);
        // console.error(reason,"rent reason");
        setLoading(false);
      } finally {
        setIsTransactionOngoing(false);
      }
    } else if (selectedChain.toString().toUpperCase() === "TON") {
      try {
        let durationInMint = 0;
        console.log(cardsData.cardsData.rent);
        if (cardsData.cardsData.rentType === "Fixed") {
          durationInMint = cardsData.cardsData.fixedDuration;
        } else {
          durationInMint = getMinutes(timeScale, duration);
        }

        console.log(cardsData.cardsData);
        console.log(durationInMint);
        console.log(conn.sender.address);

        const rentPrice =
          Number(cardsData.cardsData.rateValue) * (durationInMint / 60);

        console.log(rentPrice);
        const res = await processTonRent(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.tokenId,
          durationInMint,
          conn.sender,
          rentPrice,
          cardsData.cardsData.index,
          cardsData.cardsData.initializer.toString(),
        );
      } catch (error) {
        console.error("Error in lendTonToken:", error);

        let errorMessage = "Failed to lend token. Please try again.";

        if (error.code === 4001) {
          errorMessage = "Transaction rejected by user";
        } else if (error.code === -32603) {
          errorMessage =
            "Internal blockchain error. Please check your wallet and try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);

        // Additional error handling (e.g., reset form, update UI state)
        setLoading(false); // If you have a loading state
      }
    }
  };

  const calculateRate = (value) => {
    setDuration(value);
    if (getSeconds(timeScale, value) <= cardsData.cardsData.durationSeconds) {
      const price = (
        (value * getSeconds(timeScale, cardsData.cardsData.rate)) /
        60
      ).toFixed(point);
      setRentRate(price);
      setMsg("");
      setDisable(false);
    } else {
      setDisable(true);
      setRentRate("");
      setMsg("Duration should be less than Available duration");
    }
  };

  const handleTimeScaleChange = (selectedOption) => {
    analytics.track(
      `dapp_rent_${cardsData?.cardsData?.name}_mkt_available_rent_${selectedOption}`,
      {
        selectedOption: selectedOption,
      },
    );

    setTimeScale(selectedOption);
  };

  const setBal = async () => {
    if (selectedChain === "solana") {
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance((bal / LAMPORTS_PER_SOL).toFixed(5));
    } else if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
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
        })
        .catch(console.error);
    } else if (
      chainDetail?.chain_name?.toLowerCase()?.includes("skale") &&
      address
    ) {
      const skaleBal = await getERC20Balance(
        cardsData?.cardsData?.paymentToken,
        address,
        chainDetail?.chain_id,
        chainDetail?.rpc_url,
      );
      setBalance(skaleBal);
    } else if (selectedChain.toUpperCase().toString() === "TON") {
      if (wallet) {
        const url = `https://testnet.toncenter.com/api/v2/getAddressInformation?address=${friendlyAddress}`;

        console.log(url);

        const data = await fetch(url);

        const result = await data.json();

        console.log(result);

        setBalance(`${Number(result.result.balance) / Math.pow(10, 9)}`);
      }
    } else {
      setBalance(ethers?.formatEther(data?.value ?? 0));
    }
  };

  useEffect(() => {
    setBal();
  }, [connection, cardsData, chainDetail, data, selectedChain]);

  const bottomMessage = useMemo(() => {
    if (
      // Number(rentRate) > Number(balance) &&
      getSeconds(timeScale, duration) > cardsData.cardsData.durationSeconds
    ) {
      setDisable(true);
      return (
        <div className="flex w-full text-[#e2e2e2] items-start text-xs font-medium !font-numans">
          <span className="inline text-red mr-1 !font-numans">ERROR :</span>
          Insufficient
          <span className="inline text-red mx-1 !font-numans">balance</span>
          to rent this NFT. Please refer to this{" "}
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
      if (
        getSeconds(timeScale, duration) <= cardsData.cardsData.durationSeconds
      ) {
        setDisable(false);
      }

      return <></>;
    }
  }, [rentRate, balance, duration]);

  //
  // console.log({ cardsData });

  return (
    <>
      {isBigScreen ? (
        <Modal
          headerText="Rent Details"
          buttonText="Rent"
          error={msg}
          buttonIcon={
            <svg
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.51259 0.996835C1.41882 0.621781 1.03876 0.393757 0.663706 0.48753C0.288651 0.581303 0.0606275 0.961362 0.1544 1.33642L1.51259 0.996835ZM4.80486 13.4878L5.22563 12.9283L4.80486 13.4878ZM2.51791 8.04308L3.19863 7.87993L2.51791 8.04308ZM4.65494 13.3695L5.10089 12.83L4.65494 13.3695ZM18.3495 8.45208L19.0302 8.61522L18.3495 8.45208ZM16.5749 13.1312L16.0846 12.6317L16.5749 13.1312ZM15.8671 13.6894L16.2386 14.2827L15.8671 13.6894ZM18.2852 5.12994L18.7657 4.62085L18.2852 5.12994ZM18.5867 5.51217L19.1937 5.16361L18.5867 5.51217ZM11.6669 7.96663C11.2803 7.96663 10.9669 8.28003 10.9669 8.66663C10.9669 9.05322 11.2803 9.36663 11.6669 9.36663V7.96663ZM14.1669 10.4666C13.7803 10.4666 13.4669 10.78 13.4669 11.1666C13.4669 11.5532 13.7803 11.8666 14.1669 11.8666V10.4666ZM1.71077 5.3754H15.371V3.9754H1.71077V5.3754ZM10.9033 13.6245H10.4827V15.0245H10.9033V13.6245ZM3.19863 7.87993L2.3915 4.51225L1.03005 4.83855L1.83718 8.20623L3.19863 7.87993ZM2.38987 4.50561L1.51259 0.996835L0.1544 1.33642L1.03168 4.84519L2.38987 4.50561ZM10.4827 13.6245C8.94439 13.6245 7.85068 13.6234 7.00045 13.5246C6.16793 13.4278 5.64565 13.2443 5.22563 12.9283L4.3841 14.0472C5.07658 14.568 5.87144 14.8028 6.83883 14.9152C7.7885 15.0256 8.97746 15.0245 10.4827 15.0245V13.6245ZM1.83718 8.20623C2.18801 9.67002 2.46405 10.8265 2.79272 11.7243C3.12753 12.6388 3.5411 13.3571 4.20899 13.9091L5.10089 12.83C4.69578 12.4951 4.39552 12.03 4.1074 11.243C3.81314 10.4392 3.55716 9.37588 3.19863 7.87993L1.83718 8.20623ZM5.22563 12.9283C5.1833 12.8965 5.14171 12.8637 5.10089 12.83L4.20899 13.9091C4.2663 13.9565 4.32468 14.0025 4.3841 14.0472L5.22563 12.9283ZM10.9033 15.0245C12.2056 15.0245 13.2343 15.0253 14.0626 14.9416C14.9051 14.8564 15.6059 14.6789 16.2386 14.2827L15.4957 13.0961C15.114 13.3351 14.6494 13.4751 13.9218 13.5487C13.1801 13.6237 12.234 13.6245 10.9033 13.6245V15.0245ZM16.0846 12.6317C15.9056 12.8073 15.7082 12.9631 15.4957 13.0961L16.2386 14.2827C16.537 14.0959 16.8141 13.8773 17.0653 13.6307L16.0846 12.6317ZM15.371 5.3754C16.2 5.3754 16.7576 5.37663 17.1709 5.42706C17.5726 5.47608 17.7214 5.56038 17.8048 5.63903L18.7657 4.62085C18.3674 4.24496 17.87 4.10198 17.3404 4.03737C16.8224 3.97416 16.1637 3.9754 15.371 3.9754V5.3754ZM19.0302 8.61522C19.215 7.84436 19.3697 7.20404 19.4289 6.68559C19.4895 6.15558 19.4664 5.63855 19.1937 5.16361L17.9796 5.86072C18.0367 5.9601 18.084 6.1245 18.038 6.5266C17.9907 6.94026 17.862 7.48273 17.6688 8.28893L19.0302 8.61522ZM17.8048 5.63903C17.8736 5.70397 17.9325 5.77867 17.9796 5.86072L19.1937 5.16361C19.0784 4.96271 18.9341 4.77984 18.7657 4.62085L17.8048 5.63903ZM17.5002 10.4666H14.1669V11.8666H17.5002V10.4666ZM18.298 7.96663L11.6669 7.96663V9.36663L18.298 9.36663V7.96663ZM17.6688 8.28893C17.6514 8.36147 17.6342 8.43292 17.6174 8.50334L18.9787 8.82991C18.9957 8.75933 19.0128 8.68775 19.0302 8.61522L17.6688 8.28893ZM17.6174 8.50334C17.3692 9.538 17.1769 10.3247 16.9759 10.9536L18.3095 11.3797C18.5293 10.6919 18.7337 9.85136 18.9787 8.82991L17.6174 8.50334ZM16.9759 10.9536C16.7061 11.7981 16.4437 12.2792 16.0846 12.6317L17.0653 13.6307C17.6603 13.0467 18.0105 12.3154 18.3095 11.3797L16.9759 10.9536ZM17.5002 11.8666H17.6427V10.4666H17.5002V11.8666Z"
                fill="#F1FCF3"
              />
              <path
                d="M8.72851 16.9561C8.72851 17.4405 8.33577 17.8332 7.85131 17.8332C7.36685 17.8332 6.97412 17.4405 6.97412 16.9561C6.97412 16.4716 7.36685 16.0789 7.85131 16.0789C8.33577 16.0789 8.72851 16.4716 8.72851 16.9561Z"
                fill="#F1FCF3"
              />
              <path
                d="M13.9917 16.9561C13.9917 17.4405 13.5989 17.8332 13.1145 17.8332C12.63 17.8332 12.2373 17.4405 12.2373 16.9561C12.2373 16.4716 12.63 16.0789 13.1145 16.0789C13.5989 16.0789 13.9917 16.4716 13.9917 16.9561Z"
                fill="#F1FCF3"
              />
            </svg>
          }
          buttonHandler={() => rentCall()}
          disable={disable}
          loading={loading}
          message={bottomMessage}
        >
          <Styles.Wrapper>
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader customMessage="Renting NFT " />
              </div>
            ) : (
              <Fragment>
                <div className="image-container">
                  {cardsData?.cardsData?.image?.includes(".mp4") ? (
                    <video
                      className="video-rectangle"
                      autoPlay
                      loop
                      muted
                      src={removeQuery(cardsData.cardsData.image)}
                      type="video/mp4"
                    ></video>
                  ) : (
                    <img
                      src={removeQuery(cardsData.cardsData.image)}
                      alt={
                        cardsData.cardsData.name
                          ? cardsData.cardsData.name.length > 28
                            ? cardsData.cardsData.name.substring(0, 30)
                            : cardsData.cardsData.name
                          : "name"
                      }
                    />
                  )}
                  <h5 className="collection-name">
                    {cardsData.cardsData.name
                      ? cardsData.cardsData.name.length > 28
                        ? cardsData.cardsData.name.substring(0, 30) + "..."
                        : cardsData.cardsData.name
                      : ""}

                    {cardsData.cardsData.chain_id === "TON" ? (
                      <h1>{cardsData.cardsData?.tokenId}</h1>
                    ) : (
                      <span className="text-white font-numans text-sm ml-2">
                        #{cardsData.cardsData?.tokenId}
                      </span>
                    )}
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
                        {Number(cardsData.cardsData.ownerShare) !== 100 &&
                        cardsData.cardsData.ownerShare &&
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

                    {(cardsData.cardsData.ownerShare &&
                      Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0) ||
                    Number(cardsData.cardsData.rate) > 0 ? (
                      <tr>
                        <th>Rent Price</th>
                        <td>
                          <span className="mx-1">
                            {Number(cardsData.cardsData.rate * 60)?.toFixed(
                              point,
                            )}
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
                        <th>Max duration</th>
                        <td>{cardsData.cardsData.timeLeft} </td>
                      </tr>
                    ) : (
                      <>
                        <tr>
                          <th> Rent Duration</th>
                          <td>{cardsData.cardsData.maxTimeString} </td>
                        </tr>
                        <tr>
                          <th>Available Duration</th>
                          <td>{cardsData.cardsData.timeLeft} </td>
                        </tr>
                      </>
                    )}
                  </table>
                  <div className="flex flex-row gap-x-4">
                    {cardsData.cardsData.rentType !== "Fixed" ? (
                      <div className="half-input-wrapper">
                        <h5
                          className="mt-5 mb-2 px-3 text-white"
                          style={{ fontFamily: "Numans" }}
                        >
                          Duration
                        </h5>
                        <div className="duration-input-wrapper ">
                          <input
                            id="duration-input"
                            className="placeholder:!text-[#afafaf] !text-white !font-numans placeholder:!text-xs"
                            type="number"
                            placeholder="Duration"
                            onChange={(e) => {
                              calculateRate(e.target.value);
                              setTimeout(() => {
                                analytics.track(
                                  `dapp_rent_${cardsData?.cardsData?.name}_mkt_available_rent_${e.target.value}`,
                                  { typedData: e.target.value },
                                );
                              }, 1000);
                            }}
                          />
                          <div className="seperator"></div>
                          <Dropdown
                            body={["Hours", "Days", "Months"]}
                            state={timeScale}
                            changeHandler={handleTimeScaleChange}
                            height={"60px"}
                            width={"60px"}
                            noBorder={true}
                            className="pb-4 bg-none"
                            noBackground={true}
                          />
                        </div>
                      </div>
                    ) : null}
                    {Number(cardsData.cardsData.rate) > 0 ? (
                      <div className="half-input-wrapper">
                        <h5
                          className="mt-5 mb-2 px-3 text-white"
                          style={{ fontFamily: "Numans" }}
                        >
                          Rent Price
                        </h5>
                        <div className="duration-input-wrapper ">
                          <input
                            id="rent-price-input"
                            className="placeholder:!text-[#afafaf] !text-white !font-numans text-sm placeholder:!text-xs"
                            disabled
                            placeholder="Auto-Calculate"
                            value={rentRate}
                          />
                          <div className="seperator"></div>

                          <h5 className="cursor-pointer text-white !text-sm ml-2">
                            {" "}
                            {chainDetail.currency_symbol}{" "}
                          </h5>
                        </div>
                        <h5 className="text-[#afafaf] text-right text-xs font-numans mt-1">
                          You have {Number(balance).toFixed(point)}{" "}
                          {chainDetail?.currency_symbol} left
                        </h5>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </Fragment>
            )}
          </Styles.Wrapper>
        </Modal>
      ) : (
        <MobileModal>
          <div className="h-fit w-full flex flex-col font-numans items-start text-white p-4 overflow-y-scroll max-h-full pb-36">
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader customMessage="Renting NFT" />
              </div>
            ) : (
              <Fragment>
                <h5 className="mb-2 text-xs">Rent Details</h5>
                <div className="flex flex-row items-center gap-3 bg-grayscale-8 rounded-md w-full p-2">
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
                      className="h-24 w-24 object-cover rounded-md"
                      alt={
                        cardsData.cardsData.name
                          ? cardsData.cardsData.name.length > 28
                            ? cardsData.cardsData.name.substring(0, 30)
                            : cardsData.cardsData.name
                          : "name"
                      }
                    />
                  )}
                  <div className="flex flex-col items-start">
                    <h5 className="text-sm mb-2 text-left">
                      {cardsData.cardsData.name}{" "}
                      {cardsData.cardsData.chain_id === "TON" ? (
                        <h1> cardsData.cardsData?.tokenId</h1>
                      ) : (
                        `#${cardsData.cardsData?.tokenId}`
                      )}
                    </h5>
                    <div className="w-full flex items-center mb-1">
                      <span className="w-16 text-grayscale-4 text-xs text-left">
                        Duration:{" "}
                      </span>
                      <span className="text-xs">
                        {cardsData.cardsData.timeLeft}
                      </span>
                    </div>
                    <div className="w-full flex items-center">
                      <span className="w-16 text-grayscale-4 text-xs text-left">
                        Owner:{" "}
                      </span>
                      <span className="text-xs">
                        {cardsData.cardsData.owner.slice(0, 6)}...
                        {cardsData.cardsData.owner.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-black-6 rounded-md p-4 w-full mt-6">
                  <>
                    <div className="flex w-full items-center justify-between mb-2">
                      <th className="text-gray-4">Contract Type</th>
                      <td>
                        {Number(cardsData.cardsData.ownerShare) !== 100 &&
                        cardsData.cardsData.ownerShare &&
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
                    {(cardsData.cardsData.ownerShare &&
                      Number(cardsData.cardsData.ownerShare) !== 100 &&
                      Number(cardsData.cardsData.ownerShare) !== 0 &&
                      Number(cardsData.cardsData.rate) > 0) ||
                    Number(cardsData.cardsData.rate) > 0 ? (
                      <div className="flex w-full items-center justify-between mb-2">
                        <th className="text-gray-4">Rent Price</th>
                        <td>
                          <span className="mx-1">
                            {(cardsData.cardsData.rate * 60).toFixed(point)}
                          </span>
                          {text} / Hour
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
                        <th className="text-gray-4">Max duration</th>
                        <td>{cardsData.cardsData.timeLeft} </td>
                      </div>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4"> Rent Duration</th>
                          <td>{cardsData.cardsData.maxTimeString} </td>
                        </div>
                        <div className="flex w-full items-center justify-between mb-2">
                          <th className="text-gray-4">Available Duration</th>
                          <td>{cardsData.cardsData.timeLeft} </td>
                        </div>
                      </>
                    )}
                  </>
                </div>
                <div className="flex flex-row justify-between gap-4 w-full">
                  {cardsData.cardsData.rentType === "Variable" ? (
                    <div className="flex flex-col items-start grow">
                      <h5 className="text-white text-xs my-2">Duration</h5>
                      <div className="flex items-center bg-black-6 h-16 px-3 rounded-md w-full justify-between">
                        <input
                          className="placeholder:!text-[#afafaf] max-w-16 !text-white !font-numans placeholder:!text-xs focus:outline-none focus:border-none bg-transparent"
                          type="number"
                          placeholder="Duration"
                          onChange={(e) => {
                            calculateRate(e.target.value);
                            setTimeout(() => {
                              Mixpanel.track(
                                "home_rentmkt_collection_rent_available_nft_rent_button_duration",
                                { typedData: e.target.value },
                              );
                            }, 1000);
                          }}
                        />
                        <div className="seperator"></div>
                        <Dropdown
                          body={["Hours", "Days", "Months"]}
                          state={timeScale}
                          changeHandler={setTimeScale}
                          height={"60px"}
                          width={"60px"}
                          noBorder={true}
                          className="pb-4 bg-none"
                          noBackground={true}
                        />
                      </div>
                    </div>
                  ) : null}
                  {Number(cardsData.cardsData.rate) > 0 ? (
                    <div className="flex flex-col items-start grow">
                      <h5 className="text-white text-xs my-2">Rent Price</h5>

                      <div className="flex items-center bg-black-6 h-16 px-3 rounded-md w-full justify-between">
                        <input
                          className="placeholder:!text-[white] max-w-16 !text-white !font-numans placeholder:!text-xs focus:outline-none focus:border-none bg-transparent"
                          disabled
                          placeholder="Auto-Calculate"
                          value={rentRate}
                        />
                        <div className="seperator"></div>

                        <h5 className="cursor-pointer text-white !text-sm ml-2">
                          {chainDetail.currency_symbol}{" "}
                        </h5>
                      </div>
                      <h5 className="text-[#afafaf] text-2xs text-right font-numans mt-1">
                        You have {Number(balance).toFixed(point)}{" "}
                        {chainDetail?.currency_symbol} left
                      </h5>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </Fragment>
            )}
          </div>
          <div className="h-20 px-4 border-t-2 border-solid border-grayscale-7 bg-black-6-dark w-full flex items-center justify-start fixed bottom-0">
            <h5 className="text-xs text-red font-numans">{msg}</h5>
            <button
              className="h-fit w-fit flex items-center gap-2 bg-green disabled:bg-transparent disabled:border border-solid border-gray-300 text-white px-4 py-2 cursor-pointer rounded-md transition-all duration-300"
              onClick={() => rentCall()}
              disabled={disable}
            >
              Rent
            </button>
          </div>
        </MobileModal>
      )}
    </>
  );
};

export default RentModal;
