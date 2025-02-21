// hooks/useHashConnect.js
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const useHashConnect = () => {
  const [HashConnect, setHashConnect] = useState(null);

  // useEffect(() => {
  // const loadHashConnect = async () => {
  //   const importedHashConnect = await import("hashconnect/dist/cjs/main");
  //   setHashConnect(() => importedHashConnect.HashConnect);
  // };

  // loadHashConnect();
  // }, []);

  return HashConnect;
};

export default useHashConnect;
