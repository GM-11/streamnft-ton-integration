"use client";
import React, { useContext, useEffect, useState } from "react";
import BadgeOneImage from "../../public/images/badgeTwo.png";
import BadgeTwoImage from "../../public/images/badgeOne.png";
import BadgeThreeImage from "../../public/images/badgeThree.png";
import RewardImage from "../../public/images/rewardIcon.png";
import Image from "next/image";
import LeaderBoardTable from "@/components/LeaderBoard/LeaderBoardTable/LeaderBoardTable";
import apiCalls from "@/services/season/apiCalls";
import { MdExpandLess } from "react-icons/md";
import Dropdown from "@/components/Reusables/utility/Dropdown";
import { FormProvider, useForm } from "react-hook-form";
import { PointsContext } from "@/context/PointsContext";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  const [pageSize, setPageSize] = useState(5);

  const [pageNumber, setPageNumber] = useState(1);

  const [topThreeUsers, setTopThreeUsers] = useState([]);

  const [totalUsers, setTotalUsers] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const { selectedSeasonId,setUserTasksStatuses } = useContext(PointsContext);

  const methods = useForm({
    defaultValues: { pageSizeSelector: 5 },
  });

  const fetchLeaderboardData = async () => {
    const response = await apiCalls.getLeaderboardData(
      pageNumber,
      pageSize,
      selectedSeasonId
    );

    

    if (response?.data?.success) {
      setLeaderboardData(response?.data?.data?.users);
      setTotalUsers(response?.data?.data?.totalUsers);
      setTotalPages(response?.data?.data?.totalPages);
    } else {
      setUserTasksStatuses({});
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [pageNumber, pageSize, selectedSeasonId]);

  useEffect(() => {
    if (leaderboardData?.length > 0 && pageNumber === 1) {
      setTopThreeUsers(leaderboardData?.slice(0, 3));
    }
  }, [leaderboardData, pageNumber]);

  const nextPageHandler = () => {
    if (totalPages > pageNumber) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPageHandler = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
console.log({leaderboardData})


  return (
    <>
      <div className="flex items-center justify-between">
        <h5 className="text-2xl text-whitish green tracking-wide">
          Leaderboard
        </h5>
        {/* <Button shadowColor={"#00000000"} buttonClasses={"!bg-grayscale-21"}>
          Show Position
        </Button> */}
      </div>
      <div className="hidden 2md:flex gap-6 mt-8">
        <div className="grow h-fit p-6 rounded-md bg-grayscale-31 flex items-start justify-between">
          <div className="w-fit flex flex-col items-start gap-4">
            <div className="flex gap-4">
              {/* <Image
                src={ProfileImage}
                className="h-4 w-4 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              /> */}
              <h5 className="text-grayscale-6 text-sm">
                {topThreeUsers?.[0]?.address?.slice(0, 5)}...
                {topThreeUsers?.[0]?.address?.slice(-5)}
              </h5>
            </div>
            <div className="rounded-md p-3 flex items-center bg-grayscale-23 gap-2">
              <Image
                src={RewardImage}
                className="h-5 w-5 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              />
              <h5>{topThreeUsers?.[0]?.score}</h5>
            </div>
          </div>
          <Image
            src={BadgeOneImage}
            className="h-20 w-20 object-contain"
            alt="#"
            height={256}
            width={256}
          />
        </div>
        <div className="grow flex h-fit p-6 rounded-md bg-grayscale-31 items-start justify-between">
          <div className="w-fit flex flex-col items-start gap-4">
            <div className="flex gap-4">
              {/* <Image
                src={ProfileImage}
                className="h-4 w-4 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              /> */}
              <h5 className="text-grayscale-6 text-sm">
                {topThreeUsers?.[1]?.address?.slice(0, 5)}...
                {topThreeUsers?.[1]?.address?.slice(-5)}{" "}
              </h5>
            </div>
            <div className="rounded-md p-3 flex items-center bg-grayscale-23 gap-2">
              <Image
                src={RewardImage}
                className="h-5 w-5 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              />
              <h5>{topThreeUsers?.[1]?.score}</h5>
            </div>
          </div>
          <Image
            src={BadgeTwoImage}
            className="h-20 w-20 object-contain"
            alt="#"
            height={256}
            width={256}
          />
        </div>
        <div className="grow h-fit p-6 rounded-md bg-grayscale-31 flex items-start justify-between">
          <div className="w-fit flex flex-col items-start gap-4">
            <div className="flex gap-4">
              {/* <Image
                src={ProfileImage}
                className="h-4 w-4 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              /> */}
              <h5 className="text-grayscale-6 text-sm">
                {topThreeUsers?.[2]?.address?.slice(0, 5)}...
                {topThreeUsers?.[2]?.address?.slice(-5)}
              </h5>
            </div>
            <div className="rounded-md p-3 flex items-center bg-grayscale-23 gap-2">
              <Image
                src={RewardImage}
                className="h-5 w-5 rounded-full object-cover"
                alt="profile_image"
                height={64}
                width={64}
              />
              <h5>{topThreeUsers?.[2]?.score}</h5>
            </div>
          </div>
          <Image
            src={BadgeThreeImage}
            className="h-20 w-20 object-contain"
            alt="#"
            height={256}
            width={256}
          />
        </div>
      </div>
      {/* <div className="my-8 flex items-center justify-center">
        <div className="w-fit px-4 py-1.5 text-xs 2md:text-sm gap-1.5 bg-grayscale-31 rounded-md flex flex-wrap text-grayscale-10">
          you earned
          <Image src={RewardImage} className="h-5 w-5 object-contain inline" />
          <span className="text-white">128</span>
          today and reached
          <span className="text-white">#256</span>
          out of
          <span className="text-white">1000</span>
          users
        </div>
      </div> */}
      <LeaderBoardTable dataArray={leaderboardData} />
      <div className="h-fit w-full flex items-center justify-between text-white text-xs pb-16">
        <div className="flex items-center gap-2">
          <h5>Rows per page : </h5>
          <FormProvider {...methods}>
            <Dropdown
              name="pageSizeSelector"
              items={[
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "20", value: 20 },
                { label: "50", value: 50 },
              ]}
              onSelect={(e) => {
                setPageNumber(1);
                setPageSize(e?.value);
              }}
            />
          </FormProvider>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-1">
            <p>{(pageNumber - 1) * pageSize}</p>
            <p>-</p>
            <p>
              {pageNumber * pageSize > totalUsers
                ? totalUsers
                : pageNumber * pageSize}
            </p>
            <p>of</p>
            <p>{totalUsers}</p>
          </div>
          <div className="flex gap-2">
            <button
              className="border border-solid h-fit w-fit border-faded-white rounded-full p-1"
              onClick={() => prevPageHandler()}
            >
              <MdExpandLess className="-rotate-90 text-white" size={18} />
            </button>
            <button
              className="border border-solid h-fit w-fit border-faded-white rounded-full p-1"
              onClick={() => nextPageHandler()}
            >
              <MdExpandLess className="rotate-90 text-white" size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
