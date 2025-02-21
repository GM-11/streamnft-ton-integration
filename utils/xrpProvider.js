import { groupBy, sumBy } from "@/utils/helperFunction";
import { toast } from "react-toastify";
import { Wallet, Client, xrpToDrops } from "xrpl";
import { url } from "./hashConnectProvider";

export const walletAddress = "rnZ5pL4xSgtAyNM3cY6jBygSZ2gLy6JUy8";
const nftId =
  "000861A832100EE587E5ECC709A95144B6B6F5728779F9EE16E5DA9C00000001";

export const handlePools = async () => {
  var resp = await getPools();
  var bidManager = await getOffers();
  let collectionData = await getCollection();
  const collectionDataMap = new Map(
    collectionData.map((item) => [item.token_address, item])
  );
  resp.forEach((pool) => {
    const matchingObject = collectionDataMap.get(pool.tokenAddress);
    if (matchingObject) {
      pool.collection_name = matchingObject.name;
      pool.collection_logo = matchingObject.image_url;
      pool.floor = matchingObject.floor;
    } else {
      console.warn(
        "No matching object found for token address:",
        pool.tokenAddress
      );
    }
    pool.lastLoanAmount = matchingObject?.last_loan_amount
      ? matchingObject.last_loan_amount
      : 0;
  });

  let sorteddata = await groupBy(resp, "tokenAddress");
  return { sorteddata, bidManager };
};

export const xrpOfferData = async (userID) => {
  var bidPools = await getPools();

  let collectionData = await getCollection();
  const currentTimeInEpoch = Math.floor(Date.now() / 1000); // Current time in seconds since the epoch

  let defaulted = [];
  let _assetManager = [];
  for (let i = 0; i < collectionData.length; i++) {
    var managerValue = await getUserOffer(collectionData[i].token_address);

    _assetManager = managerValue.filter((assetManager) => {
      return (
        (assetManager.state === "LOAN" ||
          assetManager.state === "RENT_AND_LOAN" ||
          assetManager.state === "STALE_AND_LOAN") &&
        assetManager.loanState.provider.toLowerCase() === walletAddress
      );
    });
    // Check if _assetManager is not null or undefined
    if (_assetManager[0]) {
      // Check the conditions
      const qualifyingAssetManagers = _assetManager.filter(
        (assetManager) => assetManager.loanState.loanExpiry < currentTimeInEpoch
      );
      const loanIndices = qualifyingAssetManagers.map((assetManager) => ({
        loanPoolIndex: assetManager.LoanPoolIndex, // Assuming loanPoolIndex is a property of assetManager
        loanOfferIndex: assetManager.LoanOfferIndex, // Assuming loanOfferIndex is a property of assetManager
      }));
      defaulted.push(...qualifyingAssetManagers);
    }
  }

  const collectionDataMap = new Map(
    collectionData.map((item) => [item.token_address, item])
  );

  // Create an array to hold promises
  bidPools.map((pool) => {
    const matchingObject = collectionDataMap.get(pool.tokenAddress);
    if (matchingObject) {
      pool.collection_name = matchingObject.name;
      pool.collection_logo = matchingObject.image_url;
      pool.floor = matchingObject.floor ? matchingObject.floor : 0;
    }
  });

  var bidManagers = await getOffers();
  bidManagers = bidManagers.filter((element) => {
    return (
      element.bidderPubkey.toLowerCase() === walletAddress.toLowerCase() &&
      (element.totalBids > 0 || element.pendingLoans > 0)
    );
  });
  let response = [];
  for (let manager of bidManagers) {
    const pool = bidPools.find((a) => {
      return a.bidPoolIndex == manager.bidPoolIndex;
    });
    if (pool) {
      const assetLength = _assetManager.filter(
        (item) =>
          item.LoanPoolIndex === manager.bidPoolIndex &&
          item.LoanOfferIndex === manager.bidManagerIndex
      );
      if (assetLength.length > 1) {
        for (let i = 0; i < assetLength.length; i++) {
          const res = {
            collection_name: pool.collection_name,
            collection_logo: pool.collection_logo,
            offer: Math.round(Number(manager.bidAmount) * 100) / 100,
            apy: pool.apy,
            duration: pool.loanDurationInMinutes.toString(),
            // status: item.status,
            // btnVal: item.btnVal,
            // // best_offer: best,
            bidManager: manager,
            bidPool: pool,
            // assetManager: asset,
          };
          if (assetLength[i].loanState.loanExpiry < currentTimeInEpoch) {
            res.defaulted = assetLength[i];
            res.status = "Defaulted";
            res.btnVal = "Claim";
          } else if (manager.pendingLoans > 0) {
            res.status = "Active Loan";
            res.btnVal = "View Offer";
          } else {
            res.status = "UnClaimed";
            res.btnVal = "Cancel";
          }
          response.push(res);
        }
      } else {
        const res = {
          collection_name: pool.collection_name,
          collection_logo: pool.collection_logo,
          offer: Math.round(Number(manager.bidAmount) * 100) / 100,
          apy: pool.apy,
          duration: pool.loanDurationInMinutes.toString(),
          // status: item.status,
          // btnVal: item.btnVal,
          // // best_offer: best,
          bidManager: manager,
          bidPool: pool,
          // assetManager: asset,
        };
        if (
          defaulted.some(
            (item) =>
              item.LoanPoolIndex === manager.bidPoolIndex &&
              item.LoanOfferIndex === manager.bidManagerIndex
          ) &&
          manager.pendingLoans > 0
        ) {
          res.defaulted = defaulted.find(
            (item) =>
              item.LoanPoolIndex === manager.bidPoolIndex &&
              item.LoanOfferIndex === manager.bidManagerIndex
          );
          res.status = "Defaulted";
          res.btnVal = "Claim";
        } else if (manager.pendingLoans > 0) {
          res.status = "Active Loan";
          res.btnVal = "View Offer";
        } else {
          res.status = "UnClaimed";
          res.btnVal = "Cancel";
        }
        response.push(res);
      }
    }
  }
  return response;
};

