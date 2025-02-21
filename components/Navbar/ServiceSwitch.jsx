"use client";
import { useRouter } from "next/router";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
} from "react";
import clsx from "clsx";
import { ChainContext } from "@/context/ChainContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const ServiceSwitch = () => {
  const [selectedOption, setSelectedOption] = useState("");

  const router = useRouter();
  const { isConnected } = useUserWalletContext();
  const { symbol, utilityId } = router.query;
  const { selectedChain } = useContext(ChainContext);
  const { checkLoginValidity } = useUserWalletContext();

  const options = useMemo(() => {
    const baseLoanPath = `/${selectedChain}/loan`;
    const baseRentPath = `/${selectedChain}/rent/${symbol}`;
    const baseMartPath = `/${selectedChain}/mart/${symbol}`;
    const baseMintPath = `/mint`;

    if (router.pathname.includes("loan")) {
      return [
        { label: "Lend", value: "lend", path: `${baseLoanPath}/lend` },
        { label: "Offers", value: "offers", path: `${baseLoanPath}/offers` },
        { label: "Borrow", value: "borrow", path: `${baseLoanPath}/borrow` },
        { label: "Loans", value: "loans", path: `${baseLoanPath}/loans` },
      ];
    } else if (symbol?.length > 0 && router.pathname.includes("rent")) {
      return [
        {
          label: "My Assets",
          value: "myassets",
          path: `${baseRentPath}/myassets`,
        },
        {
          label: "Marketplace",
          value: "marketplace",
          path: `${baseRentPath}/marketplace`,
        },
        {
          label: "My Rentals",
          value: "rentals",
          path: `${baseRentPath}/rentals`,
        },
      ];
    } else if (router.pathname.includes("utility")) {
      return [
        {
          label: "Discover Rewards",
          value: "explore",
          path: `/utility/explore`,
        },
        {
          label: "Rewards Marketplace",
          value: "marketplace",
          path: `/utility/marketplace`,
        },
        {
          label: "Create Reward",
          value: "create",
          path: `/utility/create`,
          handler: async () => {
            const isTokenValid = await checkLoginValidity();
            if (isTokenValid) {
              router.push(`/utility/create`);
            }
          },
        },
        {
          label: "Manage",
          value: "manage",
          path: `/utility/manage`,
          handler: async () => {
            const isTokenValid = await checkLoginValidity();
            if (isTokenValid) {
              router.push(`/utility/manage`);
            }
          },
        },
      ];
    } else if (symbol?.length > 0 && router.pathname.includes("mart")) {
      return [
        {
          label: "My Assets",
          value: "myassets",
          path: `${baseMartPath}/myassets`,
        },
        {
          label: "Marketplace",
          value: "marketplace",
          path: `${baseMartPath}/marketplace`,
        },
      ];
    } else if (router.pathname.includes("mint")) {
      return [
        {
          label: "Create Collection",
          value: "collection",
          path: `${baseMintPath}/collection`,
        },
        {
          label: "Create Nft",
          value: "nft",
          path: `${baseMintPath}/nft`,
        },
      ];
    }
    return [];
  }, [router, isConnected, selectedChain]);

  useEffect(() => {
    const currentPath = router.asPath;

    const matchedOption = options.find((option) =>
      currentPath.includes(option.value)
    );

    // Check for `utilityId` in query and highlight `Rewards Marketplace` if applicable
    if (utilityId?.length > 0) {
      setSelectedOption("marketplace");
    } else if (matchedOption) {
      setSelectedOption(matchedOption.value);
    }
  }, [router.asPath, options, utilityId]);

  const handleOptionClick = useCallback(
    (option) => {
      if (option.handler) {
        option.handler();
      } else {
        router.push(option.path);
      }
      setSelectedOption(option.value);
    },
    [router]
  );

  return (
    <>
      {options.length > 0 && (
        <div className="w-full h-fit md:h-8 py-2 md:py-0 bg-green-2 flex items-center justify-center gap-4 md:gap-12">
          {options.map((option, index) => (
            <h5
              key={index}
              className={clsx(
                selectedOption === option.value ? "text-white" : "text-green-3",
                "transition-all duration-300 cursor-pointer text-2xs md:text-xs text-center"
              )}
              onClick={() => handleOptionClick(option)}
              id={option.label}
            >
              {option.label}
            </h5>
          ))}
        </div>
      )}
    </>
  );
};

export default ServiceSwitch;
