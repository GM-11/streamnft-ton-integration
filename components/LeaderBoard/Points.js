"use client"
import Image from "next/image";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import InfoIcon from "../../public/images/infoIcon.png";
const PointsTable = dynamic(() =>
  import("@/components/LeaderBoard/PointsTable/PointsTable")
);
import { ArrowDown } from "@/components/Reusables/utility/Icons";
import apiCalls from "@/services/season/apiCalls";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "react-toastify";
import ProgressBar from "@/components/Reusables/utility/ProgressBar";
import { PointsContext } from "@/context/PointsContext";
import { scoreBaseURL } from "@/services/axios";
import { getWalletSigner } from "@/utils/getWalletEthersSigner";
import { useRouter } from "next/router";
import { useUserWalletContext } from "@/context/UserWalletContext";

const Points = () => {
  const [showSocialTasks, setShowSocialTasks] = useState(true);
  const [showOnChainTasks, setShowOnChainTasks] = useState(true);
  const { address, isConnected } = useUserWalletContext();
  const { data: walletClient } = useWalletClient();
  const verifyCalled = useRef(false);
  const router = useRouter();

  const {
    userTasksStatuses,
    setRefreshPageData,
    refreshPageData,
    streak,
    walletConnected,
    onchainTasks,
    socialTask,
  } = useContext(PointsContext);

  const verifyWalletConnectionOnClick = async () => {
    try {
      const signer = await getWalletSigner(walletClient);
      const signedMessage = await signer.signMessage("login");

      let body = {
        address: address,
        message: "login",
        signature: signedMessage,
        referralId: localStorage.getItem("referralCode"),
      };

      const response = await apiCalls.trackUserWalletConnection(body);

      if (response?.status === 200) {
        toast.success("Wallet connection verified successfully");
        setRefreshPageData(!refreshPageData);
      } else {
        toast.error("Wallet connection verification failed");
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    if (router?.query?.ref) {
      localStorage.setItem("referralCode", router?.query?.ref);
    }
  }, [router]);

  const handlePostRedirect = async (extService) => {
    window.open(
      `${scoreBaseURL}/auth/external/${encodeURIComponent(
        extService
      )}/${encodeURIComponent(address)}`
    );
  };

  const socialTasks = useMemo(() => {
    const socialTasksWithTheirStatuses = socialTask?.map((el) => {
      return { ...el, isCompleted: userTasksStatuses?.[el?.action] };
    });

    return socialTasksWithTheirStatuses;
  }, [userTasksStatuses, socialTask]);

  const onChainTasks = useMemo(() => {
    const onChainTasksArray = onchainTasks;

    const index = onChainTasksArray?.findIndex(
      (obj) => obj?.action === "wallet"
    );

    const [walletObj] = onChainTasksArray?.splice(index, 1);

    const modifiedWalletObj = {
      ...walletObj,
      onClick: () => {
        console.log("Verifying wallet connection on click");
        verifyWalletConnectionOnClick();
      },
      isCompleted: userTasksStatuses?.wallet,
      type: "wallet",
    };

    onChainTasksArray?.unshift(modifiedWalletObj);

    return onChainTasksArray;
  }, [onchainTasks, userTasksStatuses]);



  return (
    <div className="w-full">
      <div className="w-full hidden md:flex gap-4 bg-green-11/10 px-3 py-2 text-2xs sm:text-xs rounded-md">
        <Image src={InfoIcon} alt="#" className="h-4 w-auto object-contain" />
        <h5>
          Verify once the task is performed, points typically take 10-15 minutes
          to display in the user interface. Please don't worry, your points are
          being recorded accurately.
        </h5>
      </div>
      <div className="h-fit w-full flex items-center justify-between mt-8 mb-3">
        <h5
          className="text-green-4 font-poppins"
          onClick={() => setShowSocialTasks(!showSocialTasks)}
        >
          Social Tasks
        </h5>
        <ArrowDown
          size={14}
          color="#fff"
          onClick={() => setShowSocialTasks(!showSocialTasks)}
        />
      </div>
      <div
        className={`h-fit w-full overflow-hidden transition-all duration-300 ${
          showSocialTasks ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <PointsTable
          dataArray={socialTasks}
          handlePostRedirect={handlePostRedirect}
        />
      </div>

      <div className="h-fit w-full flex items-center justify-between mt-8 mb-3">
        <h5
          className="text-green-4 font-poppins cursor-pointer"
          onClick={() => setShowOnChainTasks(!showOnChainTasks)}
        >
          On Chain Tasks
        </h5>
        <ArrowDown
          size={14}
          color="#fff"
          className="cursor-pointer"
          onClick={() => setShowOnChainTasks(!showOnChainTasks)}
        />
      </div>
      <div className="my-4 w-full flex flex-col gap-4">
        <div className="flex items-center gap-3 text-sm">
          <h5 className="">Current Streak</h5>
          <p>:</p>
          <p>{streak} Days</p>
        </div>
        <p className="text-grey text-xs">
          Maintain your streak by connecting your wallet, And get extra bonuses
        </p>
        <ProgressBar progress={streak} />
      </div>
      <div
        className={`h-fit w-full overflow-auto transition-all duration-300 ${
          showOnChainTasks ? "max-h-[5000px]" : "max-h-0"
        }`}
      >
        <PointsTable dataArray={onChainTasks} />
      </div>
    </div>
  );
};

export default Points;