export const cancelxrpOffer = async (bidPoolIndex, bidManagerIndex, amount) => {
  try {
    const standby_wallet = Wallet.fromSeed("sEd7rd9Ye6LnUYPnJzRfq6yZRag42Vw");
    const operational_wallet = Wallet.fromSeed(
      "sEdTrEvhD1LcWAfszT3MbrH42ExJ3vd"
    );
    await fundTransfer(operational_wallet, standby_wallet, amount);
    await postCancelOffer(bidPoolIndex, bidManagerIndex);
    toast.success("Offer Cancel Successful");
  } catch (e) {
    console.error(e);
    toast.error("Transaction Failed");
  }
};

const postCancelOffer = async (loanPoolIndex, loanOfferIndex) => {
  const data = {
    chainId: 101,
    contractAddress: "0x00",
    loanOfferIndex: loanOfferIndex,
    loanPoolIndex: loanPoolIndex,
  };

  try {
    const res = await fetch(`${url}/cancelOffer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export const expirexrpUserLoan = async (tokenAddress, tokenId) => {
  // transfer nft to user
  const standby_wallet = Wallet.fromSeed("sEd7rd9Ye6LnUYPnJzRfq6yZRag42Vw");
  const operational_wallet = Wallet.fromSeed("sEdTrEvhD1LcWAfszT3MbrH42ExJ3vd");

  await nftTransfer(standby_wallet, operational_wallet);
  try {
    await postExpireLoan(tokenAddress, tokenId);
    toast.success("Claim Successful");
  } catch (e) {
    toast.error("Transaction Failed");
  }
};

export const borrowLoanXrp = async (
  bidPoolIndex,
  bidManagerIndex,
  tokenID,
  serial_number,
  amount
) => {
  const standby_wallet = Wallet.fromSeed("sEd7rd9Ye6LnUYPnJzRfq6yZRag42Vw");
  const operational_wallet = Wallet.fromSeed("sEdTrEvhD1LcWAfszT3MbrH42ExJ3vd");

  await fundTransfer(standby_wallet, operational_wallet, amount);

  await nftTransfer(operational_wallet, standby_wallet);

  try {
    await postProcessLoan(
      tokenID,
      serial_number,
      bidManagerIndex,
      bidPoolIndex,
      walletAddress
    );
    toast.success("Loan Borrowed Successful");
  } catch (e) {
    console.error(e);
    toast.error("Transaction Failed");
  }
};

const postProcessLoan = async (
  tokenAddress,
  tokenId,
  loanOfferIndex,
  loanPoolIndex,
  initializer
) => {
  const data = {
    assetManagerData: {
      chainId: 101,
      contractAddress: "0x00",
      tokenAddress: tokenAddress,
      tokenId: tokenId,
      loanOfferIndex: loanOfferIndex,
      loanPoolIndex: loanPoolIndex,
      initializer: initializer,
    },
  };

  try {
    await fetch(`${url}/processLoan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

const nftTransfer = async (to, from) => {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  let transactionBlob = {
    TransactionType: "NFTokenCreateOffer",
    Account: from.classicAddress,
    NFTokenID: nftId,
    Amount: "0",
    Flags: parseInt(1),
    Destination: to.classicAddress,
  };
  let tx = await client.submitAndWait(transactionBlob, {
    wallet: from,
  });
  const transactionBlob1 = {
    TransactionType: "NFTokenAcceptOffer",
    Account: to.classicAddress,
    NFTokenSellOffer: tx.result.meta.offer_id, // Replace with the offer sequence you want to accept
  };
  // Submit transaction --------------------------------------------------------
  tx = await client.submitAndWait(transactionBlob1, {
    wallet: to,
  });
};
const fundTransfer = async (to, from, sendAmount) => {
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: from.classicAddress,
    Amount: xrpToDrops(sendAmount),
    Destination: to.classicAddress,
  });
  const signed = from.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);
};

