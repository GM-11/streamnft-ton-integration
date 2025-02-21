import {
  getAssetManager,
  getBidManager,
  getBidManagerByUser,
  getBidPool,
} from "streamnft-sol-test";
import { Metaplex } from "@metaplex-foundation/js";
import { groupBy, maxBy, sumBy } from "@/utils/helperFunction";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getBidMangerListByBidPoolIndex, getBidPools } from "./evmProvider";

// export const solanaLendData = async (connection,chainId,contractAddress,collections) => {
//   let accounts = await getBidPool();
//   let bidManager = await getBidManager();

//   var poolsApi = await getBidPools(chainId, contractAddress);
//   let bidManagerApi = await getBidMangerListByBidPoolIndex(chainId);

//
//   const metaplex = Metaplex.make(connection);

//   const values = [];
//   for (var account of accounts) {
//     const pk = account.publicKey;
//      ,"last bid lamp")

//     const collectionID = account.account.collectionAddress;

//     const metadata = metaplex.nfts().pdas().metadata({ mint: collectionID });
//     try {
//       const res = await Metadata.fromAccountAddress(connection, metadata);
//       const img = await (await fetch(res.data.uri)).json();
//       var obj = {
//         collectionId: collectionID?.toBase58(),
//         collectionPda: pk?.toBase58(),
//         collection_name: img.name,
//         collection_logo: img.image,
//         apy:
//           typeof account.account.apy == "number"
//             ? account.account.apy.toFixed(2)
//             : account.account.apy,
//         gracePeriodInMinutes: account.account.gracePeriodInMinutes?.toNumber(),
//         loanDurationInMinutes: account.account.loanDurationInMinutes?.toNumber(),
//         interestRateLender: account.account.interestRateLender,
//         interestRateProtocol: account.account.interestRateProtocol,
//         acc: account.publicKey?.toBase58(),
//         lastLoan:
//           account.account.lastBidLamports?.toNumber() > 0
//             ? Math.round(
//                 (account.account.lastBidLamports?.toNumber() / lamports) * 100
//               ) /
//                 100 +
//               " SOL"
//             : "NA SOL",
//       };
//       values.push(obj);
//     } catch (e) {
//       console.error(e);
//     }
//   }

//
//   const sorteddata = groupBy(values, "collectionId");
//   return { sorteddata, bidManager };
// };

export const solanaLendData = async (
  connection,
  chainId,
  contractAddress,
  collections
) => {
  let pools = await getBidPools(chainId, contractAddress);
  const metaplex = Metaplex.make(connection);

  let totalLoans = 0;
  let totalVolume = 0;

  collections?.forEach((item) => {
    if (item.total_volume != null) {
      totalVolume += Number(item.total_volume);
    }
    totalLoans += item.total_loan;
  });

  const collectionDataMap = new Map(
    collections?.map((item) => [item.token_address, item])
  );

  pools?.forEach((pool) => {
    const matchingObject = collectionDataMap?.get(pool.tokenAddress);
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
    pool.totalLoans = totalLoans;
    pool.totalVolume = totalVolume;
  });

  let bidManager = await getBidMangerListByBidPoolIndex(chainId);
  const sorteddata = groupBy(pools, "tokenAddress");

  return { sorteddata, bidManager };
};

// export const solanaBorrowData = async (connection,chainId,contractAddress) => {
//   const offers = await getBidManager();

//   const pools = await getBidPool();

//

//   const metaplex = Metaplex.make(connection);

//   var vals = [];
//   for (var pool of pools) {
//     let count = 0;
//     let taken = 0;

//     const liq = sumBy(offers, (o) => {

//       if (
//         o.account.biddingPoolAddress.toBase58() == pool.publicKey.toBase58()
//       ) {
//          ,o.account.biddingPoolAddress.toBase58(),"count")
//         count =
//           count +
//           o.account.totalBids.toNumber() +
//           o.account.pendingLoans.toNumber();
//         taken += o.account.pendingLoans.toNumber();

