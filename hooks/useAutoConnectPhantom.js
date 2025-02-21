import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import { useCallback } from "react";

const useAutoConnectPhantom = () => {
  const { select, connect, connected } = useWallet();
  const connectPhantom = useCallback(async () => {
    let walletName = window.localStorage.getItem("walletName");
    walletName =
      !walletName || walletName === "undefined" ? "Phantom" : walletName;

    const wallet = {
      Phantom: PhantomWalletName,
    };
    if (!connected) {
      select(wallet[walletName]);
    }
  }, [select, connect, connected]);
  return connectPhantom;
};
export default useAutoConnectPhantom;
