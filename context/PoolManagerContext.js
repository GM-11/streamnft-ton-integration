import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ChainContext } from "@/context/ChainContext";
import { HederaContext } from "./HederaContext";
import { AccountId } from "@hashgraph/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { indexerAxiosInstance } from "@/services/axios";
import { useUserWalletContext } from "./UserWalletContext";

export const PoolManagerContext = createContext();

export const PoolManagerContextWrapper = ({ children }) => {
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const [poolSignal, setPoolSignal] = useState(0);
  const [managerSignal, setManagerSignal] = useState(0);
  const [nftSignal, setNftSignal] = useState(0);
  const [bidPool, setBidPool] = useState([]);
  const [bidManager, setBidManager] = useState([]);
  const [bestOffer, setBestOffer] = useState([]);
  const [nftPoolData, setNftPoolData] = useState([]);
  const [load, setLoad] = useState(true);
  const [offers, setOffers] = useState([]);
  const { accountId } = useContext(HederaContext);
  const { publicKey, connected: solanaConnected } = useWallet();
  const { address, isConnected } = useUserWalletContext();
  const { isTokenSet } = useUserWalletContext();
  const [tvl, setTvl] = useState(0);

  const fetchData = useCallback(async () => {
    if (chainDetail?.chain_id) {
      try {
        setLoad(true);
        if (isTokenSet) {
          await getOffers(chainDetail);
        }
        await Promise.all([
          fetchNftPoolData(
            selectedChain?.toLowerCase() === "solana"
              ? chainDetail?.chain_id
              : Number(chainDetail?.chain_id)
          ),
          getBestOffer(
            selectedChain?.toLowerCase() === "solana"
              ? chainDetail?.chain_id
              : Number(chainDetail?.chain_id)
          ),
          fetchTvl(
            selectedChain?.toLowerCase() === "solana"
              ? chainDetail?.chain_id
              : Number(chainDetail?.chain_id)
          ),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoad(false);
      }
    }
  }, [
    chainDetail,
    isTokenSet,
    solanaConnected,
    address,
    isConnected,
    poolSignal,
    managerSignal,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getOffers = useCallback(
    async (chainDetail) => {
      const chainId = chainDetail?.chain_id;

      try {
        let solidityAddress = "";

        if (chainId == 295 || chainId == 296) {
          solidityAddress =
            "0x" +
            AccountId.fromString(accountId).toSolidityAddress().toString();
        } else if (chainId === "solana" && publicKey) {
          solidityAddress = publicKey?.toBase58();
        } else if (chainDetail?.evm && isConnected) {
          solidityAddress = address;
        }

        if (solidityAddress?.length <= 0) return;

        const response = await indexerAxiosInstance.get(
          `/offer/${chainId}/${solidityAddress}`
        );

        const bidManagersData = response.data?.data?.map((output) => {
          let status = "Awaiting buyer"; // Default status
          let button = "Cancel";
          let btnVal = "Cancel";
          let txLink = chainDetail?.transaction_link + output?.tx_hash;

          if (output.assetManagerDetail) {
            txLink =
              chainDetail?.transaction_link +
              output?.assetManagerDetail?.tx_hash;
            const currentTimeInEpoch = Math.floor(Date.now() / 1000);

            if (
              Number(output.assetManagerDetail.loan_expiry) < currentTimeInEpoch
            ) {
              status = "Defaulted";
              button = "Claim";
              btnVal = "Claim";
            } else {
              status = "Active";
              button = "View Offer";
            }
          }

          return {
            apy: Number(output.loanPool?.apy || 0),
            duration: Number(output.loanPool?.loan_duration_in_minutes || 0),
            bidManagerIndex: output.loan_offer_index || 0,
            bidderPubkey: output.bidder_pubkey || "",
            offer: Number(output.bid_amount || 0),
            bidPoolIndex: output.loan_pool_index || 0,
            interestRateLender: Number(output.interest_rate_lender || 0) / 1000,
            interestRateProtocol: Number(output.interest_rate_protocol || 0),
            totalBids: Number(output.total_bids || 0),
            pendingLoans: Number(output.pending_loans || 0),
            collection_name: output.loanPool?.name || "",
            collection_logo: output.loanPool?.image_url || "",
            floor: Number(output.loanPool?.floor || 0),
            initializer: output.assetManagerDetail?.initializer || "",
            state: output.assetManagerDetail?.state || "",
            loanExpiry: Number(output.assetManagerDetail?.loan_expiry || 0),
            tokenAddress: output.assetManagerDetail?.token_address || "",
            tokenId: output.assetManagerDetail?.token_id || "",
            nftName: output.assetManagerDetail?.name,
            nftImage: output.assetManagerDetail?.image || "",
            name: output.assetManagerDetail?.name,
            image: output.assetManagerDetail?.image || "",
            hederaAddress: output.loanPool?.hedera_account || "",
            version: output?.assetManagerDetail?.version,
            offerPDA: output?.loan_offer_address,
            paymentToken: output?.loanPool?.payment_token || undefined,
            status,
            button,
            btnVal,
            txLink,
          };
        });

        setOffers(bidManagersData);

        return bidManagersData;
      } catch (error) {
        console.error("Get offers error", error);
      }
    },
    [chainDetail, publicKey, address, isConnected]
  );

  const getNftOffers = useCallback(
    async (chainId, user) => {
      try {
        const response = await indexerAxiosInstance.get(
          `/nftOffers/${chainId}/${user}`
        );

        const nftOfferData = response.data?.data?.map((output) => {
          let status = "Active";
          let button;
          let btnVal;
          let txLink = chainDetail?.transaction_link + output?.tx_hash;

          if (output?.loan_expiry) {
            const currentTimeInEpoch = Math.floor(Date.now() / 1000);
            if (Number(output.loan_expiry) < currentTimeInEpoch) {
              status = "Defaulted";
              button = "Claim";
              btnVal = "Claim";
            } else {
              status = "Active";
              button = "View Offer";
            }
          }

          return {
            active: output.active,
            apy: output.apy,
            bidAmount: output.bid_amount,
            chainId: output.chain_id,
            contractAddress: output.contract_address,
            id: output.id,
            image: output.image,
            initializerKey: output.initializer_key,
            interestRateLender: Number(output.interest_rate_lender || 0) / 1000,
            interestRateProtocol: output.interest_rate_protocol,
            loanAmount: output.loan_amount,
            loanDurationInMinutes: output.loan_duration_in_minutes,
            loanProvider: output.loan_provider,
            name: output.name,
            tokenAddress: output.token_address,
            tokenId: output.token_id,
            state: output.state,
            loanExpiry: Number(output?.loan_expiry || 0),
            version: output?.version,
            status,
            button,
            btnVal,
            txLink,
          };
        });

        return nftOfferData;
      } catch (error) {
        console.error("Error fetching NFT offers:", error);
        throw error;
      }
    },
    [chainDetail]
  );

  async function fetchTvl(chainId) {
    try {
      console.log("tvl starting...");
      const response = await indexerAxiosInstance.get(`/tvl/${chainId}`);

      if (response.data?.data) {
        setTvl(response.data.data);
        console.log("tvl fetched successfully.");
      } else {
        setTvl(0);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setTvl(0);
    }
  }

  const getBidPools = useCallback(async (chainId, contractAddress) => {
    try {
      const response = await indexerAxiosInstance.get(
        `/loanPool/all/${chainId}/${contractAddress}`
      );
      const bidPoolsData = response.data?.data?.map((output) => ({
        bidPoolIndex: Number(output.loan_pool_index),
        initializerKey: output.initializer_key,
        tokenAddress: output.token_address,
        loanDurationInMinutes: Number(output.loan_duration_in_minutes),
        apy: Number(output?.apy) ?? 0,
        interestRateLender: Number(output.interest_rate_lender) / 1000,
        interestRateProtocol: Number(output.interest_rate_protocol),
        totalBidManager: Number(output.total_loan_offer),
        lastBidAmount: Number(output.last_bid_amount),
        bidNftFloorPrice: Number(output.bid_nft_floor_price),
        nftPool: output.nft_pool,
        tokenId: output.token_id,
        bidAmount: output.bid_amount,
        active: output.active,
      }));

      setBidPool(bidPoolsData);
    } catch (error) {
      console.error("Trigger smart contract error", error);
    }
  }, []);

  const fetchNftPoolData = useCallback(async (chainId) => {
    try {
      const response = await indexerAxiosInstance.get(`/nftPool/${chainId}`);
      const nftPoolData = response.data?.map((output) => ({
        active: output.active,
        bidAmount: output.bid_amount,
        chainId: output.chain_id,
        contractAddress: output.contract_address,
        id: output.id,
        image: output.image,
        initializerKey: output.initializer_key,
        interestRateLender: Number(output.interest_rate_lender || 0) / 1000,
        interestRateProtocol: output.interest_rate_protocol,
        loanAmount: output.loan_amount,
        loanDurationInMinutes: output.loan_duration_in_minutes,
        loanProvider: output.loan_provider,
        name: output.name,
        proposedOffers: output.proposed_offers,
        tokenAddress: output.token_address,
        tokenId: output.token_id,
        apy: output.apy,
        index: output?.index,
      }));

      setNftPoolData(nftPoolData);
    } catch (error) {
      console.error("Error fetching NFT pool data:", error);
    }
  }, []);

  const getBestOffer = useCallback(async (chainId) => {
    try {
      const response = await indexerAxiosInstance.get(`/bestOffer/${chainId}`);
      const bestOffers = convertKeysToCamelCase(response.data);
      setBestOffer(bestOffers);
    } catch (error) {
      console.error("Error fetching best offer:", error);
      setBestOffer([]);
    }
  }, []);

  const getBidManagers = useCallback(async (chainId) => {
    try {
      const response = await indexerAxiosInstance.get(`/loanOffer/${chainId}`);
      const bidManagersData = response.data?.data?.map((output) => ({
        bidManagerIndex: output.loan_offer_index,
        bidderPubkey: output.bidder_pubkey,
        bidAmount: Number(output.bid_amount),
        bidPoolIndex: output.loan_pool_index,
        totalBids: Number(output.total_bids),
        pendingLoans: Number(output.pending_loans),
      }));

      setBidManager(bidManagersData);
    } catch (error) {
      console.error("Error fetching bid managers:", error);
    }
  }, []);

  const convertKeysToCamelCase = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => convertKeysToCamelCase(item));
    } else if (data !== null && typeof data === "object") {
      return Object.entries(data).reduce((acc, [key, value]) => {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        acc[camelCaseKey] = convertKeysToCamelCase(value);
        return acc;
      }, {});
    }
    return data;
  };

  const contextValue = useMemo(
    () => ({
      load,
      offers,
      bidPool,
      bidManager,
      nftPoolData,
      poolSignal,
      managerSignal,
      nftSignal,
      bestOffer,
      setPoolSignal,
      setManagerSignal,
      setNftSignal,
      fetchData,
      fetchTvl,
      tvl,
      getNftOffers,
      setLoad,
    }),
    [load, offers, nftPoolData, poolSignal, managerSignal, nftSignal, tvl]
  );

  return (
    <PoolManagerContext.Provider value={contextValue}>
      {children}
    </PoolManagerContext.Provider>
  );
};
