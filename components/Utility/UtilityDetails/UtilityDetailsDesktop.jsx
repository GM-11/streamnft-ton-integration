"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import CardGrid from "../../Reusables/utility/CardGrid/CardGrid";
import Image from "next/image";
import GradientText from "../../Reusables/utility/GradientText";
import discordIcon from "../../../public/images/discordgreen.svg";
import twitterIcon from "../../../public/images/twittergreen.svg";
import telegramIcon from "../../../public/images/telegram.svg";
import reportIcon from "../../../public/images/report.svg";
import explorerIcon from "../../../public/images/explore.svg";
import checkedIcon from "../../../public/images/checked.png";
import RegImage from "../../../public/images/registration.png";
import YoutubeIcon from "../../../public/images/youtubeGreen.svg";
import RaffleImage from "../../../public/images/raffle.png";
import ClaimImage from "../../../public/images/claim.png";
import NFTIcon from "../../../public/images/nft.png";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";
import utilityCalls from "@/services/utility/utilityCalls";
import { useRouter } from "next/router";
import moment from "moment";
import CheckRewardsModal from "../../Reusables/utility/Modals/CheckRewardsModal";
import ClickAwayListener from "../../Reusables/ClickAwayListener";
import { ChainContext } from "@/context/ChainContext";
import { utilityAxiosInstance, utilityBaseURL } from "@/services/axios";
import Tooltip from "../../Reusables/utility/Tooltip";
import { useSigner } from "@/context/SignerContext";
import Loader from "@/components/Reusables/loan/Loader";
import UtilityButton from "./UtilityButton";
import nftCalls from "@/services/utility/nftCalls";
import { removeHTMLTags } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";

