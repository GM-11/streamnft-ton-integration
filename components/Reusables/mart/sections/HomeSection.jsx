import React, { useContext, useState } from "react";
import { postCollection } from "@/utils/apiRequests";
import { ChainContext } from "@/context/ChainContext";
import PostCollectionModal from "../modals/PostCollectionModal";

const HomeSection = ({ currPage }) => {
  const [openAddCollectionModal, setOpenAddCollectionModal] = useState(false);
  const { chainDetail } = useContext(ChainContext);

  return (
    <section className="flex flex-col gap-2 items-center justify-center h-fit px-4 pt-16">
      {/* <h1
        className={`text-xl font-bold ${
          currPage === "discover" ? "text-white" : "text-jet-black"
        } text-center`}
      >
        Tokenize Your Content, Explore Learning Resources, and Unlock Content
        Utilities
      </h1>
      <div
        className={`${
          currPage === "discover" ? "text-white" : "text-jet-black"
        } font-semibold text-xs mb-8 sm:text-sm sm:font-medium`}
      >
        Want to add your collection,
        <button
          className="text-white bg-black/30 px-6 py-1.5 text-xs  rounded-2xl font-medium ml-4"
          onClick={() => setOpenAddCollectionModal(true)}
        >
          List here.
        </button>
      </div>

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
      )} */}
    </section>
  );
};

export default HomeSection;
