import { url } from "./hashConnectProvider";
import { AccountId } from "@hashgraph/sdk";
import {
  indexerAxiosInstance,
  nftCacheAxiosInstance,
  scoreAxiosInstance,
  shopAxiosInstance,
} from "@/services/axios";
import utilityCalls from "@/services/utility/utilityCalls";

const getCollectionName = async (collectionId) => {
  const getResponse = await utilityCalls.getCollectionName(collectionId);
  const data = getResponse.data;

  return data;
};

const postLoanOffer = async (
  bidderPubkey,
  bidAmount,
  totalBids,
  bidPoolIndex,
  txnHash,
  chainId,
  referralId,
  contractAddress,
  index,
  address
) => {
  const data = {
    bidderPubkey: bidderPubkey,
    bidAmount: bidAmount,
    totalBids: totalBids,
    bidPoolIndex: bidPoolIndex,
    chain_id: chainId,
    contract_address: contractAddress,
    txnHash: txnHash,
    referralId: referralId,
    offerIndex: index,
    wallet: address,
  };

  try {
    await indexerAxiosInstance.post("/loanOffer", data);
  } catch (error) {
    let errorMessage = "Something went wrong while creating the loan offer.";
    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postLoanOffer:", errorMessage);
    throw new Error(errorMessage);
  }
};

const postSolanaLoanOffer = async (
  chainId,
  txnHash,
  contractAddress,
  loanOfferAddress,
  bidderPubkey,
  biddingAmountInLamports,
  biddingPoolAddress,
  totalBids
) => {
  const data = {
    chainId,
    txnHash,
    contractAddress,
    loanOfferAddress,
    bidderPubkey,
    biddingAmountInLamports,
    biddingPoolAddress,
    totalBids,
  };

  try {
    const response = await fetch(`${url}/solana/loanOffer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${errorMessage}`
      );
    }
  } catch (error) {
    console.error("Error posting loan offer:", error);
    throw error;
  }
};

const postProcessLoan = async (
  tokenAddress,
  tokenId,
  loanOfferIndex,
  loanPoolIndex,
  initializer,
  email,
  txnHash,
  chainId,
  referredId,
  contractAddress,
  index
) => {
  const data = {
    assetManagerData: {
      chainId,
      contractAddress,
      tokenAddress,
      tokenId,
      loanOfferIndex,
      loanPoolIndex,
      initializer,
      txnHash,
      email: email || null,
      version: ["v2"],
      referredId,
      index,
    },
    txnHash,
    wallet: initializer,
  };

  try {
    await indexerAxiosInstance.post(`/processLoan`, data);
  } catch (error) {
    let errorMessage = "Failed to post process loan";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postProcessLoan:", errorMessage);
    throw new Error(errorMessage);
  }
};

