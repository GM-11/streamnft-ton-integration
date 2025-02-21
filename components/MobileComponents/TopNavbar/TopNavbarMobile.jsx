import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import { IoEllipsisHorizontalOutline as Ellipsis } from "react-icons/io5";
import { StyledWalletButton2 } from "@/components/Reusables/loan/Button";
import logoImage from "../../../public/images/grouplogo.svg";
import HamMenu from "../../../public/images/hamMenu.png";
import Image from "next/image";
import ClickAwayListener from "@/components/Reusables/ClickAwayListener";
import ChainDropdown from "@/components/ChainDropdown/ChainDropdown";
import rewardLogo from "../../../public/images/reward_box.svg";
import { ChainContext } from "@/context/ChainContext";
import { getReward } from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import CustomLink from "@/components/Reusables/utility/CustomLink";

const TopNavbarMobile = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openEllipsisMenu, setOpenEllipsisMenu] = useState(false);
  const { selectedChain } = useContext(ChainContext);
  const [reward, setReward] = useState(0);
  const [storage, setStorage] = useState(null);
  const navbarRef = useRef(null);
  const [pairingStatus, setPairingStatus] = useState(false);
  const [_, setcon] = useState("Connect Wallet");
  const { isPaired } = useContext(HederaContext);

  const currentPath = router.asPath;
  const isCurrentPage = (path) => currentPath.includes(path.toLowerCase());

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

  const [chainValue, setChainValue] = useState("Hedera");

  const handleChange = (value) => {
    const selectedService = router?.asPath?.includes("loan")
      ? "loan/lend"
      : "rent";
    router.push(
      selectedService?.includes("utility")
        ? `/${selectedService}/explore`
        : `/${value}/${selectedService}`
    );
  };

  useEffect(() => {
    if (localStorage.getItem("hashconnectData")) {
      if (
        JSON.parse(localStorage.getItem("hashconnectData")).pairingData.length >
        0
      ) {
        const length = JSON.parse(localStorage.getItem("hashconnectData"))
          .pairingData.length;
        setcon(
          JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
            length - 1
          ].accountIds[0]
        );
        setPairingStatus(true);
        setStorage(true);
        localStorage.setItem("connected", 1);
        rewardDetail();
      }
    } else {
      setcon("Connect Wallet");
    }
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem("hashconnectData") &&
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData.length >
        0 &&
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[0]
        .accountIds[0] &&
      pairingStatus
    ) {
      if (localStorage.getItem("hashconnectData")) {
        const length = JSON.parse(localStorage.getItem("hashconnectData"))
          .pairingData.length;
        setcon(
          JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
            length - 1
          ].accountIds[0]
        );
      }
      rewardDetail();
    } else {
      setcon("Connect Wallet");
    }
  }, [pairingStatus, storage, isPaired]);

  const rewardDetail = async () => {
    const length = JSON.parse(localStorage.getItem("hashconnectData"))
      .pairingData.length;
    const reward = await getReward(
      JSON.parse(localStorage.getItem("hashconnectData")).pairingData[
        length - 1
      ].accountIds[0]
    );
    setReward(reward);
  };

  const navItems = useMemo(
    () => [
      {
        label: "Discover",
        href: `/discover`,
        isActive: isCurrentPage("discover"),
      },
      {
        label: "Rent",
        href: `/${selectedChain}/rent`,
        isActive: isCurrentPage("rent"),
      },
      {
        label: "Loan",
        href: `/${selectedChain}/loan/lend`,
        isActive: isCurrentPage("lend"),
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
      },
      {
        label: "Season 0",
        href: `/season`,
        isActive: isCurrentPage("season"),
      },
    ],
    [selectedChain, router]
  );

  return (
    <div className="z-[1000] block lg:hidden sticky top-0 w-full">
      <div
        className="h-fit p-2 md:p-0 md:h-[34px] w-full flex items-center justify-center gap-8 bg-green-6"
        style={headerStyle}
      >
        <h5 className="font-medium font-numans text-center text-xs text-white">
          🚀Join our Telegram community to discover more Rewards
          Opportunities.🎉
        </h5>
        <button
          className="bg-green-12 whitespace-nowrap px-4 text-2xs py-1 text-white rounded-md"
          onClick={() => window.open("https://t.me/StreamNFTHQ", "_blank")}
        >
          Join now
        </button>
      </div>
      <nav className="bg-green-1 h-fit ">
        <div
          ref={navbarRef}
          className="min-w-screen flex flex-wrap items-center justify-between py-[0.6rem] flex-grow"
        >
          <div className="flex items-center justify-between p-2 flex-grow min-w-full">
            <div className="cursor-pointer flex items-center min-h-8 justify-start">
              <Image
                src={logoImage}
                alt="Desktop Logo"
                className="block"
                onClick={() => router.push("/")}
              />
            </div>
            <Image
              src={HamMenu}
              height={24}
              width={24}
              alt="ham-menu"
              className="block md:hidden cursor-pointer"
              onClick={toggleMenu}
            />
            <ul
              className={` flex items-center flex-col md:flex-row space-x-4 md:flex-nowrap md:flex text-sm  ${
                isMenuOpen
                  ? "absolute top-[95px] -left-4 right-0 block z-[999] items-center justify-center bg-green-1"
                  : "relative hidden"
              }`}
            >
              {navItems.map((item, idx) => (
                <CustomLink
                  key={idx}
                  href={item?.href}
                  className={`flex items-center justify-center py-2 px-1 text-[13px] rounded font-semibold ${
                    item?.isActive
                      ? "text-green-4"
                      : "text-green-2 hover:text-green-4"
                  }`}
                >
                  <span>
                    <span
                      style={{
                        borderBottom: item?.isActive
                          ? "1px solid #23963E"
                          : "none",
                      }}
                    >
                      {item?.label?.charAt(0)?.toUpperCase()}
                    </span>
                    <span>{item?.label?.slice(1)}</span>
                  </span>
                </CustomLink>
              ))}
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
                      className="origin-top-right absolute right-0 w-[11rem] rounded-md shadow-lg text-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[999] bg-green-4 top-full"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div className="h-2 w-2 absolute rotate-45 right-4 -top-1 bg-green-4"></div>
                      <div className="py-1" role="none">
                        <button
                          className="px-4 py-2 text-sm text-gray-700 transition-all duration-300 w-full hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-1 items-center"
                          role="menuitem"
                        >
                          <img
                            src="./images/support_icon.svg"
                            className="h-4 w-4  "
                            alt=""
                          />
                          <span>Support/Help</span>
                        </button>
                        <button
                          className="px-4 py-2 text-sm text-gray-700 w-full hover:bg-gray-100 hover:text-gray-900 flex flex-row gap-1 text-nowrap"
                          role="menuitem"
                        >
                          <img
                            src="./images/sdk_icon.svg"
                            className="h-4 w-4"
                            alt=""
                          />
                          <span className="whitespace-nowrap">
                            SDK Integration
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              </ClickAwayListener>
            </ul>
          </div>

          <div
            className="flex items-center justify-between p-2 px-1 md:!px-4 flex-row font-numans min-w-full"
            style={{ borderTop: "2px solid #C0F2CB" }}
          >
            <div className="flex items-center justify-center gap-2 border border-green-2 px-2 py-2 rounded mx-2">
              <Image src={rewardLogo} alt="reward Logo" />
              <span className="text-green-2 text-sm font-semibold">
                {reward?.data && Number(reward?.data).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!(
                router.pathname.includes("utility") ||
                router.pathname.includes("season")
              ) && <ChainDropdown changeHandler={handleChange} />}{" "}
              <StyledWalletButton2 />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopNavbarMobile;
