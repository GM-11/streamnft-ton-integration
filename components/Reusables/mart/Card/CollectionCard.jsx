import { ChainContext } from "@/context/ChainContext";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";

const CollectionCard = ({ data, type }) => {
  const router = useRouter();
  const { pathname } = router;
  const { setSelectedNft } = useContext(ScrollHeaderContext);
  const { setCollectionId, selectedChain } = useContext(ChainContext);

  const handleClick = (item) => {
    const formattedName = item.name.replace(/\s+/g, "-").replace(/-+/g, "-");

    let basePath;
    if (pathname.includes("launchpad")) {
      basePath = "launchpad";
    } else if (pathname.includes("rent")) {
      basePath = "rent";
    } else {
      basePath = "mart";
    }

    const destinationPath =
      basePath === "launchpad"
        ? `/${selectedChain}/${basePath}/${formattedName}/${item.token_address}`
        : `/${selectedChain}/${basePath}/${formattedName}/marketplace`;

    router.push(destinationPath);

    setCollectionId(item.token_address);
    setSelectedNft(item.name);

    analytics.track(`dapp_${basePath}_${item.name}`);
  };

  return (
    <div
      className="bg-[#1C1C1C] cursor-pointer rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-5px] max-w-[238px] hover:brightness-110 hover:shadow-xl mx-2"
      onClick={() => handleClick(data)}
    >
      <Image
        src={
          data?.image ??
          "https://streamnft-chain.s3.ap-south-1.amazonaws.com/default.png"
        }
        alt={data?.name}
        height={160}
        width={276}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">{data?.name}</h3>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400 mt-2">
            <span>{type === "collection" ? "Floor" : "Token Type"}</span>
            {type === "collection" ? (
              <p className="text-white">
                {data?.floor} {data?.symbol}
              </p>
            ) : (
              <p className="text-white">{data?.tokenType}</p>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            <span>Token Address</span>
            <p className="text-white">
              {data?.token_address?.slice(0, 4)}...
              {data?.token_address?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
