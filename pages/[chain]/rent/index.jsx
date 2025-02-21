"use client";
import React, { Fragment, useEffect, useState, useContext } from "react";
import AllNftsView from "@/components/Reusables/rent/AllNftsView/AllNftsView";
import { Mixpanel } from "@/utils/mixpanel";
import { ChainContext } from "@/context/ChainContext";
import ScrollHeader from "@/components/Reusables/rent/ScrollHeader/ScrollHeader";
import { useTonConnectUI } from "@tonconnect/ui-react";

const index = () => {
  const [collection, setCollection] = useState([]);
  // const conn = useConnection();
  const [TonConnectUI] = useTonConnectUI();

  const { collections, selectedChain } = useContext(ChainContext);

  useEffect(() => {
    setCollection(collections);
    console.log(selectedChain);
    console.log(TonConnectUI);

    Mixpanel.track("On Homepage");
  }, [selectedChain, collections]);

  return (
    <Fragment>
      <div className="h-fit w-full py-0 px-[5%] md:px-0 pt-12">
        <ScrollHeader />
        <AllNftsView collection={collection} />
      </div>
    </Fragment>
  );
};

export default index;
