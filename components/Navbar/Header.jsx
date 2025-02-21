import { useRouter } from "next/router";
import React, { useMemo } from "react";
import LendImage from "../../public/images/lendHeader.png";
import BorrowImage from "../../public/images/borrowHeader.png";
import LoanImage from "../../public/images/loanHeader.png";
import OfferImage from "../../public/images/offerHeader.png";
import Image from "next/image";

const Header = () => {
  const router = useRouter();

  const { leftHeaderText, rightMainText, leftSubText, imagePath } =
    useMemo(() => {
      let imagePath =
        router?.pathname === "/[chain]"
          ? LendImage
          : router?.pathname?.includes("offer")
          ? OfferImage
          : router?.pathname?.includes("borrow")
          ? BorrowImage
          : router?.pathname?.includes("loan")
          ? LoanImage
          : "";

      let leftHeaderText =
        router?.pathname === "/[chain]"
          ? "Make loan offers"
          : router?.pathname?.includes("offer")
          ? "Manage your"
          : router?.pathname?.includes("borrow")
          ? "Borrow against"
          : router?.pathname?.includes("loan")
          ? "Manage your"
          : "";

      let leftSubText =
        router?.pathname === "/[chain]"
          ? "On NFTs"
          : router?.pathname?.includes("offer")
          ? "Bid offers"
          : router?.pathname?.includes("borrow")
          ? "NFTs instantly"
          : router?.pathname?.includes("loan")
          ? "Active loans"
          : "";

      let rightMainText =
        router?.pathname === "/[chain]"
          ? "Explore various collections and pools, set your bid price, and the best offer becomes visible to borrowers. The NFT is then secured as collateral when loan offer is accepted. You will be repaid at the end of the loan. If defaulted, you receive the NFT."
          : router?.pathname?.includes("offer")
          ? "Browse bids for a collection, edit and cancel any unclaimed bids. If the loan repaid then the loan amount with interest gets paid to same address and if it is not repaid, then you can claim NFT."
          : router?.pathname?.includes("borrow")
          ? "Browse the collections below, and borrow against NFT from any collection. The current best loan offer is shown to you. When you take an offer, NFT is used as collateral. NFT is sent back when the loan is repaid, if not repaid, NFT gets transferred to the lender."
          : router?.pathname?.includes("loan")
          ? "Browse loans for collection, and repay by or before loan expiry to retain the ownership of NFT. If a loan is not repaid then NFT gets transferred to the lender. You can also rent this NFT while it is on loan to make passive income."
          : "";

      return { leftHeaderText, rightMainText, leftSubText, imagePath };
    }, [router]);

  return (
    <div
      className="h-fit mb-2  w-full bg-green-1 items-center px-16 relative hidden lg:flex"
      style={{ boxShadow: "0px 8px 0px 0px #8FE6A4" }}
    >
      <img
        src={"/images/star1.png"}
        alt=""
        className="left-2/3 -bottom-4 w-64 absolute h-auto"
      />
      <img
        src={"/images/star2.png"}
        alt=""
        className="absolute right-0 bottom-0 h-3/4 w-auto"
      />
      <img
        src={"/images/star3.png"}
        alt=""
        className="h-2/4 w-auto absolute left-4 bottom-0"
      />
      <img
        src={"/images/star4.png"}
        alt=""
        className="h-3/4 w-auto opacity-10 absolute left-0 top-0"
      />

      <div className="min-w-fit flex items-center gap-4">
        <div>
          <h5 className="text-medium whitespace-nowrap text-green-12">
            {leftHeaderText}
          </h5>
          <p className="text-green-4 text-2xl font-semibold">{leftSubText}</p>
        </div>
        <Image
          height={192}
          width={192}
          src={imagePath}
          alt=""
          className="h-20 w-auto mr-16"
        />
      </div>
      <h5 className="grow text-xs text-green-12">{rightMainText}</h5>
    </div>
  );
};

export default Header;
