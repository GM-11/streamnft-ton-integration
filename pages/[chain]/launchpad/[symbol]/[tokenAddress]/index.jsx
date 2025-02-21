import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { InfoIcon } from "@/components/Reusables/rent/Icons";
import { FaTwitter, FaLink, FaDiscord } from "react-icons/fa";
import Button from "@/components/Reusables/utility/Button";
import { getCollectionDetails } from "@/utils/evmProvider";
import Loader from "@/components/Reusables/loan/Loader";
import { ChainContext } from "@/context/ChainContext";

const CollectionMint = () => {
  const router = useRouter();
  const { tokenAddress } = router.query;
  const { chainDetail } = useContext(ChainContext);

  const [collectionDetails, setCollectionDetails] = useState(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (tokenAddress) {
      const fetchCollectionDetails = async () => {
        const details = await getCollectionDetails(tokenAddress);
        console.log({ details})
        setCollectionDetails(details.data);
      };

      fetchCollectionDetails();
    }
  }, [tokenAddress]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  if (!collectionDetails) {
    return <Loader customMessage="Fetching Collection Details..." />;
  }

  
  return (
    <div className="p-6 max-w-6xl mt-6 mx-auto text-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4 text-left">
        {collectionDetails?.name}
      </h1>

      <div className="grid sm:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex justify-center items-center bg-black-5 rounded-lg p-4">
          <img
            src={collectionDetails.image || "https://via.placeholder.com/300"}
            alt="Collection"
            className="w-full max-h-[35rem] rounded-md"
          />
        </div>

        <div className="bg-black-5 rounded-lg p-6">
          <div className="bg-black-3 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-green-3 text-green-6 text-xs font-bold py-1 px-3 rounded-full">
                {collectionDetails?.minttype}
              </span>
              <span className="text-pink-500 font-semibold text-sm">
                ENDS IN 02:05:35:31
              </span>
            </div>

            {/* Description and Social Links side by side */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-medium text-gray-300 w-3/4">
                {collectionDetails?.description}
              </p>
              <div className="flex gap-4 ml-6">
                <a
                  href={collectionDetails?.twitterlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-4 hover:bg-green-3 p-1 rounded-lg "
                >
                  <FaTwitter className="hover:text-green-4" size={16} />
                </a>
                <a
                  href={collectionDetails?.websitelink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-4 hover:bg-green-3 p-1 rounded-lg "
                >
                  <FaLink className="hover:text-green-4" size={16} />
                </a>
                <a
                  href={collectionDetails?.discordlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-4 hover:bg-green-3 p-1 rounded-lg "
                >
                  <FaDiscord className="hover:text-green-4" size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-black-3 rounded-lg p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-2 text-white text-xs font-bold py-1 px-3 rounded">
                Live
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-sm text-gray-400 font-semibold">
                  Total Minted
                </span>
                <span className="text-sm font-semibold text-white">
                  {collectionDetails?.tokenminted ?? 0}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold">FREE</p>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400">
                <div className="items-center flex">
                  Mint fee{" "}
                  <div className="tooltip">
                    <InfoIcon className="h-4 w-4 text-green ml-2" />
                    <span className="tooltiptext !text-xs">hello</span>
                  </div>
                </div>
                <span>
                  {collectionDetails.mintprice ?? 1}{" "}
                  {chainDetail?.currency_symbol}
                </span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-400">
                <div className="items-center flex">
                  Protocol fee{" "}
                  <div className="tooltip">
                    <InfoIcon className="h-4 w-4 text-green ml-2" />
                    <span className="tooltiptext !text-xs">hello</span>
                  </div>
                </div>
                <span>
                  {collectionDetails.mintprice ?? 1}{" "}
                  {chainDetail?.currency_symbol}
                </span>
              </div>
            </div>

            <div className="mt-4 text-gray-400 text-sm">
              <p>
                Priority fee (<span className="text-pink-500">Standard</span>)
              </p>
            </div>

            {/* Email input */}
            <div className="mt-4">
              <label className="text-gray-400 text-sm">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full mt-1 p-2 bg-black-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="termsCheckbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="accent-green-4 w-4 h-4 mr-2"
              />
              <label htmlFor="termsCheckbox" className="text-gray-400 text-xs">
                By clicking "mint," you agree to the{" "}
                <a
                  href="https://streamnft.tech/terms-and-condition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  StreamNFT Terms of Service
                </a>
                .
              </label>
            </div>

            <div className="mt-4">
              <Button buttonClasses="w-full" disabled={!isChecked}>
                Mint Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionMint;
