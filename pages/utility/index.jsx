import Loader from "@/components/Reusables/loan/Loader";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const index = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(`${router.asPath}/explore`);
  }, [router]);

  return (
    <div>
      <Loader />
    </div>
  );
};

export default index;
