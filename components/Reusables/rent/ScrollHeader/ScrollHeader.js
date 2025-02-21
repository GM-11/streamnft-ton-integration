"use client";
import React, { useContext, useEffect, useState } from "react";
import SearchBar from "@/components/Reusables/rent/SearchBar/SearchBar";
import { ImageBlock } from "@/components/Reusables/rent/ScrollHeader/ScrollHeaderStyles";
import { useRouter } from "next/router";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import { ChainContext } from "@/context/ChainContext";
import Image from "next/image";
import MobileScrollHeader from "./MobileScrollHeader";
import PostCollectionModal from "../../mart/modals/PostCollectionModal";
import { postCollection } from "@/utils/apiRequests";
import { switchUserChain } from "@/utils/evmProvider";
import { wagmiConfig } from "@/config/wagmiConfig";

const ScrollHeader = () => {
  const { selectedNft, setSelectedNft } = useContext(ScrollHeaderContext);

  const {
    selectedChain,
    collections,
    scrollChainDetails,
    searchValue,
    setSearchValue,
  } = useContext(ChainContext);
  const [collection, setCollection] = useState(collections);
  const router = useRouter();
  const [openAddCollectionModal, setOpenAddCollectionModal] = useState(false);

  const { symbol } = router.query;

  useEffect(() => {
    setCollection(collections);
  }, [selectedChain, collections]);

  useEffect(() => {
    if (symbol === undefined) {
      setSelectedNft("all");
    } else {
      setSelectedNft(symbol);
    }
  }, [symbol]);

  useEffect(() => {
    if (selectedNft !== "all") {
      setSelectedNft(symbol);
    }
  }, [selectedNft]);

  function modify(str) {
    return str.replace(/[\s-]+/g, "").toLowerCase();
  }

  const handleChange = (value) => {
    const selectedService = router.asPath.split("/")?.[2];
    if (value.toLowerCase().includes("hedera")) {
      window.open("https://hedera-rent.streamnft.tech", "_blank");
    } else {
      router.push(`/${value.toLowerCase()}/${selectedService}`);
    }
  };

  function modifyPathname(path, searchTerm) {
    searchTerm = searchTerm.replace(/\s/g, "-");
    let parts = path.split("/");
    parts.splice(2, 1, searchTerm);
    let modifiedPathname = parts.join("/");
    router.push(modifiedPathname);
  }

  return (
    <>
      <div
        className="hidden md:flex flex-col md:flex-row justify-between items-center px-[2.7rem] w-full gap-0 md:gap-3"
        // style={{ marginTop: selectedNft === "all" ? "15px" : "" }}
      >
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex flex-row flex-wrap">
            <div className="important_chain h-12 flex-col items-start justify-start gap-1 w-76">
              <div
                className="rounded-lg overflow-hidden border border-[#292929] justify-start items-start inline-flex
  "
              >
                <div className="w-16 py-2 pl-3 bg-[rgba(137.59,136.61,136.61,0.36)] border-r border-[#3D3D3D] flex items-center justify-center self-stretch ">
                  <div className="text-white font-numans text-xs font-normal pr-2 break-words">
                    Chains
                  </div>
                </div>
                {scrollChainDetails &&
                  scrollChainDetails.map((chainDetail, index) => (
                    <div
                      key={index}
                      className="h-12 p-3 flex items-center justify-start"
                    >
                      <button
                        onClick={async () => {
                          if (chainDetail?.evm) {
                            const response = await switchUserChain(
                              Number(chainDetail.chain_id),
                              wagmiConfig
                            );
                            if (response?.name) {
                              localStorage.setItem(
                                "selectedChain",
                                chainDetail?.chain_name.toLowerCase()
                              );

                              handleChange(chainDetail?.chain_name);
                              analytics.track(
                                `dapp_rent_${chainDetail?.chain_name}`
                              );
                            }
                          } else {
                            handleChange(chainDetail?.chain_name);
                            analytics.track(
                              `dapp_rent_${chainDetail?.chain_name}`
                            );
                          }
                        }}
                        className="flex items-center"
                      >
                        <Image
                          className="rounded-full"
                          style={{
                            border: `2px solid ${
                              selectedChain.toLowerCase() ===
                              chainDetail?.chain_name.toLowerCase()
                                ? "rgb(48,183,80,0.5)"
                                : "rgba(9, 42, 19, 0.5)"
                            }`,
                            padding: "2px",
                          }}
                          src={chainDetail?.chain_image_url}
                          alt={`Chain ${index + 1}`}
                          height={28}
                          width={28}
                        />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <SearchBar
            className="search_bar"
            state={searchValue}
            changeHandler={setSearchValue}
            placeholder="Search for collection"
            onSearch={modifyPathname}
            isCollection="true"
          />
        </div>

        <div className="text-white font-semibold  items-center text-center text-xs justify-center  sm:text-sm sm:font-medium">
          Want to add your collection,
          <button
            className="text-[rgb(95,211,122)] ml-1 underline underline-offset-[4px]"
            onClick={() => setOpenAddCollectionModal(true)}
          >
            List here.
          </button>
        </div>

        <div className=" ml-3 md:ml-0 flex flex-row flex-wrap md:flex-nowrap my-2 gap-3 ">
          <div>
            <div className="scroll-block flex flex-row flex-wrap md:flex-nowrap items-start justify-center">
              {collection &&
                collection?.slice(0, 5)?.map((item) => {
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
                    <ImageBlock
                      onClick={() => {
                        setSelectedNft(item.name);
                        router.push(
                          `/${selectedChain}/rent/${formattedName}${defaultPath}`
                        );
                        if (router.pathname.includes("myassets")) {
                          analytics.track(`dapp_rent_${item?.name}_my_assets`);
                        } else if (router.pathname.includes("marketplace")) {
                          analytics.track(`dapp_rent_${item?.name}_mkt`);
                        } else if (router.pathname.includes("myassets")) {
                          analytics.track(`dapp_rent_${item?.name}_rentals`);
                        } else {
                          analytics.track(`dapp_rent_${item?.name}`);
                        }
                      }}
                      selected={
                        modify(String(selectedNft)) == modify(String(item.name))
                      }
                      key={item.id}
                      className={`flex`}
                    >
                      <div>
                        <img key={item.id} src={item.image_url} />
                      </div>
                    </ImageBlock>
                  );
                })}
            </div>
          </div>
          <div className="inline-block self-stretch bg-[#C0F2CB] border-[#C0F2CB] border-[1px] opacity-20"></div>
          <ImageBlock
            selected={selectedNft === "all"}
            onClick={() => {
              setSelectedNft("all");
              router.push(`/${selectedChain}/rent`);
              if (router.pathname.includes("myassets")) {
                analytics.track(`dapp_rent_${item?.name}_my_assets_all`);
              } else if (router.pathname.includes("marketplace")) {
                analytics.track(`dapp_rent_${item?.name}_mkt_all`);
              } else if (router.pathname.includes("myassets")) {
                analytics.track(`dapp_rent_${item?.name}_rentals_all`);
              } else {
                analytics.track(`dapp_rent_All`);
              }
            }}
          >
            <div className="all-block-section">
              <div className="all-block-bg ">
                {collection?.slice(0, 4).map((item, index) => (
                  <img
                    key={index}
                    src={item.image_url}
                    className="rounded-full"
                  />
                ))}
              </div>
              <h5>All</h5>
            </div>
          </ImageBlock>
        </div>
      </div>
      <MobileScrollHeader
        openingFrom={"home"}
        search={searchValue}
        setSearch={setSearchValue}
      />

      {openAddCollectionModal && (
        <PostCollectionModal
          open={openAddCollectionModal}
          handleClose={() => {
            setOpenAddCollectionModal(false);
          }}
          onButtonClick={(e) => {
            postCollection(e?.chainId, e?.tokenAddress, chainDetail);
          }}
          placeholder="Enter your collection's address here"
          buttonTitle="Proceed"
          title="Add New Collection"
        />
      )}
    </>
  );
};

export default ScrollHeader;
