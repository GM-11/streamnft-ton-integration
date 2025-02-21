import { useState, useContext } from "react";
import { HashConnect } from "hashconnect";
import {
  AccountId,
  Client,
  TokenId,
  NftId,
  Hbar,
  PrivateKey,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  AccountAllowanceApproveTransaction,
  TokenMintTransaction,
  TransactionReceiptQuery,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenNftInfoQuery,
  ContractCallQuery,
} from "@hashgraph/sdk";
import { groupBy, sumBy } from "@/utils/helperFunction";
import { toast } from "react-toastify";
import {
  deleteNftPool,
  postAcceptNFTOffer,
  postCancelOffer,
  postExpireLoan,
  postLoanOffer,
  postOfferAmount,
  postOfferCount,
  postProcessLoan,
  postRepayLoan,
} from "./apiRequests";

import { getStreamConfig } from "./evmSdkCalls.js";
import { indexerAxiosInstance } from "@/services/axios";

export const hashconnect = new HashConnect(true);

export const url =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-staging.danlabs.xyz";

const testClient = Client.forTestnet();
export const networkType = process.env.NEXT_PUBLIC_NETWORK_TYPE ?? "testnet";
const mirrornode =
  process.env.NEXT_PUBLIC_MIRRORNODE ?? "https://testnet.mirrornode.hedera.com";
export const env = process.env.NEXT_PUBLIC_NODE_ENV ?? "dev";

let appMetadata = {
  name: "Stream NFT",
  description: "Platform to Loan/Borrow NFT.",
  icon: "/icon.png",
  uri: process.env.NEXT_PUBLIC_HEDERA_URL,
};

let savedDataTemplate = {
  topic: "",
  pairingStatus: "",
  privateKey: "",
  pairedWalletData: null,
  accountIds: [],
};

let savedData = { ...savedDataTemplate };

export const hashapackPairingData = () => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  return JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
    length - 1
  ];
};

export const initHashpack = async () => {
  let initData = await hashconnect.init(appMetadata, networkType, true);
};
export const pairHashpack = async () => {
  await initHashpack();
  hashconnect.findLocalWallets();
  hashconnect.foundExtensionEvent.once((extensionMetadata) => {
    hashconnect.connectToLocalWallet();
  });
  localStorage.setItem("connected", 1);
  hashconnect.pairingEvent.once((pairingData) => {
    pairingData.accountIds.forEach((id) => {
      if (savedData.accountIds.indexOf(id) === -1)
        savedData.accountIds.push(id);
    });

    return pairingData;
  });
};

export const unpairHashpack = async () => {
  if (savedData.topic) {
    hashconnect.disconnect(savedData.topic);
  }
  savedData = savedDataTemplate;
};

export const checkPairing = () => {
  return hashconnect.hcData.pairingData.length > 0;
};

