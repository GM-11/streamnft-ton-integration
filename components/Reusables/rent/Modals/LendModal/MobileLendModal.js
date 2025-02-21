import React, { Fragment, useContext, useEffect, useState } from "react";
import * as Styles from "@/components/Reusables/rent/Modals/LendModal/lendModalStyles";
import Dropdown from "@/components/Reusables/rent/Dropdown/Dropdown";
import RadioButtons from "@/components/Reusables/rent/RadioButtons";
import { ModalContext } from "@/context/ModalContext";
import { toast } from "react-toastify";
import { InfoIcon } from "@/components/Reusables/rent/Icons";
import Tooltip from "@/components/Reusables/rent/Tooltip/Tooltip";
import { Mixpanel } from "@/utils/mixpanel";
import { initRent } from "streamnft-sol-test";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import {
  getEVMRate,
  getHederaRate,
  getMinutes,
  getRate,
  url,
} from "@/utils/common";
import { checkPairing, lendTokenHedera } from "@/utils/hashConnectProvider";
import { useAccount } from "wagmi";
import { lendToken, approveToken, approveToken1155 } from "@/utils/evmSdkCalls";
import { solanaPostList, wait } from "@/services/rent/reusableFunctions";
import { ChainContext } from "@/context/ChainContext";
import { HederaContext } from "@/context/HederaContext";
import { useRouter } from "next/router";
import MobileModal from "@/components/Reusables/rent/Modals/MobileModal";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import { indexerAxiosInstance } from "@/services/axios";
import { useUserWalletContext } from "@/context/UserWalletContext";

