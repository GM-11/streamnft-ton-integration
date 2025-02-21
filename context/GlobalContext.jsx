import { chainArray } from "@/constants/chainConstants";
import { AUTHENTICATED, UNAUTHENTICATED } from "@/constants/globalConstants";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { initializeSDK } from "streamnft-evm-test";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [authStatus, setAuthStatus] = useState("unauthenticated");
  const [initialChain, setInitialChain] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const updateAuthStatus = () => {
      const token = localStorage.getItem("token");
      setAuthStatus(token ? AUTHENTICATED : UNAUTHENTICATED);
    };

    updateAuthStatus();

    window.addEventListener("storage", updateAuthStatus);

    return () => {
      window.removeEventListener("storage", updateAuthStatus);
    };
  }, []);

  useEffect(() => {
    // initializeSDK(process.env.NEXT_PUBLIC_STREAMNFT_API_KEY);
    const storedChain = router?.query?.chain ?? "skale nebula";

    if (storedChain) {
      const matchedChain = chainArray.find((chain) =>
        Object.values(chain).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(storedChain.toLowerCase()),
        ),
      );

      if (matchedChain) {
        setInitialChain(matchedChain);
      }
    }
  }, [router]);

  return (
    <GlobalContext.Provider value={{ authStatus, initialChain }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);

  return context;
}

export default GlobalContext;