export const getNFTImageURI = async (NFTID, id) => {
  const out = await fetch(
    `${mirrornode}/api/v1/tokens/${NFTID}/nfts/${id}`
  ).then((r) => r.json());

  const newValue = Buffer.from(out.metadata, "base64");
  const metadata = newValue.toString();

  let uri = "";
  let response = {};

  if (metadata.includes("https")) {
    uri = metadata;
    const data = { url: uri };

    // Fetch metadata link
    const result = await fetch(`${url}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    response = await result.json();
  } else {
    if (metadata.includes("ipfs://")) {
      uri = metadata.replace("ipfs://", "https://hashpack.b-cdn.net/ipfs/");
    } else {
      uri = "https://hashpack.b-cdn.net/ipfs/" + metadata;
    }

    const resp = await fetch(uri).then((r) => r.json());
    response = resp;
  }

  let image_url = "";
  if (response.image) {
    image_url = response.image.includes("https")
      ? response.image
      : response.image.replace("ipfs://", "https://hashpack.b-cdn.net/ipfs/");
  } else if (response?.data?.image) {
    image_url = response.data.image.includes("https")
      ? response.data.image
      : response.data.image.replace(
          "ipfs://",
          "https://hashpack.b-cdn.net/ipfs/"
        );
  }

  return {
    image: image_url,
    name: response.name,
    metadata_link: uri,
  };
};

export const getUserBalance = async () => {
  const hashconnectData = localStorage.getItem("hashconnectData");
  if (hashconnectData) {
    const parsedData = JSON.parse(hashconnectData);
    const length = parsedData.pairingData.length;
    const accountId = parsedData.pairingData[length - 1]?.accountIds[0];

    if (!accountId) return null;

    const bal = await fetch(`${mirrornode}/api/v1/accounts/${accountId}`)
      .then((r) => r.json())
      .then((e) => parseFloat(e?.balance?.balance / 100000000).toFixed(2));
    return bal;
  }
  return null;
};

export const getNFTDetail = async (NFTID, id) => {
  const out = await fetch(
    `${mirrornode}/api/v1/tokens/${NFTID}/nfts/${id}`
  ).then((r) => {
    r = r.json();
    return r;
  });

  const newValue = Buffer.from(out.metadata, "base64");

  const metadata = newValue.toLocaleString();

  let uri = "";
  let response = {};
  if (metadata.includes("https")) {
    uri = metadata;
    const data = {
      url: uri,
    };
    const result = await fetch(`${url}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    response = await result.json();
  } else {
    if (metadata.includes("ipfs://")) {
      uri = metadata.replace("ipfs://", "https://hashpack.b-cdn.net/ipfs/");
    } else {
      uri = "https://hashpack.b-cdn.net/ipfs/" + metadata;
    }
    const resp = await fetch(uri).then((r) => {
      r = r.json();
      return r;
    });
    response = resp;
  }
  let image_url = "";
  if (response.image) {
    if (response?.image.includes("https")) {
      image_url = response?.image;
    } else {
      image_url = response?.image?.replace(
        "ipfs://",
        "https://hashpack.b-cdn.net/ipfs/"
      );
    }
  } else {
    if (response?.data?.image?.includes("https")) {
      image_url = response?.data?.image;
    } else {
      image_url = response?.data?.image?.replace(
        "ipfs://",
        "https://hashpack.b-cdn.net/ipfs/"
      );
    }
  }

  return {
    image: image_url,
    name: response.name,
  };
};

export const getCollectionArray = async (chainId) => {
  try {
    const response = await indexerAxiosInstance.get(`/collections/${chainId}`, {
      params: { loan: true },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw new Error("Failed to fetch collections");
  }
};

export const getReward = async (userAddress) => {
  const solidityAddress =
    "0x" + AccountId.fromString(userAddress).toSolidityAddress().toString();
  const resp = await fetch(`${url}/reward/${solidityAddress}`).then((r) => {
    r = r.json();
    return r;
  });
  return resp;
};

export const getUserReward = async (userAddress, chainId) => {
  const solidityAddress =
    "0x" + AccountId.fromString(userAddress).toSolidityAddress().toString();
  const resp = await fetch(`${url}/reward/${solidityAddress}/${chainId}`).then(
    (r) => {
      r = r.json();
      return r;
    }
  );
  return resp;
};

export const getUserNFTs = async () => {
  var tmp = {};
  var nftH = [];
  if (JSON.parse(localStorage.getItem("hashconnectData"))) {
    const length = JSON.parse(localStorage.getItem("hashconnectData"))
      .pairingData.length;
    const bal = await fetch(
      `${mirrornode}/api/v1/accounts/${
        JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
          length - 1
        ].accountIds[0]
      }`
    )
      .then((r) => {
        r = r.json();
        return r;
      })
      .then((e) => {
        tmp = { ...tmp, tokens: e.balance.tokens };
      });

    tmp.tokens.forEach((element) => {
      if (element.balance > 0) {
      }
    });
    const tokensHold = await fetch(
      `${mirrornode}/api/v1/accounts/${
        JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
          length - 1
        ].accountIds[0]
      }/nfts?limit=300`
    ).then((r) => {
      r = r.json();
      return r;
    });
    var img = "";
    for (var element of tokensHold.nfts) {
      const processedMetadata = await getNFTImageURI(
        element.token_id,
        element.serial_number
      );

      element.image = processedMetadata.image;
      element.name = processedMetadata.name;
      nftH.push(element);
    }
  }
  return nftH;
};

export const contractSigningFunction = async () => {};

export const associateHederaToken = async (tokenAddress) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const accountId = JSON.parse(localStorage.getItem("hashconnectData"))
    .pairingData[length - 1].accountIds[0];
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  try {
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenAddress])
      .freezeWithSigner(signer);
    const signedTransaction = transaction.executeWithSigner(signer);
  } catch (error) {
    toast.error("Transaction Failed!");
    console.error(error);
  }
};
export const initializeLend = async (
  //bidderPubkey,
  bidPoolIndex,
  bidAmount,
  totalBids,
  chainId,
  referralId,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  const bidder = AccountId.fromString(
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const createBidManagerTransaction = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(500000)
    .setPayableAmount(bidAmount * totalBids)
    .setFunction(
      "addLoanOffer",
      new ContractFunctionParameters()
        // .addAddress(bidder.toSolidityAddress())
        .addUint256(bidAmount * 100000000)
        .addUint256(bidPoolIndex + 1)
        .addUint256(totalBids)
    )
    .freezeWithSigner(signer);

  try {
    const transactionResponse =
      await createBidManagerTransaction.executeWithSigner(signer);
    let transactionQuery = null;
    let transactionReceipt = null;
    let txHash = null;
    if (transactionResponse === undefined) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        createBidManagerTransaction._transactionIds.list[0].toString()
      );
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
      const validStart = transactionQuery._transactionId.validStart;
      const accountCheck = transactionQuery._transactionId.accountId.toString();
      txHash =
        accountCheck +
        "@" +
        validStart.seconds.low +
        "." +
        validStart.nanos.low;
    }
    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      const bidderPubkey = "0x" + bidder.toSolidityAddress().toString();
      if (transactionResponse) {
        txHash = transactionResponse.transactionId;
      }
      await postLoanOffer(
        bidderPubkey,
        bidAmount * 100000000,
        totalBids,
        bidPoolIndex + 1,
        txHash,
        chainId,
        referralId,
        contractAddress
      );
      toast.success("Lend Transaction Successful");
    } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
      toast.error("Lend Transaction Failed");
    }
  } catch (e) {
    console.error(e);
    toast.error("Lend Transaction Failed");
  }
};

export const mintNft = async () => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;

  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  const mintTx = await new TokenMintTransaction()
    .setTokenId("0.0.4594876")
    .setMetadata([
      Buffer.from("QmXmAKtmLkn2QSSjerB8DERLArD7h5N2VdK5efXRHzH4Vp"),
    ])
    .freezeWithSigner(signer);
  let mintTxSign = await mintTx.signWithSigner(signer);
  let mintTxTra = await mintTxSign.executeWithSigner(signer);
  if (mintTxTra) {
    return "SUCCESS";
  }
  return "FAIL";
};

