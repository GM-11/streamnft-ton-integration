"use client";
import React, { useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Leaderboard from "@/components/LeaderBoard/Leaderboard";
import Points from "@/components/LeaderBoard/Points";
import Image from "next/image";
import GreenPatternImage from "../../public/images/greenPatternBg.png";
import LeftPatternImage from "../../public/images/leftSidePatternBg.png";
import TrophyImage from "../../public/images/trophyImage.png";
import PointsEarnedModal from "@/components/Reusables/utility/Modals/PointsEarned";
import HowToRedeemModal from "@/components/Reusables/utility/Modals/HowToRedeem";
import { PointsContext } from "@/context/PointsContext";
import ReferralModal from "@/components/Reusables/utility/Modals/ReferralModal";
import apiCalls from "@/services/season/apiCalls";
import { useRouter } from "next/router";
import { useUserWalletContext } from "@/context/UserWalletContext";
import { formatHumanReadableDate } from "@/utils/helperFunction";
import SeasonsList from "@/components/Reusables/season/SeasonList";
const RegisterNowButton = dynamic(() =>
  import("@/components/LeaderBoard/RegisterNowButton")
);

const index = () => {
  const router = useRouter();

  const { address } = useUserWalletContext();

  const [selectedTab, setSelectedTab] = useState("points");

  const [showHowToRedeem, setShowHowToRedeem] = useState(false);

  const [showPointsEarned, setShowPointsEarned] = useState(false);

  const {
    points,
    walletConnected,
    openReferModal,
    setOpenReferModal,
    allSeasonDetails,
    selectedSeason,
    setSelectedSeason,
  } = useContext(PointsContext);

  useEffect(() => {
    const fn = async () => {
      if (router?.query?.ref) {
        apiCalls.registerReferral({
          walletAddress: address,
          referralId: router?.query?.ref,
        });
      }
    };

    fn();
  }, [router, address]);

  return (
    <div className="px-2 mt-12 md:px-8 relative">
      <div className="absolute">
        <Image
          src={LeftPatternImage}
          className="min-h-[calc(100vh-160px)] min-w-[calc(100vw-160px)] max-h-[calc(100vh-160px)] max-w-[calc(100vw-160px)] object-cover object-center"
          height={600}
          width={1500}
        />
      </div>
      <div className="relative z-[2]">
        <div className="h-full max-w-full 2md:max-w-[calc(100vw-450px)] z-[2]">
          <div className="h-fit w-full flex flex-col gap-4 items-start 2sm:flex-row 2sm:items-center !text-2xs md:!text-sm justify-between my-3 2md:my-8">
            <div className="h-fit flex p-2 rounded-lg bg-grayscale-27 w-full 2sm:w-fit">
              <div
                className={`py-1 2sm:py-2 flex items-center justify-center px-4 rounded-lg grow text-white transition-all duration-300 cursor-pointer ${
                  selectedTab === "points"
                    ? "bg-grayscale-28"
                    : "bg-transparent"
                }`}
                onClick={() => {
                  setSelectedTab("points");
                }}
              >
                Points
              </div>
              <div
                className={`py-1 2sm:py-2 flex items-center justify-center px-4 rounded-lg grow text-white transition-all duration-300 cursor-pointer ${
                  selectedTab === "leaderboard"
                    ? "bg-grayscale-28"
                    : "bg-transparent"
                }`}
                onClick={() => {
                  setSelectedTab("leaderboard");
                }}
              >
                Leaderboard
              </div>
            </div>
            <div className="h-fit w-full 2sm:w-fit flex gap-6 items-center justify-between 2sm:justify-start">
              {walletConnected && (
                <div className="px-4 py-2 flex gap-2 bg-grayscale-21 cursor-pointer text-2xs 2sm:text-sm items-center rounded-md">
                  <h5>Your Points : {points}</h5>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex 2md:hidden py-4 h-fit flex-col z-[2]">
            <div className="flex-1 rounded-lg bg-grayscale-30 overflow-hidden">
              <div className="bg-grayscale-30 rounded-lg">
                <div className="h-fit w-full bg-green-4 relative rounded-lg">
                  <Image
                    src={GreenPatternImage}
                    alt="#"
                    className="h-full w-full absolute left-0 right-0 object-cover"
                  />
                  <div className="h-full w-full p-4 pr-8 flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <div className="px-3 py-1 text-xs bg-white-1 rounded-md w-fit text-white">
                        starts{" "}
                        {formatHumanReadableDate(selectedSeason?.start_date)}
                      </div>
                      <h5>{selectedSeason?.title}</h5>
                    </div>
                    <div className="text-2xs md:text-xs text-white">
                      {selectedSeason?.description}
                    </div>
                  </div>
                  <Image
                    src={TrophyImage}
                    alt="#"
                    className="h-24 w-auto object-contain absolute right-0 bottom-0"
                  />
                </div>
                {!walletConnected && (
                  <div className="p-4">
                    <RegisterNowButton />
                  </div>
                )}
              </div>
            </div>
          </div>
          {selectedTab === "leaderboard" ? (
            <Leaderboard />
          ) : selectedTab === "points" ? (
            <Points />
          ) : (
            <></>
          )}
        </div>

        <SeasonsList
          seasons={allSeasonDetails}
          key={index}
          walletConnected={walletConnected}
        />
      </div>

      <PointsEarnedModal
        open={showPointsEarned}
        handleClose={() => {
          setShowPointsEarned(false);
        }}
      />
      <HowToRedeemModal
        open={showHowToRedeem}
        handleClose={() => {
          setShowHowToRedeem(false);
        }}
      />
      <ReferralModal
        open={openReferModal}
        handleClose={() => {
          setOpenReferModal(false);
        }}
      />
    </div>
  );
};

export default index;
