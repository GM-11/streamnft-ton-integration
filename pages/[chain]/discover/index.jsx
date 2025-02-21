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
import { Mixpanel } from "@/utils/mixpanel";
import CollectionTableSection from "@/components/Reusables/mart/sections/CollectionTableSection";
import TrendingSection from "@/components/Reusables/mart/sections/TrendingSection";
import Loader from "@/components/Reusables/loan/Loader";
import { getCollectionCategories } from "@/utils/apiRequests";
import { CollectionContext } from "@/context/CollectionContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const index = () => {
  const { collections, collectionsLoading, chainDetail } =
    useContext(ChainContext);

  const { collectionCategories } = useContext(CollectionContext);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const [tagsArray, setTagsArray] = useState([]);

  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    setTagsArray(["All", ...Object.keys(collectionCategories)]);
  }, [collectionCategories]);

  const subcategories = useMemo(() => {
    const allSubcategories = {
      All: Object.entries(collectionCategories).flatMap(
        ([category, subcategories]) => {
          return {
            categoryTitle: category,
            headerTitle: `Trending in ${category}`,
            data: collections,
          };
        }
      ),
      ...Object.entries(collectionCategories).reduce(
        (acc, [category, subcategories]) => ({
          ...acc,
          [category]:
            subcategories?.map((sub) => ({
              categoryTitle: sub,
              headerTitle: `Trending in ${sub}`,
              data: collections,
            })) || [],
        }),
        {}
      ),
    };

    return allSubcategories;
  }, [collections, collectionCategories]);

  console.log({ subcategories });

  useEffect(() => {
    const filteredCategories = subcategories[activeTag];
    setSelectedCategories(filteredCategories);
  }, [activeTag, subcategories]);

  useEffect(() => {
    Mixpanel.track("On Discover Page");
  }, []);

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
      <div className="h-fit w-full py-0 pb-24 px-[5%] md:px-0 ">
        {collectionsLoading ? (
          <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <Section1
              data={subcategories}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
              cardsData={collections}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              tagsArray={tagsArray}
            />
            <CollectionTableSection />
            <TrendingSection data={selectedCategories} />
          </>
        )}
      </div>
    </Fragment>
  );
};

export default index;
