import { createContext, useState } from "react";

export const ScrollHeaderContext = createContext();

const ScrollHeaderContextWrapper = ({ children }) => {
  const [selectedNft, setSelectedNft] = useState("all");


  return (
    <ScrollHeaderContext.Provider value={{ selectedNft, setSelectedNft }}>
      {children}
    </ScrollHeaderContext.Provider>
  );
};

export default ScrollHeaderContextWrapper;
