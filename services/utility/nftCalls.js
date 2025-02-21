import { getRequest, postRequest } from "../axios";
import ROUTES from "./apiRoutes";

const nftCalls = {
  getUserNFTCollections: (chainId, address) =>
    getRequest(`${ROUTES.GET_ALL_NFTS}/${chainId}/${address}`),
  fetchUserNftData: (chainId, utilityId) =>
    getRequest(`${ROUTES.GET_USER_NFTS}/${chainId}/${utilityId}`),
  getCollections: () => getRequest(`${ROUTES.GET_COLLECTIONS}`),
  createCollection: (tokenAddress, chainId) =>
    postRequest(`${ROUTES.GET_COLLECTIONS}`, {
      tokenAddress,
      chainId
    }),
  getTraitOptions: (tokenAddress) =>
    getRequest(`${ROUTES.GET_COLLECTIONS_TRAITS}/${tokenAddress}`),
  nftDetail: (address, response) =>
    postRequest(`${ROUTES.NFT_DETAIL}/${response}/11155111/${address}`, {}),
};

export default nftCalls;
