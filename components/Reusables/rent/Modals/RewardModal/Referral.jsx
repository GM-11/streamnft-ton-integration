import React, { useContext, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Reusables/rent/Modals/Modal";
import * as Styles from "@/components/Reusables/rent/Modals/RewardModal/referModalStyles";
import { ModalContext } from "@/context/ModalContext";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { getReferralCode } from "@/services/rent/reusableFunctions";
import { ChainContext } from "@/context/ChainContext";
import { useUserWalletContext } from "@/context/UserWalletContext";

const RewardModal = () => {
  const { openModal, setOpenModal } = useContext(ModalContext);
  const { chainDetail, selectedChain } = useContext(ChainContext);
  const [generatedCode, setGeneratedCode] = useState("");
  const [count, setCount] = useState(0);

  const { address } = useUserWalletContext();
  const { publicKey } = useWallet();

  const getReferralCodeCall = async (walletAddress) => {
    try {
      const response = await getReferralCode(walletAddress);

      setGeneratedCode(response?.referralId);
      setCount(response?.totalReferrals);
    } catch (error) {
      console.error(error);
    }
  };

  const walletAddress = useMemo(() => {
    return chainDetail?.evm
      ? address
      : (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
        selectedChain
      ? JSON.parse(localStorage.getItem("hashconnectData"))?.pairingData[
          length - 1
        ]?.accountIds[0]
      : selectedChain === "Solana"
      ? publicKey.toBase58()
      : "";
  }, [chainDetail, address, publicKey, selectedChain]);

  const referralLink = `${
    process.env.NEXT_PUBLIC_RENT_URL ?? "https://streamnft-rent.vercel.app"
  }?ref=${generatedCode}`;

  useEffect(() => {
    getReferralCodeCall(walletAddress);
  }, [chainDetail, address, publicKey, openModal]);

  const referralCount = count;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <Modal
      headerText="Referral Details"
      buttonText="Cancel"
      handelButton={() => setOpenModal(false)}
    >
      <Styles.Wrapper>
        <div className="text-sm !font-numans text-white">
          <p className="text-[12px] leading-[16px] text-center">
            🚀 Get ready to supercharge your experience with our referral
            campaign – exclusively crafted just for YOU! It's time to spread the
            excitement and reap the rewards together!
          </p>
        </div>
        <div className="flex flex-row items-start gap-7 mt-4">
          <div className="image-container">
            <div className="text-green-5 text-[16px] font-semibold md:whitespace-nowrap font-numans">
              💎 Here's what awaits you
            </div>
            <div className="pl-5 pr-1">
              <ul className="list-disc !font-numans text-white text-[11.3px]">
                <li className="pb-1">
                  Up to 10 Referrals: Earn 1 Point for every connected wallet
                  and a whopping 10 hbar for each successful transaction on our
                  platform!
                </li>
                <li className="py-1">
                  10-25 Referrals: Enjoy an even sweeter deal with 1.5 Points
                  per connected wallet and a thrilling 15 hbar for every wallet
                  transaction!
                </li>
                <li className="py-1">
                  25+ Referrals: Reach for the stars with 2 Points for every
                  connected wallet and an exhilarating 20 hbar for each wallet
                  transaction!
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex-col flex justify-between items-start text-white   bg-[#2929294D] rounded-lg p-4 w-[100%]">
              <div className="text-[12px] !font-numans">
                🌟 Share the joy, invite your pals, and let the rewards roll in!
                Every referral takes you closer to the pinnacle of rewards!
              </div>
              <div className="flex flex-row !justify-between items-center mt-8 w-full">
                <div className="!bg-[#303030] !text-white rounded-md !px-3 !py-2 mr-2 w-full !text-xs">
                  <h5>{referralLink}</h5>
                </div>
                <button
                  className="bg-green-2 text-white px-3 !py-[0.4rem] rounded-md"
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex-col flex bg-[#2929294D] rounded-lg !p-4  !text-white w-full !justify-between items-center gap-7 !mt-5">
              <div className="text-[12px] !font-numans">
                🌈 Don't miss out on this opportunity to maximize your rewards
                and make your journey with us truly unforgettable! Start
                referring today and let the excitement begin!
              </div>
              <div className="flex flex-row !justify-between !w-full !items-center">
                <div className="text-green-5 font-numans text-xs">
                  Total Referral count
                </div>
                <div className="bg-[#141414] w-[50px] rounded-md items-center py-2 flex justify-center">
                  {count}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Styles.Wrapper>
    </Modal>
  );
};

export default RewardModal;
