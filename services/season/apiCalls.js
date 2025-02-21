import ROUTES from "./apiRoutes";
import { getRequest, postRequest } from "../axios";

const apiCalls = {
  getPointsTasks: (season) => getRequest(`${ROUTES.GET_TASKS_DATA}?season=${season}`, {}, true),
  getLeaderboardData: (pageNumber, pageSize,season) =>
    getRequest(
      `${ROUTES.GET_LEADERBOARD_DATA}?page=${pageNumber}&limit=${pageSize}&season=${season}`,
      {},
      true
    ),
  getUserPoints: (walletAddress) =>
    getRequest(`${ROUTES.GET_USER_POINTS}/${walletAddress}`, {}, true),
  getUserTasksStatus: (address,season) =>
    getRequest(`${ROUTES.GET_USER_TASK_STATUS}/${address}?season=${season}`, {}, true),
  trackUserWalletConnection: (body) =>
    postRequest(`${ROUTES.VERIFY_USER_WALLET_CONNECTION}`, body, {}, true),
  getPointsValue: (walletId) =>
    getRequest(`${ROUTES.GET_POINTS_VALUE}/${walletId}`, {}, true),
  registerReferral: (body) =>
    postRequest(ROUTES.REGISTER_REFERRAL, body, {}, true),
  generateReferralId: (walletAddress) =>
    getRequest(`${ROUTES.GET_REFERRAL_CODE}/${walletAddress},`, {}, true),
  getAllSeason: () =>
    getRequest(`${ROUTES.GET_ALL_SEASON}`, {}, true),
};

export default apiCalls;
