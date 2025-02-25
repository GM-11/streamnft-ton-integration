import React from "react";
import { useRouter } from "next/router";
import Loader from "../Reusables/loan/Loader";
import { LendRentCard as MartCard } from "../Reusables/mart/Card/Card";
import { LendRentCard as RentCard } from "../Reusables/rent/Card/Card";
import { useUserWalletContext } from "@/context/UserWalletContext";
import WalletIcon from "../../public/images/Wallet.svg";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Button from "../Reusables/utility/Button";
import Image from "next/image";

const CardsSection = ({
  setModalType,
  cardsData,
  cardDatatype,
  setDataItem,
  msg,
  disable,
  loading,
  tab,
  tokenData,
  isFilterOpen,
}) => {
  const router = useRouter();
  const { pathname } = router;

  const LendRentCard = pathname.includes("rent") ? RentCard : MartCard;
  const { isTokenSet, setShowSignInModal } = useUserWalletContext();
  const { isConnected, address } = useUserWalletContext();
  const { openConnectModal } = useConnectModal();

  if (!isConnected && !router.pathname.includes("marketplace")) {
    return (
      <div className="flex flex-col w-full items-center justify-center ">
        <h3 className="text-2xl text-center tracking-tight text-white mb-4">
          Connect your wallet to proceed
        </h3>
        <Button
          buttonClasses={
            "!w-fit !whitespace-nowrap flex gap-3 items-center !bg-green-4 !text-white"
          }
          onClick={openConnectModal}
        >
          <Image src={WalletIcon} height={16} width={16} alt="wallet" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  // if (!isTokenSet) {
  //   return (
  //     <div className="flex flex-col items-center justify-center ">
  //       <h1 className="text-2xl text-center font-bold text-white mb-4">
  //         Sign in with your wallet to proceed
  //       </h1>
  //       <Button
  //         buttonClasses={
  //           "!w-[40%] flex gap-3 items-center"
  //         }
  //         onClick={() => {
  //           setShowSignInModal(true);
  //         }}
  //       >
  //         <Image src={WalletIcon} height={16} width={16} alt="wallet" />
  //         Sign in with your wallet
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <div className="!text-white grow">
      {loading ? (
        <Loader customMessage={"Loading Data"} />
      ) : (typeof cardsData === "undefined" || cardsData?.length <= 0) &&
        msg !== "" ? (
        <div className="w-full h-fit my-4 flex items-center justify-center">
          <h1 className="text-2xl text-center  ">{msg}</h1>
        </div>
      ) : cardsData?.length <= 0 ? (
        <div className="w-full h-fit my-4 flex items-center justify-center">
          <h1 className="text-2xl text-center  ">No Data Found</h1>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 overflow-x-hidden xs:!grid-cols-2 justify-center ${
            isFilterOpen
              ? "sm:!grid-cols-3 lg:!grid-cols-4"
              : "sm:!grid-cols-4 lg:!grid-cols-5"
          } gap-6 p-4 md:px-0 md:py-8`}
        >
          {cardsData
            // ?.sort((a, b) => parseFloat(a.saleprice) - parseFloat(b.saleprice))
            ?.map((item, index) => {
              item = {
                ...item,
                buttonValue: pathname.includes("myassets") ? "Lend" : "Rent",
              };
              return (
                <LendRentCard
                  key={index}
                  isHomeCard={false}
                  img={item.image}
                  name={item.name}
                  owner={item.owner}
                  data={item}
                  buttonValue={item.buttonValue}
                  setModalType={setModalType}
                  setDataItem={setDataItem}
                  disable={disable}
                  cardDatatype={cardDatatype}
                  tab={tab}
                  tokenData={tokenData}
                  cardIndex={index + 1}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CardsSection;
