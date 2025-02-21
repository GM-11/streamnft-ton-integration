import { AccountId } from "@hashgraph/sdk";
import { getUserNftByCollection } from "./hashConnectProvider";
import { getProvider } from "./evmSdkCalls";
import {
  calculateTimeDifference,
  expiryTime,
  getCardMaxTime,
  getDuration,
  getMaxTimeInSecond,
  getRatePerHour,
  getTimeForCard,
  timeString,
  url,
} from "./common";
import { indexerAxiosInstance } from "@/services/axios";
import { Address, TonClient, Contract } from "ton";
import { getTonAssetData, fetchTonNFTs } from "@/utils/tonProvider";

function filterEntries(array, walletAddress) {
  return array.filter((entry) => {
    const { rentState } = entry;

    if (!rentState) return false;

    const { privateRental, whitelist } = rentState;

    let parsedWhitelist;
    try {
      parsedWhitelist = JSON.parse(whitelist);
    } catch (e) {
      console.error("Invalid JSON in whitelist:", whitelist);
      return false;
    }

    if (!privateRental) {
      return true;
    } else if (
      Array.isArray(parsedWhitelist) &&
      parsedWhitelist.includes(walletAddress)
    ) {
      return true;
    }

    return false;
  });
}

// API Functions
const fetchAssetData = async (
  chainId,
  collection,
  state,
  user = null,
  rentee,
) => {
  try {
    if (chainId.toString().toUpperCase() === "TON") {
      const assets = await getTonAssetData(collection);

      return assets;
    } else {
      const response = await indexerAxiosInstance.get(
        `/assetManager/${chainId}`,
        {
          params: {
            state,
            collection,
            user,
            rentee,
          },
        },
      );
      const assetData = response.data;
      return assetData && Array.isArray(assetData.data)
        ? formatAssetsByDB(assetData.data)
        : [];
    }
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return []; // Return an empty array on error
  }
};

export const getAssetStaleData = (chainId, collection) =>
  fetchAssetData(chainId, collection, "STALE");
export const getAssetRentData = (chainId, collection) =>
  fetchAssetData(chainId, collection, "RENT");
export const getUserRentedData = (chainId, user, collection) =>
  fetchAssetData(chainId, collection, "RENT", null, user);

export const getAssetUserData = async (chainId, user, collection) => {
  if (chainId === 295 || chainId === 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
  }

  const response = await fetch(
    `${url}/assetManager/${chainId}?user=${user}&collection=${collection}`,
  );
  const assetData = await response.json();

  if (assetData && Array.isArray(assetData.data)) {
    const formattedAssets = formatAssetsByDB(assetData.data);
    return formattedAssets;
  } else {
    return [];
  }
};

//REDUNDANT FUNCTIONS. NOT IN USE NOW
export const getAssetUserRentData = async (chainId, user, collection) => {
  if (chainId === 295 || chainId === 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
  }

  const response = await fetch(
    `${url}/assetManager/${chainId}?user=${user}&state=RENT&collection=${collection}`,
  );
  const assetData = await response.json();

  if (assetData && Array.isArray(assetData.data)) {
    const formattedAssets = formatAssetsByDB(assetData.data);
    return formattedAssets;
  } else {
    return [];
  }
};

export const getAssetUserStaleData = async (chainId, user, collection) => {
  if (chainId === 295 || chainId === 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
  }

  const response = await fetch(
    `${url}/assetManager/${chainId}?user=${user}&state=STALE&collection=${collection}`,
  );

  const assetData = await response.json();

  if (assetData && Array.isArray(assetData.data)) {
    const formattedAssets = formatAssetsByDB(assetData.data);
    return formattedAssets;
  } else {
    return [];
  }
};

export const getAssetUserLoanData = async (chainId, user, collection) => {
  if (chainId === 295 || chainId === 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
  }

  const response = await fetch(
    `${url}/assetManager/${chainId}?user=${user}&state=LOAN&collection=${collection}`,
  );

  const assetData = await response.json();

  if (assetData && Array.isArray(assetData.data)) {
    const formattedAssets = formatAssetsByDB(assetData.data);
    return formattedAssets;
  } else {
    return [];
  }
};

export const getEVMMetadata = async (contractAddress, tokenId, chainId) => {
  const provider = await getProvider(chainId).then((res) => {
    return res;
  });
  const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
  try {
    const tokenURI = await contract.tokenURI(tokenId);
    return tokenURI;
  } catch (error) {
    return null;
  }
};

