import { ethers } from "ethers";
import { leafNodes, merkleTree } from "./merkleTreeHelper";
import erc721 from "./ERC721ABI.json";
import {
  getWalletSigner,
  createUtility,
  redeemUtilityOnNFT,
} from "./utilitySdkCalls";
import utilityCalls from "@/services/utility/utilityCalls";

export const ZeroHash = ethers.ZeroHash;
const MATIC_AMOUNT = "0.00001";

function getContractInterface(contract) {
  try {
    if (contract.supportsInterface("0x80ac58cd")) {
      return "erc721Interface";
    } else if (contract.supportsInterface("0xd9b67a26")) {
      return "erc1155Interface";
    } else {
      throw new Error("Unsupported contract type");
    }
  } catch (error) {
    console.error("Error determining contract interface:", error);
    throw new Error("Failed to determine contract interface");
  }
}

async function approveNFTTransfer(nftContractAddress, signer, adminAddress) {
  try {
    const contract = new ethers.Contract(nftContractAddress, erc721, signer);

    const tx = await contract.setApprovalForAll(adminAddress, true);
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.error("NFT transfer approval failed", {
      nftContractAddress,
      adminAddress,
      error: error.message,
    });
    throw new Error(`NFT transfer approval failed: ${error.message}`);
  }
}

async function transferNFT(
  signer,
  adminAddress,
  user,
  tokenIds,
  amounts,
  nftContractAddress
) {
  let contractInterface;
  let contract;
  try {
    contract = new ethers.Contract(nftContractAddress, erc721, signer);
    contractInterface = getContractInterface(contract);

    const handleTransaction = async (tx) => {
      const receipt = await tx.wait();
      if (!receipt.status) throw new Error("Transaction failed");
      return { success: true };
    };

    if (contractInterface === "erc721Interface") {
      contract = new ethers.Contract(nftContractAddress, erc721Abi, signer);

      for (const tokenId of tokenIds) {
        const tx = await contract.transferFrom(user, adminAddress, tokenId);
        const result = await handleTransaction(tx);
        if (!result.success) return result;
      }
    } else if (contractInterface === "erc1155Interface") {
      if (tokenIds.length !== amounts.length) {
        return {
          success: false,
          error: "Token IDs and amounts length mismatch",
        };
      }

      contract = new ethers.Contract(nftContractAddress, erc1155Abi, signer);

      const tx = await contract.safeBatchTransferFrom(
        user,
        adminAddress,
        tokenIds,
        amounts,
        "0x"
      );
      const result = await handleTransaction(tx);
      if (!result.success) return result;
    } else {
      return { success: false, error: "Unsupported contract type" };
    }

    return { success: true };
  } catch (error) {
    console.error("Transfer failed:", error);
    return { success: false, error: error.message };
  }
}

export async function demo(
  signer,
  user,
  treasuryAccount,
  nftContractAddress,
  tokenIds
) {
  try {
    const approveNfts = await approveNFTTransfer(
      "0xC49ABBF449e9b49DAC3BCb17fD5215cb8d349eEB",
      signer,
      treasuryAccount
    );
    const transferNfts = await transferNFT(
      signer,
      treasuryAccount,
      user,
      ["1"],
      null,
      "0xC49ABBF449e9b49DAC3BCb17fD5215cb8d349eEB"
    );
  } catch (error) {
    console.error("Error during NFT approval:", error);
  }
}

function getUtilityIdNumberPart(utilityId) {
  const parts = utilityId.split("-");
  return parseInt(parts[1], 10);
}

export const createUtilityInContract = async ({
  chainId,
  contractID,
  utilityData,
  signer,
}) => {
  try {
    if (utilityData?.utilityType === "NFT Airdrop") {
      const approval = await approveNFTTransfer(
        utilityData?.reward?.value,
        signer,
        contractID
      );
      if (!approval || !approval.status) {
        throw new Error("NFT transfer approval failed");
      }
    }
    const createUtilityTx = await createUtility(
      contractID,
      utilityData,
      Number(chainId),
      signer
    );

    return {
      success: createUtilityTx.success,
      data: createUtilityTx.data,
      message: createUtilityTx.message,
    };
  } catch (error) {
    console.error("Error creating utility:", error);
    return {
      success: false,
      message: "Transaction failed",
    };
  }
  // }
};