export const borrowLoan = async (
  bidPoolIndex,
  bidManagerIndex,
  tokenID,
  serial_number,
  email,
  chainId,
  referredId,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  try {
    const tx = await new AccountAllowanceApproveTransaction()
      .approveTokenNftAllowanceAllSerials(
        tokenID,
        JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
          length - 1
        ].accountIds[0],
        nativeAddress
      )
      .freezeWithSigner(signer);
    const txres = await tx.executeWithSigner(signer);
    const processLoanTx = await new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "processLoanV2",
        new ContractFunctionParameters()
          .addUint256(bidPoolIndex + 1)
          .addUint256(bidManagerIndex + 1)
          .addUint256(serial_number)
      )
      .freezeWithSigner(signer);
    const signedProcessLoan = await processLoanTx.signWithSigner(signer);

    const transactionResponse = await signedProcessLoan.executeWithSigner(
      signer
    );
    let transactionQuery = null;
    let transactionReceipt = null;
    let txHash = null;
    if (transactionResponse === undefined) {
      for (let i = 0; i < 5; i++) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          processLoanTx._transactionIds.list[0].toString()
        );
        if (transactionQuery) {
          break;
        }
      }
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
      const validStart = transactionQuery._transactionId.validStart;
      const accountCheck = transactionQuery._transactionId.accountId.toString();
      txHash =
        accountCheck +
        "@" +
        validStart.seconds.low +
        "." +
        validStart.nanos.low;
    }

    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      const tokenAddress =
        "0x" + AccountId.fromString(tokenID).toSolidityAddress().toString();
      const initializer =
        "0x" +
        AccountId.fromString(
          JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
            length - 1
          ].accountIds[0]
        )
          .toSolidityAddress()
          .toString();

      if (transactionResponse) {
        txHash = transactionResponse.transactionId;
      }
      await postProcessLoan(
        tokenAddress,
        serial_number,
        bidManagerIndex + 1,
        bidPoolIndex + 1,
        initializer,
        email,
        txHash,
        chainId,
        referredId,
        contractAddress
      );
      toast.success("Loan Borrowed Successful");
    } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
      console.error("failed", transactionReceipt);
      toast.error("Borrow Transaction Failed");
    }
  } catch (e) {
    console.error(e, "borrow ");
    toast.error("Borrow  Transaction Failed");
  }
};

export const cancelOffer = async (
  bidPoolIndex,
  bidManagerIndex,
  chainId,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);

  try {
    const createToken = new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "updateOfferCount",
        new ContractFunctionParameters()
          .addUint256(bidPoolIndex + 1)
          .addUint256(bidManagerIndex + 1)
          .addUint256(0)
      );
    createToken.freezeWithSigner(signer);

    const txResponse = await createToken.executeWithSigner(signer);

    let transactionQuery = null;
    let transactionReceipt = null;
    if (txResponse === undefined) {
      for (let i = 0; i < 5; i++) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          createToken._transactionIds.list[0].toString()
        );
        if (transactionQuery) {
          break;
        }
      }
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
    }

    if (
      txResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      await postCancelOffer(
        bidPoolIndex + 1,
        bidManagerIndex + 1,
        chainId,
        contractAddress
      );
      toast.success("Offer Cancel Successful");
    } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
      toast.error("Transaction Failed");
    }
  } catch (e) {
    toast.error("Transaction Failed");
  }
};

export const repayUserLoan = async (
  tokenAddress,
  tokenId,
  repayment,
  chainId,
  version,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;

  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  try {
    let nftTransfer;
    if (version == "v1") {
      nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setPayableAmount(repayment)
        .setFunction(
          "repayLoan",
          new ContractFunctionParameters()
            .addAddress(tokenAddress)
            .addUint256(tokenId)
        )
        .freezeWithSigner(signer);
    } else {
      nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setPayableAmount(repayment)
        .setFunction(
          "repayLoanV2",
          new ContractFunctionParameters()
            .addAddress(tokenAddress)
            .addUint256(tokenId)
            .addAddress("0x0000000000000000000000000000000000000000")
        )
        .freezeWithSigner(signer);
    }

    const txResponse = await nftTransfer.executeWithSigner(signer);

    let transactionQuery = null;
    let transactionReceipt = null;
    if (txResponse === undefined) {
      for (let i = 0; i < 5; i++) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          nftTransfer._transactionIds.list[0].toString()
        );
        if (transactionQuery) {
          break;
        }
      }
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
    }

    if (
      txResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      await postRepayLoan(tokenAddress, tokenId, chainId, contractAddress);
      toast.success("Loan Repay Successful");
    } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
      toast.error("Transaction Failed");
    }
  } catch (e) {
    console.error(e, "repay error");
    toast.error("Transaction Contract Failed");
  }
};

export const expireUserLoan = async (
  tokenAddress,
  tokenId,
  chainId,
  version,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;

  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);

  try {
    let nftTransfer;
    if (version == "v1") {
      nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setFunction(
          "expireLoan",
          new ContractFunctionParameters()
            .addAddress(tokenAddress)
            .addUint256(tokenId)
        )
        .freezeWithSigner(signer);
    } else {
      nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setFunction(
          "expireLoanV2",
          new ContractFunctionParameters()
            .addAddress(tokenAddress)
            .addUint256(tokenId)
        )
        .freezeWithSigner(signer);
    }
    const txResponse = await nftTransfer.executeWithSigner(signer);
    let transactionQuery = null;
    let transactionReceipt = null;
    if (txResponse === undefined) {
      for (let i = 0; i < 5; i++) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          nftTransfer._transactionIds.list[0].toString()
        );
        if (transactionQuery) {
          break;
        }
      }
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
    }

    if (
      txResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      await postExpireLoan(tokenAddress, tokenId, chainId, contractAddress);
      toast.success("Claim Successful");
    } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
      toast.error("Transaction Failed");
    }
  } catch (e) {
    toast.error("Transaction Failed");
  }
};

