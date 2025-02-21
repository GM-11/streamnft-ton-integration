import React, { useState, useEffect, useRef, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount } from "wagmi";
import { IoEllipsisHorizontalOutline as Ellipsis } from "react-icons/io5";
import { StyledWalletButton2 } from "@/components/Reusables/loan/Button";
import logoImage from "../../../../public/images/desktopLogo.png";
import logo1 from "../../../../public/images/logo_1.svg";
import Image from "next/image";
import ClickAwayListener from "../../Reusables/ClickAwayListener";
import ChainDropdown from "../../ChainDropdown/ChainDropdown";
import rewardLogo from "../../../../public/images/reward_box.svg";
import { ChainContext } from "@/context/ChainContext";
import { getUserReward } from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { ModalContext } from "@/context/ModalContext";
import RewardModal from "../../Reusables/loan/Modals/RewardModal/Referral";
import { ConnectButton2 } from "./ConnectButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { mintNft } from "@/utils/evmProvider";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";
import { useSigner } from "@/context/SignerContext";
import { UserNftContext } from "@/context/UserNftContext";
import { wait } from "@/services/loan/helpers";
import { scoreAxiosInstance } from "@/services/axios";
import { useUserWalletContext } from "@/context/UserWalletContext";

const TopNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openEllipsisMenu, setOpenEllipsisMenu] = useState(false);
  const [storage, setStorage] = useState(null);
  const [pairingStatus, setPairingStatus] = useState(false);
  const [openMintingDropdown, setOpenMintingDropdown] = useState(false);
  const [reward, setReward] = useState(0);
  const [pointsValue, setPointsValue] = useState(0);

  const router = useRouter();
  const { isConnected, address } = useUserWalletContext();
  const { selectedChain, chainDetail, collections, evmWalletConnected } =
    useContext(ChainContext);
  const navbarRef = useRef(null);
  const { setIsPaired, isPaired, accountId } = useContext(HederaContext);
  const { setOpenModal, modalType, setModalType } = useContext(ModalContext);
  const { publicKey, connected } = useWallet();
  const { signer } = useSigner();
  const { reloadNftCacheCall } = useContext(UserNftContext);

  const headerStyle = {
    background: "url('/images/announcement copy.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const threshold = 710;

      if (isMenuOpen && windowWidth > threshold) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [navbarRef, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChange = (value) => {
    const selectedService = router.asPath.split("/")?.[2];
    router.push(
      selectedService?.includes("utility")
        ? `/${selectedService}/explore`
        : `/${value}/${selectedService}`
    );
  };

  useEffect(() => {
    if (localStorage.getItem("hashconnectData")) {
      if (accountId) {
        setPairingStatus(true);
        setStorage(true);
        localStorage.setItem("connected", 1);
        rewardDetail(accountId);
      }
    }
  }, [accountId]);

  useEffect(() => {
    if (
      localStorage.getItem("hashconnectData") &&
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData.length >
        0 &&
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[0]
        .accountIds[0] &&
      pairingStatus
    ) {
      const length = JSON.parse(localStorage.getItem("hashconnectData"))
        .pairingData.length;
      const id = JSON.parse(localStorage.getItem("hashconnectData"))
        .pairingData[length - 1].accountIds[0];
      rewardDetail(id);
    }
  }, [pairingStatus, storage, isPaired]);

  const rewardDetail = async (id) => {
    if (address?.length > 0 && chainDetail?.chain_id) {
      const reward = await getUserReward(address, chainDetail?.chain_id);
      setReward(reward?.data);
    }
  };

  const buttonHandler1 = () => {
    setModalType("Referral");
    setOpenModal(true);
  };

  const getPoints = async () => {
    try {
      const response = await scoreAxiosInstance.get(`/score/user/${address}`);

      if (response?.data) {
        setPointsValue(response?.data?.message ?? 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (address?.length > 0) {
      getPoints();
    }
  }, [address]);

  return (
    <div className="z-[1000] hidden lg:block sticky top-0 w-full">
      <div
        className="h-8 w-full flex items-center justify-evenly bg-green-2 "
        style={headerStyle}
      >
        <h5 className="font-medium font-numans text-center text-xs text-white">
          🚀 Engage with platform transactions and earn rewards as an early
          supporter – OC Points & Eduverse Pioneers NFT! 🎉
        </h5>
      </div>
      <nav className="bg-green-1 px-2 h-fit ">
        <div
          ref={navbarRef}
          className="min-w-screen flex flex-wrap items-center justify-between px-4 py-[0.6rem] flex-grow"
        >
          <div className="flex items-center space-x-4 flex-grow">
            <div className="cursor-pointer flex gap-10 items-center justify-start">
              <Image
                src={logo1}
                alt="stream NFT Logo"
                className="block sm:hidden"
                onClick={() => router.push("/")}
                width={50}
                height={50}
              />

              <Image
                src={logoImage}
                alt="Desktop Logo"
                className="hidden sm:block h-6 w-auto"
                onClick={() => router.push("/")}
                width={150}
                height={24}
              />
            </div>
            <ul
              className={` flex items-center flex-col md:flex-row space-x-4 md:flex-nowrap md:flex text-sm  ${
                isMenuOpen
                  ? "absolute top-[95px] -left-4 right-0 block z-[999] items-center justify-center bg-green-1"
                  : "relative hidden"
              }`}
            >
              <Link
                href={`${selectedChain}/rent`}
                className="flex items-center justify-center py-2 px-3 rounded font-medium text-green-2 hover:text-green-4"
              >
                Rent
              </Link>
              <Link
                href={`${selectedChain}/loan/lend`}
                className="flex items-center justify-center py-2 px-3 rounded font-medium text-green-4 relative"
              >
                <span>
                  <span style={{ borderBottom: "1px solid #23963E" }}>L</span>
                  <span>oan</span>
                </span>
              </Link>
              <Link
                href={`/utility/explore`}
                className="flex items-center justify-center py-2 px-3 rounded font-medium text-green-2 hover:text-green-4"
              >
                Utility
              </Link>
              <Link
                href={`/campaign`}
                className="flex items-center justify-center py-2 px-3 rounded font-medium text-green-2 hover:text-green-4"
              >
                Campaign
              </Link>
              {/* <Link
                href={`${process.env.NEXT_PUBLIC_DAPP_URL}/${
                  selectedChain?.toLowerCase() === ""
                    ? "hedera testnet"
                    : selectedChain?.toLowerCase()
                }/Manage`}
                className="flex items-center justify-center py-2 px-3 rounded font-medium text-green-2 hover:text-green-4"
              >
                Dashboard
              </Link> */}
              <ClickAwayListener onClickAway={() => setOpenEllipsisMenu(false)}>
                <li className="block items-center justify-center py-2 px-3 rounded font-medium text-green-2 hover:text-green-4 relative">
                  <Ellipsis
                    className="h-auto w-6 object-contain cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenEllipsisMenu(!openEllipsisMenu);
                    }}
                  />
                  {openEllipsisMenu && (
                    <div
                      className="origin-top-right absolute left-0 right-0 w-[11rem] rounded-md shadow-lg  text-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[999] bg-green-4 top-full"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="h-2 w-2 absolute rotate-45 left-6 -top-1 bg-green-4"></div>
                      <div className="py-1" role="none">
                        <a
                          href="https://discord.gg/MAzRF4YFjR"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button
                            className="px-4 py-2 text-sm text-gray-700 transition-all duration-300 w-full hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-1 items-center"
                            role="menuitem"
                          >
                            <Image
                              src="./images/support_icon.svg"
                              className="h-4 w-4"
                              alt="Support"
                              width={16}
                              height={16}
                            />

                            <span className="text-gray-100 hover:text-green-2">
                              Support/Help
                            </span>
                          </button>
                        </a>
                        <a
                          href="https://docs.streamnft.tech/for-developers/rental-integration"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button
                            className="px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-1 text-nowrap"
                            role="menuitem"
                          >
                            <Image
                              src="./images/sdk_icon.svg"
                              className="h-4 w-4"
                              alt="SDK Integration"
                              height={16}
                              width={16}
                            />
                            <span className="whitespace-nowrap text-gray-100 hover:text-green-2">
                              SDK Integration
                            </span>
                          </button>
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              </ClickAwayListener>
              {/* {isMenuOpen && (
                <li className="block items-center justify-center pb-2 px-3 rounded ">
                  <Dropdown />
                </li>
              )} */}
            </ul>
          </div>

          <div className="flex items-center justify-center flex-row font-numans">
            {evmWalletConnected && (
              <ClickAwayListener
                onClickAway={() => setOpenMintingDropdown(false)}
              >
                <button
                  onClick={() => {
                    setOpenMintingDropdown(!openMintingDropdown);
                  }}
                  className="hidden relative mr-4 md:block hover:bg-gradient-to-r from-[#5fd37a] to-[#5fd37a] border-[#1f7634] border rounded-md py-1.5 px-1.5 items-center"
                  type="button"
                >
                  <span className="text-[#1f7634] items-center !font-numans font-semibold text-sm">
                    Mint Testnet NFT
                  </span>
                  {openMintingDropdown && (
                    <div className="h-fit w-fit p-4 flex flex-col items-start gap-4 absolute top-[110%] rounded-md border border-solid border-green-3 right-0 bg-green-1 text-green-6 text-sm">
                      {collections
                        ?.filter((el) =>
                          el?.name?.toLowerCase()?.includes("eduverse")
                        )
                        .map((el) => (
                          <p
                            key={el?.token_address}
                            onClick={() => {
                              toast(
                                <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
                                  <ImSpinner2 className="animate-spin text-white" />
                                  <span>Minting NFT</span>
                                </div>,
                                {
                                  position: toast.POSITION.TOP_RIGHT,
                                  autoClose: 5000000,
                                  className: "!bg-green-6",
                                  bodyClassName: "!bg-green-6",
                                }
                              );
                              mintNft(
                                el?.token_address,
                                address,
                                signer,
                                async (tx) => {
                                  wait(3).then(async () => {
                                    toast.dismiss();
                                    toast(
                                      <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
                                        <ImSpinner2 className="animate-spin text-white" />
                                        <span>Updating NFT Data</span>
                                      </div>,
                                      {
                                        position: toast.POSITION.TOP_RIGHT,
                                        autoClose: 5000000,
                                        className: "!bg-green-6",
                                        bodyClassName: "!bg-green-6",
                                      }
                                    );
                                    await reloadNftCacheCall();
                                    toast.dismiss();
                                    toast(
                                      <div className="flex items-start gap-2 flex-col space-x-3 bg-green-6 text-white rounded">
                                        <span>NFT Minted successfully</span>
                                        <span>
                                          Transaction Hash - {tx?.hash}
                                        </span>
                                      </div>,
                                      {
                                        position: toast.POSITION.TOP_RIGHT,
                                        autoClose: 5000,
                                        className: "!bg-green-6 !h-fit",
                                        bodyClassName: "!bg-green-6 !h-fit",
                                      }
                                    );
                                  });
                                },
                                () => {
                                  toast.dismiss();
                                  toast.error(
                                    "Something went wrong. Try again"
                                  );
                                }
                              );
                            }}
                          >
                            {el?.name}
                          </p>
                        ))}
                    </div>
                  )}
                </button>
              </ClickAwayListener>
            )}

            <>
              <button
                onClick={buttonHandler1}
                className="hover:bg-gradient-to-r from-[#5fd37a] to-[#5fd37a] border-[#1f7634] border rounded-md py-1.5 px-1.5 items-center font-numans"
                type="button"
              >
                <span className="text-green-6  items-center !font-numans text-sm font-semibold">
                  Refer & Earn
                </span>
              </button>
              {modalType === "Referral" && (
                <RewardModal
                  code={reward?.referral_id}
                  count={reward?.validconnection}
                />
              )}
            </>
            <div className="flex items-center justify-center gap-2 border border-green-2 px-2 py-2 rounded mx-2">
              <Image src={rewardLogo} alt="reward Logo" />
              <span className="text-green-6 text-sm font-semibold">
                {pointsValue ? pointsValue : 0}
              </span>
            </div>
            <ChainDropdown changeHandler={handleChange} />
            {chainDetail && chainDetail.evm ? (
              <ConnectButton2 chainDetail={chainDetail} />
            ) : (
              <StyledWalletButton2 />
              // "hello"
            )}

            <button
              type="button"
              className="md:hidden text-gray-900 dark:text-white focus:outline-none items-start"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                    color="#30B750"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                    color="#30B750"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopNav;
