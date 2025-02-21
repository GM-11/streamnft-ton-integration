"use client";
import React, { useState, useContext } from "react";
import Image from "next/image";
import GreenPatternImage from "../../../public/images/greenPatternBg.png";
import TrophyImage from "../../../public/images/trophyImage.png";
import { formatHumanReadableDate } from "@/utils/helperFunction";
import RegisterNowButton from "@/components/LeaderBoard/RegisterNowButton";
import { PointsContext } from "@/context/PointsContext";

const CollapsibleSeason = ({ season, walletConnected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedSeason, setSelectedSeason, selectedSeasonId } =
    useContext(PointsContext);

  const toggleSeason = () => {
    if (selectedSeason?.season_number !== season.season_number) {
      setSelectedSeason(season);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  console.log({ selectedSeasonId, selectedSeason });

  return (
    <div className="flex-1 rounded-lg bg-grayscale-30 overflow-hidden p-2">
      <div
        className={` rounded-lg ${
          selectedSeason?.season_number === season?.season_number
            ? "bg-green-4"
            : "bg-grayscale-30"
        }`}
      >
        <div className="h-fit w-full relative rounded-lg">
          <Image
            src={GreenPatternImage}
            alt="#"
            className={`max-h-16 w-full absolute rounded-lg left-0 right-0 object-cover ${
              selectedSeason?.season_number === season?.season_number
                ? "bg-green-4"
                : "hidden"
            }`}
          />
          <div className="h-full w-full p-4 pr-16 flex flex-col gap-2">
            <div
              className="px-3 py-1 text-sm bg-white-1 rounded-md w-fit text-white cursor-pointer z-[20]"
              onClick={toggleSeason}
            >
              <h5>{season?.title}</h5>
            </div>
          </div>
          {selectedSeason?.season_number === season?.season_number && (
            <Image
              src={TrophyImage}
              alt="#"
              className="h-36 w-auto object-contain absolute right-0 bottom-0"
            />
          )}
        </div>
      </div>
      {isOpen && selectedSeason?.season_number === season?.season_number && (
        <div className="mt-5">
          <div className="text-sm px-2 text-green-5">{season?.description}</div>
          <div className="w-full h-fit p-3 flex items-center rounded-md justify-between bg-white-3 text-xs my-2">
            <h5>Start Date</h5>
            <div className="py-1 px-2 text-white rounded-md bg-white-2">
              {formatHumanReadableDate(season?.start_date)}
            </div>
          </div>
          <div className="w-full h-fit p-3 flex items-center rounded-md justify-between bg-white-3 text-xs my-2">
            <h5>End Date</h5>
            <div className="py-1 px-2 text-white rounded-md bg-white-2">
              {formatHumanReadableDate(season?.end_date)}
            </div>
          </div>
        </div>
      )}
      {!walletConnected && (
        <div className="p-4">
          <RegisterNowButton />
        </div>
      )}
    </div>
  );
};

const SeasonsList = ({ seasons, walletConnected }) => {
  return (
    <div className="w-[350px] gap-2 hidden 2md:flex py-4 fixed top-[180px] lg:top-28 right-8 flex-col z-[2]">
      {seasons.map((season, index) => (
        <CollapsibleSeason
          key={index}
          season={season}
          walletConnected={walletConnected}
        />
      ))}
    </div>
  );
};

export default SeasonsList;
