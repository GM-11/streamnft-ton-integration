import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { ChainContext } from "./ChainContext";
import utilityCalls from "@/services/utility/utilityCalls";
import { useSigner } from "./SignerContext";
import { jwtDecode } from "jwt-decode";
import { scoreAxiosInstance } from "@/services/axios";
import { SiweMessage } from "siwe";
import { useUserWalletContext } from "./UserWalletContext";

export const utilityContext = createContext();

const UtilityContextProvider = ({ children }) => {
  const [utilityData, setUtilityData] = useState([]);
  const [initialUtilityData, setInitialUtilityData] = useState([]);
  const [userUtilityData, setUserUtilityData] = useState([]);
  const [initialUserUtilityData, setInitialUserUtilityData] = useState([]);
  const [userNftCollectionData, setUserNftCollectionData] = useState([]);
  const [allNftCollectionData, setAllNftCollectionData] = useState([]);
  const [selectedRewardType, setSelectedRewardType] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [updateExploreData, setUpdateExploreData] = useState(false);
  const [exploreSelectedChain, setExploreSelectedChain] = useState("");
  const [showPageSwitchModal, setShowPageSwitchModal] = useState(false);
  const [clickedLink, setClickedLink] = useState("");

  const { chainDetail, chainDetails, evmWalletConnectedForMinting } =
    useContext(ChainContext);
  const {
    setIsTokenValid,
    setIsTokenSet,
    setHasUserRejectedSignin,
    setShowSignInModal,
  } = useUserWalletContext();

  const { address } = useUserWalletContext();
  const { signer } = useSigner();
  const isCheckTokenCompleted = useRef(false);
  const isSkaleDistributed = useRef(false);

  async function fetchData() {
    const resp = await utilityCalls.getAllUtilities();

    setInitialUtilityData(resp?.data ?? []);

    setUtilityData(resp?.data ?? []);
  }

  async function fetchUserUtilityData() {
    const resp = await utilityCalls.getAllUtilities();

    setInitialUserUtilityData(
      resp?.data?.filter((el) => el?.provider === address) ?? []
    );

    setUserUtilityData(
      resp?.data?.filter((el) => el?.provider === address) ?? []
    );
  }

  useEffect(() => {
    if (chainDetails?.length > 0) {
      setExploreSelectedChain(
        chainDetails?.find(
          (el) =>
            Number(el?.chain_id) ===
            Number(localStorage.getItem("exploreSelectedChainId"))
        ) ?? chainDetails?.[0]
      );
    }
  }, [chainDetails]);

  async function fetchUserNftCollectionData() {
    try {
      const resp = await utilityCalls.getCollectionsWithUtilities(
        exploreSelectedChain?.chain_id,
        address,
        false
      );

      setUserNftCollectionData(resp?.data ?? []);
    } catch (e) {
      setUserNftCollectionData([]);
    }
  }

  async function fetchAllNftCollectionData() {
    try {
      const resp = await utilityCalls.getAllCollectionsWithUtilities(
        exploreSelectedChain?.chain_id,
        address,
        false
      );

      setAllNftCollectionData(resp?.data ?? []);
    } catch (e) {
      setAllNftCollectionData([]);
    }
  }

  const reloadNftCacheCall = async () => {
    try {
      const resp = await utilityCalls.getCollectionsWithUtilities(
        chainDetail?.chain_id,
        address,
        true
      );

      if (resp?.data) {
        setUserNftCollectionData(resp?.data ?? []);
      }
    } catch (e) {
      setUserNftCollectionData([]);
    }
  };

  const checkToken = async (data) => {
    const token = localStorage.getItem("token");

    try {
      if (!token && signer) {
        if (isCheckTokenCompleted.current) {
          return;
        }

        const message = new SiweMessage({
          domain: window.location.host,
          address: data?.address ?? address,
          statement: "Please sign with your account to continue",
          uri: window.location.origin,
          version: "1",
          chainId: Number(chainDetail?.chain_id),
        });

        isCheckTokenCompleted.current = true;
        const signedMessage = await signer.signMessage(
          message.prepareMessage()
        );
        isCheckTokenCompleted.current = false;

        const body = {
          address: data?.address ?? address,
          message: message.prepareMessage(),
          signature: signedMessage,
          referralId: localStorage.getItem("referralCode"),
        };

        const loginResult = await scoreAxiosInstance.post("/auth/login", body);

        if (loginResult) {
          isSkaleDistributed.current = false;
          localStorage.setItem("token", loginResult.data.token);
          localStorage.setItem("refreshToken", loginResult.data.refreshToken);

          setUpdateExploreData(!updateExploreData);
          setIsTokenSet(true);
          setIsTokenValid(true);
          setShowSignInModal(false);
          setHasUserRejectedSignin(false);
          localStorage.setItem("userRejectedSignin", true);

          window.dispatchEvent(new Event("storage"));
        } else {
          setShowSignInModal(false);

          throw new Error("Token generation failed");
        }
      }
    } catch (error) {
      isCheckTokenCompleted.current = false;
      setShowSignInModal(false);

      if (error?.code === "ACTION_REJECTED") {
        setIsTokenValid(false);
        setHasUserRejectedSignin(true);
        localStorage.setItem("userRejectedSignin", true);
        setIsTokenSet(false);
      }
    }
  };

  useEffect(() => {
    if (evmWalletConnectedForMinting) {
      fetchData();
    }
  }, [evmWalletConnectedForMinting]);

  return (
    <utilityContext.Provider
      value={{
        utilityData,
        setUtilityData,
        userNftCollectionData,
        setUserNftCollectionData,
        fetchUserNftCollectionData,
        fetchAllNftCollectionData,
        fetchData,
        selectedService,
        setSelectedService,
        initialUtilityData,
        reloadNftCacheCall,
        checkToken,
        updateExploreData,
        exploreSelectedChain,
        setExploreSelectedChain,
        selectedRewardType,
        setSelectedRewardType,
        userUtilityData,
        setUserUtilityData,
        initialUserUtilityData,
        setInitialUserUtilityData,
        fetchUserUtilityData,
        showPageSwitchModal,
        setShowPageSwitchModal,
        clickedLink,
        setClickedLink,
        isSkaleDistributed,
        setAllNftCollectionData,
        allNftCollectionData,
      }}
    >
      {children}
    </utilityContext.Provider>
  );
};

export default UtilityContextProvider;
