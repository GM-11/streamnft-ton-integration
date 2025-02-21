import utilityCalls from "@/services/utility/utilityCalls";
import { toast } from "react-toastify";
import {
  claimReward,
  claimUtility,
  createUtilityInContract,
  joinEvmRaffle,
  redeemUtility,
  ZeroHash,
} from "./ContractCalls";
import {
  claimHederaUtility,
  createHederaUtility,
  joinHederaRaffle,
  redeemHederaUtility,
} from "./HederaContract";
import { ethers } from "ethers";

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

export const UtilityType = {
  NONE: 0,
  TimeBased: 1,
  UseBased: 2,
  Unlimited: 3,
};

export const valueToEnumMapping = {
  none: UtilityType.NONE,
  time_based: UtilityType.TimeBased,
  use_based: UtilityType.UseBased,
  date_based: UtilityType.Unlimited,
};

export function getEnumValueFromString(value) {
  return valueToEnumMapping[value] ?? UtilityType.NONE;
}

export const uploadImages = async (images) => {
  const uploadedImages = [];

  for (const image of images) {
    if (typeof image?.file === "string") {
      uploadedImages.push(image.file);
      return;
    }
    const formData = new FormData();
    formData.append("files", image.file, image.name);

    try {
      const response = await utilityCalls.uploadImages(formData);
      uploadedImages.push(response.data.image[0]);
    } catch (err) {
      console.error("Image upload error:", err);
    }
  }

  return uploadedImages;
};