export const hederaLendData = async (
  bidPool,
  bidManager,
  collections,
  chainDetail
) => {
  var resp = await bidPool;
  var bidManager = await bidManager;
  let totalLoans = 0;
  collections?.forEach((item) => {
    totalLoans += item.total_loan; // Replace 'loanAmount' with the actual property name
  });
  let totalVolume = 0;
  collections?.forEach((item) => {
    if (item.total_volume != null) {
      totalVolume += Number(item.total_volume);
    }
  });

  resp.forEach((pool) => {
    pool.totalLoans = totalLoans;
    pool.totalVolume = totalVolume;
    pool.bestOffer =
      pool.maxBid / Math.pow(10, chainDetail?.currency_decimal).toFixed(2);
  });

  let sorteddata = await groupBy(resp, "tokenAddress");

  return { sorteddata, bidManager };
};

export const updateOfferAmountHedera = async (
  loanOfferIndex,
  loanPoolIndex,
  updatedOffer,
  difference,
  chainId,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;

  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  try {
    if (difference > 0) {
      const nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setPayableAmount(difference)
        .setFunction(
          "updateOfferAmount",
          new ContractFunctionParameters()
            .addUint256(loanPoolIndex + 1)
            .addUint256(loanOfferIndex + 1)
            .addUint256(updatedOffer * 100000000)
        )
        .freezeWithSigner(signer);

      const txResponse = await nftTransfer.executeWithSigner(signer);
      let transactionQuery = null;
      let transactionReceipt = null;
      if (txResponse === undefined) {
        for (let i = 0; i < 5; i++) {
          transactionQuery = new TransactionReceiptQuery().setTransactionId(
            nftTransfer._transactionIds.list[0].toString()
          );
          if (transactionQuery) {
            break;
          }
        }
      }
      if (transactionQuery) {
        transactionReceipt = await transactionQuery.execute(testClient);
      }
      if (
        txResponse ||
        (transactionReceipt && transactionReceipt.status._code === 22)
      ) {
        await postOfferAmount(
          loanOfferIndex + 1,
          loanPoolIndex + 1,
          updatedOffer * 100000000,
          chainId,
          contractAddress
        );
        toast.success("Offer update Successful");
      } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
        toast.error("Transaction Failed");
      }
    } else {
      const nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setFunction(
          "updateOfferAmount",
          new ContractFunctionParameters()
            .addUint256(loanPoolIndex + 1)
            .addUint256(loanOfferIndex + 1)
            .addUint256(updatedOffer * 100000000)
        )
        .freezeWithSigner(signer);

      const txResponse = await nftTransfer.executeWithSigner(signer);
      let transactionQuery = null;
      let transactionReceipt = null;
      if (txResponse === undefined) {
        for (let i = 0; i < 5; i++) {
          transactionQuery = new TransactionReceiptQuery().setTransactionId(
            nftTransfer._transactionIds.list[0].toString()
          );
          if (transactionQuery) {
            break;
          }
        }
      }
      if (transactionQuery) {
        transactionReceipt = await transactionQuery.execute(testClient);
      }

      if (
        txResponse ||
        (transactionReceipt && transactionReceipt.status._code === 22)
      ) {
        await postOfferAmount(
          loanOfferIndex + 1,
          loanPoolIndex + 1,
          updatedOffer * 100000000,
          chainId,
          contractAddress
        );
        toast.success("Offer update Successful");
      } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
        toast.error("Transaction Failed");
      }
    }
  } catch (e) {
    toast.error("Transaction Failed");
  }
};

export const updateOfferCountHedera = async (
  loanOfferIndex,
  loanPoolIndex,
  updatedOffer,
  difference,
  chainId,
  contractAddress,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;

  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);
  try {
    if (difference > 0) {
      const nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setPayableAmount(difference)
        .setFunction(
          "updateOfferCount",
          new ContractFunctionParameters()
            .addUint256(loanPoolIndex + 1)
            .addUint256(loanOfferIndex + 1)
            .addUint256(updatedOffer)
        )
        .freezeWithSigner(signer);

      const txResponse = await nftTransfer.executeWithSigner(signer);
      let transactionQuery = null;
      let transactionReceipt = null;
      if (txResponse === undefined) {
        for (let i = 0; i < 5; i++) {
          transactionQuery = new TransactionReceiptQuery().setTransactionId(
            nftTransfer._transactionIds.list[0].toString()
          );
          if (transactionQuery) {
            break;
          }
        }
      }
      if (transactionQuery) {
        transactionReceipt = await transactionQuery.execute(testClient);
      }
      if (
        txResponse ||
        (transactionReceipt && transactionReceipt.status._code === 22)
      ) {
        await postOfferCount(
          loanOfferIndex + 1,
          loanPoolIndex + 1,
          updatedOffer,
          chainId,
          contractAddress
        );
        toast.success("Offer update Successful");
      } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
        toast.error("Transaction Failed");
      }
    } else {
      const nftTransfer = await new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setFunction(
          "updateOfferCount",
          new ContractFunctionParameters()
            .addUint256(loanPoolIndex + 1)
            .addUint256(loanOfferIndex + 1)
            .addUint256(updatedOffer)
        )
        .freezeWithSigner(signer);

      const txResponse = await nftTransfer.executeWithSigner(signer);
      let transactionQuery = null;
      let transactionReceipt = null;
      if (txResponse === undefined) {
        for (let i = 0; i < 5; i++) {
          transactionQuery = new TransactionReceiptQuery().setTransactionId(
            nftTransfer._transactionIds.list[0].toString()
          );
          if (transactionQuery) {
            break;
          }
        }
      }
      if (transactionQuery) {
        transactionReceipt = await transactionQuery.execute(testClient);
      }

      if (
        txResponse ||
        (transactionReceipt && transactionReceipt.status._code === 22)
      ) {
        await postOfferCount(
          loanOfferIndex + 1,
          loanPoolIndex + 1,
          updatedOffer,
          chainId,
          contractAddress
        );
        toast.success("Offer update Successful");
      } else if (transactionReceipt && transactionReceipt.status._code !== 22) {
        toast.error("Transaction Failed");
      }
    }
  } catch (e) {
    console.error(e);
    toast.error("Transaction Failed");
  }
};

