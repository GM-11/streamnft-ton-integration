import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import Button from "../Button";
import Image from "next/image";
import trophyImage from "../../../../public/images/trophyIcon.png";
import linkIcon from "../../../../public/images/link.png";
import giftIcon from "../../../../public/images/gift.png";
import walletIcon from "../../../../public/images/Wallet.svg";
import crossHairIcon from "../../../../public/images/crosshair.png";
import Loader from "../../loan/Loader";

const ClaimRedeemFromExploreModal = ({
  title,
  handleRedeemReward,
  handleClaimUtility,
  backendData,
  open,
  handleClose,
  generatedCode,
  loadingForModal,
  showRedeemButton,
  selectedNft,
}) => {
  const [clickedButton, setClickedButton] = useState("");

  const isUtilityClaimed = useMemo(() => {
    return selectedNft?.claimed?.some(
      (obj) => obj?.utilityId === backendData?.utilityId
    );
  }, [selectedNft, backendData]);

  const { isUtilityRedeemed, reward } = useMemo(() => {
    const isUtilityRedeemed = generatedCode?.tokens?.some(
      (el) => el?.tokenId?.toString() === selectedNft?.tokenId?.toString()
    );

    return { isUtilityRedeemed };
  }, [generatedCode, selectedNft]);

  const code = useMemo(() => {
    return generatedCode?.codeInfo?.map((el) => el?.code);
  }, [generatedCode]);

  const airDropWinInfo = useMemo(() => {
    return generatedCode?.tokens?.find(
      (el) => Number(el?.tokenId) === Number(selectedNft?.tokenId)
    )?.winInfo;
  }, [generatedCode]);

  return (
    <Modal title={title} open={open} handleClose={handleClose}>
      <div className="min-h-[500px] max-h-[500px] overflow-y-auto p-3 md:p-4 md:px-8">
        {loadingForModal ? (
          <>
            <Loader
              customMessage={
                clickedButton === "claim"
                  ? "Linking reward ... "
                  : "Redeeming reward ..."
              }
            />
          </>
        ) : isUtilityRedeemed ? (
          <div className="min-h-[400px] w-full bg-grayscale-27">
            <p>
              {backendData?.utilityType === "Coupon Code" ? (
                <>
                  Code Generated
                  <span className="font-normal block my-2">
                    Here is your generated code: ({code})
                  </span>
                </>
              ) : backendData?.utilityType === "NFT Airdrop" ? (
                <>
                  <span className="font-normal mb-3 mt-1 block">
                    🎉 Congratulations! You've received a special NFT Airdrop!
                    <br />
                    Your token ID is: <strong>{airDropWinInfo}</strong>. Enjoy
                    your unique digital asset!
                  </span>
                </>
              ) : backendData?.utilityType === "Fungible Token Airdrop" ? (
                <>
                  <span className="font-normal mb-3 mt-1 block">
                    🎉 You've won a token airdrop!
                    <br />
                    You've received{" "}
                    <strong>{reward?.winInfo / 1000000} USDC</strong> . Time to
                    grow your crypto portfolio!
                  </span>
                </>
              ) : (
                <>
                  <span className="font-normal mb-3 mt-1 block p-8">
                    {generatedCode?.winInfo}
                  </span>
                </>
              )}
            </p>{" "}
          </div>
        ) : (
          <>
            <div className="h-fit w-full bg-black-9 rounded-xl">
              <div className="h-24 w-full bg-blue-4 rounded-xl flex items-center p-3 pr-24 relative overflow-hidden">
                <h1 className="text-sm md:text-base">
                  Congratulations! You're a step away from redeeming reward for
                  NFT.
                </h1>
                <Image
                  src={trophyImage}
                  alt="#"
                  className="h-[72px] w-auto object-cover absolute bottom-0 right-0"
                />
              </div>
              <div className="h-fit py-2 px-4 text-[13px] font-normal">
                Please follow below steps to redeem your rewards
              </div>
            </div>
            <div className="flex flex-col w-full items-start gap-2 mt-5 relative pl-10 pb-8">
              <div className="absolute top-0 left-0 h-full flex items-center flex-col">
                <Image
                  src={linkIcon}
                  alt="#"
                  className="h-6 w-auto object-cover"
                />
                <div className="w-px h-56 border-l-2 border-dashed border-grey"></div>
              </div>
              <div className="flex h-fit gap-3 items-center">
                <h5 className="text-sm">Link Reward to Your NFT</h5>
                {isUtilityClaimed && (
                  <div className="bg-blue-5 h-fit w-fit rounded-md py-1 !text-xs flex gap-2 items-center px-3">
                    <div className="h-2 w-2 rounded-full bg-blue-6 "></div>
                    Reward Linked
                  </div>
                )}
              </div>
              <p className="text-xs text-grey">
                Your rewards will transfer with the NFT if ownership changes,
                allowing the new owner to avail the reward if you haven't
                already redeemed it.
              </p>
              {!isUtilityClaimed && (
                <Button
                  disabled={isUtilityClaimed}
                  onClick={() => {
                    setClickedButton("claim");
                    handleClaimUtility(backendData?.utilityId);
                  }}
                  buttonClasses={"w-2/3 sm:w-1/3 mt-2 text-xs !w-fit !gap-4"}
                >
                  Link Reward
                  <Image src={walletIcon} className="h-4 w-auto" />
                </Button>
              )}
            </div>
            <div className="flex flex-col w-full items-start gap-2 relative pl-10">
              <div className="absolute top-0 left-0 h-full flex items-center flex-col">
                <Image
                  src={giftIcon}
                  alt="#"
                  className={`h-6 w-auto object-cover ${
                    !isUtilityClaimed && "filter grayscale"
                  }`}
                />
              </div>
              <h5 className="text-sm">Redeem this benefit yourself</h5>
              <p className="text-xs text-grey">
                If you redeem the reward, it gets consumed and will not be
                transferred to the new owner.
              </p>
              <Button
                disabled={!isUtilityClaimed}
                onClick={() => {
                  setClickedButton("redeem");
                  handleRedeemReward(backendData?.utilityId);
                }}
                buttonClasses={"w-2/3 sm:w-1/3 mt-2 text-xs !w-fit !gap-4"}
              >
                Redeem
                <Image src={crossHairIcon} alt="#" className="h-4 w-auto" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ClaimRedeemFromExploreModal;
