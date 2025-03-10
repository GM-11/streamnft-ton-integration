import React, { useCallback, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import walletIcon from "../../../public/images/Wallet.svg";
import Image from "next/image";
import {
  hashconnect,
  pairHashpack,
  unpairHashpack,
  initHashpack,
  getUserReward,
} from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { RippleAPI } from "ripple-lib";
import { ChainContext } from "@/context/ChainContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { addUserInReward } from "@/utils/apiRequests";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import useAutoConnectPhantom from "@/hooks/useAutoConnectPhantom";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { useUserWalletContext } from "@/context/UserWalletContext";
import {
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
  useTonConnectModal,
} from "@tonconnect/ui-react";

export const StyledWalletButton = styled.div`
  position: relative;
  padding: 1rem 0;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00bb34;
  color: black;
  border: 1px solid #00bb34;
  position: relative;
  cursor: pointer;
  font-family: Poppins;
  text-transform: uppercase;
  border-radius: 0;
  z-index: initial;
  font-weight: 600;
  font-display: swap;
  font-style: normal;

  &:hover {
    background: #00bb34;
  }

  &::after {
    content: " ";
    height: 40px;
    width: 100%;
    background: black;
    border: 1px solid #00bb34;
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: -1;
  }
`;

export const StyledWalletButton2 = () => {
  const isBigScreen = useMediaQuery();
  const { selectedChain, chainDetail } = useContext(ChainContext);

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { isConnected, address } = useUserWalletContext();
  const { select, connect, disconnect, connected, publicKey } = useWallet();
  const [xrpText, setXrpText] = useState("rnZ5pL4xSgtAyNM3cY6jBygSZ2gLy6JUy8");

  const { setIsPaired, isPaired, accountId } = useContext(HederaContext);
  const [walletAddress, setWalletAddress] = useState("Connect");
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const wallet = useTonWallet();

  const userFriendlyAddress = useTonAddress(true);

  const { setVisible } = useWalletModal();

  const router = useRouter();

  useEffect(() => {
    switch (chainDetail?.chain_id) {
      case "296":
        const hashconnectData = localStorage.getItem("hashconnectData");
        if (hashconnectData && JSON.parse(hashconnectData).pairingData[0]) {
          initHashpack().then(() => {
            setWalletAddress(accountId);
            setIsPaired(true);
          });
        } else {
          setIsPaired(false);
        }
        break;
      case "solana":
        setWalletAddress(connected ? publicKey?.toBase58() : "Connect");
        break;
      case "ton":
        setWalletAddress(wallet ? userFriendlyAddress.toString() : "Connect");
        break;
      default:
        setWalletAddress(isConnected ? address : "Connect");
        break;
    }
  }, [chainDetail, publicKey, isConnected, connected, address]);

  const connectXRP = async () => {
    if (xrpText === "Connect") {
      const api = new RippleAPI({
        server: "wss://s.altnet.rippletest.net:51233",
      });
      api
        .connect()
        .then(() => {
          setXrpText("rnZ5pL4xSgtAyNM3cY6jBygSZ2gLy6JUy8");
        })
        .catch(console.error);
    } else {
      setXrpText("rnZ5pL4xSgtAyNM3cY6jBygSZ2gLy6JUy8");
    }
  };

  const handleHedera = async () => {
    if (isPaired) {
      await unpairHashpack();
      localStorage.removeItem("hashconnectData");
      setWalletAddress("Connect");
      setIsPaired(false);
    } else {
      const hashconnectData = localStorage.getItem("hashconnectData");
      const parsedData = hashconnectData ? JSON.parse(hashconnectData) : null;
      if (
        hashconnectData == null ||
        (parsedData && parsedData.pairingData.length == 0)
      ) {
        await pairHashpack();

        hashconnect.pairingEvent.once(async (pairdata) => {
          const length = JSON.parse(localStorage.getItem("hashconnectData"))
            .pairingData.length;
          setWalletAddress(
            JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
              length - 1
            ].accountIds[0],
          );
          setIsPaired(true);
          const check = await getUserReward(
            JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
              length - 1
            ].accountIds[0],
            chainDetail.chain_id,
          );
          if (
            router.query.ref &&
            (check?.data === null || check?.data.referred_by === null)
          ) {
            addUserInReward(
              JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
                length - 1
              ].accountIds[0],
              chainDetail.chain_id,
              router.query.ref,
            );
          }
        });
      } else {
        initHashpack().then(() => {
          if (
            localStorage.getItem("hashconnectData") &&
            JSON.parse(localStorage.getItem("hashconnectData")).pairingData
              .length > 0
          ) {
            setWalletAddress(accountId);
          }
          setIsPaired(true);
        });
      }
    }

    //setWallet(address);// Call the callback function with the new wallet address
  };

  const handleOtherChains = useCallback(() => {
    if (isConnected) {
      openAccountModal();
      setWalletAddress(address);
    } else {
      openConnectModal();
      setWalletAddress("Connect");
    }
  }, [isConnected, address]);

  const handleSolana = useCallback(async () => {
    if (connected) {
      await disconnect();
      setWalletAddress("Connect");
    } else {
      try {
        await connect();
        setWalletAddress(publicKey?.toBase58() || "Connected");
      } catch (error) {
        console.error("Solana wallet connection failed:", error);
      }
    }
  }, [connect, disconnect, connected, publicKey]);

  const handleTon = useCallback(async () => {
    try {
      if (wallet) {
        console.log("ton already connected");
        tonConnectUI.disconnect();
        setWalletAddress("Connect");
      } else {
        await tonConnectUI.openModal();

        // Set up wallet change listener
        tonConnectUI.onStatusChange((wallet) => {
          if (wallet) {
            // Use the user-friendly address format
            // const friendlyAddress = useTonAddress(true);
            setWalletAddress(wallet.account.address || "Connected");
            console.log("TON wallet status changed:", wallet.account.address);
          } else {
            setWalletAddress("Connect");
            console.log("TON wallet disconnected");
          }
        });
      }
    } catch (error) {
      console.error("Ton wallet connection failed:", error);
      setWalletAddress("Connect");
    }
  }, [tonConnectUI, wallet]);

  // Add useEffect to handle initial wallet state and cleanup
  useEffect(() => {
    if (chainDetail?.chain_id === "ton") {
      // Set up initial wallet status
      if (wallet) {
        setWalletAddress(userFriendlyAddress || "Connected");
      }

      // Set up wallet change listener
      const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
        if (wallet) {
          setWalletAddress(userFriendlyAddress || "Connected");
        } else {
          setWalletAddress("Connect");
        }
      });

      // Cleanup function
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [chainDetail?.chain_id, wallet, tonConnectUI, userFriendlyAddress]);

  const connectWallet = useCallback(() => {
    switch (chainDetail?.chain_id) {
      case "296":
        handleHedera();
        break;
      case "solana":
        handleSolana();
        break;
      case "xrp":
        connectXRP();
        break;
      case "ton":
        handleTon();
        break;
      default:
        handleOtherChains();
        break;
    }
  }, [chainDetail, handleHedera, handleSolana, connectXRP, handleOtherChains]);

  useEffect(() => {
    select(PhantomWalletName);
  }, []);

  return (
    <>
      {selectedChain?.toLowerCase() === "solana" ? (
        <div
          id="connect-button"
          onClick={() => {
            console.log("click");
          }}
        >
          <WalletMultiButton className="custom-wallet-button" />
        </div>
      ) : (
        <button
          type="button"
          className="flex h-10 p-3 md:p-4 justify-center items-center gap-1 mr-2 md:mr-0 rounded bg-green-4 shadow-lg text-white text-xs font-semibold md:font-medium md:text-sm"
          style={{ boxShadow: "4px 4px 0px 0px #0A7128" }}
          onClick={() => connectWallet()}
        >
          {walletAddress && walletAddress !== "Connect"
            ? walletAddress?.length < 12
              ? walletAddress
              : walletAddress?.slice(0, 4) + "..." + walletAddress?.slice(-4)
            : "Connect"}
          <span>
            <Image src={walletIcon} alt="wallet logo" />
          </span>
        </button>
      )}
    </>
  );
};