const MobileLendModal = (cardsData) => {
  const [contractType, setContractType] = useState("fixed");
  const [isPrivateRental, setIsPrivateRental] = useState(false);

  const [rate, setRate] = useState(0);
  const [revenueShare, setRevenueShare] = useState(0);
  const [whitelist, setWhitelist] = useState([]);
  const [disable, setDisable] = useState(true);
  const [offerDuration, setOfferDuration] = useState(null);
  const [fixedDurationValue, setFixedDurationValue] = useState(0);
  const [offerScale, setOfferScale] = useState("Hours");
  const [isFixedDurationRadioSelected, setIsFixedDurationRadioSelected] =
    useState(false);

  const [selectedDuration, setSelectedDuration] = useState("max"); // 'fixed', 'max', or 'variable'

  const [loading, setLoading] = useState(false);

  const { setOpenModal, openModal } = useContext(ModalContext);
  const { accountId, nftSignal, setNftSignal } = useContext(HederaContext);
  const { isConnected, address } = useUserWalletContext();
  const [error, setError] = useState("");
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const { signer } = useSigner();

  const router = useRouter();
  const unitChangeHandler = (value) => {
    setOfferScale(value);
    Mixpanel.track(
      "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input_unit"
    );
  };
  const checkDisable = (price, offer, fixed, radio, revenueShare) => {
    if (price > 0 && offer > 0) {
      if (radio && fixed > 0) {
        setDisable(false);
      } else if (!radio) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else if (contractType === "sharing" && revenueShare !== 0 && offer > 0) {
      setDisable(false);
    } else {
      setDisable(true);
    }

    if (
      fixed > 0 &&
      getMinutes(offerScale, fixed) > getMinutes(offerScale, offer)
    ) {
      setDisable(true);
      setError("Rent duration should be less than Lend Duration");
    } else {
      setError("");
    }
  };

  const handleDurationClick = (value) => {
    setSelectedDuration(value);
    if (value === "fixed") {
      Mixpanel.track(
        "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_fixed"
      );
      setIsFixedDurationRadioSelected(true);
    } else if (value === "max") {
      Mixpanel.track(
        "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_max"
      );
      setIsFixedDurationRadioSelected(false);
    } else {
      Mixpanel.track(
        "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_variable"
      );
    }
    checkDisable(
      rate,
      offerDuration,
      fixedDurationValue,
      value !== "fixed",
      revenueShare
    );
  };

  const togglePrivateRental = () => {
    setIsPrivateRental(!isPrivateRental);
  };

  const lendCall = async () => {
    setLoading(true);
    var offerTime = getMinutes(offerScale, offerDuration);
    var fixedTime = getMinutes(offerScale, fixedDurationValue);
    var ownershare = revenueShare ? revenueShare : 0;
    const chainSelection = chainDetail?.chain_id;

    if (selectedChain === "Solana") {
      try {
        var solanaRate = getRate(offerScale, rate);
        const nftMint = new PublicKey(cardsData.cardsData.id);
        initRent(
          new BN(solanaRate),
          new BN(offerTime),
          new BN(fixedTime),
          isFixedDurationRadioSelected,
          new BN(0),
          false,
          new BN(0),
          true,
          null,
          nftMint,
          undefined,
          false
        )
          .then(async (val) => {
            if (val) {
              await wait(15);
              await solanaPostList(cardsData.cardsData.id);
              //await wait(1);
              toast.success("Transaction Successful");
              setLoading(false);
              setOpenModal(false);
              cardsData.setUserTransacted(!cardsData.userTransacted);
            } else {
              toast.error("Transaction Failed");
              setLoading(false);
            }
          })
          .catch((e) => {
            toast.error(e.message);
            console.error(e);
            setLoading(false);
          });
      } catch (e) {
        toast.error(e.message);
        console.error(e);
        setLoading(false);
      }
    } else if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      try {
        const checkPair = await checkPairing();
        if (!checkPair && accountId !== null) {
          setLoading(false);
          toast.error("Connect your wallet");
          return;
        }

        var hederaRate = getHederaRate(offerScale, rate);
        const res = await lendTokenHedera(
          cardsData.cardsData.hederaTokenAddress,
          accountId,
          cardsData.cardsData.id,
          hederaRate,
          offerTime,
          isFixedDurationRadioSelected,
          fixedTime,
          ownershare,
          chainSelection,
          accountId,
          router?.query?.ref,
          chainDetail.contract_address,
          chainDetail.native_address
        );
        if (res === "SUCCESS") {
          await wait(5);
          toast.success("Transaction Successful");
          setNftSignal(nftSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Something went wrong");
          setNftSignal(nftSignal + 1);
          setLoading(false);
        }
      } catch (e) {
        toast.error(e.message);
        console.error(e);
        setNftSignal(nftSignal + 1);
        setLoading(false);
      }
    } else if (chainDetail?.evm && selectedChain) {
      try {
        if (!isConnected) {
          setLoading(false);
          toast.error("Connect your wallet");
          return;
        }

        // if (isPrivateRental) {
        //   try {
        //     const data = {
        //       chainId: chainSelection,
        //       contractAddress: chainDetail.contractAddress,
        //       tokenAddress: cardsData.cardsData.tokenAddress,
        //       tokenId: Number(cardsData.cardsData.id),
        //       whitelistJson: whitelist,
        //     };

        //     const result = await indexerAxiosInstance.post(`/whitelist`, data);

        //     setNftSignal(nftSignal + 1);
        //     setBalanceSignal(balanceSignal + 1);
        //   } catch (e) {
        //     toast.error("Error in private rental");
        //     console.error(e);
        //     setNftSignal(nftSignal + 1);
        //     setLoading(false);
        //   }
        // }

        const allowSigner = signer;

        try {
          if (cardsData?.cardsData?.isErc1155) {
            const approveTokenn = await approveToken1155(
              cardsData.cardsData.tokenAddress,
              chainDetail.contract_address,
              allowSigner
            );
          } else {
            const approve = await approveToken(
              cardsData.cardsData.tokenAddress,
              chainDetail.contract_address,
              cardsData.cardsData.id,
              allowSigner
            );
          }
        } catch (e) {
          console.error(e, "error in polygon");
        }

        var rateValue = getEVMRate(offerScale, rate * 60);

        const walletSigner = signer;

        const res = await lendToken(
          cardsData.cardsData.tokenAddress,
          cardsData.cardsData.id,
          (rateValue * Math.pow(10, chainDetail.currency_decimal)).toFixed(0),
          offerTime,
          isFixedDurationRadioSelected,
          fixedTime,
          ownershare,
          whitelist,
          chainSelection,
          walletSigner,
          null,
          chainDetail.contract_address,
          1
        )
          .then((item) => {
            return item;
          })
          .catch((err) => {
            console.error(err);
          });

        if (res && res.hash) {
          await wait(10);
          toast.success("Transaction Successful");
          setNftSignal(nftSignal + 1);
          setLoading(false);
          setOpenModal(false);
          cardsData.setUserTransacted(!cardsData.userTransacted);
        } else {
          toast.error("Something went wrong");
          setNftSignal(nftSignal + 1);
          setLoading(false);
          //setOpenModal(false);
        }
      } catch (e) {
        toast.error(e.message);
        console.error(e, "error here in polygon");
        setNftSignal(nftSignal + 1);
        setLoading(false);
      }
    }
  };

  const handleWhitelist = async (value) => {
    const newWhitelist = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // Update the whitelist state with the new array.
    setWhitelist(newWhitelist);
  };

  useEffect(() => {
    setRate(null);
    setOfferDuration(null);
    setFixedDurationValue(null);
    setRevenueShare(null);
    if (contractType === "fixed") {
      Mixpanel.track("home_rentmkt_collection_lend_owned_nft_lend_fixed_price");
    } else if (contractType === "revenueSharing") {
      Mixpanel.track(
        "home_rentmkt_collection_lend_owned_nft_lend_revenue_share"
      );
    } else if (contractType === "hybrid") {
      Mixpanel.track("home_rentmkt_collection_lend_owned_nft_lend_hybrid");
    } else return;
  }, [contractType]);

  useEffect(() => {
    setRate(null);
    setOfferDuration(null);
    setFixedDurationValue(null);
    setRevenueShare(null);
  }, [cardsData, openModal]);

  return (
    <MobileModal
    //   headerText="Lend Details"
    //   buttonText="Lend"
    //   buttonHandler={() => lendCall()}
    //   disable={disable}
    //   error={error}
    >
      <Styles.Wrapper
        openSolAddress={isPrivateRental}
        contractType={contractType}
      >
        {loading ? (
          <Fragment>
            <Loader customMessage="Creating NFT listing" />
          </Fragment>
        ) : (
          <Fragment>
            <div className="image-container">
              {cardsData.cardsData?.image?.includes(".mp4") ? (
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
              <h5 className="collection-name">
                {cardsData.cardsData.name}
                <span className="text-white font-numans text-sm ml-2">
                  #{cardsData.cardsData?.tokenId}
                </span>
              </h5>
              <span>Duration: 3D</span>
              <span>
                {/* <span className="owner-address-label">Owner: </span> */}
                {/* <span className="owner-address-value break-all">
                  {cardsData.cardsData.owner}
                </span> */}
              </span>
            </div>
            <div className="lend-modal-content">
              <h5>Contract Type</h5>
              <div className="content-row">
                <div className="contract-selection items-center justify-between">
                  <Styles.SelectionOption
                    selected={contractType === "fixed" ? true : false}
                    onClick={() => setContractType("fixed")}
                  >
                    <h5 className=" !text-sm numans-label">Fixed Price</h5>
                  </Styles.SelectionOption>
                  <Styles.SelectionOption
                    selected={contractType === "sharing" ? true : false}
                    onClick={() => setContractType("sharing")}
                  >
                    <h5 className=" !text-sm  numans-label whitespace-nowrap">
                      Reward Sharing
                    </h5>
                  </Styles.SelectionOption>
                  <Styles.SelectionOption
                    selected={contractType === "hybrid" ? true : false}
                    onClick={() => setContractType("hybrid")}
                  >
                    <h5 className=" !text-sm  numans-label">Hybrid</h5>
                  </Styles.SelectionOption>
                </div>
              </div>
              <div className="w-full mt-2 mb-0 flex flex-row  items-center justify-between">
                <div className="flex items-center justify-between">
                  <h5 className="text-white !text-sm whitespace-nowrap numans-label">
                    Lend Duration
                  </h5>

                  <div className="tooltip">
                    <InfoIcon className="h-4 w-4 text-green ml-4" />
                    <span className="tooltiptext !text-xs">
                      Specify the duration you would like to deploy NFT on
                      StreamNFT protocol
                    </span>
                  </div>
                </div>
                <Styles.TimeInput show={true}>
                  <div className="time-input-wrapper">
                    <input
                      className="placeholder:!text-[white] placeholder:!text-xs !text-[white] placeholder:!font-numans"
                      type="number"
                      placeholder="Lend Duration"
                      value={offerDuration}
                      onChange={(e) => {
                        setOfferDuration(e.target.value);
                        setTimeout(() => {
                          Mixpanel.track(
                            "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input"
                          );
                        }, 1000);
                        checkDisable(
                          rate,
                          e.target.value,
                          fixedDurationValue,
                          isFixedDurationRadioSelected,
                          revenueShare
                        );
                      }}
                    />
                    <div className="seperator"></div>
                    <Dropdown
                      body={["Hours", "Days", "Months"]}
                      state={offerScale}
                      changeHandler={unitChangeHandler}
                      height={"60px"}
                      width={"90px"}
                      noBorder={true}
                      noBackground={true}
                    />
                  </div>
                </Styles.TimeInput>
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center justify-between">
                  <h5 className="text-white !text-sm whitespace-nowrap numans-label">
                    Rent Duration
                  </h5>

                  <div className="tooltip">
                    <InfoIcon className="h-4 w-4 text-green ml-4" />
                    <span className="tooltiptext !text-xs">
                      Specify the duration you would like to deploy NFT on
                      StreamNFT protocol
                    </span>
                  </div>
                </div>
                <div className="content-row !w-[55%]">
                  <div className="contract-selection items-center justify-between gap-2">
                    <Styles.SelectionOption
                      selected={selectedDuration === "max" ? true : false}
                      onClick={() => handleDurationClick("max")}
                    >
                      <h5 className="whitespace-nowrap">Maximum</h5>
                    </Styles.SelectionOption>
                    <Styles.SelectionOption
                      selected={selectedDuration === "fixed" ? true : false}
                      onClick={() => handleDurationClick("fixed")}
                    >
                      <h5 className="whitespace-nowrap">Fixed</h5>
                    </Styles.SelectionOption>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-row justify-end gap-4">
                {selectedDuration === "max" ? (
                  <Styles.TimeInput show={true}>
                    <div className="time-input-wrapper">
                      <input
                        className="placeholder:!text-[white] placeholder:!text-xs !text-[white] placeholder:!font-numans"
                        type="number"
                        placeholder="Max Duration"
                        value={offerDuration}
                        onChange={(e) => {
                          setOfferDuration(e.target.value);
                          setTimeout(() => {
                            Mixpanel.track(
                              "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input"
                            );
                          }, 1000);
                          checkDisable(
                            rate,
                            e.target.value,
                            fixedDurationValue,
                            isFixedDurationRadioSelected,
                            revenueShare
                          );
                        }}
                        disabled
                      />
                      <div className="seperator"></div>
                      <Dropdown
                        body={["Hours", "Days", "Months"]}
                        state={offerScale}
                        changeHandler={unitChangeHandler}
                        height={"60px"}
                        width={"90px"}
                        noBorder={true}
                        noBackground={true}
                      />
                    </div>
                  </Styles.TimeInput>
                ) : (
                  // Render Fixed Duration input when selectedDuration is "fixed"
                  <Styles.TimeInput show={true}>
                    <div className="time-input-wrapper">
                      <input
                        className="placeholder:!text-[white] placeholder:!text-xs !text-[white] placeholder:!font-numans"
                        type="number"
                        placeholder="Fixed Duration"
                        value={fixedDurationValue}
                        onChange={(e) => {
                          setFixedDurationValue(e.target.value);
                          setTimeout(() => {
                            Mixpanel.track(
                              "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input"
                            );
                          }, 1000);
                          checkDisable(
                            rate,
                            offerDuration,
                            e.target.value,
                            isFixedDurationRadioSelected,
                            revenueShare
                          );
                        }}
                      />
                      <div className="seperator"></div>
                      <Dropdown
                        body={["Hours", "Days", "Months"]}
                        state={offerScale}
                        changeHandler={unitChangeHandler}
                        height={"60px"}
                        width={"90px"}
                        noBorder={true}
                        noBackground={true}
                      />
                    </div>
                  </Styles.TimeInput>
                )}
              </div>
              {contractType === "fixed" ? (
                <>
                  <div className="flex items-center flex-row justify-between">
                    <h5 className="text-white !text-sm whitespace-nowrap  numans-label">
                      Rent Price
                    </h5>

                    <div className="h-[60px] w-[55%] px-2  flex items-center justify-items-end  bg-[#191919] rounded-lg !font-numans">
                      <input
                        className="placeholder:!text-[white] !text-[white] placeholder:!text-xs placeholder:!font-numans"
                        type="number"
                        placeholder="Price"
                        onChange={(e) => {
                          setRate(e.target.value);
                          setTimeout(() => {
                            Mixpanel.track(
                              "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input_unit"
                            );
                          }, 1000);
                          checkDisable(
                            e.target.value,
                            offerDuration,
                            fixedDurationValue,
                            isFixedDurationRadioSelected,
                            revenueShare
                          );
                        }}
                      />

                      <h5 className="cursor-pointer text-white !text-sm ml-2">
                        {" "}
                        {chainDetail.currency_symbol}{" "}
                      </h5>

                      <h5 className="text-white !text-sm cursor-pointer ml-2">
                        per
                      </h5>
                      {isFixedDurationRadioSelected ? (
                        <h5 className="text-white !text-sm cursor-pointer ml-2">
                          {offerScale.slice(0, offerScale.length - 1)}
                        </h5>
                      ) : (
                        <h5 className="text-white !text-sm cursor-pointer ml-2">
                          {offerScale.slice(0, offerScale.length - 1)}
                        </h5>
                      )}
                    </div>
                  </div>
                  <div className="w-full mt-2 mb-0">
                    <RadioButtons
                      checked={isPrivateRental}
                      clickHandler={() => togglePrivateRental()}
                      groupName="private-rent"
                      label={
                        <div className="flex">
                          <p className="numans-label whitespace-nowrap">
                            Private Rental
                          </p>

                          <div className="tooltip">
                            <InfoIcon className="h-4 w-4 text-green ml-4" />
                            <span className="tooltiptext !text-xs">
                              If you wish to share it with a specific public
                              address. Only they'll see on the marketplace
                            </span>
                          </div>
                        </div>
                      }
                      labelID="private-rental-radio-buttons"
                    />
                  </div>
                  {isPrivateRental && (
                    <div className="wallet-row">
                      <>
                        <input
                          type="text"
                          placeholder="Wallet Address"
                          className="address-input whitespace-nowrap  !text-[white] placeholder:!text-[white] placeholder:!text-sm placeholder:!font-numans"
                          onChange={(e) => handleWhitelist(e.target.value)}
                        />
                        <button className="whitespace-nowrap">
                          or upload csv
                          <svg
                            width="18"
                            height="19"
                            viewBox="0 0 18 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.98514 6.11545L3.09465 6.80683L2.98514 6.11545ZM6.4487 2.65189L7.14008 2.7614V2.7614L6.4487 2.65189ZM14.7824 17.0377L14.371 16.4713L14.7824 17.0377ZM15.7042 16.1159L15.1379 15.7044L15.7042 16.1159ZM2.29576 16.1159L2.86207 15.7044L2.29576 16.1159ZM3.21756 17.0377L3.62901 16.4713L3.21756 17.0377ZM3.21756 1.96251L2.80611 1.3962L3.21756 1.96251ZM2.29576 2.88431L1.72945 2.47286L2.29576 2.88431ZM14.7824 1.96251L14.371 2.52882L14.7824 1.96251ZM15.7042 2.88431L15.1379 3.29576L15.7042 2.88431ZM6.5 1.19086L6.47603 0.491266L6.5 1.19086ZM1.52411 6.16675L0.824518 6.14278L1.52411 6.16675ZM8.3 13.6667C8.3 14.0533 8.6134 14.3667 9 14.3667C9.3866 14.3667 9.7 14.0533 9.7 13.6667H8.3ZM5.16949 9.17399C4.89734 9.44857 4.89932 9.89178 5.1739 10.1639C5.44849 10.4361 5.8917 10.4341 6.16384 10.1595L5.16949 9.17399ZM6.83154 8.49143L7.32872 8.9842L6.83154 8.49143ZM11.1685 8.49143L10.6713 8.9842L11.1685 8.49143ZM11.8362 10.1595C12.1083 10.4341 12.5515 10.4361 12.8261 10.1639C13.1007 9.89178 13.1027 9.44857 12.8305 9.17399L11.8362 10.1595ZM8.79111 7.01334L8.70261 6.31896H8.7026L8.79111 7.01334ZM9.20889 7.01334L9.2974 6.31896H9.2974L9.20889 7.01334ZM9 7.00008L9 6.30008L9 7.00008ZM3.09465 6.80683C5.17706 6.47701 6.81026 4.84381 7.14008 2.7614L5.75732 2.54239C5.52238 4.02575 4.359 5.18913 2.87564 5.42407L3.09465 6.80683ZM0.8 8.66675V10.3334H2.2V8.66675H0.8ZM17.2 10.3334V8.66675H15.8V10.3334H17.2ZM9 18.5334C10.5468 18.5334 11.7631 18.5344 12.7277 18.4299C13.7053 18.3239 14.507 18.103 15.1939 17.604L14.371 16.4713C13.9626 16.7681 13.4354 16.945 12.5769 17.038C11.7052 17.1325 10.578 17.1334 9 17.1334V18.5334ZM15.8 10.3334C15.8 11.9114 15.799 13.0387 15.7046 13.9103C15.6116 14.7688 15.4347 15.296 15.1379 15.7044L16.2705 16.5273C16.7696 15.8405 16.9905 15.0388 17.0965 14.0611C17.201 13.0965 17.2 11.8802 17.2 10.3334H15.8ZM15.1939 17.604C15.607 17.3038 15.9704 16.9405 16.2705 16.5273L15.1379 15.7044C14.9241 15.9987 14.6653 16.2575 14.371 16.4713L15.1939 17.604ZM0.8 10.3334C0.8 11.8802 0.799039 13.0965 0.903543 14.0611C1.00947 15.0388 1.23042 15.8405 1.72945 16.5273L2.86207 15.7044C2.56534 15.296 2.38841 14.7688 2.2954 13.9103C2.20096 13.0387 2.2 11.9114 2.2 10.3334H0.8ZM9 17.1334C7.42202 17.1334 6.29476 17.1325 5.42312 17.038C4.56457 16.945 4.03743 16.7681 3.62901 16.4713L2.80611 17.604C3.49296 18.103 4.29466 18.3239 5.27232 18.4299C6.23688 18.5344 7.4532 18.5334 9 18.5334V17.1334ZM1.72945 16.5273C2.02962 16.9405 2.39296 17.3038 2.80611 17.604L3.62901 16.4713C3.33471 16.2575 3.0759 15.9987 2.86207 15.7044L1.72945 16.5273ZM2.80611 1.3962C2.39296 1.69637 2.02962 2.0597 1.72945 2.47286L2.86207 3.29576C3.0759 3.00146 3.33471 2.74265 3.62901 2.52882L2.80611 1.3962ZM9 1.86675C10.578 1.86675 11.7052 1.86771 12.5769 1.96215C13.4354 2.05516 13.9626 2.23209 14.371 2.52882L15.1939 1.3962C14.507 0.897171 13.7053 0.676214 12.7277 0.570291C11.7631 0.465787 10.5468 0.466748 9 0.466748V1.86675ZM17.2 8.66675C17.2 7.11995 17.201 5.90363 17.0965 4.93907C16.9905 3.9614 16.7696 3.15971 16.2705 2.47286L15.1379 3.29576C15.4347 3.70418 15.6116 4.23132 15.7046 5.08986C15.799 5.96151 15.8 7.08877 15.8 8.66675H17.2ZM14.371 2.52882C14.6653 2.74265 14.9241 3.00146 15.1379 3.29576L16.2705 2.47286C15.9704 2.05971 15.607 1.69637 15.1939 1.3962L14.371 2.52882ZM9 0.466748C8.02977 0.466748 7.19419 0.46666 6.47603 0.491266L6.52397 1.89044C7.21305 1.86684 8.02202 1.86675 9 1.86675V0.466748ZM6.47603 0.491266C4.9139 0.544786 3.74573 0.713523 2.80611 1.3962L3.62901 2.52882C4.19706 2.11611 4.97912 1.94337 6.52397 1.89044L6.47603 0.491266ZM5.8 1.19085C5.79999 1.97464 5.79733 2.28977 5.75732 2.54239L7.14008 2.7614C7.2016 2.37299 7.19999 1.92334 7.2 1.19086L5.8 1.19085ZM2.2 8.66675C2.2 7.68877 2.20009 6.8798 2.2237 6.19072L0.824518 6.14278C0.799913 6.86094 0.8 7.69652 0.8 8.66675H2.2ZM2.2237 6.19072C2.27663 4.64587 2.44936 3.86381 2.86207 3.29576L1.72945 2.47286C1.04677 3.41248 0.878038 4.58065 0.824518 6.14278L2.2237 6.19072ZM1.52411 6.86675C2.25659 6.86674 2.70625 6.86835 3.09465 6.80683L2.87564 5.42407C2.62303 5.46408 2.30789 5.46674 1.5241 5.46675L1.52411 6.86675ZM9.7 13.6667V7.66675H8.3V13.6667H9.7ZM6.16384 10.1595L7.32872 8.9842L6.33436 7.99867L5.16949 9.17399L6.16384 10.1595ZM10.6713 8.9842L11.8362 10.1595L12.8305 9.17399L11.6656 7.99867L10.6713 8.9842ZM7.32872 8.9842C7.80479 8.50386 8.12095 8.18637 8.3857 7.97375C8.63942 7.76999 8.77717 7.72078 8.87962 7.70772L8.7026 6.31896C8.23892 6.37806 7.86137 6.59925 7.50907 6.88218C7.16782 7.15624 6.78725 7.54172 6.33436 7.99867L7.32872 8.9842ZM11.6656 7.99867C11.2127 7.54172 10.8322 7.15624 10.4909 6.88218C10.1386 6.59925 9.76108 6.37806 9.2974 6.31896L9.12038 7.70772C9.22283 7.72078 9.36058 7.76999 9.6143 7.97375C9.87906 8.18637 10.1952 8.50386 10.6713 8.9842L11.6656 7.99867ZM8.87962 7.70772C8.91959 7.70263 8.9598 7.70008 9 7.70008L9 6.30008C8.90067 6.30008 8.80134 6.30637 8.70261 6.31896L8.87962 7.70772ZM9 7.70008C9.0402 7.70008 9.08041 7.70263 9.12038 7.70772L9.2974 6.31896C9.19866 6.30637 9.09933 6.30008 9 6.30008L9 7.70008ZM9.7 7.66675V7.00008H8.3V7.66675H9.7Z"
                              fill="#525252"
                            />
                          </svg>
                        </button>
                      </>
                    </div>
                  )}
                </>
              ) : contractType === "sharing" || contractType === "hybrid" ? (
                <>
                  {" "}
                  <div className="flex flex-row items-center justify-between mb-2">
                    <div className="1/4">
                      <h5
                        className="text-white !text-sm"
                        style={{ fontFamily: "Numans" }}
                      >
                        Reward Sharing
                      </h5>
                    </div>
                    <div className="flex w-70 justify-between">
                      <div className="duration-input-wrapper w-1/2 mr-2">
                        <input
                          type="number"
                          placeholder="Your Share"
                          className="text-sm w-full reward-input !text-white placeholder:!text-[white] placeholder:!text-xs placeholder:!font-numans"
                          onChange={(e) => {
                            setRevenueShare(e.target.value);
                            checkDisable(
                              rate,
                              offerDuration,
                              fixedDurationValue,
                              isFixedDurationRadioSelected,
                              revenueShare,
                              e.target.value
                            );
                            setTimeout(() => {
                              Mixpanel.track(
                                "home_rentmkt_collection_rent_available_nft_rent_button_duration",
                                { typedData: e.target.value }
                              );
                            }, 1000);
                          }}
                        />
                        <div className="seperator"></div>
                        <svg
                          width="20"
                          height="19"
                          viewBox="0 0 20 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.49984 12.0001L12.2139 7.28604M18.3332 9.50008C18.3332 14.1025 14.6022 17.8334 9.99984 17.8334C5.39746 17.8334 1.6665 14.1025 1.6665 9.50008C1.6665 4.89771 5.39746 1.16675 9.99984 1.16675C14.6022 1.16675 18.3332 4.89771 18.3332 9.50008Z"
                            stroke="#F1FCF3"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6.6665 7.00008C6.6665 7.46032 7.0396 7.83341 7.49984 7.83341C7.96007 7.83341 8.33317 7.46032 8.33317 7.00008C8.33317 6.53984 7.96007 6.16675 7.49984 6.16675C7.0396 6.16675 6.6665 6.53984 6.6665 7.00008Z"
                            fill="#F1FCF3"
                          />
                          <path
                            d="M11.6665 12.0001C11.6665 12.4603 12.0396 12.8334 12.4998 12.8334C12.9601 12.8334 13.3332 12.4603 13.3332 12.0001C13.3332 11.5398 12.9601 11.1667 12.4998 11.1667C12.0396 11.1667 11.6665 11.5398 11.6665 12.0001Z"
                            fill="#F1FCF3"
                          />
                        </svg>
                      </div>
                      <div className="duration-input-wrapper w-1/2 mr-2">
                        <input
                          type="number"
                          placeholder="Renter's Share"
                          className="text-sm w-full reward-input !text-white placeholder:!text-[white] placeholder:!text-xs placeholder:!font-numans"
                          defaultValue={
                            revenueShare === 0 ? "" : 100 - revenueShare
                          }
                        />
                        <div className="seperator"></div>
                        <svg
                          width="20"
                          height="19"
                          viewBox="0 0 20 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.49984 12.0001L12.2139 7.28604M18.3332 9.50008C18.3332 14.1025 14.6022 17.8334 9.99984 17.8334C5.39746 17.8334 1.6665 14.1025 1.6665 9.50008C1.6665 4.89771 5.39746 1.16675 9.99984 1.16675C14.6022 1.16675 18.3332 4.89771 18.3332 9.50008Z"
                            stroke="#F1FCF3"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6.6665 7.00008C6.6665 7.46032 7.0396 7.83341 7.49984 7.83341C7.96007 7.83341 8.33317 7.46032 8.33317 7.00008C8.33317 6.53984 7.96007 6.16675 7.49984 6.16675C7.0396 6.16675 6.6665 6.53984 6.6665 7.00008Z"
                            fill="#F1FCF3"
                          />
                          <path
                            d="M11.6665 12.0001C11.6665 12.4603 12.0396 12.8334 12.4998 12.8334C12.9601 12.8334 13.3332 12.4603 13.3332 12.0001C13.3332 11.5398 12.9601 11.1667 12.4998 11.1667C12.0396 11.1667 11.6665 11.5398 11.6665 12.0001Z"
                            fill="#F1FCF3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {contractType === "sharing" && (
                    <div>
                      <div className="w-full mt-2 mb-0">
                        <RadioButtons
                          checked={isPrivateRental}
                          clickHandler={() => togglePrivateRental()}
                          groupName="private-rent"
                          label={
                            <div className="flex">
                              <p className="numans-label">Private Rentals</p>
                              <Tooltip
                                tooltip={
                                  "If you wish to share it with a specific public address. Only they’ll see on the marketplace"
                                }
                              >
                                <InfoIcon className="h-4 w-4 text-green ml-4" />
                              </Tooltip>
                            </div>
                          }
                          labelID="private-rental-radio-buttons"
                        />
                      </div>
                      {isPrivateRental && (
                        <div className="wallet-row">
                          <>
                            <input
                              type="text"
                              placeholder="Wallet Address"
                              className="address-input !text-white placeholder:!text-[white] placeholder:!text-xs placeholder:!font-numans"
                              onChange={(e) => handleWhitelist(e.target.value)}
                            />
                            <button>
                              or upload csv
                              <svg
                                width="18"
                                height="19"
                                viewBox="0 0 18 19"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2.98514 6.11545L3.09465 6.80683L2.98514 6.11545ZM6.4487 2.65189L7.14008 2.7614V2.7614L6.4487 2.65189ZM14.7824 17.0377L14.371 16.4713L14.7824 17.0377ZM15.7042 16.1159L15.1379 15.7044L15.7042 16.1159ZM2.29576 16.1159L2.86207 15.7044L2.29576 16.1159ZM3.21756 17.0377L3.62901 16.4713L3.21756 17.0377ZM3.21756 1.96251L2.80611 1.3962L3.21756 1.96251ZM2.29576 2.88431L1.72945 2.47286L2.29576 2.88431ZM14.7824 1.96251L14.371 2.52882L14.7824 1.96251ZM15.7042 2.88431L15.1379 3.29576L15.7042 2.88431ZM6.5 1.19086L6.47603 0.491266L6.5 1.19086ZM1.52411 6.16675L0.824518 6.14278L1.52411 6.16675ZM8.3 13.6667C8.3 14.0533 8.6134 14.3667 9 14.3667C9.3866 14.3667 9.7 14.0533 9.7 13.6667H8.3ZM5.16949 9.17399C4.89734 9.44857 4.89932 9.89178 5.1739 10.1639C5.44849 10.4361 5.8917 10.4341 6.16384 10.1595L5.16949 9.17399ZM6.83154 8.49143L7.32872 8.9842L6.83154 8.49143ZM11.1685 8.49143L10.6713 8.9842L11.1685 8.49143ZM11.8362 10.1595C12.1083 10.4341 12.5515 10.4361 12.8261 10.1639C13.1007 9.89178 13.1027 9.44857 12.8305 9.17399L11.8362 10.1595ZM8.79111 7.01334L8.70261 6.31896H8.7026L8.79111 7.01334ZM9.20889 7.01334L9.2974 6.31896H9.2974L9.20889 7.01334ZM9 7.00008L9 6.30008L9 7.00008ZM3.09465 6.80683C5.17706 6.47701 6.81026 4.84381 7.14008 2.7614L5.75732 2.54239C5.52238 4.02575 4.359 5.18913 2.87564 5.42407L3.09465 6.80683ZM0.8 8.66675V10.3334H2.2V8.66675H0.8ZM17.2 10.3334V8.66675H15.8V10.3334H17.2ZM9 18.5334C10.5468 18.5334 11.7631 18.5344 12.7277 18.4299C13.7053 18.3239 14.507 18.103 15.1939 17.604L14.371 16.4713C13.9626 16.7681 13.4354 16.945 12.5769 17.038C11.7052 17.1325 10.578 17.1334 9 17.1334V18.5334ZM15.8 10.3334C15.8 11.9114 15.799 13.0387 15.7046 13.9103C15.6116 14.7688 15.4347 15.296 15.1379 15.7044L16.2705 16.5273C16.7696 15.8405 16.9905 15.0388 17.0965 14.0611C17.201 13.0965 17.2 11.8802 17.2 10.3334H15.8ZM15.1939 17.604C15.607 17.3038 15.9704 16.9405 16.2705 16.5273L15.1379 15.7044C14.9241 15.9987 14.6653 16.2575 14.371 16.4713L15.1939 17.604ZM0.8 10.3334C0.8 11.8802 0.799039 13.0965 0.903543 14.0611C1.00947 15.0388 1.23042 15.8405 1.72945 16.5273L2.86207 15.7044C2.56534 15.296 2.38841 14.7688 2.2954 13.9103C2.20096 13.0387 2.2 11.9114 2.2 10.3334H0.8ZM9 17.1334C7.42202 17.1334 6.29476 17.1325 5.42312 17.038C4.56457 16.945 4.03743 16.7681 3.62901 16.4713L2.80611 17.604C3.49296 18.103 4.29466 18.3239 5.27232 18.4299C6.23688 18.5344 7.4532 18.5334 9 18.5334V17.1334ZM1.72945 16.5273C2.02962 16.9405 2.39296 17.3038 2.80611 17.604L3.62901 16.4713C3.33471 16.2575 3.0759 15.9987 2.86207 15.7044L1.72945 16.5273ZM2.80611 1.3962C2.39296 1.69637 2.02962 2.0597 1.72945 2.47286L2.86207 3.29576C3.0759 3.00146 3.33471 2.74265 3.62901 2.52882L2.80611 1.3962ZM9 1.86675C10.578 1.86675 11.7052 1.86771 12.5769 1.96215C13.4354 2.05516 13.9626 2.23209 14.371 2.52882L15.1939 1.3962C14.507 0.897171 13.7053 0.676214 12.7277 0.570291C11.7631 0.465787 10.5468 0.466748 9 0.466748V1.86675ZM17.2 8.66675C17.2 7.11995 17.201 5.90363 17.0965 4.93907C16.9905 3.9614 16.7696 3.15971 16.2705 2.47286L15.1379 3.29576C15.4347 3.70418 15.6116 4.23132 15.7046 5.08986C15.799 5.96151 15.8 7.08877 15.8 8.66675H17.2ZM14.371 2.52882C14.6653 2.74265 14.9241 3.00146 15.1379 3.29576L16.2705 2.47286C15.9704 2.05971 15.607 1.69637 15.1939 1.3962L14.371 2.52882ZM9 0.466748C8.02977 0.466748 7.19419 0.46666 6.47603 0.491266L6.52397 1.89044C7.21305 1.86684 8.02202 1.86675 9 1.86675V0.466748ZM6.47603 0.491266C4.9139 0.544786 3.74573 0.713523 2.80611 1.3962L3.62901 2.52882C4.19706 2.11611 4.97912 1.94337 6.52397 1.89044L6.47603 0.491266ZM5.8 1.19085C5.79999 1.97464 5.79733 2.28977 5.75732 2.54239L7.14008 2.7614C7.2016 2.37299 7.19999 1.92334 7.2 1.19086L5.8 1.19085ZM2.2 8.66675C2.2 7.68877 2.20009 6.8798 2.2237 6.19072L0.824518 6.14278C0.799913 6.86094 0.8 7.69652 0.8 8.66675H2.2ZM2.2237 6.19072C2.27663 4.64587 2.44936 3.86381 2.86207 3.29576L1.72945 2.47286C1.04677 3.41248 0.878038 4.58065 0.824518 6.14278L2.2237 6.19072ZM1.52411 6.86675C2.25659 6.86674 2.70625 6.86835 3.09465 6.80683L2.87564 5.42407C2.62303 5.46408 2.30789 5.46674 1.5241 5.46675L1.52411 6.86675ZM9.7 13.6667V7.66675H8.3V13.6667H9.7ZM6.16384 10.1595L7.32872 8.9842L6.33436 7.99867L5.16949 9.17399L6.16384 10.1595ZM10.6713 8.9842L11.8362 10.1595L12.8305 9.17399L11.6656 7.99867L10.6713 8.9842ZM7.32872 8.9842C7.80479 8.50386 8.12095 8.18637 8.3857 7.97375C8.63942 7.76999 8.77717 7.72078 8.87962 7.70772L8.7026 6.31896C8.23892 6.37806 7.86137 6.59925 7.50907 6.88218C7.16782 7.15624 6.78725 7.54172 6.33436 7.99867L7.32872 8.9842ZM11.6656 7.99867C11.2127 7.54172 10.8322 7.15624 10.4909 6.88218C10.1386 6.59925 9.76108 6.37806 9.2974 6.31896L9.12038 7.70772C9.22283 7.72078 9.36058 7.76999 9.6143 7.97375C9.87906 8.18637 10.1952 8.50386 10.6713 8.9842L11.6656 7.99867ZM8.87962 7.70772C8.91959 7.70263 8.9598 7.70008 9 7.70008L9 6.30008C8.90067 6.30008 8.80134 6.30637 8.70261 6.31896L8.87962 7.70772ZM9 7.70008C9.0402 7.70008 9.08041 7.70263 9.12038 7.70772L9.2974 6.31896C9.19866 6.30637 9.09933 6.30008 9 6.30008L9 7.70008ZM9.7 7.66675V7.00008H8.3V7.66675H9.7Z"
                                  fill="#525252"
                                />
                              </svg>
                            </button>
                          </>
                        </div>
                      )}
                    </div>
                  )}
                  {contractType === "hybrid" && (
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="text-white !text-sm whitespace-nowrap mr-10 numans-label">
                          Rent Price
                        </h5>

                        <div className="h-[60px] w-[55%] px-2  flex items-center justify-items-end  bg-[#191919] rounded-lg">
                          <input
                            type="text"
                            className="!text-white placeholder:!text-[white] placeholder:!text-xs placeholder:!font-numans"
                            placeholder="Price"
                            onChange={(e) => {
                              setRate(e.target.value);
                              setTimeout(() => {
                                Mixpanel.track(
                                  "home_rentmkt_collection_lend_owned_nft_lend_fixed_price_duration_input_unit"
                                );
                              }, 1000);
                              checkDisable(
                                e.target.value,
                                offerDuration,
                                fixedDurationValue,
                                isFixedDurationRadioSelected,
                                revenueShare
                              );
                            }}
                          />

                          <h5 className="cursor-pointer text-white !text-sm ml-2">
                            {" "}
                            {chainDetail.currency_symbol}{" "}
                          </h5>

                          <h5 className="text-white !text-sm cursor-pointer ml-2">
                            per
                          </h5>
                          {isFixedDurationRadioSelected ? (
                            <h5 className="text-white !text-sm cursor-pointer ml-2">
                              {offerScale.slice(0, offerScale.length - 1)}
                            </h5>
                          ) : (
                            <h5 className="text-white !text-sm cursor-pointer ml-2">
                              {offerScale.slice(0, offerScale.length - 1)}
                            </h5>
                          )}
                        </div>
                      </div>
                      <div className="w-full mt-2 mb-0">
                        <RadioButtons
                          checked={isPrivateRental}
                          clickHandler={() => togglePrivateRental()}
                          groupName="private-rent"
                          label={
                            <div className="flex">
                              <p className="numans-label">Private Rental</p>
                              <Tooltip
                                tooltip={
                                  "If you wish to share it with a specific public address. Only they’ll see on the marketplace"
                                }
                              >
                                <InfoIcon className="h-4 w-4 text-green ml-4" />
                              </Tooltip>
                            </div>
                          }
                          labelID="private-rental-radio-buttons"
                        />
                      </div>
                      {isPrivateRental && (
                        <div className="wallet-row">
                          <>
                            <input
                              type="text"
                              placeholder="Wallet Address"
                              className="address-input !text-white placeholder:!text-[white] placeholder:!text-xs placeholder:!font-numans"
                              onChange={(e) => handleWhitelist(e.target.value)}
                            />
                            <button>
                              or upload csv
                              <svg
                                width="18"
                                height="19"
                                viewBox="0 0 18 19"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2.98514 6.11545L3.09465 6.80683L2.98514 6.11545ZM6.4487 2.65189L7.14008 2.7614V2.7614L6.4487 2.65189ZM14.7824 17.0377L14.371 16.4713L14.7824 17.0377ZM15.7042 16.1159L15.1379 15.7044L15.7042 16.1159ZM2.29576 16.1159L2.86207 15.7044L2.29576 16.1159ZM3.21756 17.0377L3.62901 16.4713L3.21756 17.0377ZM3.21756 1.96251L2.80611 1.3962L3.21756 1.96251ZM2.29576 2.88431L1.72945 2.47286L2.29576 2.88431ZM14.7824 1.96251L14.371 2.52882L14.7824 1.96251ZM15.7042 2.88431L15.1379 3.29576L15.7042 2.88431ZM6.5 1.19086L6.47603 0.491266L6.5 1.19086ZM1.52411 6.16675L0.824518 6.14278L1.52411 6.16675ZM8.3 13.6667C8.3 14.0533 8.6134 14.3667 9 14.3667C9.3866 14.3667 9.7 14.0533 9.7 13.6667H8.3ZM5.16949 9.17399C4.89734 9.44857 4.89932 9.89178 5.1739 10.1639C5.44849 10.4361 5.8917 10.4341 6.16384 10.1595L5.16949 9.17399ZM6.83154 8.49143L7.32872 8.9842L6.83154 8.49143ZM11.1685 8.49143L10.6713 8.9842L11.1685 8.49143ZM11.8362 10.1595C12.1083 10.4341 12.5515 10.4361 12.8261 10.1639C13.1007 9.89178 13.1027 9.44857 12.8305 9.17399L11.8362 10.1595ZM8.79111 7.01334L8.70261 6.31896H8.7026L8.79111 7.01334ZM9.20889 7.01334L9.2974 6.31896H9.2974L9.20889 7.01334ZM9 7.00008L9 6.30008L9 7.00008ZM3.09465 6.80683C5.17706 6.47701 6.81026 4.84381 7.14008 2.7614L5.75732 2.54239C5.52238 4.02575 4.359 5.18913 2.87564 5.42407L3.09465 6.80683ZM0.8 8.66675V10.3334H2.2V8.66675H0.8ZM17.2 10.3334V8.66675H15.8V10.3334H17.2ZM9 18.5334C10.5468 18.5334 11.7631 18.5344 12.7277 18.4299C13.7053 18.3239 14.507 18.103 15.1939 17.604L14.371 16.4713C13.9626 16.7681 13.4354 16.945 12.5769 17.038C11.7052 17.1325 10.578 17.1334 9 17.1334V18.5334ZM15.8 10.3334C15.8 11.9114 15.799 13.0387 15.7046 13.9103C15.6116 14.7688 15.4347 15.296 15.1379 15.7044L16.2705 16.5273C16.7696 15.8405 16.9905 15.0388 17.0965 14.0611C17.201 13.0965 17.2 11.8802 17.2 10.3334H15.8ZM15.1939 17.604C15.607 17.3038 15.9704 16.9405 16.2705 16.5273L15.1379 15.7044C14.9241 15.9987 14.6653 16.2575 14.371 16.4713L15.1939 17.604ZM0.8 10.3334C0.8 11.8802 0.799039 13.0965 0.903543 14.0611C1.00947 15.0388 1.23042 15.8405 1.72945 16.5273L2.86207 15.7044C2.56534 15.296 2.38841 14.7688 2.2954 13.9103C2.20096 13.0387 2.2 11.9114 2.2 10.3334H0.8ZM9 17.1334C7.42202 17.1334 6.29476 17.1325 5.42312 17.038C4.56457 16.945 4.03743 16.7681 3.62901 16.4713L2.80611 17.604C3.49296 18.103 4.29466 18.3239 5.27232 18.4299C6.23688 18.5344 7.4532 18.5334 9 18.5334V17.1334ZM1.72945 16.5273C2.02962 16.9405 2.39296 17.3038 2.80611 17.604L3.62901 16.4713C3.33471 16.2575 3.0759 15.9987 2.86207 15.7044L1.72945 16.5273ZM2.80611 1.3962C2.39296 1.69637 2.02962 2.0597 1.72945 2.47286L2.86207 3.29576C3.0759 3.00146 3.33471 2.74265 3.62901 2.52882L2.80611 1.3962ZM9 1.86675C10.578 1.86675 11.7052 1.86771 12.5769 1.96215C13.4354 2.05516 13.9626 2.23209 14.371 2.52882L15.1939 1.3962C14.507 0.897171 13.7053 0.676214 12.7277 0.570291C11.7631 0.465787 10.5468 0.466748 9 0.466748V1.86675ZM17.2 8.66675C17.2 7.11995 17.201 5.90363 17.0965 4.93907C16.9905 3.9614 16.7696 3.15971 16.2705 2.47286L15.1379 3.29576C15.4347 3.70418 15.6116 4.23132 15.7046 5.08986C15.799 5.96151 15.8 7.08877 15.8 8.66675H17.2ZM14.371 2.52882C14.6653 2.74265 14.9241 3.00146 15.1379 3.29576L16.2705 2.47286C15.9704 2.05971 15.607 1.69637 15.1939 1.3962L14.371 2.52882ZM9 0.466748C8.02977 0.466748 7.19419 0.46666 6.47603 0.491266L6.52397 1.89044C7.21305 1.86684 8.02202 1.86675 9 1.86675V0.466748ZM6.47603 0.491266C4.9139 0.544786 3.74573 0.713523 2.80611 1.3962L3.62901 2.52882C4.19706 2.11611 4.97912 1.94337 6.52397 1.89044L6.47603 0.491266ZM5.8 1.19085C5.79999 1.97464 5.79733 2.28977 5.75732 2.54239L7.14008 2.7614C7.2016 2.37299 7.19999 1.92334 7.2 1.19086L5.8 1.19085ZM2.2 8.66675C2.2 7.68877 2.20009 6.8798 2.2237 6.19072L0.824518 6.14278C0.799913 6.86094 0.8 7.69652 0.8 8.66675H2.2ZM2.2237 6.19072C2.27663 4.64587 2.44936 3.86381 2.86207 3.29576L1.72945 2.47286C1.04677 3.41248 0.878038 4.58065 0.824518 6.14278L2.2237 6.19072ZM1.52411 6.86675C2.25659 6.86674 2.70625 6.86835 3.09465 6.80683L2.87564 5.42407C2.62303 5.46408 2.30789 5.46674 1.5241 5.46675L1.52411 6.86675ZM9.7 13.6667V7.66675H8.3V13.6667H9.7ZM6.16384 10.1595L7.32872 8.9842L6.33436 7.99867L5.16949 9.17399L6.16384 10.1595ZM10.6713 8.9842L11.8362 10.1595L12.8305 9.17399L11.6656 7.99867L10.6713 8.9842ZM7.32872 8.9842C7.80479 8.50386 8.12095 8.18637 8.3857 7.97375C8.63942 7.76999 8.77717 7.72078 8.87962 7.70772L8.7026 6.31896C8.23892 6.37806 7.86137 6.59925 7.50907 6.88218C7.16782 7.15624 6.78725 7.54172 6.33436 7.99867L7.32872 8.9842ZM11.6656 7.99867C11.2127 7.54172 10.8322 7.15624 10.4909 6.88218C10.1386 6.59925 9.76108 6.37806 9.2974 6.31896L9.12038 7.70772C9.22283 7.72078 9.36058 7.76999 9.6143 7.97375C9.87906 8.18637 10.1952 8.50386 10.6713 8.9842L11.6656 7.99867ZM8.87962 7.70772C8.91959 7.70263 8.9598 7.70008 9 7.70008L9 6.30008C8.90067 6.30008 8.80134 6.30637 8.70261 6.31896L8.87962 7.70772ZM9 7.70008C9.0402 7.70008 9.08041 7.70263 9.12038 7.70772L9.2974 6.31896C9.19866 6.30637 9.09933 6.30008 9 6.30008L9 7.70008ZM9.7 7.66675V7.00008H8.3V7.66675H9.7Z"
                                  fill="#525252"
                                />
                              </svg>
                            </button>
                          </>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </Fragment>
        )}
      </Styles.Wrapper>
    </MobileModal>
  );
};

export default MobileLendModal;
