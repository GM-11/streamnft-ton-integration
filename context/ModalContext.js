import { createContext, useState } from "react";

export const ModalContext = createContext();

const ModalContextWrapper = ({ children }) => {
  const [openModal, setOpenModal] = useState(false);
  const [lendData, setLendData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [borrowData, setBorrowData] = useState([]);
  const [openNavModel, setOpenNavModel] = useState(false);
  const [modalType, setModalType] = useState("");
  const [lendSearch, setLendSearch] = useState("");
  const [editData, setEditData] = useState([]);
  const [counterData, setCounterData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [claimData, setClaimData] = useState([]);
  const [requestBorrowData, setRequestBorrowData] = useState("");
  const [modalData, setModalData] = useState({});

  return (
    <ModalContext.Provider
      value={{
        openModal,
        setOpenModal,
        lendData,
        setLendData,
        openNavModel,
        setOpenNavModel,
        loanData,
        setLoanData,
        borrowData,
        setBorrowData,
        modalType,
        setModalType,
        lendSearch,
        setLendSearch,
        editData,
        setEditData,
        claimData,
        setClaimData,
        requestBorrowData,
        setRequestBorrowData,
        counterData,
        setCounterData,
        viewData,
        setViewData,
        modalData,
        setModalData,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContextWrapper;
