import Image from "next/image";
import React, { useContext } from "react";
import { IoIosSearch } from "react-icons/io";
import FilterIcon from "@/public/images/filterIcon.png";
import { ModalContext } from "@/context/ModalContext";
import MobileFiltersModal from "@/components/Reusables/rent/Modals/MobileFiltersModal/MobileFiltersModal";
import { toast } from "react-toastify";
import { ReloadIcon } from "../Icons";
import { UserNftContext } from "@/context/UserNftContext";
import { ImSpinner2 } from "react-icons/im";

const showSpinnerToast = (message, autoClose = 5000000) => {
  toast(
    <div className="flex items-center space-x-3 bg-green-6 text-white rounded">
      <ImSpinner2 className="animate-spin text-white" />
      <span>{message}</span>
    </div>,
    {
      position: toast.POSITION.TOP_RIGHT,
      autoClose,
      className: "!bg-green-6",
      bodyClassName: "!bg-green-6",
    }
  );
};

const MobileScrollHeader = ({
  openingFrom,
  setRightSelect,
  search,
  setSearch,
}) => {
  const { modalType, setModalType, setOpenModal } = useContext(ModalContext);
  const { reloadNftCacheCall } = useContext(UserNftContext);

  return (
    <>
      <div className="w-full flex md:hidden gap-1 justify-between py-4 h-fit font-numans">
        <div className="h-10 w-full max-w-[150px] sm:max-w-full bg-gray-1 rounded-md flex items-center justify-between font-medium px-4">
          <input
            type="text"
            className="bg-transparent max-w-[75%] h-full focus:outline-none focus:border-none text-white placeholder:text-white text-xs"
            placeholder="Enter collection here"
            value={search}
            onChange={(e) => {
              setSearch(e?.target?.value);
            }}
          />
          <IoIosSearch color="#fff" size={21} />
        </div>
        <div
          className="h-10 min-w-[110px] max-w-[110px] px-4 cursor-pointer rounded-md bg-gray-1 flex text-white text-xs items-center gap-4"
          onClick={() => {
            setModalType("mobileFilters");
            setOpenModal(true);
          }}
        >
          <Image alt="#" className="h-6 w-6" src={FilterIcon} />
          <p>Filter</p>
        </div>
        <div
          className="h-10 w-10 p-2 cursor-pointer rounded-md bg-gray-1 flex text-white text-xs items-center "
          onClick={async () => {
            showSpinnerToast("Updating NFT's Data");
            await reloadNftCacheCall();
            toast.dismiss();
            toast.success("Nft's updated successfully");
          }}
        >
          <ReloadIcon size={35} color="#fff" />
        </div>
      </div>
      {modalType === "mobileFilters" && (
        <MobileFiltersModal
          openingFrom={openingFrom}
          setRightSelect={setRightSelect}
        />
      )}
    </>
  );
};

export default MobileScrollHeader;
