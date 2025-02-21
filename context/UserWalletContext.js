import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChainContext } from "./ChainContext";
import { initHashpack } from "@/utils/hashConnectProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { isTokenExpired } from "@/utils/generalUtils";
import { switchUserChain } from "@/utils/evmProvider";
import { useGlobalContext } from "./GlobalContext";
import { AUTHENTICATED } from "@/constants/globalConstants";
import { useTonWallet, useTonAddress } from "@tonconnect/ui-react";

const UserWalletContext = createContext();

export const UserWalletProvider = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isTransactionOngoing, setIsTransactionOngoing] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [hasUserRejectedSignin, setHasUserRejectedSignin] = useState(false);
  const userFriendlyAddress = useTonAddress(true);
  const wallet = useTonWallet();

  const { connected, publicKey } = useWallet();

  const {
    isConnected: isEvmWalletConnected,
    address: evmAddress,
    chainId,
  } = useAccount();

  const { chainDetail } = useContext(ChainContext);

  const { authStatus } = useGlobalContext();

  const chainIdRef = useRef(chainId);

  const isWalletConnectedRef = useRef(isWalletConnected);

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  useEffect(() => {
    isWalletConnectedRef.current = isWalletConnected;
  }, [isWalletConnected]);

  useEffect(() => {
    switch (chainDetail?.chain_id) {
      case "ton":
        if (wallet) {
          setAddress(wallet ? userFriendlyAddress.toString() : "");
          setIsWalletConnected(userFriendlyAddress.toString().length !== 0);
          localStorage.setItem("token", "ton_wallet");
        }
        break;
      case "296":
        const hashconnectData = localStorage.getItem("hashconnectData");
        if (hashconnectData && JSON.parse(hashconnectData).pairingData[0]) {
          initHashpack().then(() => {
            if (hashconnectData && hashconnectData.pairingData.length > 0) {
              const length = hashconnectData.pairingData.length;
              setAddress(hashconnectData.pairingData[length - 1].accountIds[0]);
            }
            setIsWalletConnected(true);
          });
        } else {
          setAddress("");
          setIsWalletConnected(false);
        }
        break;
      case "solana":
        setAddress(connected ? publicKey?.toBase58() : "");
        setIsWalletConnected(connected);
        break;
      default:
        setAddress(isEvmWalletConnected ? evmAddress : "");
        setIsWalletConnected(
          isEvmWalletConnected && authStatus === AUTHENTICATED,
        );
        break;
    }
  }, [
    chainDetail,
    publicKey,
    isEvmWalletConnected,
    connected,
    evmAddress,
    authStatus,
  ]);

  useEffect(() => {
    const listenStorageChange = async () => {
      if (localStorage.getItem("token") === null) {
        setIsTokenSet(false);
      } else {
        setIsTokenSet(true);
      }
    };

    listenStorageChange(); // Run on component mount

    window.addEventListener("storage", listenStorageChange);
    return () => window.removeEventListener("storage", listenStorageChange);
  }, []);

  const checkLoginValidity = async () => {
    const isUserOnSelectedChain =
      Number(chainDetail?.chain_id) === Number(chainIdRef?.current);

    if (!isWalletConnectedRef?.current) {
      document.getElementById("connect-button")?.click();
      return false;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setIsTokenSet(false);
      setIsTokenValid(false);
      // setShowSignInModal(true);
      toast.dismiss();
      toast.error("Please sign in with your wallet to continue");
      return false;
    }

    if (!isUserOnSelectedChain && chainDetail?.evm) {
      toast.dismiss();
      await switchUserChain(chainDetail?.chain_id);
      toast.success(
        "Switched to selected chain successfully, Please try again",
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userRejectedSigninFromLS =
        localStorage.getItem("userRejectedSignin");

      if (token) {
        setIsTokenSet(true);
      }

      if (userRejectedSigninFromLS) {
        setHasUserRejectedSignin(true);
      }
    }
  }, []);

  const isConnected = useMemo(() => {
    console.log({ isWalletConnected, isTokenSet });
    return isWalletConnected && isTokenSet;
  }, [isWalletConnected, isTokenSet]);

  return (
    <UserWalletContext.Provider
      value={{
        isConnected,
        isTokenSet,
        isTokenValid,
        isTransactionOngoing,
        setIsTransactionOngoing,
        address,
        checkLoginValidity,
        setIsTokenSet,
        setIsTokenValid,
        showSignInModal,
        setShowSignInModal,
        hasUserRejectedSignin,
        setHasUserRejectedSignin,
      }}
    >
      {children}
    </UserWalletContext.Provider>
  );
};

export const useUserWalletContext = () => {
  const context = useContext(UserWalletContext);
  return context;
};
