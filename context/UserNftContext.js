import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChainContext } from "@/context/ChainContext";
import { HederaContext } from "./HederaContext";
import { reloadNftCache } from "@/utils/apiRequests";
import { nftCacheAxiosInstance } from "@/services/axios";
import { useUserWalletContext } from "./UserWalletContext";
import { useConnection } from "@/hooks/useTonConnection";
const conn = useConnection();
import { Address } from "ton";

export const UserNftContext = createContext();

const UserNftContextProvider = ({ children }) => {
  const [fetching, setFetching] = useState(true);
  const [isNftsLoaded, setIsNftsLoaded] = useState(true);
  const { address, isConnected } = useUserWalletContext();
  const { publicKey, connected } = useWallet();
  const { chainDetail, collectionId } = useContext(ChainContext);
  const { isPaired } = useContext(HederaContext);
  const [userNfts, setUserNfts] = useState([]);

  const [initialUserNfts, setInitialUserNfts] = useState([]);

  const [usersNftsByCollection, setUsersNftsByCollection] = useState([]);

  const addTokenInNftArray = (tokenId) => {
    const tokenIdData = initialUserNfts?.find((el) => el.tokenId === tokenId);

    if (tokenIdData) {
      const updatedUserNfts = userNfts?.[0]?.tokenId;
      updatedUserNfts.push(tokenIdData);

      const uniqueUserNfts = updatedUserNfts.filter(
        (nft, index, self) =>
          index === self.findIndex((t) => t.tokenId === nft.tokenId),
      );
      setUsersNftsByCollection(uniqueUserNfts);
    } else {
      setUsersNftsByCollection(userNfts?.[0]?.tokenId);
    }
  };

  const removeTokenFromNftArray = (tokenId) => {
    const updatedUserNfts = usersNftsByCollection.filter(
      (el) => el.tokenId !== tokenId,
    );

    const uniqueUserNfts = updatedUserNfts.filter(
      (nft, index, self) =>
        index === self.findIndex((t) => t.tokenId === nft.tokenId),
    );

    setUsersNftsByCollection(uniqueUserNfts);
  };
  const [manage, setManage] = useState(true);

  const fetchTonNFTs = async (walletAddress, collectionAddress) => {
    try {
      const ta = new TonApiClient({
        baseUrl: "https://testnet.tonapi.io/",
        apiKey: process.env.NEXT_PUBLIC_TON_API_KEY,
      });

      const collection = Address.parse(collectionAddress);
      const owner = Address.parse(walletAddress);
      console.log("fetcing");
      const _n = await ta.accounts.getAccountNftItems(owner, { collection });
      console.log(_n);
      return _n.nftItems;
    } catch (error) {
      console.error("Failed to fetch TON NFTs:", error);
      return [];
    }
  };

  const fetchNFTs = async (walletAddress, collectionId) => {
    try {
      if (chainDetail?.chain_id.toUpperCase() === "TON") {
        await fetchTonNFTs(walletAddress, collectionId);
        return;
      }

      setFetching(true);
      setIsNftsLoaded(false);
      const response = await nftCacheAxiosInstance.get(
        `/getNFTs/${chainDetail?.chain_id}/${walletAddress}?collection=${collectionId}`,
      );
      setUserNfts(response?.data?.result ?? []);
      setInitialUserNfts(response?.data?.result?.[0]?.tokenId ?? []);

      setUsersNftsByCollection(response?.data?.result?.[0]?.tokenId ?? []);
    } catch (error) {
      console.error("Failed to fetch NFTs:", { error });

      setUserNfts([]);
      setUsersNftsByCollection([]);
    } finally {
      setFetching(false);
      setIsNftsLoaded(true);
    }
  };

  const walletAddress = useMemo(() => {
    if (chainDetail?.evm) return address;
    if (chainDetail?.chain_id === "296") {
      return JSON.parse(localStorage.getItem("hashconnectData"))
        ?.pairingData?.[0]?.accountIds[0];
    }
    if (chainDetail?.chain_id === "solana" && connected) {
      return publicKey?.toBase58();
    }
    if (chainDetail?.chain_id === "ton") {
      return conn.sender?.address?.toString();
    }

    return "";
  }, [chainDetail, address, publicKey, connected]);

  useEffect(() => {
    if (!isConnected && !isPaired && connected) {
      return;
    }
    if (chainDetail?.chain_id && walletAddress && collectionId?.length > 0) {
      fetchNFTs(walletAddress, collectionId);
    }
  }, [
    walletAddress,
    chainDetail,
    collectionId,
    isConnected,
    connected,
    isPaired,
  ]);

  const reloadNftCacheCall = async () => {
    if (!walletAddress) {
      return;
    }

    try {
      const data = await reloadNftCache(
        chainDetail?.chain_id,
        walletAddress,
        collectionId,
      );

      setUserNfts(data?.data ?? []);
      setUsersNftsByCollection(data?.data?.[0]?.tokenId ?? []);
    } catch (error) {
      console.error("Failed to reload NFT cache:", error);
    }
  };

  return (
    <UserNftContext.Provider
      value={{
        userNfts,
        fetching,
        isNftsLoaded,
        reloadNftCacheCall,
        addTokenInNftArray,
        removeTokenFromNftArray,
        usersNftsByCollection,
        manage,
        setManage,
        setFetching,
      }}
    >
      {children}
    </UserNftContext.Provider>
  );
};

export default UserNftContextProvider;
