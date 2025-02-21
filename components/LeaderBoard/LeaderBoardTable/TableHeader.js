import React from "react";

const TableHeader = () => {
  return (
    <div className="w-full flex items-center my-4 p-4">
      <div className="w-20 sm:w-36">
        <h5 className="text-sm text-grayscale-24">Place</h5>
      </div>
      <div className="grow max-w-sm flex items-center justify-start sm:justify-center">
        <h5 className="text-sm text-grayscale-24">User</h5>
      </div>
      <div className="w-24 sm:grow flex items-center justify-start sm:justify-center">
        <h5 className="text-sm text-grayscale-24">Points</h5>
      </div>
    </div>
  );
};

export default TableHeader;