export const getOwnerOf = async (contractAddress, tokenId, chainId) => {
  const provider = await getProvider(chainId).then((res) => {
    return res;
  });

  const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
  try {
    const tokenURI = await contract.ownerOf(tokenId);
    return tokenURI;
  } catch (error) {
    return null;
  }
};
export const formatAssetsByDB = (outputs) => {
  return outputs.map((output) => {
    return {
      initializer: output.initializer,
      tokenAddress: output.token_address,
      tokenId: Number(output.token_id)
        ? Number(output.token_id)
        : output.token_id,
      state: output.state,
      metadata_uri: output.metadata_uri,
      metadata_link: output.metadata_link,
      name: output.name === "null" ? null : output.name,
      image: output.image,
      index: output.index,
      saleprice: output.saleprice ? Number(output.saleprice) : 0,
      rentState: {
        rate: output.rate ? output.rate : 0,
        validityExpiry: output.validity_expiry
          ? Number(output.validity_expiry)
          : 0,
        isFixed: output.is_fixed,
        fixedMinutes: output.fixed_minutes ? Number(output.fixed_minutes) : 0,
        ownerShare: output.owner_share ? Number(output.owner_share) : 0,
        rentExpiry: output.rent_expiry ? Number(output.rent_expiry) : 0,
        rentee: output.rentee,
        whitelist: output.whitelist,
        privateRental: output.private_rental,
        masterIndex: output.master_index,
      },
    };
  });
};

export const myasset = async (
  chainId,
  user,
  userNfts,
  collectionId,
  chainDetail,
  erc1155,
  paymentToken,
) => {
  var listings = [];
  let owner = user;
  if (chainId == 295 || chainId == 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
    userNfts = await getUserNftByCollection(collectionId, user);
  } else if (chainId.toString().toUpperCase() === "TON") {
    userNfts = await fetchTonNFTs(user, collectionId);
  } else {
    if (userNfts && Array.isArray(userNfts) && userNfts.length > 0) {
      for (let i = 0; i < userNfts.length; i++) {
        const nft = userNfts[i];

        if (nft.tokenType === "ERC1155") {
          userNfts[i].name = nft.name;
          userNfts[i].image =
            nft?.image ||
            "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png";
        } else {
          userNfts[i].name = nft.name;
          userNfts[i].image =
            nft?.image && nft.image.startsWith("https://")
              ? nft.image
              : nft?.image
                ? nft.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png";
        }
      }
    }
  }
  // console.log({ userNfts });
  for (let i in userNfts) {
    let hederaTokenAddress = "";
    if (chainDetail.chain_id == 295 || chainDetail.chain_id == 296) {
      hederaTokenAddress =
        AccountId.fromSolidityAddress(collectionId).toString();
    }

    userNfts[i] = {
      value: "Owned",
      buttonValue: "Lend",
      token: collectionId,
      tokenAddress: collectionId,
      id: userNfts[i].tokenId,
      tokenId: userNfts[i]?.tokenId,
      metadata_link: userNfts[i]?.metadata_link,
      owner,
      explorerLink: ``,
      magiceden: ``,
      opensea: ``,
      totalAvailable: userNfts?.length,
      durationType: "",
      image:
        userNfts[i]?.image ||
        "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png",
      name: userNfts[i].name,
      hederaTokenAddress,
      isErc1155: erc1155,
      tokenType: userNfts[i]?.tokenType,
      balance: userNfts[i]?.balance,
      paymentToken,
    };
    listings.push(userNfts[i]);
  }

  const allAssets = await getAssetUserData(chainId, user, collectionId);

  const staleAsset = allAssets?.filter((el) => el?.state === "STALE");

  const listed = processMyAssetNfts(staleAsset, "list", chainDetail);

  const rentAsset = allAssets?.filter((el) => el?.state === "RENT");
  const rented = processMyAssetNfts(rentAsset, "rent", chainDetail);

  const renteeRentedAssets = await getUserRentedData(
    chainId,
    user,
    collectionId,
  );

  if (chainId.toString().toUpperCase() !== "TON") {
    const renteeRented = await processMyRentedNfts(
      renteeRentedAssets,
      chainDetail,
    );
  }

  const loanAsset = allAssets?.filter((el) => el?.state === "LOAN");
  const loanAssets = processMyAssetNfts(loanAsset, "loan", chainDetail);

  const excludedIds = new Set([
    ...listed.map((nft) => nft.id),
    ...rented.map((nft) => nft.id),
  ]);

  if (!erc1155) {
    listings = listings.filter(
      (ownedNft) => !excludedIds.has(ownedNft.tokenId),
    );
  }

  if (chainId === "solana") {
    const renteeRentedIds = new Set(renteeRented.map((nft) => nft.id));

    listings = listings.filter(
      (ownedNft) => !renteeRentedIds.has(ownedNft.tokenId),
    );
  }

  var otherList = {
    owned: listings,
    listed: listed,
    rented: rented,
    loanAssets: loanAssets,
  };
  return otherList;
};