const UtilityDetailsDesktop = ({
  backendData,
  handleEnterDraw,
  handleClaimUtility,
  handleRedeemReward,
  openRewardsModal,
  setOpenRewardsModal,
  generatedCode,
  selectedNft,
  setSelectedNft,
  entryUpdated,
  setEntryUpdated,
  loadingForModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tasksStatuses, setTasksStatuses] = useState([]);
  const [tokens, setTokens] = useState([]);

  const { isConnected, address } = useUserWalletContext();
  const router = useRouter();
  const { isTokenSet } = useUserWalletContext();

  const { signer } = useSigner();

  const currentData = useMemo(() => {
    return backendData?.collectionUtility;
  }, [backendData]);

  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  function convertMilliseconds(ms) {
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));
    let hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return ms === 0
      ? "Ended"
      : `${days} ${days === 1 ? "Day" : "Days"}, ${hours} Hours`;
  }

  const getUserAccountName = (url) => {
    const splittedUrl = url?.split("/");
    return splittedUrl[splittedUrl.length - 1];
  };

  async function fetchUserNftData() {
    const resp = await nftCalls.fetchUserNftData(
      currentData?.target?.[0]?.chainId,
      currentData?.target?.[0]?.collection
    );

    if (resp?.data?.tokens) {
      setTokens(resp?.data?.tokens);
    }
  }

  useEffect(() => {
    if (currentData?.target?.length > 0 && address?.length > 0) {
      fetchUserNftData();
    }
  }, [backendData, address]);

  const fetchTasksStatus = async () => {
    try {
      const response = await utilityCalls.listDetails(
        address,
        router.query?.utilityId
      );

      setTasksStatuses(response?.data);
    } catch (error) {
      console.error("Error fetching task status:", error);
    }
  };

  useEffect(() => {
    if (address && router.query?.utilityId) {
      fetchTasksStatus();
    }
  }, [router, address]);

  const handlePostRedirect = async (
    selectedExternalService,
    targetName,
    taskInfo,
    extService
  ) => {
    toast.success("Verifying task ...");

    const response = await utilityCalls.listDetails(
      address,
      router.query?.utilityId
    );

    if (response instanceof Error) {
      console.error("Error", response);
    } else {
      const selectedServiceData = response?.data?.find(
        (el) => el?.taskType === selectedExternalService
      );

      const selectedTask = selectedServiceData?.tasks?.find(
        (el) => el?.taskInfo === taskInfo
      );

      if (selectedTask?.completed) {
        setTasksStatuses(response?.data);
        toast.dismiss();
        toast.success("Task verified! Progress updated.");
      } else {
        toast.dismiss();
        toast.success("Redirecting for authentication");

        window.open(
          `${utilityBaseURL}/user/utility/verifyExternal?extService=${encodeURIComponent(
            extService
          )}&wallet=${encodeURIComponent(
            address
          )}&targetName=${encodeURIComponent(
            targetName
          )}&utilityId=${encodeURIComponent(
            router.query?.utilityId
          )}&taskInfo=${encodeURIComponent(
            taskInfo
          )}&token=${encodeURIComponent(localStorage.getItem("token"))}`
        );
      }
    }
  };

  const verifyUserHoldNftCollectionCall = async (tokenAddress) => {
    try {
      const response = await utilityCalls.verifyUserHoldNftCollection({
        taskType: "nft_owner",
        tokenAddress,
        chainId: currentData?.target?.[0]?.chainId,
        wallet: address,
        utilityId: router.query?.utilityId,
        taskInfo: "Own a NFT",
      });

      if (response instanceof Error) {
        throw response;
      } else {
        if (response?.data?.success) {
          toast.success("Task verified! Progress updated.");
          fetchTasksStatus();
          setEntryUpdated(!entryUpdated);
        } else {
          toast.error("You do not own nft of target collection");
        }
      }
    } catch (error) {
      console.error("Error verifying NFT ownership:", error);
      toast.error("An error occurred while verifying the task.");
    }
  };

  const handleOnchainVerification = async (
    tokenAddress,
    taskInfo,
    onchainTask,
    chainId
  ) => {
    const outputMap = onchainTask[0]?.functions[0]?.output.reduce(
      (map, outputItem) => {
        const value = outputItem.isAddress ? address : outputItem.value;

        map[outputItem.name] = {
          operation: outputItem.operation,
          expectedValue: value,
        };

        return map;
      },
      {}
    );

    const inputArray = onchainTask[0]?.functions[0]?.input.map((inputItem) => {
      if (inputItem?.isAddress) {
        return address;
      } else {
        return inputItem?.value;
      }
    });

    const response = await utilityCalls.verifyOnchainTask({
      tokenAddress,
      chainId,
      abi: onchainTask[0]?.abi,
      functionName: onchainTask[0]?.functions[0]?.functionName,
      inputs: inputArray,
      outputOperations: outputMap,
      wallet: address,
      utilityId: router.query?.utilityId,
      taskInfo: taskInfo,
      signer,
    });

    if (response instanceof Error) {
      console.error("Error", response);
    } else {
      fetchTasksStatus();
      setEntryUpdated(!entryUpdated);
      toast.success("Task verified! Progress updated.");
    }
  };

  const eligibilityEntries = useMemo(() => {
    if (Object.keys(currentData ?? {})?.length > 0) {
      if (tasksStatuses?.length > 0) {
        let eligibilityData = currentData?.eligible;

        for (const el of tasksStatuses) {
          let correspondingEntryInEligible = eligibilityData[el.taskType];

          const modifiedTasksDetails = [];

          for (const el2 of correspondingEntryInEligible?.taskDetails) {
            const taskStatus = el?.tasks.find(
              (el3) => el3?.taskInfo === el2?.taskInfo
            );

            modifiedTasksDetails.push({
              ...el2,
              completed: taskStatus?.completed,
            });
          }

          correspondingEntryInEligible = {
            ...correspondingEntryInEligible,
            taskDetails: modifiedTasksDetails,
          };

          eligibilityData = {
            ...eligibilityData,
            [`${el?.taskType}`]: correspondingEntryInEligible,
          };
        }

        const returnArray = Object.entries({ ...eligibilityData });

        let targetIndex = returnArray.findIndex(
          ([key, value]) => value.isTarget
        );

        let [targetElement] = returnArray.splice(targetIndex, 1);

        returnArray.unshift(targetElement);

        return returnArray;
      } else return Object.entries(currentData.eligible ?? {});
    }
  }, [currentData, tasksStatuses]);

  const loadTelegramScript = (taskType) => {
    const script = document.createElement("script");

    const botName =
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "streamnft_test_bot"
        : "streamnft_prod_bot";

    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute(
      "data-auth-url",
      `${utilityBaseURL}/telegram/callbackWidget/${router.query?.utilityId}/${taskType}/${address}`
    );
    script.setAttribute("data-request-access", "write");
    document.getElementById("telegram-verify")?.appendChild(script);
  };

  useEffect(() => {
    if (eligibilityEntries?.length > 0) {
      const telegramTask = eligibilityEntries?.find(
        ([key, value]) => key === "Telegram"
      );
      const taskDetails = telegramTask?.[1]?.taskDetails;
      loadTelegramScript(taskDetails?.[0]?.taskInfo);
    }
  }, [eligibilityEntries]);

  const verifyTwitterTask = async (serviceTarget, taskInfo) => {
    try {
      const utilityId = router.query.utilityId;

      const response = await utilityAxiosInstance.post(
        `/twitter/verifyX/${address}`,
        {
          target: serviceTarget,
          utilityId,
          taskInfo,
        }
      );

      if (response.status === 200) {
        await fetchTasksStatus();
        toast.success("Task verified! Progress updated.");
      }
    } catch (error) {
      toast.error("Something went wrong, Please try again");
    }
  };

  // console.log({ isConnected, isTokenSet });

  return (
    <>
      {!(Object.keys(currentData ?? {})?.length > 0) ? (
        <Loader />
      ) : (
        <div className="mt-10 md:px-8 lg:px-20">
          <div className="text-white p-3 justify-start items-center w-full h-[196px] flex gap-6 bg-[#1D1D1D] bg-opacity-30 rounded-lg !relative ">
            <div className="absolute top-3 right-3 min-w-fit">
              <ClickAwayListener onClickAway={() => setIsMenuOpen(false)}>
                <div>
                  <div
                    className={`absolute top-0 right-0 px-5 py-3 m-4 rounded-md cursor-pointer hover:bg-[#30B750] ${
                      isMenuOpen ? "bg-[#30B750]" : "bg-[#292929] bg-opacity-30"
                    }`}
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <svg
                      width="5"
                      height="18"
                      viewBox="0 0 5 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.86654 9.00002C3.86654 9.92049 3.12034 10.6667 2.19987 10.6667C1.2794 10.6667 0.533203 9.92049 0.533203 9.00002C0.533203 8.07955 1.2794 7.33335 2.19987 7.33335C3.12034 7.33335 3.86654 8.07955 3.86654 9.00002Z"
                        stroke="#F1FCF3"
                      />
                      <path
                        d="M3.86654 2.33335C3.86654 3.25383 3.12034 4.00002 2.19987 4.00002C1.2794 4.00002 0.533204 3.25383 0.533204 2.33335C0.533204 1.41288 1.2794 0.666687 2.19987 0.666687C3.12034 0.666687 3.86654 1.41288 3.86654 2.33335Z"
                        stroke="#F1FCF3"
                      />
                      <path
                        d="M3.86654 15.6667C3.86654 16.5872 3.12034 17.3334 2.19987 17.3334C1.2794 17.3334 0.533203 16.5872 0.533203 15.6667C0.533203 14.7462 1.2794 14 2.19987 14C3.12034 14 3.86654 14.7462 3.86654 15.6667Z"
                        stroke="#F1FCF3"
                      />
                    </svg>
                  </div>
                  {isMenuOpen && (
                    <div className="absolute top-16 right-5 bg-[#30B750] border border-[#23963E] rounded-md shadow h-20">
                      <div
                        className="min-w-[14rem] h-10 flex flex-row items-center gap-4 px-4 cursor-pointer "
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Image src={reportIcon} alt="report" />
                        Report
                      </div>
                      <div
                        className="min-w-[14rem] h-10 whitespace-nowrap flex flex-row items-center gap-4 px-4 cursor-pointer "
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Image src={explorerIcon} alt="check" />
                        Check on Explorer
                      </div>
                    </div>
                  )}
                </div>
              </ClickAwayListener>
            </div>
            <img
              src={currentData?.image_url ?? ""}
              alt="Collection Image"
              className="!min-w-[200px] !max-w-[200px] h-[160px] rounded-md items-start object-center"
            />
            <div className="flex flex-col !pt-[2rem]">
              <div className="flex gap-1 flex-row items-center gap-x-2 space-x-2">
                <h1 className="font-numans text-2xl text-white">
                  {currentData?.title}
                </h1>
                <div className="h-6 w-fit flex my-0 mx-4">
                  <div className="h-6 w-6 flex items-center justify-center bg-transparent rounded-full border-[0.6px] border-solid border-green-8 mr-2 cursor-pointer hover:bg-green-4 hover:scale-110 transition-all duration-300">
                    <Image src={twitterIcon} alt="#" />
                  </div>
                  <div className="h-6 w-6 flex items-center justify-center bg-transparent rounded-full border-[0.6px] border-solid border-green-8 mr-2 cursor-pointer hover:bg-green-4 hover:scale-110 transition-all duration-300">
                    <Image src={discordIcon} alt="#" />
                  </div>
                </div>
              </div>
              <div className="text-xs text-ellipsis text-balance">
                {removeHTMLTags(currentData?.description)}
              </div>
              <div className="h-[70px] w-full flex items-center justify-start gap-x-6 !mb-5 !mt-0 !pt-0 !font-numans">
                <div className="w-fit pr-4">
                  <div className="text-faded-white font-numans whitespace-nowrap text-[12px]">
                    Created By
                  </div>
                  <div>
                    {currentData?.provider?.length > 0
                      ? `${currentData?.provider?.slice(
                          0,
                          4
                        )}...${currentData?.provider?.slice(-3)}`
                      : "N/A"}
                  </div>
                </div>
                <div className="h-[35px] w-0.5 bg-bluish-grey opacity-20 rotate-[15deg]"></div>
                <div className="w-fit pr-4">
                  <div className="whitespace-nowrap text-faded-white font-numans text-[12px]">
                    Participants
                  </div>
                  <h4 className="font-semibold text-xs text-white ">
                    {(currentData?.selectionType === "raffle"
                      ? backendData?.participant_length
                      : currentData?.winners?.length) ?? 0}
                  </h4>
                </div>
                <div className="h-[35px] w-0.5 bg-bluish-grey opacity-20 rotate-[15deg]"></div>
                <div className="detail">
                  <div className="whitespace-nowrap text-faded-white font-numans text-[12px]">
                    Winners
                  </div>
                  <h4 className="font-semibold text-xs text-white">
                    {currentData?.reward?.count ?? "--"}
                  </h4>
                </div>
                <div className="h-[35px] w-0.5 bg-bluish-grey opacity-20 rotate-[15deg]"></div>
                <div className="w-fit pr-4">
                  <div className="whitespace-nowrap text-faded-white font-numans text-[12px]">
                    Price value
                  </div>
                  <h4 className="!text-xs">
                    {currentData?.reward?.currency}
                    <span className="ml-1">
                      {currentData?.reward?.estimatedValue}
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit w-full font-numans flex gap-8 justify-between">
            <div className="min-w-[320px] lg:min-w-[30%] h-fit">
              <div className=" w-full flex flex-col py-4 bg-[#1D1D1D] bg-opacity-30 rounded-lg mt-6 px-3">
                <div className="text-[18px] text-left  font-numans text-white mb-4">
                  Schedule
                </div>
                {currentData?.selectionType === "raffle" ? (
                  <>
                    <div className="bg-[#23963E] relative h-[136px] w-full flex items-center gap-4 p-2 rounded-lg mb-4 font-numans">
                      <div className="h-[112px] w-14 bg-[#30B750] rounded-lg flex items-center justify-center">
                        <Image src={RegImage} alt="#" className="h-10 w-10" />
                      </div>
                      <div className="bg-[#30B750] relative text-white h-[112px] flex flex-col items-start pl-5 justify-center font-numans w-full rounded-lg">
                        <div className=" text-xl mb-1 font-numans">
                          <div className="text-left">Registration</div>
                        </div>
                        <p className=" text-2xs font-light">
                          Ends on
                          <span className=" text-white ml-1 text-[13px] font-light">
                            {moment(currentData?.startDate).format(
                              "DD MMM, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-black-4 h-24 w-full flex items-center gap-4 p-2 rounded-lg mb-4">
                      <div className="h-14 w-14 bg-black-5 rounded-lg flex items-center justify-center">
                        <Image
                          src={RaffleImage}
                          alt="#"
                          className="h-12 w-12 filter grayscale"
                        />
                      </div>
                      <div className="bg-black-5 bg-opacity-25 w-full rounded-lg h-14 pl-5 py-2">
                        <GradientText classNames=" text-[14px] mb-1 font-numans filter grayscale">
                          Raffle Draw
                        </GradientText>
                        <p className="text-grey text-2xs filter grayscale">
                          Happening on
                          <span className=" text-white ml-1 text-[13px] font-light">
                            {moment(currentData?.endDate).format(
                              "DD MMM, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-black-4 relative h-24 w-full flex items-center gap-4 p-2 rounded-lg mb-4">
                      <div className="h-14 w-14 bg-black-5 rounded-lg flex items-center justify-center">
                        <Image
                          src={ClaimImage}
                          alt="#"
                          className="h-10 w-10 filter grayscale"
                        />
                      </div>
                      <div className="bg-black-5 bg-opacity-25 w-full rounded-lg h-14 pl-5 py-2">
                        <GradientText classNames=" text-[14px] mb-1 font-numans filter grayscale">
                          Claim
                        </GradientText>
                        <p className="text-grey text-2xs mb-1">
                          Ends on{" "}
                          <span className=" text-white ml-1 text-2xs font-light">
                            {moment(currentData?.raffle?.claimDate).format(
                              "DD MMM, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-black-4 relative h-24 w-full flex items-center gap-4 p-2 rounded-lg mb-4">
                      <div className="h-14 w-14 bg-black-5 rounded-lg flex items-center justify-center">
                        <Image src={RegImage} alt="#" className="h-10 w-10" />
                      </div>
                      <div>
                        <GradientText classNames=" text-xl mb-1 font-numans">
                          Claim
                        </GradientText>
                        <p className="text-grey text-xs">
                          Starts{" "}
                          <span className=" text-white ml-1 text-2xs font-light">
                            {moment(currentData?.startDate).format(
                              "DD MMM, hh:mm A"
                            )}
                          </span>
                        </p>
                        <p className="text-grey text-xs">
                          Ends on{" "}
                          <span className=" text-white ml-1 text-2xs font-light">
                            {moment(currentData?.endDate).format(
                              "DD MMM, hh:mm A"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grow h-full">
              <div className="w-full h-fit mt-6 bg-[#1D1D1D] bg-opacity-30  p-4 rounded-lg ">
                <div className="h-fit w-full flex items-between gap-4">
                  {currentData?.selectionType === "raffle" && (
                    <>
                      <div className="grow bg-transparent rounded-lg flex px-3 flex-col gap-1 py-1 border-[#656565] border-[1px]">
                        <h5 className="text-faded-white text-[12px]">
                          Your entries
                        </h5>
                        <p className="text-white  font-numans">
                          {backendData?.userInfo?.entries === 0
                            ? 0
                            : backendData?.userInfo?.entries}
                        </p>
                      </div>
                      <div className="grow bg-transparent rounded-lg flex px-3 flex-col gap-1   py-1 border-[#656565] border-[1px]">
                        <h5 className="text-faded-white text-[12px]">
                          Total entries
                        </h5>
                        <p className="text-white  font-numans">
                          {currentData?.raffle?.totalEntries == 0
                            ? 0
                            : currentData?.raffle?.totalEntries}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="grow max-w-1/3 bg-transparent rounded-lg flex px-3 flex-col gap-1 py-1 border-[#656565] border-[1px]">
                    <h5 className="text-faded-white text-[12px]">Time left</h5>
                    <p className="text-white font-semibold font-numans">
                      {convertMilliseconds(backendData?.timeLeft)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 rounded-lg h-fit w-full p-4">
                  <div className="my-2 flex justify-between items-center">
                    <h2 className="font-numans text-lg text-white ">
                      {currentData?.selectionType === "raffle"
                        ? "HOW TO ENTER DRAW"
                        : "HOW TO CLAIM REWARD"}
                    </h2>
                    <div className="text-faded-white font-numans text-[12px]">
                      Note - Finish the task to participate in the raffle.
                    </div>
                  </div>
                  {eligibilityEntries?.map(([key, value]) => {
                    return (
                      <>
                        <>
                          {ethereumAddressRegex.test(key) ? (
                            <>
                              {value?.eligibleType === "nft_owner" ||
                              value?.eligibleType === "nft_trait" ? (
                                <>
                                  {value?.taskDetails?.map((el) => {
                                    const tokenName = el?.name
                                      ? el?.name
                                      : el?.collectionName
                                      ? el?.collectionName
                                      : `${key?.slice(0, 6)}...${key?.slice(
                                          -6
                                        )}`;

                                    return (
                                      <>
                                        <div className="flex py-2 px-2 items-center gap-4 bg-[#292929] bg-opacity-40 rounded-lg text-white">
                                          <div className="flex flex-row w-full items-center justify-between">
                                            <div className="flex flex-row  items-center">
                                              <div className="rounded-lg bg-[#3D3D3D] bg-opacity-50 p-3">
                                                <Image
                                                  src={NFTIcon}
                                                  className="h-[25px] w-[25px]"
                                                  alt="#"
                                                />
                                              </div>
                                              <div className="text-sm pl-3">
                                                {el?.mandatory && (
                                                  <span className="text-red mr-1">
                                                    *
                                                  </span>
                                                )}
                                                Own atleast 1 NFT from
                                                <Link
                                                  className="text-sm text-green-4 mx-1"
                                                  target="_blank"
                                                  href={`https://sepolia.etherscan.io/address/${key}`}
                                                >
                                                  {tokenName}
                                                </Link>
                                                {el?.traits?.length > 0 && (
                                                  <p className="inline">
                                                    with following
                                                    <div className="ml-1 inline">
                                                      <Tooltip
                                                        text={
                                                          <div className="min-h-fit min-w-fit bg-black p-3 rounded-md border border-solid border-gray33">
                                                            <div className="w-full flex gap-6 text-sm justify-between items-center mb-3 whitespace-nowrap">
                                                              <h5>
                                                                Trait Type
                                                              </h5>
                                                              <h5>
                                                                Trait Value
                                                              </h5>
                                                            </div>
                                                            {el?.traits?.map(
                                                              (el2) => {
                                                                return (
                                                                  <div className="w-full flex gap-6 text-xs justify-between items-center whitespace-nowrap">
                                                                    <h5>
                                                                      {el2?.key}
                                                                    </h5>
                                                                    <h5>
                                                                      {
                                                                        el2?.value
                                                                      }
                                                                    </h5>
                                                                  </div>
                                                                );
                                                              }
                                                            )}
                                                          </div>
                                                        }
                                                      >
                                                        <p className="inline text-green-4">
                                                          traits
                                                        </p>
                                                      </Tooltip>
                                                    </div>
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <div
                                              className={`rounded flex gap-2 flex-row items-center`}
                                            >
                                              <>
                                                {isConnected && isTokenSet ? (
                                                  !el?.completed ? (
                                                    <div
                                                      className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                      onClick={() => {
                                                        verifyUserHoldNftCollectionCall(
                                                          key
                                                        );
                                                      }}
                                                    >
                                                      Verify
                                                    </div>
                                                  ) : (
                                                    <Image
                                                      src={checkedIcon}
                                                      alt="checkedStatus"
                                                      height={20}
                                                      width={20}
                                                      className="mx-4"
                                                    />
                                                  )
                                                ) : (
                                                  ""
                                                )}
                                              </>
                                              {currentData?.selectionType ===
                                                "raffle" &&
                                                !value?.isTarget && (
                                                  <div className="text-md text-white bg-green-2 p-2 px-4 rounded font-numans text-sm">
                                                    + {el.numberOfEntries}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })}
                                </>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : value?.eligibleType === "external_services" ? (
                            <>
                              {value?.taskDetails?.map((el) => (
                                <div className="flex py-2 px-2 mb-4 mt-2 items-center gap-4 bg-[#292929] bg-opacity-40 rounded-lg text-white">
                                  <div className="flex flex-row w-full items-center justify-between">
                                    <div className="flex flex-row  items-center">
                                      <div className="rounded-lg bg-[#3D3D3D] bg-opacity-50 p-3">
                                        <Image
                                          src={
                                            key === "Twitter"
                                              ? twitterIcon
                                              : key === "Discord"
                                              ? discordIcon
                                              : key === "Youtube"
                                              ? YoutubeIcon
                                              : key === "Telegram"
                                              ? telegramIcon
                                              : ""
                                          }
                                          className="h-[25px] w-[25px]"
                                          alt="social icon"
                                        />
                                      </div>
                                      <div className="text-sm pl-3 flex items-center gap-1">
                                        {el?.mandatory && (
                                          <span className="text-red mr-1">
                                            *
                                          </span>
                                        )}

                                        {el?.taskInfo?.includes("Follow") ? (
                                          <p>
                                            Follow{" "}
                                            <p className="text-green inline">
                                              {key === "Twitter" && "@"}
                                              {getUserAccountName(
                                                el?.targetURL
                                              )}
                                            </p>{" "}
                                            on{" "}
                                            {key === "Twitter"
                                              ? "X"
                                              : "Youtube"}
                                          </p>
                                        ) : el?.taskInfo === "ReTweet" ? (
                                          <p>
                                            Retweet a specified tweet on Twitter
                                          </p>
                                        ) : el?.taskInfo?.includes("Like") ? (
                                          <p>
                                            Like a specified tweet on Twitter
                                          </p>
                                        ) : el?.taskInfo?.includes("Join") &&
                                          el?.taskInfo?.includes("Discord") ? (
                                          <p className="flex items-center">
                                            Join Discord Server
                                          </p>
                                        ) : el?.taskInfo?.includes("Join") &&
                                          el?.taskInfo?.includes("Telegram") ? (
                                          <p className="flex items-center">
                                            Join Telegram Group
                                          </p>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className={`rounded flex gap-2 flex-row items-center`}
                                    >
                                      {key === "Telegram" &&
                                      !el?.completed &&
                                      isConnected &&
                                      isTokenSet ? (
                                        <>
                                          <div
                                            className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                            onClick={() => {
                                              window.open(el?.targetURL);
                                            }}
                                          >
                                            Join
                                          </div>
                                          <div
                                            className="text-md cursor-pointer relative text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                            id="telegram-verify"
                                          >
                                            Verify
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          {isConnected && isTokenSet ? (
                                            !el?.completed ? (
                                              <div className="flex gap-2">
                                                {key !== "Twitter" && (
                                                  <div
                                                    className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                    onClick={() => {
                                                      window.open(
                                                        el?.targetURL,
                                                        "_blank"
                                                      );
                                                    }}
                                                  >
                                                    {el?.taskInfo
                                                      ?.toLowerCase()
                                                      ?.includes("join")
                                                      ? "Join"
                                                      : el?.taskInfo
                                                          ?.toLowerCase()
                                                          ?.includes("follow")
                                                      ? "Follow"
                                                      : "Visit"}
                                                  </div>
                                                )}
                                                <div
                                                  className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                  onClick={() => {
                                                    if (key === "Twitter") {
                                                      window.open(
                                                        el?.targetURL,
                                                        "_blank"
                                                      );
                                                      verifyTwitterTask(
                                                        el?.serviceTarget,
                                                        el?.taskInfo
                                                      );
                                                    } else {
                                                      handlePostRedirect(
                                                        key,
                                                        el?.serviceTarget,
                                                        el?.taskInfo,
                                                        key?.toLowerCase()
                                                      );
                                                    }
                                                  }}
                                                >
                                                  Verify
                                                </div>
                                              </div>
                                            ) : (
                                              <Image
                                                src={checkedIcon}
                                                alt="checkedStatus"
                                                height={20}
                                                width={20}
                                                className="mx-4"
                                              />
                                            )
                                          ) : (
                                            ""
                                          )}
                                        </>
                                      )}
                                      {currentData?.selectionType ===
                                        "raffle" && (
                                        <>
                                          <div className="text-md text-white bg-green-2 p-2 px-4 whitespace-nowrap rounded font-numans text-sm">
                                            + {el.numberOfEntries}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : value?.eligibleType === "onchain_call" ? (
                            <>
                              {value?.taskDetails?.map((el) => (
                                <div className="flex py-2 px-2 items-center gap-4 bg-[#292929] bg-opacity-40 rounded-lg text-white mb-4 mt-2">
                                  <div className="flex flex-row w-full items-center justify-between">
                                    <div className="flex flex-row items-center">
                                      {/* Icon for Onchain Task */}
                                      <div className="rounded-lg bg-[#3D3D3D] bg-opacity-50 p-3">
                                        <Image
                                          src={twitterIcon}
                                          className="h-[25px] w-[25px]"
                                          alt="onchain task"
                                        />
                                      </div>

                                      <div className="text-sm pl-3 flex items-center gap-1">
                                        {el?.mandatory && (
                                          <span className="text-red mr-1">
                                            *
                                          </span>
                                        )}
                                        <p>
                                          Complete the {el?.taskInfo} on chainId
                                          <span className="text-sm text-green-4 mx-1">
                                            {" "}
                                            {el.chainId}
                                          </span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="rounded flex gap-2 flex-row items-center">
                                      {isConnected && isTokenSet ? (
                                        <>
                                          {!el?.completed ? (
                                            <>
                                              <div
                                                className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                onClick={() =>
                                                  handleOnchainVerification(
                                                    el?.serviceTarget,
                                                    el?.taskInfo,
                                                    el?.onchain,
                                                    el.chainId
                                                  )
                                                }
                                              >
                                                Verify
                                              </div>
                                            </>
                                          ) : (
                                            <Image
                                              src={checkedIcon}
                                              alt="checkedStatus"
                                              height={20}
                                              width={20}
                                              className="mx-4"
                                            />
                                          )}
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            ""
                          )}
                        </>
                      </>
                    );
                  })}
                  <UtilityButton
                    backendData={backendData}
                    currentData={currentData}
                    tasksStatuses={tasksStatuses}
                    setOpenRewardsModal={setOpenRewardsModal}
                    handleEnterDraw={handleEnterDraw}
                    generatedCode={generatedCode}
                    tokens={tokens}
                    entryUpdated={entryUpdated}
                    setEntryUpdated={setEntryUpdated}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h5 className="text-white  font-numans text-2xl">Recommended</h5>
            <CardGrid for="SingleUtility" />
          </div>
        </div>
      )}
      <CheckRewardsModal
        open={openRewardsModal}
        title="Rewards"
        backendData={backendData}
        handleClose={() => {
          setOpenRewardsModal(false);
        }}
        handleRedeemReward={handleRedeemReward}
        handleClaimUtility={handleClaimUtility}
        generatedCode={generatedCode}
        selectedNft={selectedNft}
        setSelectedNft={setSelectedNft}
        loadingForModal={loadingForModal}
        tokens={tokens}
      />
    </>
  );
};

export default UtilityDetailsDesktop;
