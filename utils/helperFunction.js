import axios from "axios";
import jwt from "jsonwebtoken";
import { utilityAxiosInstance } from "../services/axios";
import { jwtDecode } from "jwt-decode";

const REFRESH_THRESHOLD = 3600; // 1 hour in seconds
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// IPFS conversion utility
export function convertIPFS(url) {
  const ipfsPrefix = "ipfs://";
  const httpPrefix = "https://ipfs.io/ipfs/";

  return url.startsWith(ipfsPrefix) ? url.replace(ipfsPrefix, httpPrefix) : url;
}

// Array utility functions
export const sumBy = (arr, func) =>
  arr.reduce((acc, item) => acc + func(item), 0);

export const maxBy = (arr, func) => {
  const max = Math.max(...arr.map(func));
  return arr.find((item) => func(item) === max);
};

export const groupBy = (arr, criteria) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    console.error("Invalid input array:", arr);
    return {};
  }
  try {
    return arr.reduce((obj, item) => {
      const key =
        typeof criteria === "function" ? criteria(item) : item[criteria];
      if (!obj[key]) {
        obj[key] = [];
      }
      obj[key].push(item);
      return obj;
    }, {});
  } catch (error) {
    console.error("Error in groupBy function:", error);
    return {};
  }
};

// Token verification functions
export const verifyToken = async () => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const decodedToken = jwt.decode(token);

  if (!decodedToken) {
    console.error("Failed to decode token");
    return true;
  }

  const currentTime = Date.now() / 1000;
  const isTokenExpiringSoon =
    decodedToken.exp - currentTime < REFRESH_THRESHOLD;

  if (isTokenExpiringSoon) {
    try {
      const response = await utilityAxiosInstance.post(
        "/login/token",
        { refresh_token: refreshToken },
        { headers: { Authorization: token } }
      );
      localStorage.setItem("token", response?.data?.token);
      localStorage.setItem("refreshToken", response?.data?.refreshToken);
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }

  return { token, expired: decodedToken.exp < currentTime };
};

// Fetch events from Mirror
export async function getEventsFromMirror(contractId, abiInterface) {
  await delay(10000);
  const url = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId.toString()}/results/logs?order=asc`;

  try {
    const response = await axios.get(url);
    const logs = response.data.logs;

    for (const log of logs) {
      const logRequest = { data: log.data, topics: log.topics };
      const event = abiInterface.parseLog(logRequest);

      if (event && event.name === "UtilityAdded") {
        const index = event.args[2];
        if (!index) {
          throw new Error("Invalid index in UtilityAdded event");
        }
        return index;
      }
    }
    throw new Error("No UtilityAdded event found");
  } catch (error) {
    console.error("Error fetching logs from mirror node:", error);
  }
}

// Search utility functions
export const searchLend = (obj, query) => {
  if (query.trim() === "") return obj;

  return Object.entries(obj).reduce((filtered, [key, value]) => {
    if (value.pool.collectionName.toLowerCase().includes(query.toLowerCase())) {
      filtered[key] = value;
    }
    return filtered;
  }, {});
};

export const searchOffer = (arr, query) => {
  if (query.trim() === "") return arr;
  return arr.filter((item) => {
    return (
      (item.collection_name &&
        item.collection_name.toLowerCase().includes(query.toLowerCase())) ||
      (item.name && item.name.toLowerCase().includes(query.toLowerCase()))
    );
  });
};

export const searchBorrow = (arr, query) => {
  if (query.trim() === "") return arr;
  return Object.entries(arr).reduce((obj, [index, item]) => {
    if (item[0].collection_name.toLowerCase().includes(query.toLowerCase())) {
      obj[index] = item;
    }
    return obj;
  }, {});
};

// Mint metadata retrieval
export function getMintMetadataById(id) {
  const metadataCollection = [
    {
      name: "Honeyland Test#011",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs...",
      collection: "Honeyland",
      image:
        "https://ipfs.io/ipfs/QmW2YNgaPgT8qPCaZBcaQayC9FeFtpPvCiC58TTHvsRQXs",
      route: "Honeyland",
    },
    // ... other metadata
  ];

  const res = metadataCollection.filter((a) =>
    a.route.toLowerCase().includes(id.toLowerCase())
  );

  if (res.length === 0) {
    return {
      name: "Honeyland Test#0",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs...",
      collection: "Honeyland",
      image:
        "https://arweave.net/6TKUpexnbnDtEPdcGsTi95ahC5X-nZyqfwDrBc2Rxx4?ext=png",
    };
  }

  return res[0];
}

export function getErrorMessage(errorCode) {
  const errorMessages = {
      "InvalidInitializer": "Invalid Setup! Fix your account or parameters to proceed.",
      "InsufficientBalance": "Not Enough Funds! Top up your wallet to continue.",
      "InvalidTimeDuration": "Wrong Duration! Adjust time to meet platform rules.",
      "InvalidUser": "Verification Failed! Log in correctly with proper permissions.",
      "PrivateRental": "Access Denied! This NFT is private—ask the owner for access.",
      "RequiredValidityLessThanLoan": "Too Long! Match validity with the loan period.",
      "RequiredAdmin": "Admin Only! Switch to admin or contact support now.",
      "NonExistentToken": "Token Missing! Double-check the token ID and try again.",
      "ExceededValidity": "Period Too Long! Shorten the time and try again.",
      "InvalidAssetState": "Invalid NFT State! Check ownership or availability first.",
      "AlreadyOnRent": "Already Rented! Wait for the current lease to end.",
      "PendingExpiry": "Rental Ending Soon! Hold off until the period expires.",
      "AllOffersTaken": "No Offers Left! Look for other listings or return later.",
      "RequiredMoreThanRentValdity": "Extend Period! Make the validity longer to proceed.",
      "AlreadyRentedOut": "On Rent! Wait for it to be available again.",
      "OffersExist": "Offers in Play! Clear active offers before moving forward.",
      "Expired": "Expired Rental! Refresh to get updated info.",
      "InvalidTokenType": "Unsupported Token! Confirm details and retry.",
      "NoRewardsFound": "Uh oh! No rewards yet – why not create one and make someone's day.",
      "LoanSuccess": "Loan created! You're all set to go.",
      "LendSuccess": "Lending confirmed! Ready for use.",
      "RentSuccess": "Rental active! Enjoy the experience.",
      "BorrowSuccess": "Borrow successful! It’s all yours now.",
      "UtilityClaimSuccess": "Utility claimed! Added to your account.",
      "UtilityCreateSuccess": "Utility created! Ready for action.",
      "TaskVerificationSuccess": "Task verified! Progress updated.",
      "NftClaim": "Claim your NFT! 🎉 . Loan unpaid? You're eligible for this exclusive NFT – grab it now!",
      "4001":"User rejected the request."
  };


  return errorMessages[errorCode] || "Transaction Failed";
}

export const formatHumanReadableDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                 (day % 10 === 2 && day !== 12) ? 'nd' :
                 (day % 10 === 3 && day !== 13) ? 'rd' : 'th';

  return `${day}${suffix} ${month} ${year}`;
};