export const myassetmart = async (
  chainId,
  user,
  userNfts,
  collectionId,
  chainDetail,
  erc1155,
  walletAddress,
) => {
  const staleAsset = await getUserSoldNftsData(
    chainId,
    collectionId,
    walletAddress,
  );
  const listed = processMyAssetNfts(staleAsset, "list", chainDetail);

  var listings = [];
  let owner = user;
  if (chainDetail.evm) {
    if (userNfts && Array.isArray(userNfts) && userNfts.length > 0) {
      for (let i = 0; i < userNfts.length; i++) {
        const nft = userNfts[i];

        if (nft.tokenType === "ERC1155") {
          userNfts[i].name = nft.name;
          userNfts[i].image =
            nft?.image ||
            "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png";
        } else {
          userNfts[i].name = nft.name;
          userNfts[i].image =
            nft?.image && nft.image.startsWith("https://")
              ? nft.image
              : nft?.image
                ? nft.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png";
        }
      }
    }
  }

  for (let i in userNfts) {
    listed?.find((el) => {
      return (
        el?.tokenAddress === collectionId &&
        el?.tokenId === userNfts[i]?.tokenId
      );
    }),
      (userNfts[i] = {
        value: "Owned",
        buttonValue: listed?.find(
          (el) =>
            el?.tokenAddress === collectionId &&
            Number(el?.tokenId) === Number(userNfts[i]?.tokenId),
        )
          ? "On Sale"
          : "Sell",
        token: collectionId,
        tokenAddress: collectionId,
        id: userNfts[i].tokenId,
        tokenId: userNfts[i]?.tokenId,
        metadata_link: userNfts[i]?.metadata_link,
        owner,
        explorerLink: ``,
        magiceden: ``,
        opensea: ``,
        totalAvailable: userNfts?.length,
        durationType: "",
        image:
          userNfts[i]?.image ||
          "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png",
        isErc1155: erc1155,
        tokenType: userNfts[i]?.tokenType,
        balance: userNfts[i]?.balance,
      });
    listings.push(userNfts[i]);
  }

  var otherList = {
    owned: listings,
    listed: listed,
  };
  return otherList;
};

function removeRentedListings(listings, listed, rented) {
  return listings.filter((listing) => {
    const isListed = listed.some((item) => item.tokenId == listing.tokenId);
    const isRented = rented.some((item) => item.tokenId == listing.tokenId);

    return !isListed && !isRented;
  });
}

export const marketplace = async (
  chainId,
  collectionId,
  chainDetail,
  paymentToken,
  loggedUserAddress,
) => {
  console.log("fetching marketplace data for", chainId, collectionId);
  const availableAsset = await getAssetStaleData(chainId, collectionId);
  const currentTime = new Date().getTime();

  if (chainId === "ton") {
    return {
      available: availableAsset.available,
      rented: availableAsset.rented,
    };
  }

  const filteredAvailableAsset = availableAsset.filter((item) => {
    const expiryTime = item.rentState.validityExpiry * 1000;
    return expiryTime > currentTime;
  });

  // console.log({ availableAsset });

  let available = processMarketplaceListings(
    filteredAvailableAsset,
    "list",
    chainDetail,
    paymentToken,
  );
  console.log(available);

  const rentedAsset = await getAssetRentData(chainId, collectionId);
  let rented = processMarketplaceListings(
    rentedAsset,
    "rent",
    chainDetail,
    paymentToken,
  );

  // available = filterEntries(available, loggedUserAddress);

  // rented = filterEntries(rented, loggedUserAddress);

  return { available: available, rented: rented };
};

export const myrent = async (chainId, user, chainDetail, collectionId) => {
  if (chainId == 295 || chainId == 296) {
    user = `0x${AccountId.fromString(user).toSolidityAddress().toString()}`;
  }

  const rentedAsset = await getUserRentedData(chainId, user, collectionId);
  const rented = await processMyRentedNfts(rentedAsset, chainDetail);
  return { rented };
};

