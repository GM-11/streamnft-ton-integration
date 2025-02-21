import React, { useContext } from "react";
import VolumeIcon from "../../../../public/images/volumeIcon.png";
import VolumeSecondIcon from "../../../../public/images/volumeIcon2.png";
import HeartIcon from "../../../../public/images/heartIcon.png";
import RightArrow from "../../../../public/images/right-thin-arrow.png";
import SwigglyLineImage from "../../../../public/images/swigglyLine.png";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChainContext } from "@/context/ChainContext";

const CollectionCard = ({ data }) => {
  const router = useRouter();
  const { selectedChain } = useContext(ChainContext);
  return (
    <div
      className="relative rounded-xl shadow-lg overflow-hidden min-w-64 min-h-80 text-white"
      onClick={() =>
        router.push(`/${selectedChain}/discover/${data?.name}/marketplace `)
      }
    >
      <div className="h-full w-full absolute top-0 left-0 bg-black/20"></div>
      {/* Top Left Badge */}
      <div className="bg-white-1 absolute top-2 left-2 flex items-center justify-center max-h-10 max-w-10 min-w-10 min-h-10 text-white text-xs font-semibold rounded-full ">
        7D
      </div>
      <div className="absolute left-10 top-2 max-h-10 gap-2 min-h-10 max-w-fit min-w-fit flex items-center bg-white rounded-full p-2">
        <Image
          src={VolumeIcon}
          height={80}
          width={80}
          alt="#"
          className="h-16 w-16 min-h-8 max-h-8 min-w-8 max-w-8"
        />
        <div>
          <h5 className="text-black   text-xs">Volume</h5>
          <p className="text-black font-semibold text-sm">130 EDU</p>
        </div>
      </div>

      {/* Top Right Button */}
      <button className="absolute top-2 right-2 bg-white-5 bg-opacity-50 text-white h-10 w-10 flex items-center justify-center rounded-full">
        <Image
          src={HeartIcon}
          alt="#"
          height={84}
          width={84}
          className="h-4 w-4 object-contain"
        />
      </button>

      {/* Main Image */}
      <Image
        src={data?.image}
        alt="Logo"
        className="h-full w-full object-cover"
        height={250}
        width={250}
      />

      {/* Text Section */}
      <div className="mt-4 text-center absolute">
        <p className="font-semibold text-lg">Abracadabra in the city of...</p>
      </div>

      {/* Bottom Section */}
      <div className="absolute left-2 bottom-2 max-h-10 gap-2 min-h-10 max-w-fit min-w-fit flex items-center bg-white-5 rounded-full p-2">
        <Image
          src={VolumeSecondIcon}
          height={80}
          width={80}
          alt="#"
          className="h-16 w-16 min-h-8 max-h-8 min-w-8 max-w-8"
        />
        <div>
          <h5 className="text-white   text-xs">Volume</h5>
          <p className="text-white font-semibold text-sm">130 EDU</p>
        </div>
      </div>
      <button className="absolute bottom-2 right-2 bg-white h-10 w-10 flex items-center justify-center rounded-full">
        <Image
          src={RightArrow}
          alt="#"
          height={84}
          width={84}
          className="h-4 w-4 object-contain"
        />
      </button>
    </div>
  );
};

const TrendingSection = ({ data }) => {
  const router = useRouter();
  const { selectedChain } = useContext(ChainContext);

  return (
    <div className="px-12">
      {data?.map((el, idx) => (
        <div key={idx}>
          <div className="w-full flex items-center justify-between">
            <h2 className="my-12 text-4xl w-fit font-medium">
              {el?.headerTitle?.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="relative">
                {el?.headerTitle?.split(" ").pop()}
                <Image
                  src={SwigglyLineImage}
                  alt="#"
                  className="h-auto w-24 absolute left-2 bottom-0"
                />
              </span>
            </h2>
            <button
              className="bg-transparent border-2 border-solid border-white text-white px-4 py-2 rounded-full text-sm"
              onClick={() =>
                router.push(`/${selectedChain}/discover/collection`)
              }
            >
              Explore All
            </button>
          </div>
          <div
            className="flex overflow-x-scroll no-scrollbar  gap-4 justify-start"
            style={{ scrollBehavior: "smooth" }}
          >
            {el?.data?.map((el) => (
              <CollectionCard data={el} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendingSection;