const postSolanaProcessLoan = async (
  tokenAddress,
  tokenId,
  loanOfferIndex,
  loanPoolIndex,
  initializer,
  email,
  txHash,
  chainId,
  referredId,
  contractAddress
) => {
  const data = {
    assetManagerData: {
      chainId: chainId,
      contractAddress: contractAddress,
      tokenAddress: tokenAddress,
      tokenId: tokenId,
      loanOfferIndex: loanOfferIndex,
      loanPoolIndex: loanPoolIndex,
      initializer: initializer,
      email: email,
      version: "v2",
      referredId: referredId,
      index: "0",
    },
    txnHash: txHash,
  };

  try {
    const response = await fetch(`${url}/solana/processLoan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error processing Solana loan:", error.message);
    throw error;
  }
};

const postCancelOffer = async (
  loanPoolIndex,
  loanOfferIndex,
  chainId,
  contractAddress,
  txnHash,
  walletAddress
) => {
  const data = {
    chainId,
    contractAddress,
    loanOfferIndex,
    loanPoolIndex,
    txnHash,
    wallet: walletAddress,
  };

  try {
    await indexerAxiosInstance.delete(`/cancelOffer`, { data });
  } catch (error) {
    let errorMessage = "Failed to cancel offer";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postCancelOffer:", errorMessage);
    throw new Error(errorMessage);
  }
};

const postRepayLoan = async (
  bidPoolIndex,
  bidManagerIndex,
  tokenAddress,
  tokenId,
  chainId,
  contractAddress,
  index,
  txnHash,
  walletAddress
) => {
  const data = {
    assetManagerData: {
      loanPoolIndex: bidPoolIndex,
      loanOfferIndex: bidManagerIndex,
      chainId,
      contractAddress,
      tokenAddress,
      tokenId,
      index,
    },
    txnHash,
    wallet: walletAddress,
  };

  try {
    await indexerAxiosInstance.post(`/repayLoan`, data);
  } catch (error) {
    let errorMessage = "Failed to post repay loan";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postRepayLoan:", errorMessage);
    throw new Error(errorMessage);
  }
};

//expire
const postExpireLoan = async (
  tokenAddress,
  tokenId,
  chainId,
  contractAddress,
  index,
  txnHash,
  walletAddress
) => {
  const data = {
    assetManagerData: {
      chainId,
      contractAddress,
      tokenAddress,
      tokenId,
      index,
    },
    txnHash,
    wallet: walletAddress,
  };

  try {
    await indexerAxiosInstance.post(`/expireLoan`, data);
  } catch (error) {
    let errorMessage = "Failed to expire loan";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postExpireLoan:", errorMessage);
    throw new Error(errorMessage);
  }
};

//offer amt
const postOfferAmount = async (
  loanOfferIndex,
  loanPoolIndex,
  bidAmount,
  chainId,
  contractAddress,
  txnHash,
  address
) => {
  const data = {
    chain_id: chainId,
    contract_address: contractAddress,
    loan_offer_index: loanOfferIndex,
    bidPoolIndex: loanPoolIndex,
    bidAmount,
    txnHash,
    wallet: address,
  };

  try {
    await indexerAxiosInstance.put(`/loanOfferAmount`, data);
  } catch (error) {
    let errorMessage = "Error in postOfferAmount";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postOfferAmount:", errorMessage);
    throw new Error(errorMessage);
  }
};

//offer count

const postOfferCount = async (
  loanOfferIndex,
  loanPoolIndex,
  totalBids,
  chainId,
  contractAddress,
  txnHash,
  address
) => {
  const data = {
    chain_id: chainId,
    contract_address: contractAddress,
    loan_offer_index: loanOfferIndex,
    bidPoolIndex: loanPoolIndex,
    totalBids,
    txnHash,
    wallet: address,
  };

  try {
    await indexerAxiosInstance.put(`/loanOfferCount`, data);
  } catch (error) {
    let errorMessage = "Failed to post offer count";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postOfferCount:", errorMessage);
    throw new Error(errorMessage);
  }
};

//request nft offer modal

const postRequestOffer = async (
  tokenAddress,
  loanDurationInMinutes,
  interestRateLender,
  token_id,
  bidAmount,
  chainId,
  walletAddress,
  index,
  txnHash
) => {
  const data = {
    userWallet: walletAddress,
    tokenAddress,
    tokenId: token_id,
    loanDurationMinutes: loanDurationInMinutes,
    interestRateLender,
    interestRateProtocol: 0,
    bidAmount,
    chainId,
    index,
    txnHash,
    wallet: walletAddress,
  };

  try {
    await indexerAxiosInstance.post(`/nftPool`, data);
  } catch (error) {
    let errorMessage = "Failed to post nft pool";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postRequestOffer:", errorMessage);
    throw new Error(errorMessage);
  }
};

const postAcceptNFTOffer = async (
  tokenAddress,
  tokenId,
  loanAmount,
  loanProvider,
  chainId,
  loanExpiry,
  txnHash,
  index
) => {
  const data = {
    loanProvider,
    loanAmount,
    tokenAddress,
    tokenId,
    chainId,
    loanExpiry,
    txnHash,
    version: ["v2"],
    index,
    wallet: loanProvider,
  };

  try {
    await indexerAxiosInstance.post(`/acceptNFTOffer`, data);
    return { success: true };
  } catch (error) {
    let errorMessage = "Failed to accept NFT offer";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in postAcceptNFTOffer:", errorMessage);
    throw new Error(errorMessage);
  }
};

const deleteNftPool = async (
  tokenAddress,
  tokenId,
  chainId,
  index,
  txnHash,
  address
) => {
  const data = {
    tokenAddress,
    tokenId,
    chainId,
    index,
    txnHash,
    wallet: address,
  };

  try {
    await indexerAxiosInstance.delete(`/nftPool`, { data });
  } catch (error) {
    let errorMessage = "Failed to delete NFT offer";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in deleteNftPool:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Add user

const addUserInReward = async (userToken, chainId, referralId, txnHash) => {
  userToken =
    "0x" + AccountId.fromString(userToken).toSolidityAddress().toString();
  const data = {
    userToken,
    chainId,
    referralId,
    txnHash,
  };
  try {
    const res = await fetch(`${url}/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to add user in reward");
  }
};

//get propose offers

const fetchProposedData = async (chainId, walletAddress) => {
  try {
    const url1 = `/proposeOffer/${chainId}/${walletAddress}`;

    const response = await indexerAxiosInstance.get(url1);

    return response.data; // Axios handles JSON conversion automatically
  } catch (error) {
    console.error("There was a problem with fetching data:", error);
    throw error;
  }
};

//cancel propose offers

const cancelProposedOffer = async (offerId) => {
  try {
    await indexerAxiosInstance.put(`/cancelProposedOffer/${offerId}`, {
      offerId,
    });
  } catch (error) {
    let errorMessage = "Failed to cancel the proposed offer";

    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        errorMessage;
    } else if (error.request) {
      errorMessage =
        "No response from the server. Please check your connection.";
    } else {
      errorMessage = error.message || errorMessage;
    }

    console.error("Error in cancelProposedOffer:", errorMessage);
    throw new Error(errorMessage);
  }
};

