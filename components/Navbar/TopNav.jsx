"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { IoEllipsisHorizontalOutline as Ellipsis } from "react-icons/io5";
import { StyledWalletButton2 } from "@/components/Reusables/loan/Button";
import logoImage from "../../public/images/logo-update.png";
import rewardLogo from "../../public/images/reward_box.svg";
import logo1 from "../../public/images/logo_1.svg";
import Image from "next/image";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";
import ChainDropdown from "../ChainDropdown/ChainDropdown";
import { ChainContext } from "@/context/ChainContext";
import { getUserReward } from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { ModalContext } from "@/context/ModalContext";
import { ConnectButton2 } from "./ConnectButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { mintNft } from "@/utils/evmProvider";
import { toast } from "react-toastify";
import { ImSpinner2 } from "react-icons/im";
import { useSigner } from "@/context/SignerContext";
import { UserNftContext } from "@/context/UserNftContext";
import { wait } from "@/services/loan/helpers";
import { scoreAxiosInstance } from "@/services/axios";
import CustomLink from "../Reusables/utility/CustomLink";
import SupportIcon from "../../public/images/support_icon.svg";
import SdkIcon from "../../public/images/sdk_icon.svg";
import RewardModal from "@/components/Reusables/loan/Modals/RewardModal/Referral";
import { FaChevronDown } from "react-icons/fa";
import MintModal from "./MintModal";
import utilityCalls from "@/services/utility/utilityCalls";
import ContentImage from "../../public/images/content.png";
import LaunchpadImage from "../../public/images/launchpad.png";
import Link from "next/link";
import { useUserWalletContext } from "@/context/UserWalletContext";
import NavDropdown from "../Reusables/NavDropdown/NavDropdown";

const TopNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openEllipsisMenu, setOpenEllipsisMenu] = useState(false);
  const [storage, setStorage] = useState(null);
  const [pairingStatus, setPairingStatus] = useState(false);
  const [openMintingDropdown, setOpenMintingDropdown] = useState(false);
  const [reward, setReward] = useState(0);
  const [pointsValue, setPointsValue] = useState(0);
  const [openMintDropdown, setOpenMintDropdown] = useState(false);
  const [selectedNavitem, setSelectedNavitem] = useState("");

  const router = useRouter();
  const { isConnected, address } = useUserWalletContext();
  const { selectedChain, chainDetail, collections } = useContext(ChainContext);
  const navbarRef = useRef(null);
  const { setIsPaired, isPaired, accountId } = useContext(HederaContext);

  const { setModalData, setOpenModal, setModalType, modalType } =
    useContext(ModalContext);
  const { publicKey, connected } = useWallet();
  const { signer } = useSigner();
  const { reloadNftCacheCall } = useContext(UserNftContext);
  const [loading, setLoading] = useState(false);

  const isCurrentPage = (path) => router?.asPath?.includes(path?.toLowerCase());

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
    if (!router?.query?.chain) {
      window.location.reload();
    } else {
      router.push(
        router?.pathname?.includes("rent")
          ? `/${value}/rent`
          : router?.pathname?.includes("loan")
            ? `/${value}/loan`
            : router?.pathname?.includes("utility")
              ? `/${value}/utility/explore`
              : `/${value}/discover`,
      );
    }
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
      console.log("address", address);
      getPoints();
    }
  }, [address]);

  const navItems = useMemo(
    () => [
      {
        label: "Discover",
        href: `/${selectedChain}/discover`,
        isActive: isCurrentPage("mart"),
        isDropdown: true,
        dropdownItems: [
          {
            image: ContentImage,
            title: "Marketplace",
            href: `/${selectedChain}/discover`,
          },
          {
            image: LaunchpadImage,
            title: "Launchpad",
            href: `/${selectedChain}/launchpad`,
          },
        ],
      },
      {
        label: "Rent",
        href: `/${selectedChain}/rent`,
        isActive: isCurrentPage("rent"),
      },
      {
        label: "Loan",
        href: `/${selectedChain}/loan/lend`,
        isActive: isCurrentPage("loan"),
      },
      {
        label: "Utility",
        href: `/utility/explore`,
        isActive: isCurrentPage("utility"),
      },
      {
        label: "Create",
        href: `/mint`,
        isActive: isCurrentPage("mint"),
        isDropdown: true,
        dropdownItems: [
          {
            title: "NFT",
            href: `/mint/nft`,
          },
          {
            title: "Collection",
            href: `/mint/collection`,
          },
        ],
      },
      {
        label: "Campaign",
        href: `/campaign`,
        isActive: isCurrentPage("campaign"),
      },
    ],
    [selectedChain, router],
  );

  const showSpinnerToast = (message, autoClose = 5000000) => {
    toast(
      <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
        <ImSpinner2 className="animate-spin text-white" />
        <span>{message}</span>
      </div>,
      {
        position: toast.POSITION.TOP_RIGHT,
        autoClose,
        className: "!bg-green-6",
        bodyClassName: "!bg-green-6",
      },
    );
  };

  const showSuccessToast = (message, txHash) => {
    toast(
      <div className="flex items-start gap-2 flex-col space-x-3 bg-green-6 text-white rounded">
        <span>{message}</span>
        {txHash && <span>Transaction Hash - {txHash}</span>}
      </div>,
      {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
        className: "!bg-green-6 !h-fit",
        bodyClassName: "!bg-green-6 !h-fit",
      },
    );
  };

  const showErrorToast = (message) => {
    toast.dismiss();
    toast.error(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleMintClick = async (el, address, signer) => {
    if (!isConnected) {
      showErrorToast("Connect your wallet before minting");
      return;
    }
    showSpinnerToast("Minting NFT");
    try {
      setLoading(true);
      setModalType("mintmodal");
      await mintNft(el?.token_address, address, signer, async (tx) => {
        await wait(3);
        setLoading(false);
        await setOpenModal(true);
        await setModalData({ ...tx, ...el });
        toast.dismiss();

        showSpinnerToast("Updating NFT Data");
        utilityCalls.getCollectionsWithUtilities(
          chainDetail?.chain_id,
          address,
          true,
        );
        await reloadNftCacheCall();
        toast.dismiss();

        // showSuccessToast("NFT Minted successfully", tx?.hash);
      });
    } catch (error) {
      showErrorToast("Something went wrong. Try again");
    }
  };

  return (
    <div className="z-[1000] hidden lg:block top-0 w-full">
      <div
        className="h-[34px] w-full flex items-center justify-center gap-8 bg-green-6"
        style={headerStyle}
      >
        <h5 className="font-medium font-numans text-center text-[0.82rem] text-white">
          🚀 Join our Telegram community to explore exciting reward
          opportunities and a chance to win StreamNFT Pioneers NFT.🎉
        </h5>
        <button
          className="bg-green-12 px-4 text-sm py-1 text-white rounded-md"
          onClick={() => window.open("https://t.me/StreamNFTHQ", "_blank")}
        >
          Join now
        </button>
      </div>
      <nav className="bg-green-1 px-2 h-fit ">
        <div
          ref={navbarRef}
          className="min-w-screen flex flex-wrap items-center justify-between px-4 py-[0.6rem] flex-grow"
        >
          <div className="flex items-center space-x-4 flex-grow">
            <div className="cursor-pointer flex gap-10 mr-4 items-center justify-start">
              <Image
                src={logo1}
                alt="stream NFT Logo"
                className="block h-6 sm:hidden"
                onClick={() => router.push("/")}
              />
              <Image
                src={logoImage}
                alt="Desktop Logo"
                className="hidden sm:block h-6 w-auto"
                onClick={() => router.push("/")}
              />
            </div>
            <ul
              className={` flex items-center flex-col md:flex-row space-x-4 md:flex-nowrap md:flex text-sm  ${
                isMenuOpen
                  ? "absolute top-[95px] -left-4 right-0 block z-[999] items-center justify-center bg-green-1"
                  : "relative hidden"
              }`}
            >
              {navItems.map((item, idx) =>
                item.isDropdown ? (
                  <NavDropdown key={idx} data={item} />
                ) : (
                  <CustomLink
                    key={idx}
                    href={item.href}
                    className={`flex items-center justify-center py-2 px-1 text-[13px] rounded font-semibold ${
                      item.isActive
                        ? "text-green-4"
                        : "text-green-2 hover:text-green-4"
                    }`}
                  >
                    <span>
                      <span
                        style={{
                          borderBottom: item.isActive
                            ? "1px solid #23963E"
                            : "none",
                        }}
                      >
                        {item.label.charAt(0).toUpperCase()}
                      </span>
                      <span>{item.label.slice(1)}</span>
                    </span>
                  </CustomLink>
                ),
              )}

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
                              src={SupportIcon}
                              className="h-4 w-4"
                              alt=""
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
                              src={SdkIcon}
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
            </ul>
          </div>

          <div className="flex items-center justify-center flex-row font-numans">
            <ClickAwayListener
              onClickAway={() => setOpenMintingDropdown(false)}
            >
              <button
                onClick={() => {
                  setOpenMintingDropdown(!openMintingDropdown);
                }}
                className="hidden relative mr-2 md:block hover:bg-gradient-to-r from-[#5fd37a] to-[#5fd37a] border-[#1f7634] border rounded-md py-1.5 px-1.5 items-center"
                type="button"
              >
                <span className="text-[#1f7634] text-xs items-center !font-numans font-semibold ">
                  Mint Test NFT
                </span>
                {openMintingDropdown && (
                  <div className="h-fit w-fit p-4 flex flex-col items-start gap-4 absolute top-[110%] rounded-md border border-solid border-green-3 right-0 bg-green-1 text-green-6 text-sm">
                    {collections?.map((el) => (
                      <p
                        key={el?.id}
                        onClick={() => handleMintClick(el, address, signer)}
                      >
                        <span className="text-[#1f7634] text-[11px] hover:bg-green-1">
                          {el?.name}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </button>
            </ClickAwayListener>

            <>
              <button
                onClick={buttonHandler1}
                className="hidden relative md:block hover:bg-gradient-to-r from-[#5fd37a] to-[#5fd37a] border-[#1f7634] border rounded-md py-1.5 px-1.5 items-center"
                type="button"
              >
                <span className="text-green-2  items-center !font-numans text-xs font-semibold">
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
              <span className="text-green-6 text-xs items-center !font-numans font-semibold">
                {pointsValue ? pointsValue : 0}
              </span>
            </div>
            {!router.pathname.includes("utility") && (
              <ChainDropdown changeHandler={handleChange} />
            )}
            {chainDetail && chainDetail.evm ? (
              <ConnectButton2 chainDetail={chainDetail} />
            ) : (
              <StyledWalletButton2 />
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
      {modalType === "mintmodal" && <MintModal loading={loading} />}
    </div>
  );
};

export default TopNav;
