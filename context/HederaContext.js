import React, { createContext, useEffect, useState } from "react";

export const HederaContext = createContext();

export const HederaContextWrapper = ({ children }) => {
  const [isPaired, setIsPaired] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [nftSignal, setNftSignal] = useState(0);
  const [balanceSignal, setBalanceSignal] = useState(0);

  useEffect(() => {
    const hashconnectData = JSON.parse(localStorage.getItem("hashconnectData"));
    if (hashconnectData && hashconnectData.pairingData.length > 0) {
      const length = hashconnectData.pairingData.length;
      setAccountId(hashconnectData.pairingData[length - 1].accountIds[0]);
    }
  }, [isPaired]);

  return (
    <HederaContext.Provider
      value={{
        isPaired,
        setIsPaired,
        accountId,
        nftSignal,
        setNftSignal,
        balanceSignal,
        setBalanceSignal,
      }}
    >
      {children}
    </HederaContext.Provider>
  );
};
