import React, {
  Fragment,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";

import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";

import { referralRegisterCall } from "@/services/mart/reusableFunctions";
import Section1 from "@/components/Reusables/mart/sections/Section1";
import HomeSection from "@/components/Reusables/mart/sections/HomeSection";
import { Mixpanel } from "@/utils/mixpanel";
import { CollectionContext } from "@/context/CollectionContext";
import Slider1 from "@/components/Reusables/mart/slider/Slider";
import TabComponent from "@/components/Reusables/mart/Tab";
import { useUserWalletContext } from "@/context/UserWalletContext";

const index = () => {
  const { collections, selectedChain, chainDetail } = useContext(ChainContext);
  const { userAllCollection, collectionSignal, collectionLoading } =
    useContext(CollectionContext);

  const [collection, setCollection] = useState([]);

  useEffect(() => {
    setCollection(collections);

    Mixpanel.track("On Homepage");
  }, [selectedChain, collections]);

  const { address } = useUserWalletContext();

  const walletAddress = useMemo(() => {
    return chainDetail?.evm ? address : "";
  }, [chainDetail, address]);

  useEffect(() => {
    const referralId = localStorage.getItem("referralCode");

    const fn = async () => {
      await referralRegisterCall({
        walletAddress,
        referralId,
      });
    };

    if (walletAddress && referralId) {
      fn();
    }
  }, [walletAddress]);

  return (
    <Fragment>
      <div className="h-fit w-full py-0 pb-24 px-[5%] md:px-0 min-h-[calc(100vh-10rem)]">
        <HomeSection />
        <TabComponent />
        <Slider1 data={userAllCollection} type="launchpad" />
      </div>
    </Fragment>
  );
};

export default index;