const processMarketplaceListings = (data, state, chainDetail, paymentToken) => {
  const processedListings = data.map((listing) => {
    const isFixed = listing.rentState.isFixed;
    const durationType = isFixed ? "Fixed Duration" : "Max Duration";
    const durationSeconds = isFixed
      ? listing.rentState.fixedMinutes * 60
      : getMaxTimeInSecond(listing.rentState.validityExpiry);
    const duration = getDuration(durationSeconds);

    let timeLeft = expiryTime(listing.rentState.validityExpiry);
    if (listing.state.includes("RENT")) {
      timeLeft = expiryTime(listing.rentState.rentExpiry);
    }

    const rateConversionFactor = Math.pow(10, chainDetail.currency_decimal);
    const rate = listing.rentState.rate / rateConversionFactor;
    const rateValue = listing.rentState.rate;
    const ratePerHour = getRatePerHour(rate);
    const profit = listing.profit / rateConversionFactor || 0;
    let owner = listing.initializer;
    let hederaTokenAddress = "";

    if (chainDetail.chain_id == 295 || chainDetail.chain_id == 296) {
      owner = AccountId.fromSolidityAddress(owner).toString();
      hederaTokenAddress = AccountId.fromSolidityAddress(
        listing.tokenAddress,
      ).toString();
    }
    return {
      ...listing,
      value: state == "rent" ? "Rented" : "Available",
      buttonValue: state == "rent" ? "None" : "Rent",
      maxTimeString: timeString(listing.rentState.fixedMinutes * 60),
      durationType,
      duration,
      durationSeconds,
      ratePerHour,
      profit,
      rate,
      rentType: isFixed ? "Fixed" : "Variable",
      timeLeft,
      owner,
      rateValue,
      id: listing.tokenId,
      ownerShare: listing.rentState.ownerShare || 0,
      hederaTokenAddress,
      paymentToken,
    };
  });

  if (chainDetail.chain_id === "ton") {
    processedListings.push({
      value: state == "rent" ? "Rented" : "Available",
      buttonValue: state == "rent" ? "None" : "Rent",
      maxTimeString: timeString(Date.now() + 1000 * 60 * 60 * 24),
      rentType: "Fixed",
    });
  }
  return processedListings;
};

function processMyAssetNfts(allListedOrRented, state, chainDetail) {
  return allListedOrRented.map((nft) => {
    const cardTime = nft.rentState.isFixed
      ? getTimeForCard(nft.rentState.fixedMinutes * 60)
      : expiryTime(nft.rentState.validityExpiry);

    const type = nft.rentState.isFixed ? "Fixed Duration" : "Max Duration";

    const rentalTimeLeft = calculateTimeDifference(
      expiryTime(nft.rentState.rentExpiry),
      expiryTime(nft.rentState.validityExpiry),
    );

    const durationType = `${type} : ${cardTime}`;
    const rateConversionFactor = Math.pow(10, chainDetail.currency_decimal);
    const rate = nft.rentState.rate / rateConversionFactor;

    const ratePerHour = getRatePerHour(rate);
    const profit = nft.profit / rateConversionFactor || 0;

    let timeLeft = expiryTime(nft.rentState.validityExpiry);
    if (nft.state.includes("RENT")) {
      timeLeft = expiryTime(nft.rentState.rentExpiry);
    }
    let owner = nft.initializer;
    let hederaTokenAddress = "";

    if (chainDetail.chain_id == 295 || chainDetail.chain_id == 296) {
      owner = AccountId.fromSolidityAddress(owner).toString();
      hederaTokenAddress = AccountId.fromSolidityAddress(
        nft.tokenAddress,
      ).toString();
    }

    let value = "";
    let buttonValue = "";

    if (state === "list") {
      value = "Listed";
      buttonValue = "Cancel";
    } else if (state === "rent") {
      value = "Rented";
      buttonValue = "Withdraw";
    } else if (state === "loan") {
      value = "Loan";
      buttonValue = "Lend";
    }

    return {
      ...nft,
      value,
      buttonValue,
      token: nft.tokenAddress,
      id: nft.tokenId,
      rate,
      durationType,
      minTimeString: timeString(60),
      maxTimeString: timeString(nft.rentState.fixedMinutes * 60),
      duration: nft.rentState.isFixed
        ? getDuration(nft.rentState.fixedMinutes * 60)
        : expiryTime(nft.rentState.validityExpiry),
      ratePerHour,
      profit,
      rentType: nft.rentState.isFixed ? "Fixed" : "Variable",
      timeLeft,
      owner,
      explorerLink: ``,
      ownerShare: nft.rentState.ownerShare || 0,
      hederaTokenAddress,
      rentalTimeLeft,
    };
  });
}

