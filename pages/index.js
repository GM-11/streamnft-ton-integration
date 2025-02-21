import React, { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Loader from "@/components/Reusables/loan/Loader";
import { ChainContext } from "@/context/ChainContext";

const index = () => {
  const router = useRouter();
  

  useEffect(() => {
    const { ref } = router.query;
    if (ref) {
      localStorage.setItem("referralCode", ref);
    }
  }, [router.query]);

  useEffect(() => {
    const checkLocalStorage = () => {
      const storedChain =
        localStorage.getItem("selectedChain") ?? "skale nebula";
      router.push(`/${storedChain}/discover`);
    };

    if (typeof window !== "undefined") {
      checkLocalStorage();
    }
  }, [router]);

  return (
    <div className="w-full items-center flex justify-center">
      <Loader />
    </div>
  );
};

export default index;
