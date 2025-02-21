import {
  createUtility as devCreateUtility,
  redeemUtilityOnNFT as devRedeemUtilityOnNFT,
} from "streamnft-utility-test";

import {
  createUtility as prodCreateUtility,
  redeemUtilityOnNFT as prodRedeemUtilityOnNFT,
} from "streamnft-utility-test"; // change to "streamnft-utility" before deployment

import {
  lendToken as devLendToken,
  approveToken as devApproveToken,
  approveToken1155 as devApproveToken1155,
  cancelLendToken as devCancelLendToken,
  processRent as devProcessRent,
  getStreamConfig as devGetStreamConfig,
  getAssetsByUserAndCollection as devGetAssetsByUserAndCollection,
  getProvider as devGetProvider,
  getERC20Balance as devGetERC20Balance,
  expireRent as devExpireRent,
  getAssetsByCollection as devGetAssetsByCollection,
  addLoanOffer as devAddLoanOffer,
  processLoan as devProcessLoan,
  removeLoanOffer as devRemoveLoanOffer,
  repayLoan as devRepayLoan,
  updateOfferAmount as devUpdateOfferAmount,
  updateOfferCount as devUpdateOfferCount,
  createNFTPool as devCreateNFTPool,
  removeNFTPool as devRemoveNFTPool,
  acceptOffer as devAcceptOffer,
  expireLoan as devExpireLoan,
  approveErc20 as devApproveErc20,
  createListing as devCreateListing,
  buyListedNFT as devBuyListedNFT,
  cancelListing as devCancelListing,
} from "streamnft-evm-test";

import {
  lendToken as prodLendToken,
  approveToken as prodApproveToken,
  approveToken1155 as prodApproveToken1155,
  cancelLendToken as prodCancelLendToken,
  processRent as prodProcessRent,
  getStreamConfig as prodGetStreamConfig,
  getAssetsByUserAndCollection as prodGetAssetsByUserAndCollection,
  getProvider as prodGetProvider,
  getERC20Balance as prodGetERC20Balance,
  expireRent as prodExpireRent,
  getAssetsByCollection as prodGetAssetsByCollection,
  addLoanOffer as prodAddLoanOffer,
  processLoan as prodProcessLoan,
  removeLoanOffer as prodRemoveLoanOffer,
  repayLoan as prodRepayLoan,
  updateOfferAmount as prodUpdateOfferAmount,
  updateOfferCount as prodUpdateOfferCount,
  createNFTPool as prodCreateNFTPool,
  removeNFTPool as prodRemoveNFTPool,
  acceptOffer as prodAcceptOffer,
  expireLoan as prodExpireLoan,
  approveErc20 as prodApproveErc20,
  createListing as prodCreateListing,
  buyListedNFT as prodBuyListedNFT,
  cancelListing as prodCancelListing,
} from "streamnft-evm";

import {
  lendToken as stagingLendToken,
  approveToken as stagingApproveToken,
  approveToken1155 as stagingApproveToken1155,
  cancelLendToken as stagingCancelLendToken,
  processRent as stagingProcessRent,
  getStreamConfig as stagingGetStreamConfig,
  getAssetsByUserAndCollection as stagingGetAssetsByUserAndCollection,
  getProvider as stagingGetProvider,
  getERC20Balance as stagingGetERC20Balance,
  expireRent as stagingExpireRent,
  getAssetsByCollection as stagingGetAssetsByCollection,
  addLoanOffer as stagingAddLoanOffer,
  processLoan as stagingProcessLoan,
  removeLoanOffer as stagingRemoveLoanOffer,
  repayLoan as stagingRepayLoan,
  updateOfferAmount as stagingUpdateOfferAmount,
  updateOfferCount as stagingUpdateOfferCount,
  createNFTPool as stagingCreateNFTPool,
  removeNFTPool as stagingRemoveNFTPool,
  acceptOffer as stagingAcceptOffer,
  expireLoan as stagingExpireLoan,
  approveErc20 as stagingApproveErc20,
  createListing as stagingCreateListing,
  buyListedNFT as stagingBuyListedNFT,
  cancelListing as stagingCancelListing,
} from "streamnft-evm-staging";

