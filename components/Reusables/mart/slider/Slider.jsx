import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import arrow from "../../../../public/images/arrow.svg";
import RentCard from "./SliderCard";
import CollectionCard from "../Card/CollectionCard";
import NftCard from "../Card/NftCard";

const Slider1 = ({ data, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const sliderRef = useRef(null);
  const cardWidth = 260; // Width of a card, adjust as per design
  const [windowWidth, setWindowWidth] = useState(0);

  // Check window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      const totalWidth = cardWidth * data.length;
      setShowArrows(totalWidth > containerWidth);
    }
  }, [data.length, windowWidth]);

  // Handle previous slide
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      sliderRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Handle next slide
  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
      sliderRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
    }
  };

  const renderCard = (item) => {
    switch (type) {
      case "rent":
        return <RentCard key={item.id} data={item} />;
      case "collection":
        return <CollectionCard key={item.id} data={item} type={type} />;
      case "nft101":
        return <NftCard key={item.id} data={item} />;
        case "launchpad":
          return <CollectionCard key={item.id} data={item} type={type} />;
      default:
        return null;
    }
  };

  // const uniqueData = Array.from(new Set(data.map((item) => item.id))).map(
  //   (id) => data.find((item) => item.id === id)
  // );

  return (
    <div className="relative w-full flex items-center justify-start">
      {showArrows && currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-0 z-10 p-2  shadow-md rounded-full hover:scale-105"
        >
          <Image src={arrow} alt="Prev" className="transform rotate-180" />
        </button>
      )}

      <div
        ref={sliderRef}
        className="flex overflow-x-scroll no-scrollbar mx-[40px] gap-4 justify-start"
        style={{ scrollBehavior: "smooth" }}
      >
        {data.map((item) => (
          <div
            key={item.id}
            className="min-w-[260px] max-w-[260px] flex-shrink-0"
          >
            {renderCard(item)}
          </div>
        ))}
      </div>

      {showArrows && currentIndex < data.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-0 z-10 p-2  shadow-md rounded-full hover:scale-105"
        >
          <Image src={arrow} alt="Next" />
        </button>
      )}
    </div>
  );
};

export default Slider1;
