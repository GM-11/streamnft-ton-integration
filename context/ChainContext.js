import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { indexerAxiosInstance } from "@/services/axios";
import useDebounce from "@/hooks/useDebounce";
import { fetchTokenUtilityByCollection } from "@/utils/common";
import { useUserWalletContext } from "./UserWalletContext";

export const ChainContext = createContext();

const ChainContextWrapper = ({ children }) => {
  const [chainDetail, setChainDetail] = useState({});
  const [chainDetails, setChainDetails] = useState([]);
  const [selectedChain, setSelectedChain] = useState("open campus");
  const [scrollChainDetail, setScrollChainDetail] = useState({});
  const [scrollChainDetails, setScrollChainDetails] = useState([]);
  const [scrollSelectedChain, setScrollSelectedChain] = useState("");
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState(null);
  const [tokenData, setTokenData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [userTransacted, setUserTransacted] = useState(false);
  const [evmWalletConnected, setEvmWalletConnected] = useState(false);
  const [updateCollectionsSignal, setUpdateCollectionsSignal] = useState(false);
  const [openGlobalLoader, setOpenGlobalLoader] = useState(false);
  const [globalLoaderMessage, setGlobalLoaderMessage] = useState("");

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const router = useRouter();

  useEffect(() => {
    const initializeChainData = () => {
      const chainFromLocalStorage = localStorage.getItem("selectedChain");
      const defaultChain = "skale nebula";

      let selectedChain = chainFromLocalStorage || defaultChain;

      if (router.pathname.includes("utility")) {
        selectedChain = "skale nebula";
        localStorage.setItem("selectedChain", selectedChain);
      }

      selectedChain =
        selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1);

      const chainDetail = chainDetails.find(
        (detail) =>
          detail?.chain_name?.toLowerCase() === selectedChain?.toLowerCase(),
      );

      localStorage.setItem("selectedChainId", chainDetail?.chain_id);

      setSelectedChain(selectedChain);
      setChainDetail(chainDetail);
    };

    if (typeof window !== "undefined") {
      initializeChainData();
    }
  }, [router, chainDetails]);

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        const routeVariables = router?.asPath?.split("/")?.[2];
        const selectedModule =
          routeVariables === "loan"
            ? "loan"
            : routeVariables === "discover"
              ? "trade"
              : routeVariables === "rent"
                ? "rent"
                : routeVariables === "utility"
                  ? "utility"
                  : "loan";
        const response = await indexerAxiosInstance.get(
          `/chainBlockByPriority/?${selectedModule}=true`,
        );

        const ton = {
          chain_id: "ton",
          chain_image_url: "https://cryptologos.cc/logos/toncoin-ton-logo.png",
          chain_name: "TON",
          contract_address: "",
          currency_decimal: 9,
          currency_image_url:
            "https://cryptologos.cc/logos/toncoin-ton-logo.png",
          currency_name: "TON",
          currency_symbol: "TON",
          evm: false,
          explorer_link: "",
          last_block: 0,
          loan: false,
          native_address: "",
          priority: 3,
          rent: false,
          rpc_url: "",
          trade: false,
          transaction_link: "",
          treasury_account: "",
          utility: false,
          utility_address: "",
        };

        setChainDetails([...response?.data?.data, ton]);

        setScrollChainDetails(response?.data?.data?.slice(0, 5));
      } catch (error) {
        console.error("Error fetching chain details:", error);
      }
    };

    fetchChainDetails();
  }, [router]);

  useEffect(() => {
    const routeVariables = router?.asPath?.split("/")?.[2];

    const selectedModule =
      routeVariables === "loan"
        ? "loan"
        : routeVariables === "discover"
          ? "mart"
          : routeVariables === "rent"
            ? "rent"
            : routeVariables === "utility"
              ? "utility"
              : "loan";
    const getCollectionsData = async () => {
      if (chainDetail?.chain_id) {
        setCollectionsLoading(true);
        try {
          const response = await indexerAxiosInstance.get(
            `/collections/${chainDetail.chain_id === "ton" ? chainDetail.chain_id.toUpperCase() : chainDetail.chain_id}?${
              selectedModule ?? "loan"
            }=true`,
          );

          if (response.data) {
            const modifiedData = response.data.data.map((item) => ({
              ...item,
              image: item.image_url,
              list: item.active_list,
              rent: item.active_rent,
            }));

            const filteredCollections = debouncedSearchValue
              ? modifiedData.filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(debouncedSearchValue.toLowerCase()),
                )
              : modifiedData;

            setCollections(filteredCollections);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setCollectionsLoading(false);
        }
      }
    };

    getCollectionsData();
  }, [
    chainDetail,
    updateCollectionsSignal,
    userTransacted,
    debouncedSearchValue,
  ]);

  // Fetch collectionId based on router's symbol query
  useEffect(() => {
    if (router?.query?.symbol?.length > 0) {
      const symbol = router.query.symbol.replace(/-/g, " ");
      const formattedName = (str) => str?.toLowerCase().replace(/[\s-]+/g, "");
      const matchingCollection = collections.find(
        (collection) =>
          formattedName(collection.name) === formattedName(symbol),
      );
      const collectionId = matchingCollection
        ? matchingCollection.token_address
        : null;
      setCollectionId(collectionId);
    }
  }, [router.query.symbol, collections]);

  // Fetch token data for the selected collection
  useEffect(() => {
    async function getTokenData() {
      try {
        if (!chainDetail?.chain_id || !collectionId) return;
        const data = await fetchTokenUtilityByCollection(
          collectionId,
          chainDetail.chain_id,
        );
        setTokenData(data);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    }

    getTokenData();
  }, [chainDetail?.chain_id, collectionId]);

  return (
    <ChainContext.Provider
      value={{
        chainDetail,
        setChainDetail,
        chainDetails,
        setChainDetails,
        selectedChain,
        setSelectedChain,
        scrollChainDetail,
        scrollChainDetails,
        scrollSelectedChain,
        collections,
        collectionId,
        setCollectionId,
        updateCollectionsSignal,
        setUpdateCollectionsSignal,
        collectionsLoading,
        userTransacted,
        setUserTransacted,
        searchValue,
        setSearchValue,
        evmWalletConnected,
        tokenData,
        setTokenData,
        setEvmWalletConnected,
        openGlobalLoader,
        setOpenGlobalLoader,
        globalLoaderMessage,
        setGlobalLoaderMessage,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
};

export default ChainContextWrapper;
