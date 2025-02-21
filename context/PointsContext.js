"use client";
import { createContext, useEffect, useState } from "react";
import apiCalls from "@/services/season/apiCalls";
import { useUserWalletContext } from "./UserWalletContext";

export const PointsContext = createContext();

const PointsContextWrapper = ({ children }) => {
  const [totalTasks, setTotalTasks] = useState([]);
  const [onchainTasks, setOnchainTasks] = useState([]);
  const [socialTask, setsocialTask] = useState([]);
  const [userTasksStatuses, setUserTasksStatuses] = useState({});
  const [refreshPageData, setRefreshPageData] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [openReferModal, setOpenReferModal] = useState(false);

  const [allSeasonDetails, setAllSeasonDetails] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const { isConnected, address } = useUserWalletContext();

  const fetchTasksData = async () => {
    if (selectedSeasonId == null) {
      console.warn("selectedSeasonId is missing");
      return null;
    }
    const response = await apiCalls.getPointsTasks(selectedSeasonId);

    if (response.status === 200) {
      setTotalTasks(response?.data?.data?.total);
      setOnchainTasks(response?.data?.data?.onchain);
      setsocialTask(response?.data?.data?.social);
    } else {
      setTotalTasks([]);
      setOnchainTasks([]);
      setsocialTask([]);
    }
  };

  const fetchUserTasksStatuses = async () => {
    if (!address || selectedSeasonId == null) {
      console.warn("Address or selectedSeasonId is missing");
      return null;
    }

    const response = await apiCalls.getUserTasksStatus(
      address,
      selectedSeasonId
    );

    return response;
  };

  const fetchAllSeason = async () => {
    const response = await apiCalls.getAllSeason();

    if (response?.status !== 200) {
      console.error("Error fetching all season data", response);
      setAllSeasonDetails([]);
    } else {
      const seasons = response?.data?.data;
      setAllSeasonDetails(seasons);

      if (seasons?.length > 0) {
        setSelectedSeason(seasons[0]);
        setSelectedSeasonId(seasons[0]?.season_number);
      }
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, [walletConnected, selectedSeasonId]);

  useEffect(() => {
    fetchAllSeason();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      setSelectedSeasonId(selectedSeason?.season_number);
    }
  }, [selectedSeason]);

  useEffect(() => {
    const fn = async () => {
      if (address) {
        const result = await fetchUserTasksStatuses();

        if (result) {
          setUserTasksStatuses(result?.data?.data[0]);
          setPoints(result?.data?.data[0]?.score);
          setStreak(result?.data?.data[0]?.streak);
        } else {
          setUserTasksStatuses({});
          setPoints(0);
          setStreak(0);
        }
      }
    };

    if (walletConnected) {
      fn();
    } else {
      setUserTasksStatuses({});
      setPoints(0);
      setStreak(0);
    }
  }, [refreshPageData, walletConnected, address, selectedSeasonId]);

  useEffect(() => {
    if (isConnected && !walletConnected) {
      setWalletConnected(true);
    }

    if (!isConnected && walletConnected) {
      setWalletConnected(false);
    }
  }, [isConnected]);

  return (
    <PointsContext.Provider
      value={{
        userTasksStatuses,
        setUserTasksStatuses,
        totalTasks,
        setRefreshPageData,
        walletConnected,
        points,
        streak,
        fetchUserTasksStatuses,
        openReferModal,
        setOpenReferModal,
        allSeasonDetails,
        selectedSeason,
        setSelectedSeason,
        selectedSeasonId,
        onchainTasks,
        socialTask,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};

export default PointsContextWrapper;