async function processMyRentedNfts(allRented, chainDetail) {
  let rented = [];

  for (let i of allRented) {
    try {
      let maxTimeInSecond = i.rentState.isFixed
        ? i.rentState.fixedMinutes * 60
        : getMaxTimeInSecond(i.rentState.validityExpiry);
      let durationType = i.rentState.isFixed
        ? "Fixed Duration"
        : "Max Duration";
      let duration = i.rentState.isFixed
        ? getDuration(i.rentState.fixedMinutes * 60)
        : getCardMaxTime(i.rentState.validityExpiry);
      const rateConversionFactor = Math.pow(10, chainDetail.currency_decimal);
      const rate = i.rentState.rate / rateConversionFactor || 0;
      const profit = i.profit / rateConversionFactor || 0;

      let buttonValue = "Withdraw";
      const expire = i.rentState.validityExpiry * 1000;
      const currentTime = new Date().getTime();

      if (expire > currentTime) {
        buttonValue = "None";
      }
      let timeLeft = expiryTime(i.rentState.rentExpiry);
      const ratePerHour = getRatePerHour(rate);
      let owner = i.initializer;
      let hederaTokenAddress = "";

      if (chainDetail.chain_id == 295 || chainDetail.chain_id == 296) {
        owner = AccountId.fromSolidityAddress(owner).toString();
        hederaTokenAddress = AccountId.fromSolidityAddress(
          i.tokenAddress,
        ).toString();
      }
      // Metadata fetch
      let metadata = {};
      if (!i.image) {
        metadata = await fetchMetadata(i.metadata_uri || "");
        i.image = metadata.image.replace(
          "ipfs://",
          "https://hashpack.b-cdn.net/ipfs/",
        );
        i.name = metadata.name;
      }

      rented.push({
        ...i,
        durationType,
        duration,
        ratePerHour,
        timeLeft,
        maxTimeInSecond,
        profit,
        image: i.image,
        name: i.name,
        id: i.tokenId,
        metadata_link: i.metadata_uri,
        value: "Rented",
        buttonValue,
        owner,
        ownerShare: i.rentState.ownerShare || 0,
        hederaTokenAddress,
      });
    } catch (error) {
      console.error("Error processing rented listing:", error);
    }
  }
  return rented;
}

async function fetchMetadata(uri) {
  try {
    if (uri.includes("https")) {
      return fetch(uri).then((response) => response.json());
    } else {
      const ipfsUri = uri.replace(
        "ipfs://",
        "https://hashpack.b-cdn.net/ipfs/",
      );
      return fetch(ipfsUri).then((response) => response.json());
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
    throw new Error("Failed to fetch metadata");
  }
}

const getMetaplexMetadata = async (id, connection) => {
  const state = await programs.metadata.Metadata.findByMint(connection, id);

  return state;
};

const formatTimeFromMinutes = (totalMinutes) => {
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let timeStr = "";

  if (days > 0) {
    timeStr += `${days}d `;
  }
  if (hours > 0 || days > 0) {
    timeStr += `${hours}h `;
  }
  timeStr += `${minutes}m`;

  return timeStr.trim();
};

export const getUserSoldNftsData = (chainId, collection, walletAddress) =>
  fetchAssetData(chainId, collection, "SALE", walletAddress);

export const getMarketplaceData = async (chainId, collection, chainDetail) => {
  const availableAsset = await getMartMarketplaceData(chainId, collection);
  const currentTime = new Date().getTime();

  // const filteredAvailableAsset = availableAsset.filter((item) => {
  //   const expiryTime = item.rentState.validityExpiry * 1000;
  //   return expiryTime > currentTime;
  // });

  const available = processMartMarketplaceListings(
    availableAsset,
    "sale",
    chainDetail,
  );

  const rented = [];

  return { available: available, rented: rented };
};

export const getMartMarketplaceData = (chainId, collection) =>
  fetchAssetData(chainId, collection, "SALE");

export const processMartMarketplaceListings = (data, state, chainDetail) => {
  const processedListings = data.map((listing) => {
    const rateConversionFactor = Math.pow(10, chainDetail.currency_decimal);
    const rate = Number(listing.saleprice) / rateConversionFactor;
    const rateValue = Number(listing.saleprice);
    const ratePerHour = getRatePerHour(rate);
    let owner = listing.initializer;

    return {
      ...listing,
      buttonValue: state == "sale" ? "Buy" : "",
      ratePerHour: ratePerHour || 0,
      rate: rate || 0,
      owner,
      rateValue: rateValue || 0,
      id: listing.tokenId,
      ownerShare: listing.rentState.ownerShare || 0,
      saleprice: listing?.saleprice || 0,
    };
  });
  return processedListings;
};
