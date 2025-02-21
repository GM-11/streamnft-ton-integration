import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Button from "../Button";
import NFTSlider from "../NFTSlider";
import { useAccount } from "wagmi";
import nftCalls from "@/services/utility/nftCalls";
import { useRouter } from "next/router";
import Loader from "../../loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const CheckRewardsModal = ({
  title,
  handleRedeemReward,
  handleClaimUtility,
  backendData,
  open,
  handleClose,
  generatedCode,
  selectedNft,
  setSelectedNft,
  loadingForModal,
  tokens,
}) => {
  const [clickedButton, setClickedButton] = useState("");

  const [tokenOnUtilityClaimed, setTokenOnUtilityClaimed] = useState(null);

  const { address } = useUserWalletContext();

  const router = useRouter();

  const code = useMemo(() => {
    return generatedCode?.codeInfo?.map((el) => el?.code);
  }, [generatedCode]);

  const isTargetAvailable = useMemo(() => {
    return backendData?.collectionUtility?.target?.length > 0;
  }, [backendData]);

  const isUtilityRedeemedOnSelectedToken = (tokenId) => {
    const isTokenRedeemed =
      generatedCode?.tokens?.some((el) => {
        return Number(el?.tokenId) === Number(tokenId);
      }) ?? false;

    return isTokenRedeemed;
  };

  const { isUtilityRedeemed, reward } = useMemo(() => {
    const isUtilityRedeemed = generatedCode?.redeem;

    const reward = generatedCode?.codeInfo?.[0];

    return { isUtilityRedeemed, reward };
  }, [generatedCode, tokenOnUtilityClaimed]);

  // console.log("reward", generatedCode);

  useEffect(() => {
    for (const token of tokens) {
      if (
        token.claimed.some((el) => el.utilityId === router?.query?.utilityId)
      ) {
        setSelectedNft(token);
        setTokenOnUtilityClaimed(token);
        break;
      }
    }
  }, [tokens, router.query.utilityId]);

  const isAllRewardsClaimed = useMemo(() => {
    return (
      backendData?.collectionUtility?.winners?.length >=
      backendData?.collectionUtility?.reward?.count
    );
  }, [backendData]);

  return (
    <Modal title={title} open={open} handleClose={handleClose}>
      {loadingForModal ? (
        <>
          <div className="h-full min-h-[400px] w-full flex flex-col items-center justify-center grow">
            <Loader
              customMessage={
                clickedButton === "claim"
                  ? "Linking reward ... "
                  : "Redeeming reward ..."
              }
            />
          </div>
        </>
      ) : (
        <>
          {tokens?.length < 0 ? (
            <div className="flex flex-col items-center justify-center">
              <h5>No NFTs found for target collection</h5>
            </div>
          ) : (
            <div className="min-h-[400px] max-h-[400px] overflow-y-auto p-4 px-8">
              {backendData?.collectionUtility?.selectionType === "raffle" ? (
                <>
                  {backendData?.userInfo?.isWinner ? (
                    <>
                      {!backendData?.userInfo?.claimed && (
                        <h5 className="my-4">
                          {Object.keys(selectedNft)?.length > 0
                            ? "NFT Selected! Please proceed to link your reward"
                            : "Select an NFT to attach your reward (You can assign a benefit to one NFT)"}
                        </h5>
                      )}
                      {(isTargetAvailable ||
                        router?.query?.utilityId?.split("-")?.[0] ===
                          "quest") && (
                        <>
                          {backendData?.userInfo?.claimed ? (
                            <>
                              {isUtilityRedeemed ? (
                                <>
                                  <p className="mb-2">
                                    {
                                      backendData?.collectionUtility?.reward
                                        ?.congratulationText
                                    }
                                  </p>
                                  {(generatedCode?.winInfo?.length > 0 ||
                                    generatedCode?.codeInfo?.length > 0) && (
                                    <p>
                                      {backendData?.collectionUtility
                                        ?.utilityType === "Coupon Code" ? (
                                        <>
                                          Code Generated
                                          <span className="font-normal block my-2">
                                            Here is your generated code: (
                                            {generatedCode?.codeInfo?.[0]?.code}
                                            )
                                          </span>
                                        </>
                                      ) : backendData?.collectionUtility
                                          ?.utilityType === "NFT Airdrop" ? (
                                        <>
                                          <span className="font-normal mb-3 mt-1 block">
                                            Your token ID is:{" "}
                                            <strong>{reward?.winInfo}</strong>.
                                            Enjoy your unique digital asset!
                                          </span>
                                        </>
                                      ) : backendData?.collectionUtility
                                          ?.utilityType ===
                                        "Fungible Token Airdrop" ? (
                                        <>
                                          <span className="font-normal mb-3 mt-1 block">
                                            You've received{" "}
                                            <strong>
                                              {reward?.winInfo / 1000000} USDC
                                            </strong>{" "}
                                            . Time to grow your crypto
                                            portfolio!
                                          </span>
                                        </>
                                      ) : (
                                        ""
                                      )}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="my-3 font-normal">
                                  Congrats! Your reward is claimed on the
                                  selected NFT successfully. Please click below
                                  to redeem it.
                                </p>
                              )}
                              {router?.query?.utilityId?.split("-")?.[0] !==
                                "quest" && (
                                <div className="w-36 h-fit flex flex-col items-center justify-center mr-4 my-4 mt-8">
                                  <div className="relative h-[96px] w-[96px]">
                                    <img
                                      src={tokenOnUtilityClaimed?.image}
                                      className={`min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] object-cover rounded-xl border border-solid border-gray-700`}
                                    />
                                  </div>
                                  <p className="font-numans text-white text-base mt-2 text-center">
                                    Token #
                                    {Number(tokenOnUtilityClaimed?.tokenId)}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <NFTSlider
                              selectedNft={selectedNft}
                              setSelectedNft={setSelectedNft}
                              tokens={tokens}
                              backendData={backendData}
                              isUtilityRedeemedOnSelectedToken={
                                isUtilityRedeemedOnSelectedToken
                              }
                            />
                          )}
                        </>
                      )}
                      {backendData?.userInfo?.claimed ? (
                        <>
                          <div className="w-full flex flex-col items-center justify-center gap-3 px-36 mt-8">
                            {!isUtilityRedeemed && (
                              <Button
                                buttonClasses="w-full"
                                onClick={() => {
                                  handleRedeemReward();
                                  setClickedButton("redeem");
                                }}
                              >
                                {backendData?.collectionUtility?.utilityType ===
                                "Coupon Code"
                                  ? "Generate Code"
                                  : "Redeem Reward"}
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {Object.keys(selectedNft)?.length > 0 && (
                            <Button
                              buttonClasses="w-full"
                              onClick={() => {
                                handleClaimUtility();
                                setClickedButton("claim");
                              }}
                            >
                              Link reward
                            </Button>
                          )}
                          <h5 className=" text-xs w-full text-center mt-12">
                            NOTE** Claim your reward before utility ends
                          </h5>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <h5 className="my-4">
                          Following users have won the raffle
                        </h5>
                        <div className="flex flex-col gap-4">
                          {backendData?.collectionUtility?.winners}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {!backendData?.userInfo?.claimed && (
                    <h5 className="my-4">
                      {Object.keys(selectedNft)?.length > 0
                        ? "NFT Selected! Please proceed to link your reward"
                        : "Select an NFT to attach your reward (You can assign a benefit to one NFT)"}
                    </h5>
                  )}
                  {(isTargetAvailable ||
                    router?.query?.utilityId?.split("-")?.[0] === "quest") && (
                    <>
                      {backendData?.userInfo?.claimed ? (
                        <>
                          {isUtilityRedeemed ? (
                            <>
                              <p className="mb-2">
                                {
                                  backendData?.collectionUtility?.reward
                                    ?.congratulationText
                                }
                              </p>
                              {(generatedCode?.winInfo?.length > 0 ||
                                generatedCode?.codeInfo?.length > 0) && (
                                <p>
                                  {backendData?.collectionUtility
                                    ?.utilityType === "Coupon Code" ? (
                                    <>
                                      <span className="font-normal block my-2">
                                        Here is your generated code: (
                                        {generatedCode?.codeInfo?.[0]?.code})
                                      </span>
                                    </>
                                  ) : backendData?.collectionUtility
                                      ?.utilityType === "NFT Airdrop" ? (
                                    <>
                                      <span className="font-normal mb-3 mt-1 block">
                                        Your token ID is:{" "}
                                        <strong>{reward?.winInfo}</strong>.
                                        Enjoy your unique digital asset!
                                      </span>
                                    </>
                                  ) : backendData?.collectionUtility
                                      ?.utilityType ===
                                    "Fungible Token Airdrop" ? (
                                    <>
                                      <span className="font-normal mb-3 mt-1 block">
                                        You've received{" "}
                                        <strong>
                                          {reward?.winInfo / 1000000} USDC
                                        </strong>{" "}
                                        . Time to grow your crypto portfolio!
                                      </span>
                                    </>
                                  ) : (
                                    ""
                                  )}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="my-3 font-normal">
                              Congrats! Your reward is claimed on the selected
                              NFT successfully. Please click below to redeem it.
                            </p>
                          )}
                          {router?.query?.utilityId?.split("-")?.[0] !==
                            "quest" && (
                            <div className="w-36 h-fit flex flex-col items-center justify-center mr-4 my-4 mt-8">
                              <div className="relative h-[96px] w-[96px]">
                                <img
                                  src={tokenOnUtilityClaimed?.image}
                                  className={`min-h-[96px] min-w-[96px] max-h-[96px] max-w-[96px] object-cover rounded-xl border border-solid border-gray-700`}
                                />
                              </div>
                              <p className="font-numans text-white text-base mt-2 text-center">
                                Token #{Number(tokenOnUtilityClaimed?.tokenId)}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <NFTSlider
                          selectedNft={selectedNft}
                          setSelectedNft={setSelectedNft}
                          tokens={tokens}
                          backendData={backendData}
                          isUtilityRedeemedOnSelectedToken={
                            isUtilityRedeemedOnSelectedToken
                          }
                        />
                      )}
                    </>
                  )}
                  {backendData?.userInfo?.claimed ? (
                    <>
                      <div className="w-full flex flex-col items-center justify-center gap-3 px-36 mt-8">
                        {!isUtilityRedeemed && (
                          <Button
                            buttonClasses="w-full"
                            onClick={() => {
                              handleRedeemReward();
                              setClickedButton("redeem");
                            }}
                          >
                            {backendData?.collectionUtility?.utilityType ===
                            "Coupon Code"
                              ? "Generate Code"
                              : "Redeem Reward"}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {Object.keys(selectedNft)?.length > 0 && (
                        <Button
                          buttonClasses="w-full"
                          onClick={() => {
                            handleClaimUtility();
                            setClickedButton("claim");
                          }}
                        >
                          Link reward
                        </Button>
                      )}
                      <h5 className=" text-xs w-full text-center mt-12">
                        NOTE** Claim your reward before utility ends
                      </h5>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default CheckRewardsModal;