export const ModalButton = ({ children, className, ...props }) => {
  return (
    <>
      <button
        {...props}
        className={`bg-green-4 text-white flex items-center px-4 py-2 rounded-sm  ${className}`}
        style={{ boxShadow: "4px 4px 0px 0px #0A7128" }}
      >
        {children}
      </button>
    </>
  );
};
export const ModalButton2 = ({ children, className, ...props }) => {
  return (
    <>
      <button
        {...props}
        className={` text-white flex items-center px-4 py-2 rounded-sm  ${className}`}
        style={{ boxShadow: "4px 4px 0px 0px #c63e3e" }}
      >
        {children}
      </button>
    </>
  );
};

export const TableButton = ({ children, className, pagename, ...props }) => {
  return (
    <button
      {...props}
      className={`border-table-button-border border-solid border-2 rounded-md bg-transparent ${className}`}
    >
      {children}
    </button>
  );
};

export const RowDropdownButton = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`underline bg-transparent font-semibold ${className}`}
    >
      {children}
    </button>
  );
};

const Button = ({ children, clickHandler, type, classes, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  // Dynamic styles based on pressed state
  const buttonClass = `
    flex h-10 p-3 md:p-4 justify-center items-center gap-1 mr-2 md:mr-0 rounded
    ${type === "red" ? "bg-red" : "bg-green-4"}
    shadow-lg text-white text-sm
    transition-all duration-200 ease-in-out transform
    ${isPressed ? "scale-95" : "scale-100"}
  `;

  const boxShadow = isPressed
    ? "none"
    : `4px 4px 0px 0px ${type === "red" ? "#800000" : "#0A7128"}`;

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      type="button"
      className={`${buttonClass} ${classes} disabled:bg-transparent disabled:text-[#afafaf] disabled:!shadow-none disabled:border border-solid border-white`}
      style={{ boxShadow }}
      onClick={clickHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
