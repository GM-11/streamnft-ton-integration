"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import RegImage from "../../../public/images/registration.png";
import RaffleImage from "../../../public/images/raffle.png";
import ClaimImage from "../../../public/images/claim.png";
import NFTIcon from "../../../public/images/nft.png";
import Image from "next/image";
import Button from "../../Reusables/utility/Button";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import WalletIcon from "../../../public/images/Wallet.svg";
import UtilityDetailsModal from "../../Reusables/utility/Modals/UtilityDetailsModal";
import moment from "moment";
import discordIcon from "../../../public/images/discordgreen.svg";
import twitterIcon from "../../../public/images/twittergreen.svg";
import checkedIcon from "../../../public/images/checked.png";
import uncheckedIcon from "../../../public/images/unchecked.png";
import { useRouter } from "next/router";
import utilityCalls from "@/services/utility/utilityCalls";
import { RedirectIcon } from "../../Reusables/utility/Icons";
import { ChainContext } from "@/context/ChainContext";
import CheckRewardsModalMobile from "../../Reusables/utility/Modals/CheckRewardsModalMobile";
import { utilityBaseURL } from "@/services/axios";
import UtilityButton from "./UtilityButton";
import { useSigner } from "@/context/SignerContext";
import nftCalls from "@/services/utility/nftCalls";
import telegramIcon from "../../../public/images/telegram.svg";
import { useUserWalletContext } from "@/context/UserWalletContext";

