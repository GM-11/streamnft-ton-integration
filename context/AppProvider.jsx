import { useMemo } from "react";
import ModalContextWrapper from "@/context/ModalContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "@rainbow-me/rainbowkit/styles.css";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { HederaContextWrapper } from "@/context/HederaContext";
import { PoolManagerContextWrapper } from "@/context/PoolManagerContext";
import ChainContextWrapper from "@/context/ChainContext";
import { OKXWalletAdapter } from "@/utils/OKXWalletAdapter";
import { wagmiConfig } from "@/config/wagmiConfig";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SignerProvider } from "@/context/SignerContext";
import UserNftContextProvider from "@/context/UserNftContext";
import ScrollHeaderContextWrapper from "@/context/ScrollHeaderContext";
import { CreateUtilityContextWrapper } from "@/context/CreateUtilityContext";
import UtilityContextProvider from "@/context/UtilityContext";
import PointsContextWrapper from "@/context/PointsContext";
import { SpaceContextWrapper } from "@/context/SpaceContext";
import { CollectionContextWrapper } from "@/context/CollectionContext";
import { UserWalletProvider } from "@/context/UserWalletContext";
import { useGlobalContext } from "@/context/GlobalContext";
import authenticationAdapter from "@/utils/authenticationAdapter";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const AppProvider = ({ children }) => {
  const solNetwork = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);

  const wallets = useMemo(() => [new OKXWalletAdapter()], [solNetwork]);

  const queryClient = new QueryClient();

  const demoAppInfo = {
    appName: "StreamNFT",
  };

  const { selectedChain, authStatus } = useGlobalContext();

  return (
    <ModalContextWrapper>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <WalletModalProvider>
            <GoogleOAuthProvider
              clientId={
                process.env.NEXT_PUBLIC_CLIENT_ID ??
                "267035738934-759vmvn20qligsr51jnffpur3f5qpjgl.apps.googleusercontent.com"
              }
            >
              <WagmiProvider config={wagmiConfig}>
                <QueryClientProvider client={queryClient}>
                  <RainbowKitAuthenticationProvider
                    adapter={authenticationAdapter}
                    status={authStatus}
                  >
                    <RainbowKitProvider
                      modalSize="wide"
                      appInfo={demoAppInfo}
                      theme={darkTheme({
                        accentColor: "#30b750",
                        accentColorForeground: "black",
                        borderRadius: "medium",
                        fontStack: "system",
                        overlayBlur: "small",
                      })}
                      initialChain={selectedChain}
                    >
                      <ChainContextWrapper>
                        <SignerProvider>
                          <HederaContextWrapper>
                            <UserWalletProvider>
                              <PoolManagerContextWrapper>
                                <UserNftContextProvider>
                                  <ScrollHeaderContextWrapper>
                                    <CollectionContextWrapper>
                                      <CreateUtilityContextWrapper>
                                        <SpaceContextWrapper>
                                          <UtilityContextProvider>
                                            <PointsContextWrapper>
                                              {children}
                                            </PointsContextWrapper>
                                          </UtilityContextProvider>
                                        </SpaceContextWrapper>
                                      </CreateUtilityContextWrapper>
                                    </CollectionContextWrapper>
                                  </ScrollHeaderContextWrapper>
                                </UserNftContextProvider>
                              </PoolManagerContextWrapper>
                            </UserWalletProvider>
                          </HederaContextWrapper>
                        </SignerProvider>
                      </ChainContextWrapper>
                    </RainbowKitProvider>
                  </RainbowKitAuthenticationProvider>
                </QueryClientProvider>
              </WagmiProvider>
            </GoogleOAuthProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ModalContextWrapper>
  );
};

export default AppProvider;