// Determine the current environment
const environment = process.env.NEXT_PUBLIC_NODE_ENV;
const isProd = environment === "production";
const isStaging = environment === "staging";

// Export utility functions based on environment
export const createUtility = isProd ? prodCreateUtility : devCreateUtility;
export const redeemUtilityOnNFT = isProd
  ? prodRedeemUtilityOnNFT
  : devRedeemUtilityOnNFT;

// Export other functions based on environment
export const lendToken = isProd
  ? prodLendToken
  : isStaging
  ? stagingLendToken
  : devLendToken;

export const approveToken = isProd
  ? prodApproveToken
  : isStaging
  ? stagingApproveToken
  : devApproveToken;

export const approveToken1155 = isProd
  ? prodApproveToken1155
  : isStaging
  ? stagingApproveToken1155
  : devApproveToken1155;

export const cancelLendToken = isProd
  ? prodCancelLendToken
  : isStaging
  ? stagingCancelLendToken
  : devCancelLendToken;

export const processRent = isProd
  ? prodProcessRent
  : isStaging
  ? stagingProcessRent
  : devProcessRent;

export const getStreamConfig = isProd
  ? prodGetStreamConfig
  : isStaging
  ? stagingGetStreamConfig
  : devGetStreamConfig;

export const getAssetsByUserAndCollection = isProd
  ? prodGetAssetsByUserAndCollection
  : isStaging
  ? stagingGetAssetsByUserAndCollection
  : devGetAssetsByUserAndCollection;

export const getProvider = isProd
  ? prodGetProvider
  : isStaging
  ? stagingGetProvider
  : devGetProvider;

export const getERC20Balance = isProd
  ? prodGetERC20Balance
  : isStaging
  ? stagingGetERC20Balance
  : devGetERC20Balance;

export const expireRent = isProd
  ? prodExpireRent
  : isStaging
  ? stagingExpireRent
  : devExpireRent;

// New additions with environment checks
export const getAssetsByCollection = isProd
  ? prodGetAssetsByCollection
  : isStaging
  ? stagingGetAssetsByCollection
  : devGetAssetsByCollection;

export const addLoanOffer = isProd
  ? prodAddLoanOffer
  : isStaging
  ? stagingAddLoanOffer
  : devAddLoanOffer;

export const processLoan = isProd
  ? prodProcessLoan
  : isStaging
  ? stagingProcessLoan
  : devProcessLoan;

export const removeLoanOffer = isProd
  ? prodRemoveLoanOffer
  : isStaging
  ? stagingRemoveLoanOffer
  : devRemoveLoanOffer;

export const repayLoan = isProd
  ? prodRepayLoan
  : isStaging
  ? stagingRepayLoan
  : devRepayLoan;

export const updateOfferAmount = isProd
  ? prodUpdateOfferAmount
  : isStaging
  ? stagingUpdateOfferAmount
  : devUpdateOfferAmount;

export const updateOfferCount = isProd
  ? prodUpdateOfferCount
  : isStaging
  ? stagingUpdateOfferCount
  : devUpdateOfferCount;

export const createNFTPool = isProd
  ? prodCreateNFTPool
  : isStaging
  ? stagingCreateNFTPool
  : devCreateNFTPool;

export const removeNFTPool = isProd
  ? prodRemoveNFTPool
  : isStaging
  ? stagingRemoveNFTPool
  : devRemoveNFTPool;

export const acceptOffer = isProd
  ? prodAcceptOffer
  : isStaging
  ? stagingAcceptOffer
  : devAcceptOffer;

export const expireLoan = isProd
  ? prodExpireLoan
  : isStaging
  ? stagingExpireLoan
  : devExpireLoan;

export const approveErc20 = isProd
  ? prodApproveErc20
  : isStaging
  ? stagingApproveErc20
  : devApproveErc20;

export const createListing = isProd
  ? prodCreateListing
  : isStaging
  ? stagingCreateListing
  : devCreateListing;

export const buyListedNFT = isProd
  ? prodBuyListedNFT
  : isStaging
  ? stagingBuyListedNFT
  : devBuyListedNFT;

export const cancelListing = isProd
  ? prodCancelListing
  : isStaging
  ? stagingCancelListing
  : devCancelListing;