const postExpireLoan = async (tokenAddress, tokenId) => {
  const data = {
    assetManagerData: {
      chainId: 101,
      contractAddress: "0x00",
      tokenAddress: tokenAddress,
      tokenId: tokenId,
    },
  };

  try {
    await fetch(`${url}/expireLoan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export const xrpLoanData = async (userID) => {
  var pools = await getPools();

  let collectionData = await getCollection();
  const collectionDataMap = new Map(
    collectionData.map((item) => [item.token_address, item])
  );

  // Create an array to hold promises
  pools.map((pool) => {
    const matchingObject = collectionDataMap.get(pool.tokenAddress);
    if (matchingObject) {
      pool.collection_name = matchingObject.name;
      pool.collection_logo = matchingObject.image_url;
    }
    pool.floor = matchingObject?.floor ? matchingObject.floor : 0;
  });

  const grouped = groupBy(pools, "tokenAddress");
  var bidManagers = await getOffers();
  bidManagers = bidManagers.filter((element) => {
    return element.totalBids > 0 || element.pendingLoans > 0;
  });

  var assetManager = [];
  for (let key in grouped) {
    var _assetManager = await getUserOffer(key);

    const filteredAssetManagers = _assetManager.filter((assetManager) => {
      return (
        assetManager.state === "LOAN" ||
        assetManager.state === "RENT_AND_LOAN" ||
        assetManager.state === "STALE_AND_LOAN"
      );
    });
    const filtered = filteredAssetManagers.filter((element) => {
      return walletAddress.toLowerCase() == element.initializer.toLowerCase();
    });
    assetManager = assetManager.concat(filtered);
  }
  var response = [];
  for (let userAsset of assetManager) {
    const manager = bidManagers.find((a) => {
      return (
        a.bidManagerIndex == userAsset.LoanOfferIndex &&
        a.bidPoolIndex == userAsset.LoanPoolIndex
      );
    });
    if (manager == undefined) continue;
    const pool = pools.find((a) => {
      return a.bidPoolIndex == userAsset.LoanPoolIndex;
    });

    const interestRateLender = pool.interestRateLender;
    const interestRateProtocol = pool.interestRateProtocol;
    const interestR = parseFloat(
      interestRateLender + (interestRateLender * interestRateProtocol) / 100
    );
    let expired = false;
    if (userAsset.loanState.loanExpiry < Math.floor(Date.now() / 1000)) {
      expired = true;
    }
    var obj = {
      collection_name: pool.collection_name,
      collection_logo: pool.collection_logo,
      borrow_amount: Math.round(Number(manager?.bidAmount) * 100) / 100,
      apy: Math.round(Number(pool.apy) * 100) / 100,
      repayment:
        Number(manager?.bidAmount) +
        (Number(manager?.bidAmount) * Number(interestR)) / 100,
      btnVal: "Repay",
      mint: userAsset.tokenAddress,
      mintID: userAsset.tokenId,
      loan: userAsset,
      bidPool: pool,
      manager: manager,

      floor: pool.floor,
      expired: expired,
    };
    response.push(obj);
  }
  return response;
};

export const repayUserLoanXRP = async (tokenAddress, tokenId, repayment) => {
  const standby_wallet = Wallet.fromSeed("sEd7rd9Ye6LnUYPnJzRfq6yZRag42Vw");
  const operational_wallet = Wallet.fromSeed("sEdTrEvhD1LcWAfszT3MbrH42ExJ3vd");

  await fundTransfer(standby_wallet, operational_wallet, repayment);

  await nftTransfer(standby_wallet, operational_wallet);
  try {
    await postRepayLoan(tokenAddress, tokenId);
  } catch (e) {
    toast.error("Transaction Failed");
  }
};

const postRepayLoan = async (tokenAddress, tokenId) => {
  const data = {
    assetManagerData: {
      chainId: 101,
      contractAddress: "0x00",
      tokenAddress: tokenAddress,
      tokenId: tokenId,
    },
  };

  try {
    await fetch(`${url}/repayLoan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export const getPools = async () => {
  const resp = await fetch(`${url}/loanPool/101/0x00`).then((r) => {
    r = r.json();
    return r;
  });
  return resp.map((output) => ({
    bidPoolIndex: Number(output.loan_pool_index),
    initializerKey: output.initializer_key,
    tokenAddress: output.token_address,
    loanDurationInMinutes: Number(output.loan_duration_in_minutes),
    apy: Number(output.apy),
    interestRateLender: Number(output.interest_rate_lender) / 1000,
    interestRateProtocol: Number(output.interest_rate_protocol),
    totalBidManager: output.total_loan_offer,
    lastBidAmount: Number(output.last_bid_amount),
    bidNftFloorPrice: Number(output.bid_nft_floor_price),
  }));
};

export const getCollection = async () => {
  const resp = await fetch(`${url}/collection/101/0x00`).then((r) => {
    r = r.json();
    return r;
  });
  return resp;
};

export const getOffers = async () => {
  const resp = await fetch(`${url}/loanOffer/101/0x00`).then((r) => {
    r = r.json();
    return r;
  });
  return resp.map((output) => ({
    bidManagerIndex: Number(output.loan_offer_index),
    bidderPubkey: output.bidder_pubkey,
    bidAmount: Number(output.bid_amount),
    bidPoolIndex: Number(output.loan_pool_index),
    totalBids: Number(output.total_bids),
    pendingLoans: Number(output.pending_loans),
  }));
};

export const getUserOffer = async (tokenAddress) => {
  const resp = await fetch(`${url}/assetManager/101/0x00/${tokenAddress}`).then(
    (r) => {
      r = r.json();
      return r;
    }
  );
  const result = formatAssetsByDB(resp);
  return result;
};

function formatAssetsByDB(outputs) {
  return outputs.map((output) => {
    return {
      initializer: output.initializer,
      tokenAddress: output.token_address,
      tokenId: Number(output.token_id),
      LoanPoolIndex: Number(output.loan_pool_index),
      LoanOfferIndex: Number(output.loan_offer_index),
      state: output.state, // Convert this to the actual state value if needed
      loanState: {
        loanExpiry: Number(output.loan_expiry),
        provider: output.provider,
      },
      rentState: {
        rate: output.rate ? Number(output.rate) : null,
        validityExpiry: output.validity_expiry
          ? Number(output.validity_expiry)
          : null,
        isFixed: output.is_fixed,
        fixedMinutes: output.fixed_minutes
          ? Number(output.fixed_minutes)
          : null,
        ownerShare: output.owner_share ? Number(output.owner_share) : null,
        rentExpiry: output.rent_expiry ? Number(output.rent_expiry) : null,
        rentee: output.rentee,
        whitelist: output.whitelist,
      },
    };
  });
}

export const addOffer = async (
  //bidderPubkey,
  bidPoolIndex,
  bidAmount,
  totalBids
) => {
  // Add transfer function

  try {
    const standby_wallet = Wallet.fromSeed("sEd7rd9Ye6LnUYPnJzRfq6yZRag42Vw");
    const operational_wallet = Wallet.fromSeed(
      "sEdTrEvhD1LcWAfszT3MbrH42ExJ3vd"
    );

    await fundTransfer(operational_wallet, standby_wallet, bidAmount);
    const bidderPubkey = walletAddress;
    await postLoanOffer(bidderPubkey, bidAmount, totalBids, bidPoolIndex);
    toast.success("Lend Transaction Successful");
  } catch (e) {
    console.error(e);
    toast.error("Lend Transaction Failed");
  }
};

const postLoanOffer = async (
  bidderPubkey,
  bidAmount,
  totalBids,
  bidPoolIndex
) => {
  const data = {
    bidderPubkey: bidderPubkey,
    bidAmount: bidAmount,
    totalBids: totalBids,
    bidPoolIndex: bidPoolIndex,
    chain_id: 101,
    contract_address: "0x00",
  };
  try {
    const res = await fetch(`${url}/loanOffer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