// Join Raffle
export const joinEvmRaffle = async (
  utilityId,
  user,
  chainId,
  entries,
  treasury_account,
  userSigner
) => {
  try {
    // if (isTokenExpired()) {
    //   toast.error("session expired, please re-connet your wallet");
    // } else {
    // const userSigner = await getWalletSigner();
    const paymentTx = {
      to: treasury_account,
      value: ethers.parseEther(MATIC_AMOUNT),
    };

    const paymentResponse = await userSigner.sendTransaction(paymentTx);
    const paymentReceipt = await paymentResponse.wait();
    const txnHash = paymentReceipt.hash;

    if (paymentReceipt.status === 0) {
      throw new Error("Payment transaction failed");
    }

    // Call join admin API
    const joinData = {
      utilityId,
      wallet: user,
      adminTxnHash: txnHash,
      entriesToAdd: entries,
      chainId,
    };

    const response = await utilityCalls.enterDraw(joinData);
    const data = response.data;

    if (response.status === 200) {
      return {
        success: true,
        result: data?.collectionUtility,
      };
    } else {
      throw new Error("Failed to join the raffle");
    }
    // }
  } catch (error) {
    console.error("Error joining raffle:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Claim Utility
export const claimUtility = async (treasury_account, userSigner) => {
  // if (isTokenExpired()) {
  //   toast.error("session expired, please re-connet your wallet");
  // } else {
  try {
    // const userSigner = await getWalletSigner();

    // const paymentTx = {
    //   // to: treasury_account,
    //   value: ethers.parseEther(MATIC_AMOUNT),
    //   gasLimit: 21000,
    //   maxPriorityFeePerGas: ethers.parseUnits("45", "gwei"),
    //   maxFeePerGas: ethers.parseUnits("45", "gwei"),
    // };

    // const paymentResponse = await userSigner.sendTransaction(paymentTx);
    // const paymentReceipt = await paymentResponse.wait();
    // const txnHash = paymentReceipt.transactionHash;

    return { txnHash, success: true, message: "Transaction sucessfully sent" };
  } catch (error) {
    return {
      success: false,
      message: "Transaction failed",
    };
    // }
  }
};

export const claimReward = async (treasuryAccount, userSigner) => {
  try {
    const paymentTx = {
      to: treasuryAccount,
      value: ethers.parseEther(MATIC_AMOUNT),
      gasLimit: 21000,
    };

    const paymentResponse = await userSigner.sendTransaction(paymentTx);
    const paymentReceipt = await paymentResponse.wait();

    if (paymentReceipt.status === 0) {
      throw new Error("Payment transaction failed");
    }

    return paymentReceipt;
  } catch (error) {
    return {
      success: false,
      message: "Transaction failed",
    };
  }
};

export const redeemUtility = async (
  tokenAddress,
  tokenId,
  utilityId,
  chainId,
  contractId,
  userSigner
) => {
  // if (isTokenExpired()) {
  //   toast.error("session expired, please re-connet your wallet");
  // } else {
  try {
    const signer = userSigner;

    const utilityIndex = getUtilityIdNumberPart(utilityId);

    const redeemTxn = await redeemUtilityOnNFT(
      contractId,
      tokenAddress,
      tokenId,
      utilityIndex,
      chainId,
      signer
    );

    if (!redeemTxn.success) {
      throw new Error("Redeem transaction failed");
    }

    return {
      success: true,
      data: {
        hash: redeemTxn.txnHash,
        results: redeemTxn?.data,
      },
    };
  } catch (error) {
    console.error("Error redeeming utility:", error);
    return {
      success: false,
      message: "Transaction failed",
    };
  }
  // }
};
