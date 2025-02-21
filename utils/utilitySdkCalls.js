
import {
    getJWT as devGetJWT,
    checkNFTUtility as devCheckNFTUtility,
    claimUtilityOnNFT as devClaimUtilityOnNFT,
    createUtility as devCreateUtility,
    getAllUtilityByUser as devGetAllUtilityByUser,
    redeemUtilityOnNFT as devRedeemUtilityOnNFT,
    claimReward as devClaimReward,
    endRaffle as devEndRaffle,
    getWalletSigner as devGetWalletSigner,
    joinRaffle as devJoinRaffle,
    getSigner as devGetSigner,
    getContractSigner as devGetContractSigner,
    getContract as devGetContract,
    getAllUtilityByCollection as devGetAllUtilityByCollection,
    getUtilityChain as devGetUtilityChain,
} from "streamnft-utility-test";

import {
  getJWT as prodGetJWT,
  checkNFTUtility as prodCheckNFTUtility,
  claimUtilityOnNFT as prodClaimUtilityOnNFT,
  createUtility as prodCreateUtility,
  getAllUtilityByUser as prodGetAllUtilityByUser,
  redeemUtilityOnNFT as prodRedeemUtilityOnNFT,
  claimReward as prodClaimReward,
  endRaffle as prodEndRaffle,
  getWalletSigner as prodGetWalletSigner,
  joinRaffle as prodJoinRaffle,
  getSigner as prodGetSigner,
  getContractSigner as prodGetContractSigner,
  getContract as prodGetContract,
  getAllUtilityByCollection as prodGetAllUtilityByCollection,
  getUtilityChain as prodGetUtilityChain,
} from "streamnft-utility";

import {
  getJWT as stagingGetJWT,
  checkNFTUtility as stagingCheckNFTUtility,
  claimUtilityOnNFT as stagingClaimUtilityOnNFT,
  createUtility as stagingCreateUtility,
  getAllUtilityByUser as stagingGetAllUtilityByUser,
  redeemUtilityOnNFT as stagingRedeemUtilityOnNFT,
  claimReward as stagingClaimReward,
  endRaffle as stagingEndRaffle,
  getWalletSigner as stagingGetWalletSigner,
  joinRaffle as stagingJoinRaffle,
  getSigner as stagingGetSigner,
  getContractSigner as stagingGetContractSigner,
  getContract as stagingGetContract,
  getAllUtilityByCollection as stagingGetAllUtilityByCollection,
  getUtilityChain as stagingGetUtilityChain,
} from "streamnft-utility-staging";



const isProd = process.env.NEXT_PUBLIC_NODE_ENV === "production";
const isStaging = process.env.NEXT_PUBLIC_NODE_ENV === "staging";


export const getJWT = isProd ? prodGetJWT : isStaging ? stagingGetJWT : devGetJWT;
export const checkNFTUtility = isProd ? prodCheckNFTUtility : isStaging ? stagingCheckNFTUtility : devCheckNFTUtility;
export const claimUtilityOnNFT = isProd ? prodClaimUtilityOnNFT : isStaging ? stagingClaimUtilityOnNFT : devClaimUtilityOnNFT;
export const createUtility = isProd ? prodCreateUtility : isStaging ? stagingCreateUtility : devCreateUtility;
export const getAllUtilityByUser = isProd ? prodGetAllUtilityByUser : isStaging ? stagingGetAllUtilityByUser : devGetAllUtilityByUser;
export const redeemUtilityOnNFT = isProd ? prodRedeemUtilityOnNFT : isStaging ? stagingRedeemUtilityOnNFT : devRedeemUtilityOnNFT;
export const claimReward = isProd ? prodClaimReward : isStaging ? stagingClaimReward : devClaimReward;
export const endRaffle = isProd ? prodEndRaffle : isStaging ? stagingEndRaffle : devEndRaffle;
export const getWalletSigner = isProd ? prodGetWalletSigner : isStaging ? stagingGetWalletSigner : devGetWalletSigner;
export const joinRaffle = isProd ? prodJoinRaffle : isStaging ? stagingJoinRaffle : devJoinRaffle;
export const getSigner = isProd ? prodGetSigner : isStaging ? stagingGetSigner : devGetSigner;
export const getContractSigner = isProd ? prodGetContractSigner : isStaging ? stagingGetContractSigner : devGetContractSigner;
export const getContract = isProd ? prodGetContract : isStaging ? stagingGetContract : devGetContract;
export const getAllUtilityByCollection = isProd ? prodGetAllUtilityByCollection : isStaging ? stagingGetAllUtilityByCollection : devGetAllUtilityByCollection;
export const getUtilityChain = isProd ? prodGetUtilityChain : isStaging ? stagingGetUtilityChain : devGetUtilityChain;
