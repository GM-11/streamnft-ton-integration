import axios from "axios";

import {
  getAssetsByCollection,
  addLoanOffer,
  processLoan,
  removeLoanOffer,
  repayLoan,
  updateOfferAmount,
  updateOfferCount,
  createNFTPool,
  removeNFTPool,
  acceptOffer,
  approveToken1155,
  expireLoan,
  approveErc20,
  lendToken,
  approveToken,
  cancelLendToken,
  processRent,
} from "./evmSdkCalls";
import { toast } from "react-toastify";

import {
  postLoanOffer,
  postProcessLoan,
  postCancelOffer,
  postRepayLoan,
  postExpireLoan,
  postOfferAmount,
  postOfferCount,
  postRequestOffer,
  postAcceptNFTOffer,
  deleteNftPool,
  getAssetData,
} from "./apiRequests";
import { ethers } from "ethers";
import { indexerAxiosInstance, shopAxiosInstance } from "@/services/axios";
import { switchChain } from "@wagmi/core";
import MyNFT from "@/constants/Dynamic721";
import { wagmiConfig } from "@/config/wagmiConfig";
import { getErrorMessage } from "./helperFunction";
import { buyListedNFT, cancelListing, createListing } from "streamnft-evm-test";

const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const getBidPools = async () => {
  return [];
};

const abi2 = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const switchUserChain = async (chainId) => {
  try {
    const response = await switchChain(wagmiConfig, {
      chainId: Number(chainId),
    });

    await new Promise((resolve) => setTimeout(resolve, 2500));

    return response; // Return response if needed
  } catch (error) {
    throw error;
  }
};

// Utility functions