const UtilityDetailsMobile = ({
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
  const [showUtilityDetails, setShowUtilityDetails] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(openRewardsModal);

  const { isConnected, address } = useUserWalletContext();
  const router = useRouter();

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
      currentData?.target?.[0]?.collection,
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
        router.query?.utilityId,
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
    extService,
  ) => {
    toast.success("Verifying task ...");

    const response = await utilityCalls.listDetails(
      address,
      router.query?.utilityId,
    );

    if (response instanceof Error) {
      console.error("Error", response);
    } else {
      const selectedServiceData = response?.data?.find(
        (el) => el?.taskType === selectedExternalService,
      );

      const selectedTask = selectedServiceData?.tasks?.find(
        (el) => el?.taskInfo === taskInfo,
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
            extService,
          )}&wallet=${encodeURIComponent(
            address,
          )}&targetName=${encodeURIComponent(
            targetName,
          )}&utilityId=${encodeURIComponent(
            router.query?.utilityId,
          )}&taskInfo=${encodeURIComponent(
            taskInfo,
          )}&token=${encodeURIComponent(localStorage.getItem("token"))}`,
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
    chainId,
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
      {},
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
              (el3) => el3?.taskInfo === el2?.taskInfo,
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
          ([key, value]) => value.isTarget,
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
      `${utilityBaseURL}/telegram/callbackWidget/${router.query?.utilityId}/${taskType}/${address}`,
    );
    script.setAttribute("data-request-access", "write");
    document.getElementById("telegram-verify")?.appendChild(script);
  };

  useEffect(() => {
    if (eligibilityEntries?.length > 0) {
      const telegramTask = eligibilityEntries?.find(
        ([key, value]) => key === "Telegram",
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
        },
      );

      if (response.status === 200) {
        await fetchTasksStatus();
        toast.success("Task verified! Progress updated.");
      }
    } catch (error) {
      toast.error("Something went wrong, Please try again");
    }
  };

  return (
    <>
      {!currentData ? (
        <div className="w-full h-96 flex items-center text-white justify-center text-lg">
          loading ...
        </div>
      ) : (
        <>
          <div className="h-fit w-full p-8">
            {currentData?.selectionType === "raffle" ? (
              <div className="h-fit w-full flex items-center justify-between gap-2">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green">
                  <Image
                    src={RegImage}
                    height={48}
                    width={48}
                    className="h-8 w-8"
                    alt="#"
                    suppressHydrationWarning
                  />
                </div>
                <div className="grow h-full flex items-center">
                  <div className="w-1/2 h-0 border-b-[3px] border-solid border-grayscale-5"></div>
                  <div className="w-1/2 h-0 border-b-[3px] border-dashed border-grayscale-5"></div>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#727272] relative overflow-hidden">
                  <div className="h-24 w-24 rotate-[24deg] bg-[#7e7e7e] absolute top-0 left-1 "></div>
                  <div className="h-24 w-24 rotate-[24deg] bg-[#888888] absolute top-0 left-4 "></div>

                  <Image
                    src={RaffleImage}
                    height={48}
                    width={48}
                    className="h-8 w-8 filter grayscale z-10"
                    alt="#"
                    suppressHydrationWarning
                  />
                </div>
                <div className="grow h-full flex items-center">
                  <div className="w-1/2 h-0 border-b-[3px] border-solid border-grayscale-5"></div>
                  <div className="w-1/2 h-0 border-b-[3px] border-dashed border-grayscale-5"></div>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#727272] relative overflow-hidden">
                  <div className="h-24 w-24 rotate-[24deg] bg-[#7e7e7e] absolute top-0 left-1 "></div>
                  <div className="h-24 w-24 rotate-[24deg] bg-[#888888] absolute top-0 left-4 "></div>
                  <Image
                    src={ClaimImage}
                    height={48}
                    width={48}
                    className="h-8 w-8 filter grayscale z-10"
                    alt="#"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            ) : (
              <div className="h-fit w-full flex items-center justify-between gap-2 pl-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green">
                  <Image
                    src={RegImage}
                    height={48}
                    width={48}
                    className="h-8 w-8"
                    alt="#"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            )}
            <div className="h-fit w-full flex items-center justify-between">
              {currentData?.selectionType === "raffle" ? (
                <>
                  <div className="w-fit flex flex-col !text-2xs items-center">
                    <h5>Registration</h5>
                    <h5>Ends on</h5>
                    <div className="flex gap-1 text-white">
                      {moment(currentData?.startDate).format("DD MMM, hh:mm A")}
                    </div>
                  </div>
                  <div className="w-fit flex flex-col !text-2xs items-center">
                    <h5>Raffle Draw</h5>
                    <h5>Ends on</h5>
                    <div className="flex gap-1 text-white">
                      {moment(currentData?.endDate).format("DD MMM, hh:mm A")}
                    </div>
                  </div>
                  <div className="w-fit flex flex-col !text-2xs items-center">
                    <h5>Claim</h5>
                    <h5>Ends on</h5>
                    <div className="flex gap-1 text-white">
                      {moment(currentData?.raffle?.claimDate).format(
                        "DD MMM, hh:mm A",
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-fit flex flex-col !text-2xs items-center">
                    <h5>Claim</h5>
                    <h5>Ends on</h5>
                    <div className="flex gap-1 text-white">
                      {moment(currentData?.endDate).format("DD MMM, hh:mm A")}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="h-fit w-full bg-grayscale-9 p-4 grow">
            <div className="h-fit w-full flex gap-4">
              <div className="grow rounded-lg border-2 border-solid border-grayscale-7 p-2">
                <h5 className="mb-2 text-grayscale text-2xs">Your Entries</h5>
                <p className="text-2xs text-green-1" suppressHydrationWarning>
                  {backendData?.userInfo?.entries ?? 0}
                </p>
              </div>
              <div className="grow rounded-lg border-2 border-solid border-grayscale-7 p-2">
                <h5 className="mb-2 text-grayscale text-2xs">Total Entries</h5>
                <p className="text-2xs text-green-1">
                  {" "}
                  {currentData?.raffle?.totalEntries == 0
                    ? 0
                    : currentData?.raffle?.totalEntries}
                </p>
              </div>
              <div className="grow rounded-lg border-2 border-solid border-grayscale-7 p-2">
                <h5 className="mb-2 text-grayscale text-2xs">Time Left</h5>
                <p className="text-2xs text-green-1">
                  {convertMilliseconds(backendData?.timeLeft)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="font-numans text-2xs text-white mt-2">
                {currentData?.selectionType === "raffle"
                  ? "HOW TO ENTER DRAW"
                  : "HOW TO CLAIM REWARD"}
              </h2>
              <div className="text-faded-white font-numans text-2xs">
                Note - Finish the task to participate in the raffle.
              </div>
            </div>
            <div className="mt-4" suppressHydrationWarning>
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
                                    : `${key?.slice(0, 6)}...${key?.slice(-6)}`;

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
                                          <div className="text-xs pl-3">
                                            {el?.mandatory && (
                                              <span className="text-red mr-1">
                                                *
                                              </span>
                                            )}
                                            Own atleast 1 NFT from
                                            <Link
                                              className="text-xs   text-green-4 mx-1"
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
                                                          <h5>Trait Type</h5>
                                                          <h5>Trait Value</h5>
                                                        </div>
                                                        {el?.traits?.map(
                                                          (el2) => {
                                                            return (
                                                              <div className="w-full flex gap-6 text-xs justify-between items-center whitespace-nowrap">
                                                                <h5>
                                                                  {el2?.key}
                                                                </h5>
                                                                <h5>
                                                                  {el2?.value}
                                                                </h5>
                                                              </div>
                                                            );
                                                          },
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
                                            {isConnected ? (
                                              !el?.completed ? (
                                                <div
                                                  className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                  onClick={() => {
                                                    verifyUserHoldNftCollectionCall(
                                                      key,
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
                                  <div className="text-xs pl-3 flex items-center gap-1">
                                    {el?.mandatory && (
                                      <span className="text-red mr-1">*</span>
                                    )}

                                    {el?.taskInfo?.includes("Follow") ? (
                                      <p>
                                        Follow{" "}
                                        <p className="text-green inline">
                                          {key === "Twitter" && "@"}
                                          {getUserAccountName(el?.targetURL)}
                                        </p>{" "}
                                        on {key === "Twitter" ? "X" : "Youtube"}
                                      </p>
                                    ) : el?.taskInfo === "ReTweet" ? (
                                      <p>
                                        Retweet a specified tweet on Twitter
                                      </p>
                                    ) : el?.taskInfo?.includes("Like") ? (
                                      <p>Like a specified tweet on Twitter</p>
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
                                  isConnected ? (
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
                                      {isConnected ? (
                                        !el?.completed ? (
                                          <div className="flex gap-2">
                                            {key !== "Twitter" && (
                                              <div
                                                className="text-md cursor-pointer text-white bg-green-2 p-2 px-4 rounded font-numans text-sm"
                                                onClick={() => {
                                                  window.open(
                                                    el?.targetURL,
                                                    "_blank",
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
                                                    "_blank",
                                                  );
                                                  verifyTwitterTask(
                                                    el?.serviceTarget,
                                                    el?.taskInfo,
                                                  );
                                                } else {
                                                  handlePostRedirect(
                                                    key,
                                                    el?.serviceTarget,
                                                    el?.taskInfo,
                                                    key?.toLowerCase(),
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
                                  {currentData?.selectionType === "raffle" && (
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
                                      <span className="text-red mr-1">*</span>
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
                                  {isConnected ? (
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
                                                el.chainId,
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
            </div>
          </div>
          <div className="sticky bottom-0 h-fit w-full bg-black pt-4 flex items-center justify-center flex-col">
            <UtilityButton
              backendData={backendData}
              currentData={currentData}
              tasksStatuses={tasksStatuses}
              setOpenRewardsModal={setShowClaimModal}
              handleEnterDraw={handleEnterDraw}
              generatedCode={generatedCode}
              tokens={tokens}
              entryUpdated={entryUpdated}
              setEntryUpdated={setEntryUpdated}
            />
            <div
              className="bg-green-1 rounded-t-lg flex cursor-pointer items-center justify-center w-full h-fit mt-6 text-xs relative py-1"
              onClick={() => setShowUtilityDetails(true)}
            >
              <div className="h-3 w-3 bg-green-1 rotate-45 -top-1 absolute left-[calc(50%-0.75rem)]"></div>
              <h5 className="z-10 text-green-7">
                Click here to see the campaign details
              </h5>
            </div>
          </div>
        </>
      )}
      {showUtilityDetails && (
        <UtilityDetailsModal
          openModal={showUtilityDetails}
          setOpenModal={setShowUtilityDetails}
          backendData={backendData}
          currentData={currentData}
        />
      )}
      {showClaimModal && (
        <CheckRewardsModalMobile
          showClaimModal={showClaimModal}
          setShowClaimModal={setShowClaimModal}
          title="Rewards"
          backendData={backendData}
          handleRedeemReward={handleRedeemReward}
          handleClaimUtility={handleClaimUtility}
          generatedCode={generatedCode}
          selectedNft={selectedNft}
          setSelectedNft={setSelectedNft}
          tokens={tokens}
        />
      )}
    </>
  );
};

export default UtilityDetailsMobile;