//         return o.account.biddingAmountInLamports.toNumber() * o.account.totalBids.toNumber();
//       } else {
//         return 0;
//       }
//     });

//     const best = maxBy(offers, function (o) {
//       if (
//         o.account.biddingPoolAddress.toBase58() == pool.publicKey.toBase58()
//       ) {
//         return o.account.biddingAmountInLamports.toNumber() / LAMPORTS_PER_SOL;
//       }
//       return 0;
//     });

//     const last = pool.account.lastBidLamports.toNumber();

//     const resp = {
//       pk: pool.publicKey,
//       liq: liq,
//       offers: count,
//       offersTaken: taken,
//       bestOffer:
//         best?.account.biddingAmountInLamports.toNumber() / LAMPORTS_PER_SOL,
//       lastLoan: last === 0 ? "NA" : last / LAMPORTS_PER_SOL + " SOL",
//     };

//     vals.push(resp);
//   }

//   const vals2 = [];
//   for (var offer of offers) {
//     const x = pools.find((a) => {
//       return (
//         a.publicKey.toBase58() == offer.account.biddingPoolAddress.toBase58()
//       );
//     });

//     if (x == undefined) continue;

//     const metadata = metaplex
//       .nfts()
//       .pdas()
//       .metadata({ mint: x.account.collectionAddress });
//     const res = await Metadata.fromAccountAddress(connection, metadata);
//     const img = await (await fetch(res.data.uri)).json();

//     const interestR =
//       parseFloat(x.account.interestRateLender.toString()) +
//       parseFloat(x.account.interestRateProtocol.toString());

//     const intr =
//       ((offer.account.biddingAmountInLamports.toNumber()) *
//         interestR) /
//       100;
//     const current =  vals.find((a) => {
//       return a.pk.toBase58() == offer.account.biddingPoolAddress.toBase58();
//     });

//     const obj = {
//       collection_name: img.name,
//       collection_logo: img.image,
//       liquidity: Math.round(current?.liq * 100) / 100,
//       total_offers: current?.offers,
//       offers_taken: current?.offersTaken,
//       bestOffer: Math.round(current?.bestOffer * 100) / 100,
//       lastLoan: current?.lastLoan,
//       interest: Math.round(intr * 100) / 100,
//       interest_rate: interestR,
//       loanDurationInMinutes: x.account.loanDurationInMinutes.toString(),
//       offerEscrow: offer,
//       poolPDA: x,
//       btnVal: "Borrow",
//     };

//     vals2.push(obj);
//   }
//   // Convert BN to string (assuming `item.collectionAddress.toString()` works)
// const convertBNToString = (bn) => bn.toString();

// // Group objects by `collectionAddress`
// const groupByCollectionAddress = (vals) => {
//   return vals.reduce((acc, item) => {
//     const collectionAddressStr = convertBNToString(item.poolPDA.account.collectionAddress);

//     if (!acc[collectionAddressStr]) {
//       acc[collectionAddressStr] = [item]; // Start with an array containing the first item
//     } else {
//       acc[collectionAddressStr].push(item); // Push additional items to the existing array
//     }

//     return acc;
//   }, {});
// };

// // Convert the grouped object back to an array if needed
// const groupedVals = groupByCollectionAddress(vals2);
//

// const groupedArray = Object.values(groupedVals);
//

//
// const grouped = groupBy(vals2, "collection_name");

//   return groupedVals;
// };

