import { v4 as uuidv4 } from "uuid";

const generalDefaultValues = {
  title: "",
  description: "",
  benefitType: "",
  industryType: "",
  images: [
    {
      id: uuidv4(),
      type: "image/png",
      name: "sample image",
      file: "https://utilityimages.s3.ap-south-1.amazonaws.com/image12024-08-15T14-26-33.png",
      data: "https://utilityimages.s3.ap-south-1.amazonaws.com/image12024-08-15T14-26-33.png",
    },
  ],
  collection: "",
  isProvider: false,
  isCreator: false,
  spaceType: null,
  spaceId: "",
  tokenAddress: "",
  traitsArray: [],
  chainId: "",
  benefitUtilityType: "",
};

const benefitsDefaultValues = {
  utilityType: "",
  rewardStartDate: "",
  rewardEndDate: "",
  rewardUseCount: "",
  rewardExpiry: "",
  numberOfWinners: "",
  raffleStartDate: "",
  raffleEndDate: "",
  claimingEndDate: "",
  campaignMethod: "first_come",
};

export { generalDefaultValues, benefitsDefaultValues };
