import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  BN,
  BorshCoder,
} from "@project-serum/anchor";
import { IDL } from "../../types/streammoney_nft.ts";
import { programs } from "@metaplex/js";
import {
  Metadata,
  MasterEdition,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import { getMinutes, getRate, url } from "@/utils/common.js";
import { toast } from "react-toastify";
import { PROGRAM_ID } from "streamnft-sol-test/build/constants.js";
import { ethers } from "ethers";
import { indexerAxiosInstance, scoreAxiosInstance } from "../axios.js";

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

async function getProvider(wallet) {
  try {
    const opts = {
      preflightCommitment: "processed",
    };
    const network = "https://api.devnet.solana.com/";
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      wallet,
      opts.preflightCommitment
    );
    return provider;
  } catch (e) {
    console.error(e);
    toast.error(e.message);
  }
}

export const getProgramId = () => {
  return new PublicKey(PROGRAM_ID);
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



export const solanaPostList = async (
  tokenAddress,
  tokenId,
  ratePerMinute,
  offerTime,
  isFixed,
  fixedTime,
  ownershare,
  whitelist,
  chainSelection,
  contractAddress,
  referredId,
  userAddress,
  txnHash
) => {
  try {
    const jsonBody = {
      assetManagerData: {
        chainId: chainSelection,
        contractAddress: contractAddress,
        tokenAddress: tokenAddress,
        tokenId: tokenId,
        masterIndex: "0",
      },
      rentStateData: {
        rate: Number(ratePerMinute),
        validityMinutes: offerTime,
        isFixed: isFixed,
        fixedMinutes: fixedTime,
        privateRental: false,
        whitelistJson: whitelist,
        doMint: false,
        ownerShare: ownershare,
        initializer: userAddress,
        referredId: referredId,
      },
      type: "SOL",
      indexList: [],
      assetsCount: 1,
      txnHash,
    };

    const writeDBResponse = await indexerAxiosInstance.post('/listRent', jsonBody);

    if (!writeDBResponse.data) {
      throw new Error('Failed to write to DB: No response data');
    }

    return writeDBResponse.data; 
  } catch (error) {
    console.error("An error occurred:", error);
    throw new Error("Transaction Failed");
  }
};

export const solanaProcessRent = async (
  tokenAddress,
  tokenId,
  durationInMint,
  chainSelection,
  contractAddress,
  referredId,
  userAddress,
  index,
  initializer,
  txnHash
) => {
  try {
    if (!index) {
      index = 0;
    }

    const jsonBody = {
      assetManagerData: {
        chainId: chainSelection,
        contractAddress: contractAddress,
        tokenAddress: tokenAddress,
        tokenId: tokenId,
        initializer: initializer,
        index: Number(index),
      },
      rentStateData: {
        rentee: userAddress,
        durationInMinute: durationInMint,
        referredId: referredId,
      },
      txnHash,
    };

    const writeDBResponse = await indexerAxiosInstance.post('/processRent', jsonBody);

    if (!writeDBResponse.data) {
      throw new Error('Failed to write to DB: No response data');
    }
    
    return writeDBResponse.data; // Optionally return the response data
  } catch (error) {
    console.error("Error in processEvmRent:", error);
    throw new Error("Transaction Failed");
  }
};

export const solanaCancelRent = async (nftmint, collection, initializer) => {
  try {
    const response = await fetch(
      `${url}/solana/cancelRent/${nftmint}/${PROGRAM_ID}/${collection}/${initializer}`
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel rent: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error in solanaCancelRent:", {
      nftmint,
      collection,
      initializer,
      error: error.message,
    });
    throw error;
  }
};

export const solanaExpireRent = async (nftmint) => {
  await fetch(`${url}/solana/expireRent/${nftmint}/${PROGRAM_ID}`);
};

export const withdraw = async (wallet, mintId) => {
  try {
    const provider = await getProvider(wallet);
    const programID = getProgramId();
    const program = new Program(IDL, programID, provider);
    const nftMint = new PublicKey(mintId);
    const initializerMainAccount = wallet;

    const [assetManager, _nounce] = await web3.PublicKey.findProgramAddress(
      [nftMint.toBuffer()],
      program.programId
    );
    /*const takerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      initializerMainAccount.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );*/
    let escrowData = await program.account.assetManager.fetch(assetManager);

    const takerTokenAccount = escrowData.holderTokenAccount;
    const masterEditionId = await MasterEdition.getPDA(nftMint);
    try {
      let tx = await program.methods
        .expireRent()
        .accounts({
          withdrawer: wallet.publicKey,
          assetManager: assetManager,
          holderTokenAccount: takerTokenAccount,
          mint: nftMint,
          edition: masterEditionId,
          metadataAccount: new web3.PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ),
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          initializer: escrowData.initializerKey,
          initializerTokenAccount: escrowData.initializerTokenAccount,
        })
        .rpc();

      var str = {
        type: "success",
        message: "Initialize Transaction Completed with transaction id : " + tx,
      };
      return str;
    } catch (e) {
      console.error(e);
      return { type: "error", message: e.message };
    }
  } catch (e) {
    console.error(e);
    return { type: "error", message: e.message };
  }
};