export const extractProfileName = (url) => {
  const profileRegex = /https:\/\/x\.com\/([^\/]+)/;

  const match = url.match(profileRegex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};

const prepareRequirements = (requirements, chainId) => {
  const eligibleObject = {};

  requirements.formArray.forEach((req) => {
    if (req.type === "nft_owner") {
      eligibleObject[req.serviceTarget] = {
        eligibleType: req.type, //ok
        taskDetails: [],
      };
      eligibleObject[req.serviceTarget].taskDetails.push({
        taskInfo: req.heading, //ok
        mandatory: req.mandatory, //ok
        serviceTarget: req.serviceTarget, //ok
        numberOfEntries: req.entries, //ok
        traits: req.traits ?? [],
      });
    }
    if (req?.type === "onchain_call") {
      const key = chainId;
      let abiString = req?.abi;
      let functions = [];
      let contractID = req?.contractAddress;
      const abi = JSON.parse(abiString);
      const selectedAbi = abi.filter(
        (item) =>
          item.name === req?.selectedFunction && item.type === "function"
      );
      const inputObj = req?.params.map((param, index) => ({
        isAddress: param?.isAddress,
        name: param?.name,
        value: undefined,
      }));
      const outputObj = req?.output.map((output, index) => ({
        isAddress: output?.isAddress,
        name: output?.name,
        operation: output?.operation,
        value: output?.value,
      }));
      const funcObject = {
        functionName: req?.selectedFunction,
        input: inputObj,
        output: outputObj,
      };

      functions.push(funcObject);
      const onchain = {
        abi: selectedAbi,
        functions: funcObject,
      };

      if (!eligibleObject[key]) {
        eligibleObject[key] = {
          eligibleType: "onchain_call", //ok
          taskDetails: [], //ok
        };
      }

      eligibleObject[key].taskDetails.push({
        taskInfo: req.heading, //ok
        mandatory: req?.mandatory, //ok
        serviceTarget: contractID, //ok
        onchain: onchain,
        chainId: chainId,
      });
    } else {
      const key = req.fieldKey;
      if (!eligibleObject[key]) {
        eligibleObject[key] = {
          eligibleType: "external_services", //ok
          participants: [], //ok
          externalService: key, //ok
          traits: [], //ok
          taskDetails: [], //ok
        };
      }

      eligibleObject[key].taskDetails.push({
        taskInfo: req.heading, //ok
        targetURL: req?.targetURL, //ok
        mandatory: req.mandatory, //ok
        serviceTarget:
          key?.toLowerCase() === "twitter"
            ? req.targetURL?.split("/")[req.targetURL?.split("/")?.length - 1]
            : req.serviceTarget, //ok
        numberOfEntries: req.entries, //ok
      });

      return eligibleObject;
    }
  });
  return eligibleObject;
};

export const reversePrepareRequirements = (
  selectedEligibilities,
  eligibleObject
) => {
  const formArray = [];

  Object.keys(eligibleObject).forEach((key) => {
    const item = eligibleObject[key];

    if (item.eligibleType === "nft_owner" && !item?.isTarget) {
      item?.taskDetails?.forEach((task) => {
        const selectedTask = selectedEligibilities?.filter(
          (el) => el?.title === task?.taskInfo
        );
        const selectedOption = selectedTask?.[0]?.options?.filter(
          (el) => el?.title === task?.taskInfo
        );
        const selectedForm = selectedOption?.[0]?.fields?.form?.[0];

        formArray.push({
          ...selectedForm,
          form: selectedOption?.[0]?.fields?.form,
          type: "nft_owner",
          serviceTarget: task.serviceTarget,
          heading: task.taskInfo,
          mandatory: task.mandatory,
          entries: task.numberOfEntries,
          traits: task.traits || [],
        });
      });
    } else if (item.eligibleType === "onchain_call") {
      item.taskDetails.forEach((task) => {
        const onchain = task.onchain;
        const abiString = JSON.stringify(onchain.abi);
        const params = onchain.functions.input.map((param) => ({
          isAddress: param.isAddress,
          name: param.name,
          value: undefined,
        }));
        const output = onchain.functions.output.map((output) => ({
          isAddress: output.isAddress,
          name: output.name,
          operation: output.operation,
          value: output.value,
        }));

        formArray.push({
          type: "onchain_call",
          abi: abiString,
          selectedFunction: onchain.functions.functionName,
          params: params,
          output: output,
          heading: task.taskInfo,
          mandatory: task.mandatory,
          serviceTarget: task.serviceTarget,
          entries: task.numberOfEntries,
        });
      });
    } else if (item.eligibleType === "external_services") {
      item.taskDetails.forEach((task) => {
        const selectedTask = selectedEligibilities?.filter(
          (el) => el?.title === key
        );
        const selectedOption = selectedTask?.[0]?.options?.filter((el) => {
          return el?.title === task?.taskInfo;
        });
        const selectedForm = selectedOption?.[0]?.fields?.form?.[0];

        formArray.push({
          ...selectedForm,
          form: selectedOption?.[0]?.fields?.form,
          type: "external_services",
          fieldKey: item.externalService,
          heading: task.taskInfo,
          targetURL: task.targetURL,
          mandatory: task.mandatory,
          serviceTarget: task.serviceTarget,
          entries: task.numberOfEntries,
        });
      });
    } else return;
  });

  return formArray;
};

export const createCollectionAndUtility = async ({
  utility,
  reward,
  requirements,
  chainDetail,
  userAddress,
  onComplete,
  onError,
  signer,
}) => {
  try {
    const contractID = chainDetail?.utility_address;
    const token = localStorage.getItem("token") ?? "";
    let utilityIndex, txnHash;

    if (Number(chainDetail?.chain_id) === 295) {
      const hederaResponse = await createHederaUtility(
        reward,
        chainDetail?.chain_id,
        contractID,
        userAddress,
        utility?.collection?.tokenAddress
      );

      if (!hederaResponse?.success) {
        throw new Error(hederaResponse?.message);
      }

      ({ index: utilityIndex, transactionHash: txnHash } = hederaResponse);
    }

    const otherRequirements = prepareRequirements(
      requirements,
      chainDetail?.chain_id
    );

    // Upload images
    toast.success("Uploading Images...");
    const images = await uploadImages(utility?.images || []);

    const expiryType =
      reward?.expiringConditions === "time_based"
        ? "time_based"
        : reward?.expiringConditions === "date_based"
        ? "date_based"
        : "none";

    const expiryValue =
      reward?.expiringConditions === "time_based"
        ? reward?.rewardExpiry * 24 * 60 * 60 * 1000 // Convert days to ms
        : reward?.expiringConditions === "date_based"
        ? Math.floor(new Date(reward?.raffleEndDate).getTime() / 1000) // Convert date to seconds
        : 0;

    // Construct utility data
    const utilityData = {
      usage: {
        expiry: expiryValue,
        usageType:
          reward?.expiringConditions === "use_based" ? "limited" : "unlimited",
        usage: Number(reward?.rewardUseCount) || 0,
        expiryType: expiryType,
      },
      chainId: chainDetail?.chain_id,
      provider: userAddress?.toString(),
      participants: [],
      utilityType: reward?.utilityType?.title,
      industry_type: utility?.industryType?.value,
      image_url:
        images?.[0] ??
        "https://utilityimages.s3.ap-south-1.amazonaws.com/image12024-08-15T14-26-33.png",
      yourEntries: 0,
      totalEntries:
        requirements?.formArray?.length > 0
          ? requirements?.formArray.reduce(
              (sum, obj) => sum + (Number(obj.entries) || 0),
              0
            )
          : 0,
      raffle: {
        reward: utility?.description,
        totalEntries: 0,
        participants: [],
        claimDate: new Date(reward.raffleClaimDate),
        tokenId: 0,
        ended: false,
        winnersMerkle: ZeroHash,
      },
      eligible: otherRequirements,
      selectionType: reward?.campaignMethod,
      title: utility?.title,
      reward: reward?.completeRewardData,
      description: utility?.description,
      startDate: new Date(reward.raffleStartDate),
      endDate: new Date(reward.raffleEndDate),
      token,
      spaceId: utility?.spaceType?._id ?? "",
      utilityTag: utility?.isCreator
        ? "quest"
        : utility?.isProvider
        ? "nft_benefit"
        : "nft_access",
    };

    // Add reward-specific details
    if (reward?.contractChainId?.length > 0) {
      utilityData.reward = {
        ...reward?.completeRewardData,
        chainId: reward?.contractChainId,
      };
    }

    // Configure target for NFT providers
    if (utility?.isProvider) {
      utilityData.target = {
        eligibleType:
          utility?.traitsArray?.length > 0 ? "nft_trait" : "nft_owner",
        collection: utility?.collection?.tokenAddress ?? null,
        name: utility?.collection?.name ?? "",
        collection_image: utility?.collection?.image_url ?? "",
        chainId: utility?.collection?.chainId,
        mandatory: true,
        numberOfEntries: 0,
        taskInfo: "Own a NFT",
        traits: utility?.traitsArray?.map((el) => ({
          key: el?.selectedOption,
          value: el?.selectedTag,
        })),
      };
    }

    if (utility?.isCreator) {
      const response = await utilityCalls.createUtility(utilityData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Utility created! Ready for action.");
        onComplete();
      } else {
        throw new Error("Failed to create utility");
      }
    } else {
      // contract-based utility creation for benefits
      if (chainDetail?.evm) {
        const { success, message } = await createUtilityInContract({
          chainId: chainDetail?.chain_id,
          contractID,
          utilityData,
          signer,
        });

        if (!success) {
          throw new Error(message);
        }

        toast.success("Utility created! Ready for action.");
        onComplete();
      } else {
        //  non-EVM
        utilityData.utilityIndex = utilityIndex;
        utilityData.txnHash = txnHash;

        const response = await utilityCalls.createUtility(utilityData);

        if (response.status === 201 || response.status === 200) {
          toast.success("Utility created! Ready for action.");
          onComplete();
        } else {
          throw new Error("Failed to create utility");
        }
      }
    }
  } catch (err) {
    console.error("Error creating utility:", err);
    onError();
    return err;
  }
};

export const updateCollectionAndUtility = async ({
  id,
  utility,
  reward,
  requirements,
  chainDetail,
  userAddress,
  onComplete,
  onError,
  signer,
}) => {
  try {
    let stringVal;
    let txnHash;

    let contractID = chainDetail?.utility_address,
      treasuryAccount = chainDetail?.treasury_account;

    const token = localStorage.getItem("token") ?? "";

    if (Number(chainDetail?.chain_id) === "295") {
      const data = await createHederaUtility(
        reward,
        chainDetail?.chain_id,
        contractID,
        userAddress,
        utility?.collection?.tokenAddress
      );

      if (!data?.success) {
        throw new Error(data?.message);
      }
      stringVal = data.index;
      txnHash = data.transactionHash;
    }

    const otherRequirements = prepareRequirements(
      requirements,
      chainDetail?.chain_id
    );

    toast.success("Uploading Images...");

    const images =
      typeof utility?.images?.[0] === "string"
        ? utility?.images
        : await uploadImages(utility?.images || []);

    const expiryType =
      reward?.expiringConditions === "time_based"
        ? "time_based"
        : reward?.expiringConditions === "date_based"
        ? "date_based"
        : "none";

    const utilityData = {
      image_url: images?.[0],
      raffle: {
        claimDate: new Date(reward.raffleClaimDate),
      },
      eligible: otherRequirements,
      title: utility?.title,
      reward: {
        congratulationText: reward?.completeRewardData?.congratulationText,
      },
      description: utility?.description,
      endDate: new Date(reward.raffleEndDate),
      token,
      wallet: userAddress?.toString(),
    };

    if (reward?.contractChainId?.length > 0) {
      utilityData["reward"] = {
        ...reward?.completeRewardData,
        chainId: reward?.contractChainId,
      };
    }

    utilityData["target"] = {
      eligibleType:
        utility?.traitsArray?.length > 0 ? "nft_trait" : "nft_owner", //ok
      collection: utility?.collection?.tokenAddress ?? null, //ok
      collection_image: utility?.collection?.image_url ?? "",
      chainId: utility?.collection?.chainId, //ok
      mandatory: true,
      numberOfEntries: 0,
      taskInfo: "Own a NFT",
      traits: utility?.traitsArray?.map((el) => ({
        key: el?.selectedOption,
        value: el?.selectedTag,
      })),
    };

    if (chainDetail?.evm) {
      const response = await utilityCalls.updateUtility(id, utilityData);

      if (response.status === 201 || response.status === 200) {
        toast.success("Utility updated successfully");
        onComplete();
      } else {
        onError();
      }
      // const { success, data, message } = await updateCollectionAndUtility(
      //   chainDetail?.chain_id,
      //   contractID,
      //   treasuryAccount,
      //   utilityData,
      //   signer
      // );
      // if (success) {
      //   toast.success("Utility created successfully");
      //   onComplete();
      // } else {
      //   onError();
      // }
    } else {
      // utilityData.utilityIndex = Math.floor(1000 + Math.random() * 9000);
      // utilityData.txnHash = Math.floor(1000 + Math.random() * 9000);

      utilityData.utilityIndex = utilityIndex;
      utilityData.txnHash = txnHash;

      const response = await utilityCalls.createUtility(utilityData);

      utilityData.utilityIndex = stringVal;
      utilityData.txnHash = txnHash;

      if (response.status === 201 || response.status === 200) {
        toast.success("Utility created successfully");
        onComplete();
      } else {
        onError();
      }
    }
  } catch (err) {
    onError();
    console.error("Error creating utility:", err);
    return err;
  }
};

export const joinRaffle = async ({
  entries,
  utilityId,
  chainDetail,
  userAddress,
  signer,
}) => {
  try {
    let txnHash;

    if (chainDetail?.evm) {
      const data = await joinEvmRaffle(
        utilityId,
        userAddress,
        chainDetail?.chain_id,
        entries,
        chainDetail?.treasury_account,
        signer
      );
      if (!data?.success) {
        throw new Error(data?.result);
      }
      return "success";
    } else {
      const data = await joinHederaRaffle(
        utilityId,
        chainDetail?.chain_id,
        chainDetail?.utility_address,
        userAddress
      );

      if (!data?.success) {
        throw new Error(data?.message);
      }
      result = "";
      txnHash = data?.transactionHash;

      const joinData = {
        utilityId: utilityId,
        wallet: userAddress,
        entriesToAdd: entries,
        adminTxnHash: txnHash,
      };

      const response = await utilityCalls.enterDraw(joinData);

      if (response.status === 200 || response.status === 201) {
        return "success";
      } else {
        toast.error(response?.response?.data?.error);
        return "error";
      }
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message || "An error occurred while joining the raffle");
    return "error";
  }
};

export const handleClaimUtilityBackend = async ({
  tokenId,
  utilityId,
  chainDetail,
  userAddress,
  signer,
  type,
  tokenAddress,
}) => {
  try {
    let result;
    let txnHash;

    if (chainDetail?.evm) {
      const data = await claimUtility("", signer);

      // if (!data?.success) {
      //   throw new Error(data?.message);
      // }
      // txnHash = data?.txnHash;
    } else {
      const data = await claimHederaUtility(
        userAddress,
        tokenId,
        utilityId,
        chainId,
        contractID,
        accountId
      );

      if (!data?.success) {
        throw new Error(data?.message);
      }

      txnHash = data?.transactionHash;
      result = data?.transactionResponse;
    }

    const body = {
      utilityId,
      wallet: userAddress,
      tokenId,
      chainId: chainDetail?.chain_id,
      type,
      tokenAddress,
    };

    const response = await utilityCalls.claimUtility(body);

    return response;
  } catch (error) {
    console.error(error);

    return error;
  }
};

export const handleRedeemRewardBackend = async ({
  tokenAddress,
  tokenId,
  utilityId,
  chainDetail,
  userAddress,
  signer,
}) => {
  try {
    let txnHash;

    if (chainDetail?.evm) {
      const data = await redeemUtility(
        tokenAddress,
        tokenId,
        utilityId,
        chainDetail?.chain_id,
        chainDetail?.utility_address,
        signer
      );

      if (!data?.success) {
        throw new Error(data?.message);
      }
      txnHash = data?.data?.hash;
    } else {
      const data = await redeemHederaUtility(
        tokenAddress,
        tokenId,
        utilityId,
        chainDetail?.chain_id,
        chainDetail?.utility_address,
        userAddress
      );

      if (!data?.success) {
        throw new Error(data?.message);
      }

      txnHash = data?.transactionHash;
      result = data?.transactionResponse;
    }

    const response = await utilityCalls.redeemUtility(
      utilityId,
      userAddress,
      tokenId,
      txnHash
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const handleClaimRewardBackend = async ({
  tokenAddress,
  tokenId,
  utilityId,
  chainDetail,
  userAddress,
  signer,
  type,
}) => {
  try {
    let txnHash;

    if (chainDetail?.evm) {
      const data = await claimReward(chainDetail?.treasury_account, signer);

      txnHash = data.data;
    } else {
      const data = await redeemHederaUtility(
        tokenAddress,
        tokenId,
        utilityId,
        chainDetail?.chain_id,
        chainDetail?.utility_address,
        userAddress
      );

      txnHash = data?.transactionHash;
      result = data?.transactionResponse;
    }

    const response = await utilityCalls.redeemReward({
      utilityId,
      wallet: userAddress,
      type,
      chainId: chainDetail?.chain_id,
      tokenId,
      adminTxnHash: txnHash,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const handleRedeemQuestRewardBackend = async ({
  utilityId,
  userAddress,
}) => {
  try {
    const response = await utilityCalls.redeemQuest({
      utilityId,
      wallet: userAddress,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const mintNft = async (
  tokenAddress,
  address,
  signer,
  onComplete,
  onError
) => {
  const contract = new ethers.Contract(tokenAddress, abi, signer);

  try {
    const tx = await contract.mint(address);
    await tx.wait();
    if (tx?.hash) {
      onComplete(tx);
    }
  } catch (error) {
    console.error(error);
  }
};

export const getSpacesByOwner = async (wallet) => {
  try {
    const response = await utilityCalls.getUserSpace(wallet);
    return response;
  } catch (error) {
    console.error("Error fetching spaces:", error);
    throw error;
  }
};
