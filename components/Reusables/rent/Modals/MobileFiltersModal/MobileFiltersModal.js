import React, { useContext, useEffect, useState } from "react";
import MobileModal from "@/components/Reusables/rent/Modals/MobileModal";
import { ChainContext } from "@/context/ChainContext";
import { useRouter } from "next/router";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import Image from "next/image";
import StarImageOne from "../../../../../public/images/star1.png";
import StarImageTwo from "../../../../../public/images/star2.png";
import { ModalContext } from "@/context/ModalContext";

const MobileFiltersModal = ({ openingFrom, setRightSelect }) => {
  const [localCollections, setLocalCollections] = useState([]);

  const [selectedCollection, setSelectedCollection] = useState([]);

  const [selectedChainByUser, setSelectedChainByUser] = useState([]);

  const { setOpenModal, setModalType } = useContext(ModalContext);

  const { selectedNft, setSelectedNft } = useContext(ScrollHeaderContext);

  const { scrollChainDetails, collections, selectedChain } =
    useContext(ChainContext);

  const router = useRouter();

  function modify(str) {
    return str.replace(/[\s-]+/g, "").toLowerCase();
  }

  const handleChange = (value) => {
    router.push(`/${value.toLowerCase()}`);
    setModalType("");
    setOpenModal(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    setLocalCollections(collections);
  }, [collections]);

  useEffect(() => {
    if (router.query.symbol) {
      setSelectedNft(router.query.symbol);
    } else {
      setSelectedNft("all");
    }
  }, [router]);

  return (
    <>
      <MobileModal>
        <div className="font-numans w-full h-full flex items-start flex-col relative">
          <div className="p-6 flex flex-col items-start">
            <h5 className="text-grayscale-2">Filter</h5>
            <p className="text-grayscale-1 my-4">Popular Collections</p>
            <div className="w-full h-fit flex flex-wrap gap-3">
              {localCollections &&
                localCollections?.map((item) => {
                  const formattedName = String(item.name)
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-");

                  let defaultPath = "/myassets";
                  if (router.pathname.includes("marketplace")) {
                    defaultPath = "/marketplace";
                  } else if (router.pathname.includes("rentals")) {
                    defaultPath = "/rentals";
                  }

                  return (
                    <div
                      onClick={() => {
                        setSelectedNft(item.name);
                        setOpenModal(false);
                        setModalType("");

                        document.body.style.overflow = "auto";

                        router.push(
                          `/${formattedName}${defaultPath}`
                        );
                      }}
                      key={item.id}
                      className={`flex cursor-pointer px-4 py-2 gap-4 text-xs rounded-full items-center text-grayscale-2 font-medium ${
                        modify(String(selectedNft)) ===
                        modify(String(item.name))
                          ? "bg-green-4"
                          : "bg-[#212020]"
                      }`}
                    >
                      <img
                        key={item.id}
                        src={item.image_url}
                        className="h-6 w-6"
                      />
                      <p>{item?.name}</p>
                    </div>
                  );
                })}
            </div>
            <div className="h-[1px] w-full bg-[#292929] my-5"></div>
            {openingFrom !== "home" ? (
              <>
                <h5 className="text-grayscale-1">Sort By</h5>
                <div className="flex flex-wrap gap-4 my-4">
                  {[
                    "Price: Low to High",
                    "Price: High to Low",
                    "Duration: Low to High",
                    "Duration: High to Low",
                  ].map((item, index) => (
                    <div key={index}>
                      <button
                        onClick={() => {
                          setRightSelect(item);
                          setOpenModal(false);
                          setModalType("");
                          document.body.style.overflow = "auto";
                        }}
                        className={`flex items-center text-grayscale-2 px-4 rounded-full gap-4 py-2 cursor- bg-[#212020] cursor-pointer`}
                      >
                        <p className="text-2xs">{item}</p>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h5 className="text-grayscale-1">Chains</h5>
                <div className="flex flex-wrap gap-4 my-4">
                  {scrollChainDetails &&
                    scrollChainDetails.map((chainDetail, index) => (
                      <div key={index}>
                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "selectedChain",
                              chainDetail?.chain_name.toLowerCase()
                            );
                            handleChange(chainDetail?.chain_name);
                          }}
                          className={`flex items-center text-grayscale-2 px-4 rounded-full gap-4 py-2 cursor-pointer ${
                            selectedChain?.toLowerCase() ===
                            chainDetail?.chain_name?.toLowerCase()
                              ? "bg-green"
                              : "bg-[#212020]"
                          }`}
                        >
                          <img
                            src={chainDetail?.currency_image_url??"https://storage.googleapis.com/stream_chain/streamnft-chain/open-campus-edu-logo.png"}
                            alt={`Chain ${index + 1}`}
                            className="h-6 w-6"
                          />
                          <p className="text-2xs">{chainDetail?.chain_name}</p>
                        </button>
                      </div>
                    ))}
                  <div>
                    {/* <button
                      onClick={() => {}}
                      className={`flex items-center text-grayscale-2 px-4 rounded-full gap-4 py-2 cursor-pointer bg-[#212020]`}
                    >
                      <p className="text-2xs">All Chains</p>
                    </button> */}
                  </div>
                </div>
              </>
            )}
          </div>
          <Image
            src={StarImageOne}
            className="h-24 w-auto absolute top-0 left-0"
            alt="start-icon"
          />

          <Image
            src={StarImageTwo}
            className="h-56 w-auto absolute bottom-24 left-0"
            alt="start-icon1"
          />
          {/* <div className="flex items-center justify-between px-2 absolute bottom-0 text-2xs text-grayscale-2 w-full h-fit py-4 border-t-2 border-solid  bg-[#1A1A1A] border-[#464646]">
            <h5>202 NFT Found</h5>
            <div className="w-fit flex h-fit gap-2">
              <button className="bg-black-4 rounded-md px-4 py-2">
                Cancel
              </button>
              <button className="bg-green flex gap-2 rounded-md py-2 px-4 items-center">
                Filter Collection
                <Image src={FilterButtonIcon} className="h-4 w-auto" />
              </button>
            </div>
          </div> */}
        </div>
      </MobileModal>
    </>
  );
};

export default MobileFiltersModal;