export const hederaOfferData = async (userID, offers, chainId) => {
  const TID = new TokenId(
    parseInt(userID.split(".")[0]),
    parseInt(userID.split(".")[1]),
    parseInt(userID.split(".")[2])
  ).toSolidityAddress();

  return offers;
};

export const hederaLoanData = async (
  userID,
  collections,
  nftPools,
  chainId,
  chainDetail
) => {
  let TID;
  if (chainId === 295 || chainId === 296) {
    TID = new TokenId(
      parseInt(userID.split(".")[0]),
      parseInt(userID.split(".")[1]),
      parseInt(userID.split(".")[2])
    ).toSolidityAddress();
  }

  let assetData;

  try {
    if (chainId === 295 || chainId === 296) {
      assetData = await indexerAxiosInstance.get(`/assetManager/${chainId}`, {
        params: {
          user: "0x" + TID,
          state: "LOAN",
          expand: true,
        },
      });
    } else {
      assetData = await indexerAxiosInstance.get(`/assetManager/${chainId}`, {
        params: {
          user: userID,
          state: "LOAN",
          expand: true,
        },
      });
    }

    const assets = assetData.data.data; // Adjust based on your response structure
    const response = [];

    for (let userAsset of assets) {
      let interestRateLender, interestRateProtocol, interestR, pool;
      const txLink = chainDetail?.transaction_link + userAsset?.tx_hash;

      if (userAsset?.loan_pool) {
        interestRateLender =
          Number(userAsset.loan_pool.interest_rate_lender) / 1000;
        interestRateProtocol = Number(
          userAsset.loan_pool.interest_rate_protocol
        );
        interestR = parseFloat(
          interestRateLender + (interestRateLender * interestRateProtocol) / 100
        );
        pool = userAsset.loan_pool;
      } else {
        const matchingNftPool = nftPools.find(
          (pool) =>
            pool.tokenAddress === userAsset.token_address &&
            pool.tokenId === userAsset.token_id
        );
        interestRateLender = matchingNftPool?.interestRateLender / 1000;
        interestRateProtocol = matchingNftPool?.interestRateProtocol;
        interestR = parseFloat(
          interestRateLender + (interestRateLender * interestRateProtocol) / 100
        );
        pool = matchingNftPool;
      }

      const expired = userAsset.loan_expiry < Math.floor(Date.now() / 1000);

      const matchingCollection = collections.find(
        (collection) => collection.token_address === userAsset.token_address
      );

      const imageValue = userAsset?.image;
      const nameValue = userAsset?.name === "null" ? null : userAsset?.name;

      const obj = {
        collection_name: matchingCollection?.name,
        collection_logo: matchingCollection?.image,
        isErc1155: matchingCollection?.ERC1155,
        paymentToken: matchingCollection?.payment_token,
        image: imageValue,
        name: nameValue,
        hederaAddress: matchingCollection?.hedera_account,
        borrow_amount:
          Number(userAsset?.loan_amount) /
          Math.pow(10, chainDetail?.currency_decimal),
        apy: pool?.apy ? Math.round(Number(pool?.apy) * 100) / 100 : 240,
        repayment:
          (Number(userAsset?.loan_amount) +
            (Number(userAsset?.loan_amount) * Number(interestR)) / 100) /
          Math.pow(10, chainDetail?.currency_decimal),
        btnVal: "Repay",
        mint: userAsset.token_address,
        mintID: userAsset.token_id,
        loan: userAsset,
        bidPool: pool,
        floor: matchingCollection?.floor ?? "",
        expired: expired,
        txLink,
        version: userAsset.version,
      };
      response.push(obj);
    }
    return response;
  } catch (error) {
    console.error("Error in hederaLoanData:", error);
    throw new Error("Failed to fetch loan data");
  }
};

