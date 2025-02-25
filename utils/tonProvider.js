import {
  lendToken,
  cancel,
  processRent,
  expire,
  RENTAL_CONTRACT_ADDRESS,
  CONTRACT,
} from "streamnft-ton-sdk";
import { TonApiClient } from "@ton-api/client";
import { toast } from "react-toastify";
import { Address } from "ton";

export const lendTonToken = async (
  tokenAddress,
  validityMinutes,
  rate,
  validityExpiry,
  isFixed,
  doMint,
  fixedMinutes,
  ownerShare,
  rentExpiry,
  rentee,
  sender,
) => {
  const rentState = {
    rate,
    validityExpiry,
    isFixed,
    doMint,
    fixedMinutes,
    ownerShare,
    rentExpiry,
    rentee,
  };

  try {
    const res = await lendToken(
      tokenAddress,
      validityMinutes,
      rentState,
      sender,
      process.env.NEXT_PUBLIC_STREAMNFT_API_KEY,
    );
    console.log(validityMinutes);
    if (res) {
      return res;
    } else {
      toast.success("Lending confirmed! Ready for use.");
      return "SUCCESS";
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const cancelTonRent = async (tokenAddress, sender) => {
  try {
    const res = await cancel(
      tokenAddress,
      sender,
      process.env.NEXT_PUBLIC_STREAMNFT_API_KEY,
    );

    if (res) {
      toast.warn("Address cannot be null.");
      return "Failed";
    } else {
      toast.success("Rental cancelled successfully.");
      return "SUCCESS";
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const processTonRent = async (tokenAddress, durationMinutes, sender) => {
  try {
    const res = await processRent(
      tokenAddress,
      durationMinutes,
      sender,
      process.env.NEXT_PUBLIC_STREAMNFT_API_KEY,
    );
    console.log(res);
    if (res) {
      toast.warn("Address cannot be null.");
      return "Failed";
    }
    // else {
    //   toast.success("Rental processed successfully.");
    //   return "SUCCESS";
    // }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const expireTonRent = async (tokenAddress, sender) => {
  try {
    const res = await expire(
      tokenAddress,
      sender,
      process.env.NEXT_PUBLIC_STREAMNFT_API_KEY,
    );

    if (res) {
      toast.warn("Address cannot be null.");
      return "Failed";
    }
    // else {
    //   toast.success("Rental cancelled successfully.");
    //   return "SUCCESS";
    // }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    toast.error(error?.message || "An unexpected error occurred.");
    return "Failed";
  }
};

export const getTonAssetData = async (collection) => {
  const ta = new TonApiClient({
    baseUrl: "https://testnet.tonapi.io/",
    apiKey: process.env.NEXT_PUBLIC_TON_API_KEY,
  });
  const collectionAddress = Address.parse(collection);
  const owner = Address.parse(RENTAL_CONTRACT_ADDRESS);

  const _n = await ta.accounts.getAccountNftItems(owner, {
    collection: collectionAddress,
  });

  let rented = [];
  let available = [];
  for (let i = 0; i < _n.nftItems.length; i++) {
    const n = _n.nftItems[i];
    const data = await getOnChainData(n.address.toString());
    if (Object.keys(data).length === 0) continue;
    if (Number(data.state) !== 3 && Number(data.state) !== 6) {
      rented.push({
        image: n.previews[2].url,
        tokenAddress: n.address.toString(),
        metadata_link: n.metadata.image,
        name: n.metadata.name,
        tokenId: n.index,
        owner: data.initializer.toString(),
        rentType: data.rentState.isFixed ? "Fixed" : "Variable",
        ownerShare: Number(data.rentState.ownerShare),
        rate: Number(data.rentState.rate) / Math.pow(10, 9),
        rateValue: Number(data.rentState.rate) / Math.pow(10, 9),
        ratePerHour: Number(data.rentState.rate) / Math.pow(10, 9),
        durationSeconds:
          (new Date(Number(data.rentState.validityExpiry)).getMilliseconds() -
            Date.now()) /
          1000,
        fixedDuration: Number(data.rentState.fixedMinutes),
        maxTimeString: new Date(
          Number(data.rentState.validityExpiry),
        ).toString(),
        // initializer: data.rentState.initializer.toString(),
        paymentToken: "TON",
        state: Number(data.state),
        rentState: data.rentState,
      });
    } else {
      available.push({
        image: n.previews[2].url,
        tokenAddress: n.address.toString(),
        metadata_link: n.metadata.image,
        name: n.metadata.name,
        tokenId: n.index,
        owner: data.initializer.toString(),
        rentType: data.rentState.isFixed ? "Fixed" : "Variable",
        ownerShare: Number(data.rentState.ownerShare),
        rate: Number(data.rentState.rate) / Math.pow(10, 9),
        rateValue: Number(data.rentState.rate) / Math.pow(10, 9),
        ratePerHour: Number(data.rentState.rate) / Math.pow(10, 9),
        durationSeconds:
          (new Date(Number(data.rentState.validityExpiry)).getMilliseconds() -
            Date.now()) /
          1000,
        fixedDuration: Number(data.rentState.fixedMinutes),
        maxTimeString: new Date(
          Number(data.rentState.validityExpiry),
        ).toString(),
        // initializer: data.rentState.initializer.toString(),
        paymentToken: "TON",
        state: Number(data.state),
        rentState: data.rentState,
      });
    }
  }

  return { available, rented };
};

async function getOnChainData(tokenAddress) {
  const token = Address.parse(tokenAddress);
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const _s = await CONTRACT.getGetState();
    const state = _s.get(token);
    if (state) {
      return state;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const fetchTonNFTs = async (walletAddress, collectionAddress) => {
  try {
    const ta = new TonApiClient({
      baseUrl: "https://testnet.tonapi.io/",
      apiKey: process.env.NEXT_PUBLIC_TON_API_KEY,
    });

    const collection = Address.parse(collectionAddress);
    const owner = Address.parse(walletAddress);
    console.log("fetcing");
    const _n = await ta.accounts.getAccountNftItems(owner, { collection });
    let items = [];
    for (let i = 0; i < _n.nftItems.length; i++) {
      const n = _n.nftItems[i];
      items.push({
        image: n.previews[2].url,
        tokenId: n.address.toString(),
        metadata_link: n.metadata.image,
        name: n.metadata.name,
      });
    }
    console.log(items);
    return items;
  } catch (error) {
    console.error("Failed to fetch TON NFTs:", error);
    return [];
  }
};
