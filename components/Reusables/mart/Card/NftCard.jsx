import { ChainContext } from "@/context/ChainContext";
import { ScrollHeaderContext } from "@/context/ScrollHeaderContext";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";

const NftCard = ({ data }) => {
  const router = useRouter();
  const { pathname } = router;
  const { setSelectedNft } = useContext(ScrollHeaderContext);
  const { selectedChain, setCollectionId } = useContext(ChainContext);
  const handleClick = (item) => {
    const formattedName = item.name.replace(/\s+/g, "-").replace(/-+/g, "-");

    const basePath = pathname.includes("rent") ? "rent" : "mart";

    router.push(`/${selectedChain}/${basePath}/${formattedName}/marketplace`);

    setCollectionId(item.token_address);
    setSelectedNft(item.name);

    analytics.track(`dapp_${basePath}_${item.name}`);
  };
  return (
    <div
      className="bg-[#1C1C1C] cursor-pointer max-w-[238px] rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:translate-y-[-5px] hover:brightness-110 hover:shadow-xl mx-2"
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
      <div className="p-4 pb-12">
        <h3 className="text-lg font-semibold text-white ">{data?.name}</h3>
      </div>
    </div>
  );
};

export default NftCard;