export const solanaBorrowData = async (
  connection,
  collections,
  chainDetail
) => {
  var pools = await getBidPools(
    chainDetail?.chain_id,
    chainDetail?.contract_address
  );
  let bidManager = await getBidMangerListByBidPoolIndex(chainDetail?.chain_id);

  let collectionData = collections;
  let totalLoans = 0;
  let totalVolume = 0;

  collectionData?.forEach((item) => {
    if (item.total_volume != null) {
      totalVolume += Number(item.total_volume);
    }
    totalLoans += item.total_loan;
  });

  var filteredCollectionData = collectionData?.filter((collection) => {
    return pools?.some(
      (pool) => pool.tokenAddress === collection.token_address
    );
  });

  const collectionDataMap = new Map(
    filteredCollectionData.map((item) => [item.token_address, item])
  );

  pools?.map((pool) => {
    const matchingObject = collectionDataMap.get(pool.tokenAddress);
    if (matchingObject) {
      pool.collection_name = matchingObject?.name;
      pool.collection_logo = matchingObject?.image_url;
      pool.lastLoanAmount = matchingObject?.last_loan_amount
        ? matchingObject?.last_loan_amount
        : 0;
      pool.floor = matchingObject?.floor ? matchingObject.floor : 0;
      pool.isErc1155 = matchingObject?.erc1155; //todo
    }
  });

  const finalOffers = [];

  bidManager = bidManager?.filter((item) => {
    return item?.pendingLoans > 0 || item?.totalBids > 0;
  });

  for (const pool of pools) {
    const matchingOffers = bidManager.filter((offer) => {
      return offer.bidPoolIndex == pool.bidPoolIndex;
    });

    let count = 0; //total_offers
    let taken = 0; //offers_taken
    let liq = 0; //liquidity
    let best = 0; //best amount of best offer
    let interest = 0;
    let bestOffer = null;
    for (const item of matchingOffers) {
      count += item.totalBids + item.pendingLoans;
      taken += item.pendingLoans;
      liq += item.bidAmount * item.totalBids;
      if (
        (!bestOffer || item.bidAmount > bestOffer.bidAmount) &&
        item?.totalBids > 0
      ) {
        bestOffer = item;
      }
    }

    // if (bestOffer) {
    const interestRateLender = pool.interestRateLender;
    const interestRateProtocol = pool.interestRateProtocol;
    const interestR =
      interestRateLender + (interestRateLender * interestRateProtocol) / 100;
    const intr = (Number(bestOffer?.bidAmount ?? 0) * interestR) / 100;

    const resObj = {
      collection_name: pool?.collection_name,
      collection_logo: pool?.collection_logo,
      isErc1155: pool?.isErc1155,
      liquidity: liq,
      totalBids: bestOffer?.totalBids,
      pendingLoans: bestOffer?.pendingLoans,
      totalOffers: count,
      offersTaken: taken,
      bestOffer:
        bestOffer?.bidAmount / Math.pow(10, chainDetail?.currency_decimal),
      lastBidAmount:
        pool?.lastBidAmount / Math.pow(10, chainDetail?.currency_decimal) +
        " " +
        chainDetail?.currency_symbol,
      lastLoan:
        pool?.lastBidAmount / Math.pow(10, chainDetail?.currency_decimal) +
        " " +
        chainDetail?.currency_symbol,
      interest: Math.round(intr * 100) / 100,
      interest_rate: interestR,
      loanDurationInMinutes: pool?.loanDurationInMinutes,
      pool: pool,
      tokenAddress: pool?.tokenAddress,
      btnVal: "Borrow",
      offerEscrow: bestOffer,
      totalVolume: totalVolume,
      floor: pool?.bidNftFloorPrice,
      lastLoanAmount: pool?.lastLoanAmount
        ? pool?.lastLoanAmount / Math.pow(10, chainDetail?.currency_decimal) +
          " " +
          chainDetail?.currency_symbol
        : 0 + " " + chainDetail?.currency_symbol,
    };
    finalOffers.push(resObj);
    // }
    liq = 0;
    best = 0;
    interest = 0;
    count = 0;
    taken = 0;
  }

  const sorteddata = groupBy(finalOffers, "tokenAddress");

  return sorteddata;
};