export const addLendData = async (
  bidPoolIndex,
  bidAmount,
  totalBids,
  chainId,
  signer,
  address,
  power,
  contractAddress,
  paymentToken,
) => {
  try {
    const amountInWei = Number(bidAmount) * Math.pow(10, power);
    const res = await addLoanOffer(
      bidPoolIndex,
      amountInWei,
      totalBids,
      chainId,
      signer,
      contractAddress,
      paymentToken,
    );

    const { success, error, data, txnHash } = res;

    console.log({ res });
    if (success) {
      // const bidderPubkey = address.toString();

      // await postLoanOffer(
      //   bidderPubkey,
      //   amountInWei,
      //   totalBids,
      //   bidPoolIndex,
      //   txnHash,
      //   chainId,
      //   null,
      //   contractAddress,
      //   data,
      //   address
      // );

      toast.success("Loan created! You're all set to go.");
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText);
      }
    }
  } catch (error) {
    console.error("Caught an error:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

export const evmBorrowLoan = async (
  bidPoolIndex,
  bidManagerIndex,
  tokenID,
  tokenAddress,
  chainId,
  walletSigner,
  address,
  email,
  contractAddress,
  isErc1155,
) => {
  try {
    let allowSigner;
    let existingAsset;
    let useMaster;
    let index = 0;

    const assetData = await getAssetData(
      chainId,
      tokenAddress,
      tokenID,
      isErc1155,
    );

    if (
      assetData &&
      Array.isArray(assetData.data) &&
      assetData.data.length > 0
    ) {
      const asset = assetData.data[0];
      switch (asset.state) {
        case "RENT":
          existingAsset = true;
          useMaster = false;
          index = asset.index;
          break;
        case "STALE":
          existingAsset = false;
          useMaster = true;
          index = asset.master_index;
          break;
        case "INIT":
          existingAsset = false;
          useMaster = false;
          index = 0;
          break;
        default:
          throw new Error("Invalid state");
      }
    } else {
      existingAsset = false;
      useMaster = false;
    }

    if (isErc1155) {
      allowSigner = await approveToken1155(
        tokenAddress,
        contractAddress,
        walletSigner,
        chainId,
      );
    } else {
      allowSigner = await approveToken(
        tokenAddress,
        contractAddress,
        tokenID,
        walletSigner,
        chainId,
      );
    }

    if (allowSigner.success) {
      const res = await processLoan(
        bidPoolIndex,
        bidManagerIndex,
        tokenID,
        index,
        existingAsset,
        useMaster,
        chainId,
        walletSigner,
        null,
        contractAddress,
      );

      const { success, error, data, txnHash } = res;

      console.log({ res });

      if (success) {
        // await postProcessLoan(
        //   tokenAddress,
        //   tokenID,
        //   bidManagerIndex,
        //   bidPoolIndex,
        //   address,
        //   email,
        //   txnHash,
        //   chainId,
        //   null,
        //   contractAddress,
        //   data
        // );
        toast.success("Borrow successful! It’s all yours now.");
      } else {
        console.error("Failed to process loan:", res);
        if (error === 4001) {
          toast.error("User rejected the request");
        } else {
          const errorText = getErrorMessage(error);
          toast.error(errorText);
        }
      }
    } else {
      console.error("Token approval failed:", allowSigner.data);
      if (allowSigner?.data?.info?.error?.code === 4001) {
        toast.error("User rejected the request");
      } else {
        toast.error("Approve token failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in evmBorrowLoan:", error);

    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

export const evmCancelOffer = async (
  bidPoolIndex,
  bidManagerIndex,
  chainId,
  signer,
  contractAddress,
  walletAddress,
  reloadCall,
) => {
  try {
    const res = await removeLoanOffer(
      bidPoolIndex,
      bidManagerIndex,
      chainId,
      signer,
      contractAddress,
    );

    const { success, txnHash, error, data } = res;

    if (success) {
      try {
        // await postCancelOffer(
        //   bidPoolIndex,
        //   bidManagerIndex,
        //   chainId,
        //   contractAddress,
        //   txnHash,
        //   walletAddress
        // );
        await reloadCall();
        toast.success("Offer Closed successfully!");
      } catch (postError) {
        console.error("Failed to post cancel offer:", postError);
        toast.error("Failed to update offer cancellation on the server.");
      }
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (e) {
    console.error("Caught an error in evmCancelOffer:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

export const evmRepay = async (
  bidPoolIndex,
  bidManagerIndex,
  tokenAddress,
  tokenId,
  chainId,
  signer,
  contractAddress,
  isErc1155,
  index,
  walletAddress,
  paymentToken,
) => {
  try {
    const res = await repayLoan(
      tokenAddress,
      tokenId,
      index,
      chainId,
      signer,
      contractAddress,
      paymentToken,
    );

    const { success, error, txnHash, data } = res;

    if (success) {
      // await postRepayLoan(
      //   bidPoolIndex,
      //   bidManagerIndex,
      //   tokenAddress,
      //   tokenId,
      //   chainId,
      //   contractAddress,
      //   index,
      //   txnHash,
      //   walletAddress
      // );
      toast.success("Loan Repaid successfully");
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in evmRepay:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred during repayment.");
    }
  }
};

export const updateOfferAmountEvm = async (
  loanOfferIndex,
  loanPoolIndex,
  updatedOffer,
  chainId,
  signer,
  power,
  contractAddress,
  paymentToken,
  address,
) => {
  try {
    const amountInWei = Number(updatedOffer) * Math.pow(10, power);

    const res = await updateOfferAmount(
      loanPoolIndex,
      loanOfferIndex,
      amountInWei,
      chainId,
      signer,
      contractAddress,
      paymentToken,
    );

    const { success, error, txnHash, data } = res;

    if (success) {
      try {
        // await postOfferAmount(
        //   loanOfferIndex,
        //   loanPoolIndex,
        //   amountInWei,
        //   Number(chainId),
        //   contractAddress,
        //   txnHash,
        //   address
        // );
        toast.success("Offer Updated Successfully");
      } catch (postError) {
        console.error("Error in postOfferAmount:", postError);
        toast.error("Failed to update offer amount on the server.");
      }
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in updateOfferAmountEvm:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred during the update.");
    }
  }
};

export const updateOfferCountEvm = async (
  loanOfferIndex,
  loanPoolIndex,
  updatedOffer,
  chainId,
  signer,
  contractAddress,
  paymentToken,
  address,
) => {
  try {
    const res = await updateOfferCount(
      loanPoolIndex,
      loanOfferIndex,
      updatedOffer,
      chainId,
      signer,
      contractAddress,
      paymentToken,
    );

    const { success, error, txnHash, data } = res;

    if (success) {
      // await postOfferCount(
      //   loanOfferIndex,
      //   loanPoolIndex,
      //   updatedOffer,
      //   chainId,
      //   contractAddress,
      //   txnHash,
      //   address
      // );
      toast.success("Offer Updated Successfully!");
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in updateOfferCountEvm:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred during the update.");
    }
  }
};

export const evmRequestOffer = async (
  tokenAddress,
  chainId,
  tokenID,
  signer,
  duration,
  interest,
  amount,
  power,
  walletAddress,
  contractAddress,
  isErc1155,
  onComplete,
  onError,
) => {
  try {
    const amountInWei = Number(amount) * Math.pow(10, power);

    let existingAsset = false;
    let useMaster = false;
    let index = 0;

    const assetData = await getAssetData(
      chainId,
      tokenAddress,
      tokenID,
      isErc1155,
    );

    if (assetData?.data?.length > 0) {
      const assetState = assetData.data[0].state;
      switch (assetState) {
        case "RENT":
          existingAsset = true;
          useMaster = false;
          index = assetData.data[0].index;
          break;
        case "STALE":
          existingAsset = false;
          useMaster = true;
          index = assetData.data[0].master_index;
          break;
        case "INIT":
          existingAsset = false;
          useMaster = false;
          index = 0;
          break;
        default:
          throw new Error("Invalid asset state");
      }
    }

    const allowSigner = isErc1155
      ? await approveToken1155(tokenAddress, contractAddress, signer, chainId)
      : await approveToken(
          tokenAddress,
          contractAddress,
          tokenID,
          signer,
          chainId,
        );

    if (allowSigner.success) {
      const res = await createNFTPool(
        tokenAddress,
        tokenID,
        duration,
        interest,
        amountInWei,
        index,
        existingAsset,
        useMaster,
        chainId,
        signer,
        undefined,
        contractAddress,
      );

      const { success, error, txnHash, data } = res;

      if (success) {
        try {
          await postRequestOffer(
            tokenAddress,
            duration,
            interest,
            tokenID,
            amountInWei,
            chainId,
            walletAddress,
            data,
            txnHash,
          );
          await onComplete();
          toast.success("Request Offer Created Successfully!");
        } catch (postError) {
          console.error("Error in postRequestOffer:", postError);
          toast.error("Failed to update offer creation on the server.");
          onError();
        }
      } else {
        if (error === 4001) {
          toast.error("User rejected the request");
        } else {
          const errorText = getErrorMessage(error);
          toast.error(errorText || "Transaction Failed");
        }
      }
    } else {
      console.error("Token approval failed:", allowSigner.data);
      if (allowSigner?.data?.info?.error?.code === 4001) {
        toast.error("User rejected the request");
      } else {
        toast.error("Approve token failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in evmRequestOffer:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred.");
    }
    onError();
  }
};

export const evmAcceptOffer = async (
  tokenAddress,
  tokenID,
  index,
  chainID,
  loanAmount,
  expiry,
  signer,
  address,
  contractAddress,
  paymentToken,
) => {
  try {
    const res = await acceptOffer(
      tokenAddress,
      tokenID,
      index,
      chainID,
      signer,
      undefined,
      contractAddress,
      paymentToken,
    );

    const { success, error, txnHash, data } = res;

    if (success) {
      try {
        // const response = await postAcceptNFTOffer(
        //   tokenAddress,
        //   tokenID,
        //   loanAmount,
        //   address,
        //   chainID,
        //   expiry,
        //   txnHash,
        //   index
        // );
        toast.success("Offer Accepted Successfully!");
        return response;
      } catch (postError) {
        console.error("Error in postAcceptNFTOffer:", postError);
        toast.error("Failed to update offer acceptance on the server.");
        throw new Error("Failed to post acceptance to server");
      }
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (error) {
    console.error("Caught an error in evmAcceptOffer:", error);
    if (error?.message) {
      toast.error(`Transaction Failed: ${error.message}`);
    } else {
      toast.error("An unexpected error occurred during offer acceptance.");
    }
  }
};

export const evmNftCancel = async (
  tokenAddress,
  tokenId,
  chainId,
  signer,
  contractAddress,
  index,
  address,
) => {
  try {
    const res = await removeNFTPool(
      tokenAddress,
      tokenId,
      index,
      chainId,
      signer,
      undefined,
      contractAddress,
    );

    const { success, error, txnHash } = res;

    if (success) {
      const response = await deleteNftPool(
        tokenAddress,
        tokenId,
        chainId,
        index,
        txnHash,
        address,
      );
      toast.success("NFT Pool Cancelled Successfully!");
      return response;
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (e) {
    console.error("Caught an error in evmNftCancel:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred during cancellation.");
    }
  }
};

export const evmClaim = async (
  tokenAddress,
  tokenId,
  index,
  chainId,
  signer,
  contractAddress,
  address,
) => {
  try {
    const res = await expireLoan(
      tokenAddress,
      tokenId,
      index,
      chainId,
      signer,
      contractAddress,
    );

    const { success, error, txnHash } = res;

    if (success) {
      // await postExpireLoan(
      //   tokenAddress,
      //   tokenId,
      //   chainId,
      //   contractAddress,
      //   index,
      //   txnHash,
      //   address
      // );
      toast.success(
        "Claim your NFT! 🎉 . Loan unpaid? You're eligible for this exclusive NFT – grab it now!",
      );
    } else {
      if (error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(error);
        toast.error(errorText || "Transaction Failed");
      }
    }
  } catch (e) {
    console.error("Caught an error in evmClaim:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred during claim.");
    }
  }
};

export const mintNft = async (
  tokenAddress,
  address,
  signer,
  onComplete,
  onError,
) => {
  const contract = new ethers.Contract(tokenAddress, abi, signer);

  try {
    const tx = await contract.mint(address);
    await tx.wait();
    if (tx?.hash) {
      onComplete(tx);
    }
  } catch (error) {
    onError();
    console.error(error);
  }
};

export const uploadContent = async ({
  name,
  description,
  content,
  image,
  tokenAddress,
  tokenId,
  metadata,
}) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("description", description);
  formData.append("tokenAddress", tokenAddress);
  formData.append("tokenId", tokenId);

  if (content) {
    formData.append("content", content);
  }
  if (image) {
    formData.append("image", image);
  }

  if (metadata && Object.keys(metadata).length > 0) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  try {
    const response = await shopAxiosInstance.post("/ipfs/upload", formData);

    if (response.status !== 200) {
      throw new Error("Failed to upload content to IPFS");
    }

    return response?.data?.ipfsUrl;
  } catch (error) {
    console.error("Error uploading content:", error);
    throw error;
  }
};

export const getUserCollection = async (wallet) => {
  try {
    const response = await shopAxiosInstance.get(`/collection/getCollections`, {
      params: { wallet },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch user collection");
    }

    return response;
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

export const getCollectionDetails = async (tokenAddress) => {
  try {
    const response = await shopAxiosInstance.get(
      `/collection/fetch/${tokenAddress}`,
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch user collection");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating collection:", error);
  }
};

export async function mintNftOpenCampus(
  signer,
  address,
  name,
  description,
  image,
  content,
  tokenAddress,
  onComplete,
  onError,
  metadata,
  mintType,
) {
  let uploadLink = "";
  const contract = new ethers.Contract(tokenAddress, MyNFT.abi, signer);

  try {
    const tokenSupply = await contract.totalSupply();
    const tokenId = tokenSupply.toString();
    const uploadResponse = await uploadContent({
      name,
      description,
      image,
      content,
      tokenAddress,
      tokenId,
      metadata,
    });

    if (!uploadResponse) {
      throw new Error("Failed to upload metadata");
    }

    uploadLink = uploadResponse;

    if (mintType === "public") {
      onComplete({
        ipfsUrl: uploadLink,
      });
      return;
    }

    const tx = await contract.mint(address, uploadLink);
    await tx.wait();

    if (tx?.hash) {
      onComplete({
        hash: tx.hash,
        ipfsUrl: uploadLink,
      });
    }
  } catch (error) {
    onError(error);
    console.error("NFT Minting Error: ", error);
  }
}

//token supply in create collection is only for 721,token supply in mint is amount of that nft

export const sellNftCall = async (
  tokenId,
  tokenAddress,
  salePrice,
  address,
  chainId,
  signer,
  isErc1155,
  contractAddress,
) => {
  try {
    let allowSigner;
    let type;

    if (isErc1155) {
      type = "ERC1155";
      allowSigner = await approveToken1155(
        tokenAddress,
        contractAddress,
        signer,
        chainId,
      );
    } else {
      type = "ERC721";
      allowSigner = await approveToken(
        tokenAddress,
        contractAddress,
        tokenId,
        signer,
        chainId,
      );
    }

    if (!allowSigner.success) {
      throw new Error("Token approval failed. Please try again.");
    }

    const result = await createListing(
      tokenAddress,
      tokenId,
      salePrice,
      1,
      chainId,
      signer,
      contractAddress,
    );

    if (!result?.success) {
      if (result?.error === 4001) {
        toast.error("User rejected the request");
      } else {
        const errorText = getErrorMessage(result.error);
        toast.error(errorText || "Transaction Failed");
      }
      return result.success;
    }

    // const jsonBody = {
    //   tokenAddress,
    //   tokenId,
    //   salePrice,
    //   wallet: address,
    //   chainId: Number(chainId),
    // };

    // // Write to the database
    // const writeDBResponse = await indexerAxiosInstance.post(`/sell`, jsonBody);

    return result.success;
  } catch (error) {
    console.error("Caught an error in evmClaim:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred during selling.");
    }
  }
};

export const buyNftCall = async (
  tokenId,
  tokenAddress,
  chainId,
  signer,
  isErc1155,
  contractAddress,
  address,
  count,
  index,
) => {
  try {
    const result = await buyListedNFT(
      tokenAddress,
      tokenId,
      chainId,
      index, //master index
      count,
      signer,
      contractAddress,
    );

    console.log({ result });

    if (!result?.success) {
      if (result?.error === 4001) {
        toast.error("User rejected the request");
      } else {
        console.error("Lend token failed:", result);
        const errorText = getErrorMessage(result.error);
        toast.error(
          errorText || result.error || "Transaction failed while buying token.",
        );
      }

      return result.success;
    }

    // const jsonBody = {
    //   tokenAddress,
    //   tokenId,
    //   chainId: Number(chainId),
    //   wallet: address,
    // };

    // const writeDBResponse = await indexerAxiosInstance.post(
    //   `/buyNFT`,
    //   jsonBody
    // );

    return result?.success;
  } catch (error) {
    console.error("Caught an error in evmClaim:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred during selling.");
    }
  }
};

export const cancelListingCall = async (
  tokenId,
  tokenAddress,
  chainId,
  signer,
  isErc1155,
  contractAddress,
  address,
  count,
) => {
  try {
    const result = await cancelListing(
      tokenAddress,
      tokenId,
      0,
      count,
      chainId,
      signer,
      contractAddress,
    );
    if (result?.success) {
      // const jsonBody = {
      //   tokenAddress,
      //   tokenId,
      //   chainId: Number(chainId),
      //   wallet: address,
      // };

      // const writeDBResponse = await indexerAxiosInstance.post(
      //   `/buyNFT`,
      //   jsonBody
      // );

      return result.success;
    } else {
      if (result?.error === 4001) {
        toast.error("User rejected the request");
      } else {
        console.error("Lend token failed:", res);
        const errorText = getErrorMessage(res.error);
        toast.error(errorText || "Transaction failed while lending token.");
      }
    }
  } catch (error) {
    console.error("Caught an error in cancel sell offer:", e);
    if (e?.message) {
      toast.error(`Transaction Failed: ${e.message}`);
    } else {
      toast.error("An unexpected error occurred during selling.");
    }
  }
};

export const lendTokenEvm = async (
  isErc1155,
  tokenAddress,
  tokenId,
  ratePerMinute,
  offerTime,
  isFixed,
  fixedTime,
  ownershare,
  whitelist,
  chainSelection,
  env,
  contractAddress,
  noOfAsset,
  referredId,
  userAddress,
  signer,
  isPrivateRental,
) => {
  try {
    const walletSigner = signer;
    let type;
    let allowSigner;

    // Determine token type and approve accordingly
    if (isErc1155) {
      type = "ERC1155";
      allowSigner = await approveToken1155(
        tokenAddress,
        contractAddress,
        walletSigner,
        chainSelection,
      );
    } else {
      type = "ERC721";
      allowSigner = await approveToken(
        tokenAddress,
        contractAddress,
        tokenId,
        walletSigner,
        chainSelection,
      );
    }

    if (allowSigner?.success) {
      const res = await lendToken(
        tokenAddress,
        tokenId,
        ratePerMinute,
        offerTime,
        isFixed,
        fixedTime,
        ownershare,
        whitelist,
        noOfAsset,
        false,
        0,
        chainSelection,
        walletSigner,
        env,
        contractAddress,
        isPrivateRental,
      );

      if (res.success) {
        // const { data, txnHash } = res;

        // const jsonBody = {
        //   assetManagerData: {
        //     chainId: chainSelection,
        //     contractAddress,
        //     tokenAddress,
        //     tokenId,
        //     masterIndex: data,
        //   },
        //   rentStateData: {
        //     rate: Number(ratePerMinute),
        //     validityMinutes: offerTime,
        //     isFixed,
        //     fixedMinutes: fixedTime,
        //     privateRental: false,
        //     whitelistJson: whitelist,
        //     doMint: false,
        //     ownerShare: ownershare,
        //     initializer: userAddress,
        //     referredId,
        //   },
        //   type,
        //   indexList: [],
        //   assetsCount: 1,
        //   txnHash,
        //   wallet: userAddress,
        // };

        // const writeDBResponse = await indexerAxiosInstance.post(
        //   `/listRent`,
        //   jsonBody
        // );

        // if (writeDBResponse.status !== 200) {
        //   const errorresp = writeDBResponse.data.error;
        //   throw new Error(errorresp);
        // }

        toast.success("Lending confirmed! Ready for use.");
        return "SUCCESS";
      } else {
        console.error("Lend token failed:", res);
        const errorText = getErrorMessage(String(res.error));
        toast.error(errorText || "Transaction failed while lending token.");
        return "Failed";
      }
    } else {
      console.error("Token approval failed:", allowSigner);
      const approvalError =
        allowSigner?.data?.info?.error?.code === 4001
          ? "User rejected the token approval request."
          : "Token approval failed.";
      toast.error(approvalError);
      return "Failed";
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};
export const cancelEvmRent = async (
  tokenAddress,
  tokenId,
  chainSelection,
  env,
  contractAddress,
  address,
  index,
  masterIndex,
  signer,
) => {
  try {
    const walletSigner = signer;

    // Call the function to cancel the lending token
    const res = await cancelLendToken(
      tokenAddress,
      tokenId,
      Number(masterIndex),
      true,
      chainSelection,
      walletSigner,
      env,
      contractAddress,
      chainSelection,
    );

    const { success, txnHash, data } = res;

    if (success) {
      // const jsonBody = {
      //   assetManagerData: {
      //     chainId: chainSelection,
      //     contractAddress,
      //     tokenAddress,
      //     tokenId: Number(tokenId),
      //     initializer: address,
      //     index,
      //   },
      //   wallet: address,
      //   txnHash,
      // };

      // // Use indexerAxiosInstance to send the cancel request to the server
      // const writeDBResponse = await indexerAxiosInstance.post(
      //   "/cancelRent",
      //   jsonBody
      // );

      // if (writeDBResponse.status !== 200) {
      //   const errorresp = writeDBResponse?.data?.error;
      //   throw new Error(errorresp);
      // }

      toast.success("Rental cancelled successfully.");

      return "SUCCESS";
    } else {
      console.error("Cancel rent failed:", res);
      const errorText = getErrorMessage(res.error);
      toast.error(errorText || "Transaction failed");
      return "Failed";
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const processEvmRent = async (
  tokenAddress,
  tokenId,
  durationInMint,
  chainSelection,
  env,
  contractAddress,
  referredId,
  userAddress,
  index,
  initializer,
  masterIndex,
  state,
  signer,
  paymentToken,
) => {
  try {
    const walletSigner = signer;

    // Determine if an existing asset manager is present based on the state
    const existingAssetmanager = state === "STALE" ? false : true;

    if (!index) {
      index = 0;
    }

    // Call the processRent function
    const res = await processRent(
      tokenAddress,
      tokenId,
      masterIndex,
      index,
      durationInMint,
      existingAssetmanager,
      chainSelection,
      walletSigner,
      env,
      contractAddress,
      paymentToken,
    );

    const { success, txnHash, data } = res;

    if (success) {
      // const jsonBody = {
      //   assetManagerData: {
      //     chainId: chainSelection,
      //     contractAddress: contractAddress,
      //     tokenAddress: tokenAddress,
      //     tokenId: tokenId,
      //     initializer: initializer,
      //     index: Number(index),
      //   },
      //   rentStateData: {
      //     rentee: userAddress,
      //     durationInMinute: durationInMint,
      //     referredId: null,
      //   },
      //   wallet: userAddress,
      //   txnHash,
      // };

      // // Use indexerAxiosInstance to send the process rent request
      // const writeDBResponse = await indexerAxiosInstance.post(
      //   "/processRent",
      //   jsonBody
      // );

      // if (writeDBResponse.status !== 200) {
      //   const errorresp = writeDBResponse?.data?.error;
      //   throw new Error(errorresp);
      // }
      toast.success("Rental active! Enjoy the experience.");

      return "SUCCESS";
    } else {
      console.error("Process rent failed:", res);
      const errorText = getErrorMessage(res.error);
      toast.error(errorText || "Transaction failed while renting token.");
      return "Failed";
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const reloadNftCache = async (chainId, walletAddress, collection) => {
  try {
    const response = await axios({
      method: "get",
      url: `${
        process.env.NEXT_PUBLIC_NFTCACHE_API_URL ??
        "https://nfts-dev.danlabs.xyz"
      }/reloadNFT/${chainId}/${walletAddress}?collection=${collection}&data=true`,
    });

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return { data: [] };
  }
};

export async function getBidMangerListByBidPoolIndex(chainId) {
  try {
    const response = await indexerAxiosInstance(`/loanOffer/${chainId}`);
    const data = await response.data;

    return data?.data?.map((output) => ({
      bidManagerIndex: output.loan_offer_index,
      bidderPubkey: output.bidder_pubkey,
      bidAmount: Number(output.bid_amount),
      bidPoolIndex: output.loan_pool_index,
      totalBids: Number(output.total_bids),
      pendingLoans: Number(output.pending_loans),
    }));
  } catch (error) {
    console.error("Trigger smart contract error", error);
  }
}
