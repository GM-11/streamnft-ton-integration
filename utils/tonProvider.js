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
import { timeString } from "./common";

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
  value,
  privateRental,
  collectionAddress,
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
      value.toString(),
      privateRental,
      collectionAddress,
    );
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

export const cancelTonRent = async (
  tokenAddress,
  sender,
  index,
  collection,
) => {
  try {
    // This is handled inside the SDK now
    // localStorage.setItem("canceldTonRent", JSON.stringify({ ... }));

    const res = await cancel(
      tokenAddress,
      sender,
      collection, // Pass the collection parameter
      index, // Pass the index parameter
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

export const processTonRent = async (
  collection,
  tokenAddress,
  durationMinutes,
  sender,
  value,
  index,
  initializer,
) => {
  try {
    const res = await processRent(
      tokenAddress,
      durationMinutes.toString(),
      sender,
      value.toString(),
      collection, // Pass the collection parameter
      index, // Pass the index parameter
      initializer, // Pass the initializer parameter
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

export const expireTonRent = async (
  tokenAddress,
  sender,
  index,
  collection,
) => {
  try {
    const res = await expire(
      tokenAddress,
      sender,
      index, // Pass the index parameter
      collection, // Pass the collection parameter
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
  const data = await getNftsData(collection);

  let rented = [];
  let available = [];
  for (let i = 0; i < data.length; i++) {
    const n = data[i];

    let metadata = { image: n.image, name: n.name };

    if (!n.image || n.image === "") {
      try {
        metadata = await fetchNFTMetadata(n.token_id);
      } catch (err) {
        console.error(`Failed to fetch metadata for ${n.token_id}:`, err);
      }
    }

    const nftData = {
      image: metadata.image || n.image,
      tokenAddress: n.token_address,
      metadata_link: n.metadata_link,
      name: metadata.name || n.name,
      tokenId: n.token_id,
      index: n.index,
      owner: n.initializer,
      rentType: n.is_fixed ? "Fixed" : "Variable",
      ownerShare: Number(n.owner_share),
      rate: Number(n.rate),
      rateValue: Number(n.rate),
      ratePerHour: Number(n.rate),
      timeLeft: new Date(Number(n.validity_expiry) * 1000).toLocaleTimeString(),
      buttonValue: n.state === "STALE" ? "Rent" : "none",
      durationSeconds: new Date(Number(n.validity_expiry) * 1000).getSeconds(),
      fixedDuration: Number(n.fixed_minutes),
      maxTimeString: timeString(new Date(Number(n.validity_expiry) * 1000)),
      initializer: n.initializer,
      paymentToken: "TON",
      state: n.state,
    };

    // Sort NFTs based on their state
    if (n.state !== "STALE" && n.state !== "AVAILABLE") {
      rented.push(nftData);
    } else {
      available.push(nftData);
    }
  }

  return { available, rented };
};

async function getNftsData(collectionAddress) {
  const url = `https://api-staging.danlabs.xyz/assetManager/TON?state=STALE&collection=${collectionAddress}&owner=undefined`;

  const data = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.STREAMNFT_API_KEY,
    },
  });

  const nfts = (await data.json()).data;

  return [...nfts];
}

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

export const fetchNFTMetadata = async (tokenAddress) => {
  try {
    // Create TON API client
    const ta = new TonApiClient({
      baseUrl: "https://testnet.tonapi.io/",
      apiKey: process.env.NEXT_PUBLIC_TON_API_KEY,
    });

    // Parse the address
    const nftAddress = Address.parse(tokenAddress);

    // Fetch the NFT item details
    const nftItem = await ta.nft.getNftItemByAddress(nftAddress);
    console.log(nftItem);

    const metadata = {
      image:
        nftItem.previews?.length > 0
          ? nftItem.previews[nftItem.previews.length - 1].url // Get highest quality preview
          : nftItem.metadata?.image || "",
      name: nftItem.collection?.name + " " + nftItem.index,
      description: nftItem.metadata?.description || "",
      attributes: nftItem.metadata?.attributes || [],
    };

    return metadata;
  } catch (error) {
    console.error("Failed to fetch NFT metadata:", error);
    return {
      image: "",
      name: "Unknown",
      description: "",
      attributes: [],
    };
  }
};

export const fetchTonNFTs = async (walletAddress, collectionAddress) => {
  try {
    const ta = new TonApiClient({
      baseUrl: "https://testnet.tonapi.io/",
      apiKey: process.env.NEXT_PUBLIC_TON_API_KEY,
    });

    const collection = Address.parse(collectionAddress);
    const owner = Address.parse(walletAddress);
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
    return items;
  } catch (error) {
    console.error("Failed to fetch TON NFTs:", error);
    return [];
  }
};

export const fetchUserListedNfts = async (user, collection, state) => {
  const url = `https://api-staging.danlabs.xyz/assetManager/TON?state=${state}&collection=${collection}`;

  const data = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.NEXT_PUBLIC_STREAMNFT_API_KEY,
    },
  });

  let n = [];
  const nfts = (await data.json()).data;

  for (let i = 0; i < nfts.length; i++) {
    if (nfts[i].initializer.toString() === user) {
      console.log(nfts[i]);
      const metadata = await fetchNFTMetadata(nfts[i].token_id);
      nfts[i].image = metadata.image;
      nfts[i].rentType = nfts[i].is_fixed === true ? "Fixed" : "Variable";
      nfts[i].ownerShare = nfts[i].owner_share;
      nfts[i].rate = Number(nfts[i].rate);
      nfts[i].rateValue = Number(nfts[i].rate);
      nfts[i].ratePerHour = Number(nfts[i].rate);
      nfts[i].durationSeconds =
        new Date(Number(nfts[i].validity_expiry)).getMilliseconds() -
        Date.now();
      nfts[i].fixedDuration = Number(nfts[i].fixed_minutes);
      nfts[i].maxTimeString = new Date(
        Number(nfts[i].validity_expiry),
      ).toString();

      if (state === "RENT") {
        nfts[i].buttonValue = "Withdraw";
        nfts[i].value = "Rented";
      } else if (state === "STALE") {
        nfts[i].buttonValue = "Withdraw";
        nfts[i].value = "Listed";
      }
      // minTimeString: timeString(60),
      // maxTimeString: timeString(nft.rentState.fixedMinutes * 60),

      nfts[i].name = metadata.name;
      n.push(nfts[i]);
    }
  }
  return n;
};
