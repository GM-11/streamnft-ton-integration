import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useContext, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Button from "../../Reusables/utility/Button";
import WalletIcon from "../../../public/images/Wallet.svg";
import { useRouter } from "next/router";
import Image from "next/image";
import { ImSpinner2 } from "react-icons/im";
import { toast } from "react-toastify";
import {
  handleClaimRewardBackend,
  handleRedeemQuestRewardBackend,
} from "@/utils/BackendCalls";
import { ChainContext } from "@/context/ChainContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const showSpinnerToast = (message, autoClose = 5000000) => {
  toast(
    <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
      <ImSpinner2 className="animate-spin text-white" />
      <span>{message}</span>
    </div>,
    {
      position: toast.POSITION.TOP_RIGHT,
      autoClose,
      className: "!bg-green-6",
      bodyClassName: "!bg-green-6",
    }
  );
};

const UtilityButton = ({
  backendData,
  currentData,
  tasksStatuses,
  setOpenRewardsModal,
  handleEnterDraw,
  tokens,
  entryUpdated,
  setEntryUpdated,
}) => {
  const { isConnected, address } = useUserWalletContext();

  const { openConnectModal } = useConnectModal();
  const { chainDetail } = useContext(ChainContext);
  const { isTokenSet, setShowSignInModal } = useUserWalletContext();

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

  const isUtilityClosed = useMemo(() => {
    return backendData?.timeLeft <= 0 ? true : false;
  }, [backendData]);

  const isAllMandatoryTaskDone = useMemo(() => {
    let bool = true;

    if (eligibilityEntries?.length > 0) {
      for (const [key, value] of eligibilityEntries) {
        for (const item of value?.taskDetails) {
          if (item?.mandatory && !item?.completed) {
            bool = false;
          }
        }
      }
    }

    return bool;
  }, [eligibilityEntries]);

  const isAllTasksCompleted = useMemo(() => {
    let isAllCompleted = true;

    for (const el of tasksStatuses) {
      for (const el2 of el?.tasks) {
        if (!el2?.completed) {
          isAllCompleted = false;
        }
      }
    }

    return isAllCompleted;
  }, [tasksStatuses]);

  const handleQuestRedeem = async () => {
    try {
      showSpinnerToast("Claiming reward...");
      const result = await handleRedeemQuestRewardBackend({
        utilityId: currentData?.utilityId,
        userAddress: chainDetail?.evm ? address : accountId,
      });

      if (result?.response?.data?.error) {
        toast.dismiss();
        toast.error("Utility redeem failed");
      } else {
        toast.dismiss();
        setEntryUpdated(!entryUpdated);
        // setOpenRewardsModal(true);
        toast.success("Reward redeemed successfully.");
      }
    } catch (error) {
      console.log(error);
      toast.dismiss();
      toast.error("Utility redeem failed");
    }
  };

  return (
    <>
      {!isConnected ? (
        <div className="flex py-2 px-2 items-center gap-4 bg-transparent rounded-lg">
          <div className="flex items-center justify-between w-full">
            <Button
              buttonClasses={"!w-full flex gap-3 items-center"}
              onClick={() => {
                openConnectModal();
              }}
            >
              <Image src={WalletIcon} height={16} width={16} alt="wallet" />
              {currentData?.selectionType === "raffle"
                ? "Connect Wallet to enter raffle"
                : "Connect Wallet to claim rewards"}
            </Button>
          </div>
        </div>
      ) : !isTokenSet ? (
        <div className="flex py-2 px-2 items-center gap-4 bg-transparent rounded-lg">
          <div className="flex items-center justify-between w-full">
            <Button
              buttonClasses={"!w-full flex gap-3 items-center"}
              onClick={() => {
                setShowSignInModal(true);
              }}
            >
              <Image src={WalletIcon} height={16} width={16} alt="wallet" />
              {currentData?.selectionType === "raffle"
                ? "Sign in with your wallet to enter raffle"
                : "Sign in with your wallet to claim rewards"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {isUtilityClosed ? (
            <>
              {backendData?.userInfo?.participated ||
              backendData?.userInfo?.claimed ? (
                <>
                  <Button
                    buttonClasses={`!w-full`}
                    onClick={() => {
                      setOpenRewardsModal(true);
                    }}
                  >
                    {currentData?.selectionType === "raffle"
                      ? backendData?.userInfo?.isWinner
                        ? backendData?.userInfo?.isWinner
                          ? "Check Rewards"
                          : "Claim your reward"
                        : "Check winner"
                      : "Check Rewards"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    buttonClasses={`!w-full !bg-red`}
                    shadowColor={"#00000000"}
                    onClick={() => {}}
                  >
                    Utility Expired
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {currentData?.selectionType === "raffle" ? (
                <>
                  {!backendData?.userInfo?.enteredRaffle ? (
                    <>
                      <div
                        className={`!mt-4 w-full justify-end flex items-center `}
                      >
                        <Button
                          buttonClasses={`!w-full`}
                          disabled={!isAllTasksCompleted}
                          onClick={() => {
                            if (isAllMandatoryTaskDone) {
                              handleEnterDraw();
                            } else {
                              toast.error("You are not eligible for this draw");
                            }
                          }}
                        >
                          Enter Raffle
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex py-2 px-2 items-center gap-4 bg-transparent rounded-lg">
                        <div className="flex items-center justify-between w-full">
                          <Button
                            buttonClasses={"!w-full !shadow-none"}
                            disableWithoutEffect
                          >
                            Participated
                            <span className="absolute top-[125%] z-[10000] left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-green-4 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Stay tuned! The raffle draw results will be
                              announced on 'Raffle Draw Date
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {currentData?.winners?.length >=
                  currentData?.reward?.count ? (
                    <>
                      {currentData?.winners?.includes(address) ? (
                        <div className="flex items-center justify-between w-full">
                          <Button
                            buttonClasses={"!w-full"}
                            onClick={() => {
                              setOpenRewardsModal(true);
                            }}
                          >
                            Check Rewards
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <Button
                            buttonClasses={
                              "!w-full !bg-red flex gap-3 items-center !shadow-none"
                            }
                            onClick={() => {}}
                          >
                            All rewards have been claimed already
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {backendData?.userInfo?.claimed ? (
                        <div className="flex py-2 px-2 items-center gap-4 bg-transparent rounded-lg">
                          <div className="flex items-center justify-between w-full relative">
                            <Button
                              buttonClasses={"!w-full"}
                              onClick={() => setOpenRewardsModal(true)}
                            >
                              Check Reward
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex py-2 px-2 items-center gap-4 bg-transparent rounded-lg">
                          <div className="flex items-center justify-between w-full relative">
                            <Button
                              buttonClasses={"!w-full"}
                              disabled={!isAllTasksCompleted}
                              onClick={() => {
                                isAllMandatoryTaskDone
                                  ? currentData?.utilityTag === "quest"
                                    ? handleQuestRedeem()
                                    : setOpenRewardsModal(true)
                                  : toast.error(
                                      "You are not eligible for this claim"
                                    );
                              }}
                            >
                              Claim
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default UtilityButton;