export const hederaRequestOffer = async (
  tokenId,
  serial_number,
  loanDurationInMinutes,
  interestRateLender,
  bidAmount,
  chainId,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);

  const tx = await new AccountAllowanceApproveTransaction()
    .approveTokenNftAllowanceAllSerials(
      tokenId, //tokenID
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
        length - 1
      ].accountIds[0],
      nativeAddress
    )
    .freezeWithSigner(signer);

  const txres = await tx.executeWithSigner(signer);
  const tid = new TokenId(
    parseInt(tokenId.split(".")[0]),
    parseInt(tokenId.split(".")[1]),
    parseInt(tokenId.split(".")[2])
  ).toSolidityAddress();

  const TID = "0x" + tid;
  const processBorrow = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(500000)
    .setFunction(
      "createNFTPool",
      new ContractFunctionParameters()
        .addAddress(TID)
        .addUint256(serial_number)
        .addUint256(loanDurationInMinutes.toFixed(0))
        .addUint256(interestRateLender)
        .addUint256(bidAmount)
    )
    .freezeWithSigner(signer);

  const signedProcessBorrow = await processBorrow.signWithSigner(signer);

  const txResponse = await signedProcessBorrow.executeWithSigner(signer);

  let transactionQuery = null;
  let txHash = null;

  let transactionReceipt = null;
  if (txResponse === undefined) {
    for (let i = 0; i < 5; i++) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        signedProcessBorrow._transactionIds.list[0].toString()
      );
      if (transactionQuery) {
        break;
      }
    }
  }
  if (transactionQuery) {
    transactionReceipt = await transactionQuery.execute(testClient);
    const validStart = transactionQuery._transactionId.validStart;
    const accountCheck = transactionQuery._transactionId.accountId.toString();
    txHash =
      accountCheck + "@" + validStart.seconds.low + "." + validStart.nanos.low;
  }
  if (
    txResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    if (txResponse) {
      txHash = txResponse.transactionId;
    }
    await postRequestOffer(
      TID,
      Number(loanDurationInMinutes.toFixed(0)),
      interestRateLender,
      serial_number,
      bidAmount,
      chainId,
      txHash
    );
  }
};

