import ROUTES from "./apiRoutes";
import { getRequest, postRequest, putRequest } from "../axios";

const utilityCalls = {
  uploadImages: (data) =>
    postRequest(ROUTES.UPLOAD_IMAGES, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createUtility: (data) => postRequest(ROUTES.CREATE_UTILITY, data),
  updateUtility: (utilityId, data) =>
    putRequest(`${ROUTES.UPDATE_UTILITY}/${utilityId}`, data),
  getAllStaticTypes: () => getRequest(ROUTES.GET_STATIC_TYPES),
  verifyUserHoldNftCollection: (data) =>
    postRequest(ROUTES.VERIFY_NFT_COLLECTION, { ...data }),
  verifyOnchainTask: (data) =>
    postRequest(ROUTES.VERIFY_ONCHAIN_TASKS, { ...data }),
  checkExternal: (userAddress, targetName, utilityId, taskInfo, extService) =>
    postRequest(`${ROUTES.VERIFY_RAFFLE_TASKS}`, {
      userAddress,
      targetName,
      utilityId,
      taskInfo,
      extService,
    }),
  listDetails: (userId, utilityId) =>
    getRequest(`${ROUTES.GET_RAFFLE_TASKS_STATUS}/${userId}/${utilityId}`),
  getUtilityDetails: (utilityId, userId) =>
    getRequest(
      `${ROUTES.GET_UTILITY_DETAILS}/${utilityId}${
        userId ? `?user=${userId}` : ""
      }`
    ),
  enterDraw: (data) => postRequest(ROUTES.ENTER_DRAW, data),
  claimUtility: (data) => postRequest(`${ROUTES.CLAIM_UTILITY}`, data),
  redeemUtility: (utilityId, walletId, tokenId, txnHash) =>
    postRequest(`${ROUTES.REDEEM_REWARD}`, {
      wallet: walletId,
      utilityId,
      tokenId,
      txnHash,
    }),
  getUserWinnings: (utilityId, walletId) =>
    getRequest(`${ROUTES.GET_USER_WINNINGS}/${utilityId}/${walletId}`, {}),
  getAllUtilities: () => getRequest(ROUTES.CREATE_UTILITY),
  getCollectionsWithUtilities: (chainId, address, refresh) =>
    refresh
      ? getRequest(
          `${ROUTES.GET_COLLECTIONS_WITH_UTILITIES}/${chainId}/${address}?reload=${refresh}`
        )
      : getRequest(
          `${ROUTES.GET_COLLECTIONS_WITH_UTILITIES}/${chainId}/${address}`
        ),
  getCollectionName: (collectionId) =>
    getRequest(`${ROUTES.GET_COLLECTION_NAME}/${collectionId}`),
  getPointsValue: (walletId) =>
    getRequest(`${ROUTES.GET_POINTS_VALUE}/${walletId}`, {}, true),
  checkTelegramBotStatus: (inviteLink, chainId) =>
    getRequest(
      `${ROUTES.CHECK_TELEGRAM_BOT_STATUS}/${chainId}?inviteURL=${inviteLink}`
    ),
  registerReferral: (body) =>
    postRequest(ROUTES.REGISTER_REFERRAL, body, {}, true),
  generateReferralId: (walletAddress) =>
    getRequest(`${ROUTES.GET_REFERRAL_CODE}/${walletAddress}`, {}, true),
  redeemReward: (body) => postRequest(`${ROUTES.CLAIM_REWARD}`, body),
  redeemQuest: (body) => postRequest(`${ROUTES.REDEEM_QUEST}`, body),
  getAllCollectionsWithUtilities: (chainId) =>
    getRequest(`${ROUTES.GET_ALL_COLLECTIONS}/${chainId}`),
  getUserSpace: (wallet) =>
    getRequest(`${ROUTES.GET_USER_SPACES}/${wallet}`),
};

export default utilityCalls;
