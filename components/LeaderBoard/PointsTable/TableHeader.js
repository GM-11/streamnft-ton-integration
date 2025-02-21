import React from "react";

const TableHeader = () => {
  return (
    <>
      <div className="hidden md:flex w-full items-center my-4 p-4">
        <div className="md:grow min-w-[100px]">
          <h5 className="text-sm text-grayscale-10">Task</h5>
        </div>
        <div className="w-56 pr-16">
          <h5 className="text-sm text-grayscale-10">Points</h5>
        </div>
        <div className="w-56 pr-8">
          <h5 className="text-sm text-grayscale-10">Conditions</h5>
        </div>
        <div className="w-28 pl-8">
          <h5 className="text-sm text-grayscale-10">Frequency</h5>
        </div>
        <div className="w-48 text-right"></div>
      </div>

      <div className="flex md:hidden w-full items-center my-4 p-4">
        <div className="min-w-[100px] max-w-[100px] text-xs pr-5">
          <h5 className="text-sm text-grayscale-10">Task</h5>
        </div>
        <div className="min-w-[100px] max-w-[100px]">
          <h5 className="text-sm text-grayscale-10">Points</h5>
        </div>
        <div className="grow"></div>
      </div>
    </>
  );
};

export default TableHeader;