export const postRequestOffer = async (
  tokenAddress,
  loanDurationInMinutes,
  interestRateLender,
  token_id,
  bidAmount,
  chainId,
  txHash
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const initializer =
    "0x" +
    AccountId.fromString(
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
        length - 1
      ].accountIds[0]
    )
      .toSolidityAddress()
      .toString();

  const data = {
    userWallet: initializer,
    tokenAddress: tokenAddress,
    tokenId: token_id,
    loanDurationMinutes: loanDurationInMinutes,
    interestRateLender: interestRateLender,
    interestRateProtocol: 0,
    bidAmount: bidAmount,
    chainId: chainId,
    txHash: txHash,
  };

  try {
    const res = await fetch(`${url}/nftPool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Error in nftPool:", error);
  }
};

export const hederaProposedOffer = async (bidAmount, nftPoolId, chainId) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const initializer =
    "0x" +
    AccountId.fromString(
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
        length - 1
      ].accountIds[0]
    )
      .toSolidityAddress()
      .toString();

  const data = {
    wallet: initializer,
    chainId: chainId,
    amount: bidAmount,
    nftPoolId: nftPoolId,
  };

  try {
    const res = await fetch(`${url}/proposeOffer`, {
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

export const hederaAcceptOffer = async (
  tokenAddress,
  tokenId,
  loanAmount,
  chainId,
  loanExpiry,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);

  const initializer =
    "0x" +
    AccountId.fromString(
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
        length - 1
      ].accountIds[0]
    )
      .toSolidityAddress()
      .toString();

  const processAccept = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(500000)
    .setPayableAmount(String(loanAmount / 100000000))
    .setFunction(
      "acceptOffer",
      new ContractFunctionParameters()
        .addAddress(tokenAddress)
        .addUint256(tokenId)
    )
    .freezeWithSigner(signer);

  const signedProcessAccept = await processAccept.signWithSigner(signer);

  const txResponse = await signedProcessAccept.executeWithSigner(signer);

  let transactionQuery = null;

  let transactionReceipt = null;
  let txHash = null;

  if (txResponse === undefined) {
    for (let i = 0; i < 5; i++) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        signedProcessAccept._transactionIds.list[0].toString()
      );
      if (transactionQuery) {
        break;
      }
    }
  }
  if (transactionQuery) {
    transactionReceipt = await transactionQuery.execute(testClient);
    const validStart = transactionQuery._transactionId.validStart;
    const accountCheck = transactionQuery._transactionId.accountId.toString();
    txHash =
      accountCheck + "@" + validStart.seconds.low + "." + validStart.nanos.low;
  }
  if (
    txResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    if (txResponse) {
      txHash = txResponse.transactionId;
    }
    await postAcceptNFTOffer(
      tokenAddress,
      tokenId,
      loanAmount,
      initializer,
      chainId,
      loanExpiry,
      txHash
    );
  }
};

export const hederaCancelOffer = async (
  tokenAddress,
  tokenId,
  chainId,
  nativeAddress
) => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  const provider = hashconnect.getProvider(
    networkType,
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    JSON.parse(localStorage.getItem("hashconnectData")).pairingData[length - 1]
      .accountIds[0]
  );
  const signer = hashconnect.getSigner(provider);

  try {
    const processCancel = await new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "removeNFTPool",
        new ContractFunctionParameters()
          .addAddress(tokenAddress)
          .addUint256(tokenId)
      )
      .freezeWithSigner(signer);

    const signedProcessCancel = await processCancel.signWithSigner(signer);

    const txResponse = await signedProcessCancel.executeWithSigner(signer);

    let transactionQuery = null;

    let transactionReceipt = null;
    if (txResponse === undefined) {
      for (let i = 0; i < 5; i++) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          signedProcessCancel._transactionIds.list[0].toString()
        );
        if (transactionQuery) {
          break;
        }
      }
    }
    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(testClient);
    }
    if (
      txResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      await deleteNftPool(tokenAddress, tokenId, chainId);
    }
  } catch (e) {
    console.error(e, "error");
  }
};

export const fetchNFTsForCollections = async (chainId) => {
  let allNFTs = [];

  const collectionArray = await getCollectionArray(chainId);

  async function fetchNFTsForToken(tokenId) {
    try {
      const nftH = [];
      const length = JSON.parse(localStorage.getItem("hashconnectData"))
        .pairingData.length;
      const response = await fetch(
        `${mirrornode}/api/v1/accounts/${
          JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
            length - 1
          ].accountIds[0]
        }/nfts/?token.id=${tokenId}`
      );
      const data = await response.json();
      for (var element of data.nfts) {
        const processedMetadata = await getNFTImageURI(
          element.token_id,
          element.serial_number
        );

        element.image = processedMetadata.image;
        element.name = processedMetadata.name;
        nftH.push(element);
      }
      return nftH || [];
    } catch (error) {
      console.error("Error fetching NFTs for token", tokenId, ":", error);
      return [];
    }
  }

  // Loop through each collection/token ID
  for (const tokenId of collectionArray.data) {
    const nfts = await fetchNFTsForToken(tokenId.hedera_account);

    allNFTs = [...allNFTs, ...nfts];
  }

  return allNFTs;
};

export const removeDeci = (num) => {
  try {
    if (Number.isInteger(Number(num))) {
      return Number(num);
    } else {
      return Number(Number(num)?.toFixed(7));
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
    return num;
  }
};

export const getSolidityAddress = () => {
  const length = JSON.parse(localStorage.getItem("hashconnectData"))
    ?.pairingData.length;
  if (length > 0) {
    const userAddress = `0x + ${AccountId.fromString(
      JSON.parse(localStorage.getItem("hashconnectData"))?.pairingData[
        length - 1
      ]?.accountIds[0]
    )
      .toSolidityAddress()
      .toString()}`;

    return userAddress;
  }
  return null;
};

export const lendTokenHedera = async (
  nftAddress,
  userAddress,
  tokenId,
  ratePerMinute,
  validityMinutes,
  isFixed,
  fixedMinute,
  ownerShare,
  chainId,
  accountId,
  referredId,
  contractAddress,
  nativeAddress
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);

  // Approve NFT allowance
  const tx = await new AccountAllowanceApproveTransaction()
    .approveTokenNftAllowanceAllSerials(nftAddress, accountId, nativeAddress)
    .freezeWithSigner(signer);
  await tx.executeWithSigner(signer);

  const ratePerMinuteInt = Math.round(Number(ratePerMinute) * 100000000); // Convert to tinyHbar
  const _NFTAddress =
    "0x" + AccountId.fromString(nftAddress).toSolidityAddress();

  // Execute lend token transaction
  const lendTokenTxn = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(250000)
    .setFunction(
      "lendToken",
      new ContractFunctionParameters()
        .addAddress(_NFTAddress) // NFT address
        .addUint256(Number(tokenId)) // NFT Serial Number
        .addUint256(Number(ratePerMinuteInt)) // Rate per minute
        .addUint256(Number(validityMinutes)) // Validity Minutes
        .addBool(isFixed) // isFixed
        .addUint256(Number(fixedMinute)) // Fixed minutes if that option was chosen, else 0
        .addUint256(Number(ownerShare)) // Owner Share
        .addBytes32("0x000000000000000000000000000000")
    );

  lendTokenTxn.freezeWithSigner(signer);
  const transactionResponse = await lendTokenTxn.executeWithSigner(signer);

  let transactionReceipt = null;

  // Check transaction status
  if (transactionResponse) {
    const transactionId = lendTokenTxn._transactionIds.list[0].toString();
    const transactionQuery = new TransactionReceiptQuery().setTransactionId(
      transactionId
    );
    transactionReceipt = await transactionQuery.execute(mainClient);
  }

  // If successful, write to database
  if (
    transactionResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    const jsonBody = {
      assetManagerData: {
        chainId,
        contractAddress,
        tokenAddress: _NFTAddress,
        tokenId,
      },
      rentStateData: {
        rate: ratePerMinuteInt,
        validityMinutes,
        isFixed,
        fixedMinutes: fixedMinute,
        privateRental: false,
        doMint: false,
        ownerShare,
        referredId,
        initializer: `0x${AccountId.fromString(
          userAddress
        ).toSolidityAddress()}`,
      },
    };

    try {
      const writeDBResponse = await indexerAxiosInstance.post(
        "/listRent",
        jsonBody
      );
      return "SUCCESS";
    } catch (error) {
      console.error("Error writing to database:", error);
      return "Failed to write to database";
    }
  }

  return "Failed";
};

export const processHederaRent = async (
  nftAddress,
  tokenId,
  payableAmount,
  durationInMinute,
  chainId,
  accountId,
  referredId,
  contractAddress,
  nativeAddress
) => {
  const streamConfig = await getStreamConfig(chainId, env);
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const userAddress = `0x${AccountId.fromString(
    accountId
  ).toSolidityAddress()}`;
  const signer = hashconnect.getSigner(provider);

  const pay = payableAmount + Number(streamConfig.withdrawFee) / 100000000;

  // Prepare and execute the rent NFT transaction
  const rentNFTTxn = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(250000)
    .setPayableAmount(pay.toFixed(8))
    .setFunction(
      "processRent",
      new ContractFunctionParameters()
        .addAddress(nftAddress)
        .addUint256(Number(tokenId))
        .addUint256(Number(durationInMinute))
        .addAddress("0x0000000000000000000000000000000000000000") // Placeholder address
        .addBytes32Array(["0x000000000000000000000000000000"]) // Placeholder bytes32 array
    );

  rentNFTTxn.freezeWithSigner(signer);
  const transactionResponse = await rentNFTTxn.executeWithSigner(signer);

  let transactionReceipt = null;

  // Check transaction status
  if (transactionResponse) {
    const transactionId = rentNFTTxn._transactionIds.list[0].toString();
    const transactionQuery = new TransactionReceiptQuery().setTransactionId(
      transactionId
    );
    transactionReceipt = await transactionQuery.execute(mainClient);
  }

  // If successful, write to the database
  if (
    transactionResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    const jsonBody = {
      assetManagerData: {
        chainId,
        contractAddress,
        tokenAddress: `0x${AccountId.fromString(
          nftAddress
        ).toSolidityAddress()}`,
        tokenId,
      },
      rentStateData: {
        rentee: userAddress,
        durationInMinute,
        referredId,
      },
    };

    try {
      const writeDBResponse = await indexerAxiosInstance.post(
        "/processRent",
        jsonBody
      );
      return "SUCCESS"; // Successfully wrote to the database
    } catch (error) {
      console.error("Error writing to database:", error);
      return "Failed to write to database"; // Error occurred during the database write
    }
  }

  return "Failed"; // Transaction failed
};

export const expireHederaRent = async (
  nftAddress,
  tokenId,
  chainId,
  accountId,
  contractAddress,
  nativeAddress
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);

  const _NFTAddress = `0x${AccountId.fromString(
    nftAddress
  ).toSolidityAddress()}`;

  // Prepare the expire rent transaction
  const expireRentTxn = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(250000)
    .setFunction(
      "expireRent",
      new ContractFunctionParameters()
        .addAddress(_NFTAddress)
        .addUint256(Number(tokenId))
    )
    .freezeWithSigner(signer);

  // Execute the expire rent transaction
  const transactionResponse = await expireRentTxn.executeWithSigner(signer);

  let transactionQuery = null;
  let transactionReceipt = null;

  // Check transaction status
  if (transactionResponse === undefined) {
    const transactionId = expireRentTxn._transactionIds.list[0].toString();
    transactionQuery = new TransactionReceiptQuery().setTransactionId(
      transactionId
    );
  }

  // Execute transaction query if needed
  if (transactionQuery) {
    transactionReceipt = await transactionQuery.execute(mainClient);
  }

  // Check for success
  if (
    transactionResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    const jsonBody = {
      assetManagerData: {
        chainId,
        contractAddress,
        tokenAddress: _NFTAddress,
        tokenId: Number(tokenId),
      },
    };

    // Make API call using indexerAxiosInstance
    try {
      const writeDBResponse = await indexerAxiosInstance.post(
        "/expireRent",
        jsonBody
      );
      return "SUCCESS"; // Successfully wrote to the database
    } catch (error) {
      console.error("Error writing to database:", error);
      return "Failed to write to database"; // Error occurred during the database write
    }
  }

  return "Failed"; // Transaction failed
};

export const cancelHederaRent = async (
  nftAddress,
  tokenId,
  chainId,
  accountId,
  contractAddress,
  nativeAddress
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);
  const _NFTAddress = `0x${AccountId.fromString(
    nftAddress
  ).toSolidityAddress()}`;

  const cancelToken = await new ContractExecuteTransaction()
    .setContractId(nativeAddress)
    .setGas(250000)
    .setFunction(
      "cancelLendToken",
      new ContractFunctionParameters()
        .addAddress(_NFTAddress)
        .addUint256(Number(tokenId))
    )
    .freezeWithSigner(signer);

  const transactionResponse = await cancelToken.executeWithSigner(signer);

  let transactionQuery = null;
  let transactionReceipt = null;

  if (transactionResponse === undefined) {
    const transactionId = cancelToken._transactionIds.list[0].toString();
    transactionQuery = new TransactionReceiptQuery().setTransactionId(
      transactionId
    );
  }

  if (transactionQuery) {
    transactionReceipt = await transactionQuery.execute(mainClient);
  }

  if (
    transactionResponse ||
    (transactionReceipt && transactionReceipt.status._code === 22)
  ) {
    const jsonBody = {
      assetManagerData: {
        chainId,
        contractAddress,
        tokenAddress: _NFTAddress,
        tokenId: Number(tokenId),
      },
    };

    try {
      const writeDBResponse = await indexerAxiosInstance.post(
        "/cancelRent",
        jsonBody
      );
      return "SUCCESS";
    } catch (error) {
      console.error("Error writing to database:", error);
      return "Failed";
    }
  }

  return "Failed";
};

export const getUserNftByCollection = async (tokenid, accountId) => {
  var nftH = [];
  if (accountId !== null) {
    const response = await fetch(
      `${mirrornode}/api/v1/accounts/${accountId}/nfts/?token.id=${tokenid}`
    );
    const data = await response.json();
    if (data.length != 0) {
      nftH = await Promise.all(
        data.nfts.map(async (nft) => {
          const NFTImageURI = await getNFTImageURI(
            nft.token_id,
            nft.serial_number
          );
          nft.image = NFTImageURI.image;
          nft.name = NFTImageURI.name;
          nft.tokenId = nft.serial_number;
          nft.metadata_link = NFTImageURI.metadata_link;
          return nft;
        })
      );
    }
  }
  return nftH;
};