const getAssetData = async (chainId, tokenAddress, tokenId, isErc1155) => {
  if (isErc1155) {
    return { data: [] };
  }

  const fetchUrl = `/assetManager/${chainId}/${tokenAddress}/${tokenId}`;

  try {
    const response = await indexerAxiosInstance.get(fetchUrl);

    return response.data; // Axios automatically handles JSON parsing
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return { data: [] }; // Return an empty array to handle errors gracefully
  }
};

const reloadNftCache = async (chainId, walletAddress, collection) => {
  try {
    const response = await nftCacheAxiosInstance.get(
      `/reloadNFT/${chainId}/${walletAddress}?collection=${collection}&data=true`
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return { data: [] };
  }
};

const getReferralCode = async (walletAddress) => {
  try {
    const response = await scoreAxiosInstance.get(
      `/refer/generateId/${walletAddress}`
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return { data: [] };
  }
};

const skaleDistribution = async (
  token,
  address,
  isConnected,
  data,
  chainId
) => {
  try {
    if (
      isConnected &&
      address &&
      parseFloat(formatEther(data?.value)) < 0.0000001
    ) {
      const response = await indexerAxiosInstance.get(
        `/skale/claim/${address}/${chainId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
      } else {
        console.error(`Failed to distribute. Status Code: ${response.status}`);
      }
    }
  } catch (error) {
    console.error("Error distributing:", error);
  }
};

const postCollection = async (chainId, tokenAddress, chainDetail) => {
  const name = await getCollectionName(tokenAddress, chainDetail?.rpc_url);
  const img_url = await getTokenImageUrl(tokenAddress, chainDetail?.rpc_url);
  //
  const typeInterface = await checkTokenStandard(
    tokenAddress,
    chainDetail?.rpc_url
  );
  const newCollection = {
    chain_id: chainId,
    contract_address: chainDetail?.contract_address,
    token_address: tokenAddress,
    name: name,
    description: name,
    image_url: img_url,
    floor: 0,
    type: typeInterface || "ERC721",
  };

  try {
    const response = await indexerAxiosInstance.post(`/collections`, [
      newCollection,
    ]);

    return response.data.success;
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

export const getTokensForCollection = async (collectionId) => {
  try {
    const response = await shopAxiosInstance.get(
      `/launchpad/getTokens/${collectionId}?mintable=true`
    );

    return response?.data;
  } catch (error) {
    console.error("Error:", error);
    return { data: [] };
  }
};

const getCollectionCategories = async () => {
  try {
    const response = await shopAxiosInstance.get("/collection/categories");
    return response?.data ?? {};
  } catch (error) {
    throw error;
  }
};

// Export all functions at once
export {
  postLoanOffer,
  postSolanaLoanOffer,
  postProcessLoan,
  postSolanaProcessLoan,
  postCancelOffer,
  postRepayLoan,
  postExpireLoan,
  postOfferAmount,
  postOfferCount,
  postRequestOffer,
  postAcceptNFTOffer,
  deleteNftPool,
  addUserInReward,
  fetchProposedData,
  cancelProposedOffer,
  getAssetData,
  reloadNftCache,
  getReferralCode,
  skaleDistribution,
  postCollection,
  getCollectionCategories,
};
