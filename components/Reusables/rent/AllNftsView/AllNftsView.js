import React, { useContext } from "react";
import Table from "./Table";
import MobileCard from "../Card/MobileCard";
import { ChainContext } from "@/context/ChainContext";
import Loader from "../../loan/Loader";

const AllNftsView = ({ collection, availableList }) => {
  const { collectionsLoading } = useContext(ChainContext);

  return (
    <div className="px-0 lg:px-[5rem] w-full items-center">
      <div>
        <div className="mt-8 hidden md:block">
          <Table collection={collection} availableList={availableList} />
        </div>
        <div className="grid grid-cols-1 xs:!grid-cols-2 sm:!grid-cols-3 gap-4 md:hidden">
          {collectionsLoading ? (
            <Loader customMessage="Loading data" />
          ) : (
            collection?.length > 0 &&
            collection?.map((item, index) => (
              <div key={index}>
                <MobileCard data={item} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNftsView;