export const solanaOfferData = async (connection, anchorWallet) => {
  const userOffers = await getBidManagerByUser(anchorWallet.publicKey);
  const assetManagers = await getAssetManager();
  const biddingPools = await getBidPool();

  const metaplex = Metaplex.make(connection);
  var vals = [];
  for (var item of userOffers) {
    if (
      item.publicKey.toBase58() !=
      "HnpENE2mSCKtHac16paCfTqMfb4GJg8AS5VKHBpKEitL"
    ) {
      const pool = biddingPools.find((a) => {
        return (
          a.publicKey.toBase58() === item.account.biddingPoolAddress.toBase58()
        );
      });
      const asset = assetManagers.find((a) => {
        return (
          a.account.loanBidManagerKey.toBase58() == item.publicKey.toBase58()
        );
      });

      const metadata = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: pool?.account.collectionAddress });
      try {
        const res = await Metadata.fromAccountAddress(connection, metadata);
        var img = await (await fetch(res.data.uri)).json();

        if (item.account.pendingLoans.toNumber() > 0) {
          item.status = "Active Loan";
          item.btnVal = "View Offer";
        } else {
          item.status = "UnClaimed";
          item.btnVal = "Cancel";
        }

        const obj = {
          collection_name: img?.name,
          collection_logo: img?.image,
          offer:
            Math.round(
              (item.account.biddingAmountInLamports.toString() /
                LAMPORTS_PER_SOL) *
                100
            ) / 100,
          apy: pool?.account.apy,
          duration: pool?.account.loanDurationInMinutes.toString(),
          status: item.status,
          btnVal: item.btnVal,
          bidManager: item,
          bidPool: pool,
          assetManager: asset,
        };
        vals.push(obj);
      } catch (e) {}
    }
  }
  return vals;
};

export const solanaLoanData = async (connection, anchorWallet) => {
  const assetManagers = [];
  const bidManagers = await getBidManager();
  const biddingPools = await getBidPool();

  const userLoans = [];
  for (var assetManager of assetManagers) {
    if (
      assetManager.account.holder.toBase58() ==
      anchorWallet.publicKey.toBase58()
    ) {
      if (
        assetManager.account.state.loan ||
        assetManager.account.state.rentAndLoan ||
        assetManager.account.state.staleAndLoan
      ) {
        userLoans.push(assetManager);
      }
    }
  }
  const metaplex = Metaplex.make(connection);
  var loanRows = [];
  for (var loan of userLoans) {
    var res = bidManagers.find(
      (element) =>
        element.publicKey.toBase58() ==
        loan.account.loanBidManagerKey.toBase58()
    );
    var res2 = biddingPools.find(
      (element) =>
        res.account.biddingPoolAddress.toBase58() ==
        element.publicKey.toBase58()
    );

    loan.bidManager = res;
    loan.bidPool = res2;

    const metadataPDA = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: loan.account.collection });

    const metadata = await Metadata.fromAccountAddress(connection, metadataPDA);
    const nftDetails = await (await fetch(metadata.data.uri)).json();

    var obj = {
      collection_name: nftDetails.name,
      collection_logo: nftDetails.image,
      borrow_amount:
        Math.round(
          (res.account.biddingAmountInLamports.toNumber() / LAMPORTS_PER_SOL) *
            100
        ) / 100,
      apy: Math.round(res2.account.apy * 100) / 100,
      repayment:
        Math.round(
          (res.account.biddingAmountInLamports.toNumber() / LAMPORTS_PER_SOL +
            ((res.account.biddingAmountInLamports.toNumber() /
              LAMPORTS_PER_SOL) *
              res2.account.interestRateLender) /
              100) *
            100
        ) / 100,
      btnVal: "Repay",
      mint: loan.account.mint,
      loan: loan,
    };
    loanRows.push(obj);
  }
  return loanRows;
};

export const formatTokenId = (id) => {
  if (!id) return "";
  return `${id.slice(0, 3)}...${id.slice(-3)}`;
};
