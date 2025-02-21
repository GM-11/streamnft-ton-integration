import React from "react";
import Slider1 from "../slider/Slider";
import Loader from "../../loan/Loader";

const Section3 = ({ data, type }) => {
  return (
    <div className="bg-[#111111] h-auto">
      <div className="flex flex-row justify-between items-center mx-8 pt-12">
        <h1 className="text-white font-numans text-[32px]">Creators</h1>
      </div>

      {data.length > 0 ? (
        <Slider1 data={data} type={type} />
      ) : (
        <Loader customMessage="Loading collections..." />
      )}
    </div>
  );
};

export default Section3;
