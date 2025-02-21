import React, { useContext, useEffect, useMemo, useState } from "react";
import Modal from "@/components/Reusables/utility/Modals/Modal";
import * as Styles from "@/components/Reusables/utility/Modals/referModalStyles";
import { ChainContext } from "@/context/ChainContext";
import utilityCalls from "@/services/utility/utilityCalls";
import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUserWalletContext } from "@/context/UserWalletContext";

const ReferralModal = ({ code, count, open, handleClose }) => {
  const { selectedChain, chainDetail } = useContext(ChainContext);
  const [generatedCode, setGeneratedCode] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);

  const { address } = useUserWalletContext();

  const getReferralCode = async (walletAddress) => {
    try {
      const response = await utilityCalls.generateReferralId(walletAddress);

      setGeneratedCode(response?.data?.referralId);
      setTotalReferrals(response?.data?.totalReferrals);
    } catch (error) {
      console.error("Error:", error);
      return { data: [] };
    }
  };

  const walletAddress = useMemo(() => {
    return chainDetail?.evm
      ? address
      : selectedChain?.toLowerCase()?.includes("hedera")
      ? JSON.parse(localStorage.getItem("hashconnectData"))?.pairingData[
          length - 1
        ]?.accountIds[0]
      : "";
  }, [chainDetail, address]);

  const referralLink = useMemo(() => {
    return `${
      process.env.NEXT_PUBLIC_UTILITY_API_URL ??
      "https://streamnft-utility.vercel.app"
    }?ref=${generatedCode}`;
  }, [chainDetail, generatedCode]);

  useEffect(() => {
    if (chainDetail && open) {
      getReferralCode(walletAddress);
    }
  }, [chainDetail, address, open]);

  const referralCount = count;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
  };

  return (
    <Modal
      title={"Referral"}
      open={open}
      handleClose={handleClose}
      titleClasses={"!text-xl"}
      panelClasses={"!max-w-4xl"}
    >
      <div className="min-h-[65vh] p-8">
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
                  Up to 10 Referrals: 1 Point for every connected wallet & 10
                  hbar for transactions on the platform!
                </li>
                <li className="py-1">
                  10-25 Referrals: 1.5 Points per connected wallet & 15 hbar for
                  transactions on the platform!
                </li>
                <li className="py-1">
                  25+ Referrals: 2 Points for every connected wallet & an 20
                  hbar for transactions on the platform!
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
                <input
                  className="!bg-[#303030] !text-white !text-xs rounded-md !px-3 !py-2 mr-2 w-full !font-numans"
                  type="text"
                  value={referralLink}
                  readOnly
                />
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
                  {totalReferrals}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-fit p-3 border-t-2 border-solid border-white/10 flex items-center justify-end">
        <button
          className="h-fit w-fit py-2 px-5 border border-solid border-white rounded-lg hover:bg-green-4 text-white"
          onClick={handleClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ReferralModal;