export const cancel = async (wallet, mintId) => {
  try {
    const provider = await getProvider(wallet);
    const programID = getProgramId();
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(IDL, programID, provider);
    const nftMint = new PublicKey(mintId);
    const initializerMainAccount = wallet;
    const masterEditionId = await MasterEdition.getPDA(nftMint);
    const [asset, stateBump] = await PublicKey.findProgramAddress(
      [nftMint.toBuffer()],
      program.programId
    );

    let initializerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      initializerMainAccount.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    try {
      await program.methods
        .cancelRent()
        .accounts({
          initializer: initializerMainAccount.publicKey,
          mint: nftMint,
          assetManager: asset,
          edition: masterEditionId,
          initializerTokenAccount: initializerTokenAccount,
          metadataAccount: new web3.PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      var str = { type: "success", message: "Cancel Completed" };
      return str;
    } catch (e) {
      console.error(e);
      return { type: "error", message: e };
    }
  } catch (e) {
    console.error(e);
    return { type: "error", message: e };
  }
};

export const rentNft = async (wallet, mintId, amt, borrowDuration) => {
  const provider = await getProvider(wallet);
  const programID = getProgramId();
  /* create the program interface combining the idl, program ID, and provider */
  const program = new Program(IDL, programID, provider);
  const nftMint = new PublicKey(mintId);
  const initializerMainAccount = wallet;

  const [assetManager, _nounce] = await web3.PublicKey.findProgramAddress(
    [nftMint.toBuffer()],
    program.programId
  );

  const masterEditionId = await MasterEdition.getPDA(nftMint);
  if (provider.publicKey === null) {
    return { type: "error", message: "Connect your wallet" };
  }
  try {
    let escrowData = await program.account.assetManager.fetch(assetManager);

    const takerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      initializerMainAccount.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    if (escrowData.rentIsFixed) {
      borrowDuration = escrowData.fixedDuration.toNumber();
      amt = escrowData.rate.toNumber();
    }
    let tx = await program.methods
      .processRent(new BN(amt * LAMPORTS_PER_SOL), new BN(borrowDuration))
      .accounts({
        initializer: escrowData.initializerKey,
        initializerTokenAccount: escrowData.initializerTokenAccount,
        taker: wallet.publicKey,
        assetManager: assetManager,
        takerTokenAccount: takerTokenAccount,
        mint: nftMint,
        edition: masterEditionId,
        initializer: escrowData.initializerKey,
        metadataAccount: new web3.PublicKey(
          "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        ),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    var str = {
      type: "success",
      message: "Initialize Transaction Completed with transaction id : " + tx,
    };
    return str;
  } catch (e) {
    //var error = "Not able to complete transaction : " + e;
    console.error(e);
    return { type: "error", message: e.message };
  }
};

export const lendNft = async (
  wallet,
  nftId,
  rateTimeScale,
  rate,
  offertimeScale,
  offerDuration,
  fixedtimeScale,
  fixedDuration,
  revenueShare,
  rentIsFixed
) => {
  const provider = await getProvider(wallet);
  const programID = getProgramId();
  /* create the program interface combining the idl, program ID, and provider */
  const program = new Program(IDL, programID, provider);
  const nftMint = new PublicKey(nftId);
  const initializerMainAccount = wallet;

  try {
    const initializerTokenAccount = await getAssociatedTokenAddress(
      nftMint,
      initializerMainAccount.publicKey,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const [assetManager, _nounce] = await web3.PublicKey.findProgramAddress(
      [nftMint.toBuffer()],
      program.programId
    );

    const masterEditionId = await MasterEdition.getPDA(nftMint);
    const metadataAccount = await Metadata.getPDA(nftMint);

    try {
      var solanaRate = getRate(rateTimeScale, rate);
      var offerTime = getMinutes(offertimeScale, offerDuration);
      var fixedTime = getMinutes(fixedtimeScale, fixedDuration);

      let tx = await program.methods
        .initRent(
          new BN(solanaRate),
          new BN(offerTime),
          new BN(fixedTime),
          rentIsFixed,
          new BN(revenueShare)
        )
        .accounts({
          initializer: wallet.publicKey,
          assetManager: assetManager,
          mint: nftMint,
          edition: masterEditionId,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          token: TOKEN_PROGRAM_ID,
          initializerDepositTokenAccount: initializerTokenAccount,
          mplMetadata: new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
          ),
          metadataAccount: metadataAccount,
          whitelist: assetManager,
        })
        .rpc();

      var str = {
        type: "success",
        message: "Initialize Transaction Completed with transaction id : " + tx,
      };
      return str;
    } catch (e) {
      //var error = "Not able to complete transaction : " + e;
      console.error(e);
      return { type: "error", message: e.message };
    }
  } catch (e) {
    console.error(e);
    return { type: "error", message: e.message };
    // return "Wallet not connected. Connect your Wallet and try again.";
  }
};

// ERC-721 ABI with only the tokenURI function
export const erc721ABI = [
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const formatAssetsByDB = (outputs) => {
  return outputs.map((output) => {
    return {
      initializer: output.initializer,
      tokenAddress: output.token_address,
      tokenId: Number(output.token_id),
      state: output.state,
      metadata_uri: output.metadata_uri,
      metadata_link: output.metadata_link,
      name: output.name,
      image: output.image,
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
      },
    };
  });
};

export function wait(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export const getReferralCode = async (walletAddress) => {
  try {
    const response = await scoreAxiosInstance(
      `/refer/generateId/${walletAddress}`
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return { data: [] };
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
    onError();
    console.error(error);
  }
};
