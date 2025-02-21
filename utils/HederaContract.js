import { HashConnect } from "hashconnect";
import {
  AccountId,
  Client,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  PrivateKey,
  ContractCallQuery,
  Hbar,
  TransactionReceiptQuery,
  TransferTransaction,
  PublicKey,
} from "@hashgraph/sdk";
import { leafNodes, merkleTree } from "./merkleTreeHelper";

export const hashconnect = new HashConnect(true);

export const networkType = "testnet";
const mainClient = Client.forTestnet();
export const env = "dev";
export const nativeAddress = "0.0.4501371";

const UtilityType = {
  NFT_BENEFIT: 0,
  GIVEAWAY: 1,
};

const ExpiryType = {
  NONE: 0,
  TIME_BASED: 1,
  DATE_BASED: 2,
};

const UsageType = {
  UNLIMITED: 0,
  LIMITED: 1,
};

const SELECTION = {
  ALL: 0,
  RAFFLE: 1,
};

const RECEIPT = {
  NONE: 0,
  MINT_TOKEN: 1,
  EXTERNAL_721: 2,
  HTS_TOKEN: 3,
  ERC20: 4,
  EXTERNAL_1155: 5,
};

const privateKeyStr =
  "3030020100300706052b8104000a042204204902486a8ffe174641942ac4e6717a412781ce8cce05b11b1a97ee399976c683";
const privateKey = PrivateKey.fromString(privateKeyStr);

let appMetadata = {
  name: "Stream NFT",
  description: "Platform to Loan/Borrow NFT.",
  uri: "https://utility-personal.vercel.app",
};

let savedData = {
  topic: "",
  pairingStatus: "",
  privateKey: "",
  publicKey: "",
  pairedWalletData: null,
  accountIds: [],
};

let savedDataTemplate = {
  topic: "",
  pairingStatus: "",
  privateKey: "",
  publicKey: "",
  pairedWalletData: null,
  accountIds: [],
};

export const hashapackPairingData = () => {
  const length = JSON.parse(localStorage.getItem("hashconnectData")).pairingData
    .length;
  return JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
    length - 1
  ];
};

export const hederaData = async () => {
  return savedData;
};
export const initHashpack = async () => {
  const initData = await hashconnect.init(appMetadata, "testnet", false);
};
export const pairHashpack = async () => {
  await initHashpack();
  hashconnect.findLocalWallets();
  hashconnect.foundExtensionEvent.once((extensionMetadata) => {
    hashconnect.connectToLocalWallet();
  });
  localStorage.setItem("connected", 1);
  //setConnected(true);
  hashconnect.pairingEvent.once(async (pairingData) => {
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
  savedData = { ...savedDataTemplate };
};

export const checkPairing = () => {
  return hashconnect.hcData.pairingData.length > 0;
};

export const sendHbar = async (recipientAccountId, accountId, signer) => {
  const transaction = new TransferTransaction()
    .addHbarTransfer(accountId, new Hbar(-0.0004))
    .addHbarTransfer(recipientAccountId, new Hbar(0.0004))
    .freezeWithSigner(signer);

  const txResponse = (await transaction).executeWithSigner(signer);

  return txResponse;
};

export const signMessage = async (message, accountId) => {
  const signatures = await hashconnect.sign(
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId,
    message
  );

  return signatures;
};

export const authenticateUser = async () => {
  try {
    const payload = {
      url: "localhost:3000",
      data: {
        token: "fufhr9e84f98fc98fhwo9e8f383098fhjw3of",
      },
    };

    const response = await fetch("http://localhost:5001/login/sendAuth");
    if (!response.ok)
      throw new Error(`Network response was not ok: ${response.statusText}`);

    const authResponse = await response.json();

    const serverSigAsBuffer = Buffer.from(
      Object.values(authResponse.serverSignature)
    );

    const hashconnectData = localStorage.getItem("hashconnectData");
    if (!hashconnectData)
      throw new Error("No hashconnect data found in localStorage");

    const { topic, pairingData } = JSON.parse(hashconnectData);
    const accountId = pairingData[pairingData.length - 1]?.accountIds[0];
    if (!accountId) throw new Error("No account ID found in pairing data");

    const auth = await hashconnect.authenticate(
      topic,
      accountId,
      authResponse.serverSigningAccount,
      serverSigAsBuffer,
      payload
    );

    const receiveAuthData = {
      signingAccount: accountId,
      auth,
    };

    const response2 = await fetch("http://localhost:5001/login/receiveAuth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(receiveAuthData),
    });

    if (!response2.ok)
      throw new Error(`Network response was not ok: ${response2.statusText}`);

    const data = await response2.json();

    if (data) {
      localStorage.setItem("token", data?.token);
      localStorage.setItem("refreshToken", data?.refreshToken);
    } else {
      throw new Error("Token generation failed");
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
};

export const getUserBalance = async () => {
  if (localStorage.getItem("hashconnectData")) {
    const length = JSON.parse(localStorage.getItem("hashconnectData"))
      .pairingData.length;
    const bal = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${
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
        return parseFloat(e.balance.balance / 100000000).toFixed(2);
      });

    return bal;
  }
  return null;
};

export function getEvmAddress(accountId) {
  return `0x${AccountId.fromString(accountId).toSolidityAddress().toString()}`;
}

export const createHederaUtility = async (
  reward,
  chainId,
  accountId,
  collectionId
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);

  // const utilityType = getEnumValueFromString(reward?.expiringConditions);

  const expiryType =
    reward?.expiringConditions === "time_based"
      ? ExpiryType.TIME_BASED
      : reward?.expiringConditions === "date_based"
      ? ExpiryType.DATE_BASED
      : ExpiryType.NONE;

  const userAddress = getEvmAddress(accountId);

  const rewardParam = reward?.completeRewardData;

  let total = 0;

  if (rewardParam?.estimatedValue && rewardParam?.count) {
    total = Number(rewardParam?.estimatedValue) * Number(rewardParam?.count);
  }

  const utilityParams = {
    provider: userAddress,
    usage: {
      expiry:
        reward?.expiringConditions === "time_based"
          ? Math.floor(Number(reward?.rewardExpiry) * 24 * 60 * 60)
          : reward?.expiringConditions === "date_based"
          ? Math.floor(new Date(reward?.raffleEndDate).getTime() / 1000)
          : 0,
      usageType:
        reward?.expiringConditions === "use_based"
          ? UsageType.LIMITED
          : UsageType.UNLIMITED,
      usage: Number(reward?.rewardUseCount) || 0,
      expiryType: expiryType,
    },
    offerExpiry: Math.floor(new Date(reward.raffleEndDate).getTime() / 1000),

    raffle: {
      startTime: Math.floor(new Date(reward.raffleStartDate).getTime() / 1000),
      endTime: Math.floor(new Date(reward.raffleEndDate).getTime() / 1000),
      tokenId: 0,
      ended: false,
      winnersMerkle: "0x000000000000000000000000000000",
    },
    reward: {
      receipt:
        rewardParam?.type === "ft"
          ? RECEIPT.ERC20
          : rewardParam?.type === "nft"
          ? RECEIPT.EXTERNAL_721
          : RECEIPT.NONE,
      tokenAddress: userAddress,
      tokenId: 0,
      totalAmount: total,
      amountPerWin: rewardParam?.estimatedValue
        ? BigInt(rewardParam?.estimatedValue)
        : 0,
      noOfWinners: rewardParam?.count ? BigInt(rewardParam?.count) : 0,
    },
    partner: userAddress,
    selection: reward?.campaignMethod,
    benefitCollection: collectionId,
    utilityUri: "",
  };

  const params = new ContractFunctionParameters()
    .addAddress(userAddress)
    .addUint256(Number(utilityParams.expiryType))
    .addUint256(utilityParams.expiry)
    .addUint256(Number(utilityParams.usageType))
    .addUint256(utilityParams.usage)
    .addUint256(utilityParams.offerExpiry)
    .addUint256(Number(utilityParams.raffle.startTime))
    .addUint256(Number(utilityParams.raffle.endTime))
    .addUint256(Number(utilityParams.raffle.tokenId))
    .addBool(utilityParams.raffle.ended)
    .addBytes32(utilityParams.raffle.winnersMerkle)
    .addAddress(utilityParams.partner)
    .addUint256(Number(utilityParams.selection))
    .addUint256(Number(utilityParams.reward.receipt))
    .addAddress(utilityParams.reward.tokenAddress)
    .addUint256(Number(utilityParams.reward.tokenId))
    .addUint256(Number(utilityParams.reward.totalAmount))
    .addUint256(Number(utilityParams.reward.amountPerWin))
    .addUint256(Number(utilityParams.reward.noOfWinners))
    .addAddress(utilityParams.benefitCollection)
    .addString(utilityParams.utilityUri)
    .addUint256(Number(chainId));

  try {
    const createUtilityTxn = new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction("createUtility", params)
      .setMaxTransactionFee(new Hbar(200));

    createUtilityTxn.freezeWithSigner(signer);

    const transactionResponse = await createUtilityTxn.executeWithSigner(
      signer
    );

    let transactionQuery = null;
    let transactionReceipt = null;
    if (transactionResponse === undefined) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        createUtilityTxn._transactionIds.list[0].toString()
      );
    }

    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(mainClient);
    }

    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      const index = await getIndex(chainId, signer);
      return {
        success: true,
        transactionHash: transactionResponse?.transactionHash,
        index: index,
      };
    }

    return {
      success: false,
      message: "Transaction failed",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

const getIndex = async (chainId, signer) => {
  let functionResultQuery = new ContractCallQuery()
    .setContractId("0.0.4501371")
    .setGas(150000)
    .setFunction(
      "getUtilityIndex",
      new ContractFunctionParameters().addUint256(Number(chainId))
    )
    .setQueryPayment(new Hbar(4));

  const queryResponse = await functionResultQuery.executeWithSigner(signer);

  const index = queryResponse.getUint256(0);

  return index.toNumber();
};

export const joinHederaRaffle = async (utilityId, chainId, accountId) => {
  try {
    const provider = hashconnect.getProvider(
      "testnet",
      JSON.parse(localStorage.getItem("hashconnectData")).topic,
      accountId
    );
    const signer = hashconnect.getSigner(provider);

    const recipientAccountId = "0.0.4485720";

    const userAddress = getEvmAddress(accountId);

    const transaction = await sendHbar(recipientAccountId, accountId, signer);

    if (transaction) {
      const joinRaffleTxn = new ContractExecuteTransaction()
        .setContractId(nativeAddress)
        .setGas(500000)
        .setFunction(
          "joinRaffle",
          new ContractFunctionParameters()
            .addUint256(Number(utilityId))
            .addAddress(userAddress)
            .addUint256(Number(chainId))
        );

      const hederaClient = Client.forTestnet();
      hederaClient.setOperator(AccountId.fromString("0.0.2156963"), privateKey);

      const signedJoinRaffleTxn = await joinRaffleTxn
        .freezeWith(hederaClient)
        .signWithOperator(hederaClient);

      const transactionResponse = await signedJoinRaffleTxn.execute(
        hederaClient
      );

      let transactionQuery = null;
      let transactionReceipt = null;

      if (!transactionResponse) {
        transactionQuery = new TransactionReceiptQuery().setTransactionId(
          signedJoinRaffleTxn._transactionIds.list[0].toString()
        );
        transactionReceipt = await transactionQuery.execute(hederaClient);
      }

      if (
        transactionResponse ||
        (transactionReceipt && transactionReceipt.status._code === 22)
      ) {
        return {
          success: true,
          transactionHash: transactionResponse?.transactionHash,
          transactionResponse,
        };
      } else {
        return {
          success: false,
          message: "Join raffle transaction failed",
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const claimHederaUtility = async (
  tokenId,
  utilityId,
  chainId,
  accountId
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);

  const proof = merkleTree.getHexProof(leafNodes[0]);
  const userAddress = getEvmAddress(accountId);

  try {
    const claimTxn = new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "claimUtility",
        new ContractFunctionParameters()
          .addUint256(Number(tokenId))
          .addUint256(Number(utilityId))
          .addAddress(userAddress)
          .addBytes32(proof)
          .addUint256(Number(chainId))
      );

    claimTxn.freezeWithSigner(signer);
    const transactionResponse = await claimTxn.executeWithSigner(signer);

    let transactionQuery = null;
    let transactionReceipt = null;
    if (transactionResponse === undefined) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        claimTxn._transactionIds.list[0].toString()
      );
    }

    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(mainClient);
    }

    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      return {
        success: true,
        transactionHash: transactionResponse?.transactionHash,
        transactionResponse,
      };
    }

    return {
      success: false,
      message: "Transaction failed",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const redeemHederaUtility = async (
  tokenId,
  utilityId,
  chainId,
  accountId
) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);

  try {
    const redeemTxn = new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "redeemUtility",
        new ContractFunctionParameters()
          .addUint256(Number(tokenId))
          .addUint256(Number(utilityId))
          .addUint256(Number(chainId))
      );

    redeemTxn.freezeWithSigner(signer);
    const transactionResponse = await redeemTxn.executeWithSigner(signer);

    let transactionQuery = null;
    let transactionReceipt = null;
    if (transactionResponse === undefined) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        redeemTxn._transactionIds.list[0].toString()
      );
    }

    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(mainClient);
    }

    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      return {
        success: true,
        transactionHash: transactionResponse?.transactionHash,
        transactionResponse,
      };
    }

    return {
      success: false,
      message: "Transaction failed",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const claimHederaReward = async (offerId, chainId, accountId) => {
  const provider = hashconnect.getProvider(
    "testnet",
    JSON.parse(localStorage.getItem("hashconnectData")).topic,
    accountId
  );
  const signer = hashconnect.getSigner(provider);
  const proof = merkleTree.getHexProof(leafNodes[0]);
  const userAddress = getEvmAddress(accountId);

  try {
    const claimRewardTxn = new ContractExecuteTransaction()
      .setContractId(nativeAddress)
      .setGas(500000)
      .setFunction(
        "claimReward",
        new ContractFunctionParameters()
          .addUint256(Number(offerId))
          .addBytes32(proof)
          .addUint256(Number(chainId))
          .addAddress(userAddress)
      );

    claimRewardTxn.freezeWithSigner(signer);
    const transactionResponse = await claimRewardTxn.executeWithSigner(signer);

    let transactionQuery = null;
    let transactionReceipt = null;
    if (transactionResponse === undefined) {
      transactionQuery = new TransactionReceiptQuery().setTransactionId(
        claimRewardTxn._transactionIds.list[0].toString()
      );
    }

    if (transactionQuery) {
      transactionReceipt = await transactionQuery.execute(mainClient);
    }

    if (
      transactionResponse ||
      (transactionReceipt && transactionReceipt.status._code === 22)
    ) {
      return {
        success: true,
        transactionHash: transactionResponse?.transactionHash,
        transactionResponse,
      };
    }

    return {
      success: false,
      message: "Transaction failed",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
