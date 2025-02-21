import { useEffect, useState } from "react";
import TopNavbarMobile from "@/components/MobileComponents/TopNavbar/TopNavbarMobile";
import ServiceSwitch from "./ServiceSwitch";
import TopNav from "./TopNav";
import utilityCalls from "@/services/utility/utilityCalls";
import { useRouter } from "next/router";
import { useUserWalletContext } from "@/context/UserWalletContext";

const Navbar = () => {
  const [pointsData, setPointsData] = useState(null);

  const { address } = useUserWalletContext();

  const router = useRouter();

  useEffect(() => {
    const pointsCall = async () => {
      const response = await utilityCalls.getPointsValue(address);

      if (response instanceof Error) {
        console.error("Error", response);
      } else {
        setPointsData(response?.data);
      }
    };

    if (address?.length > 0) {
      pointsCall();
    }
  }, [address]);

  return (
    <div className="fixed top-0 w-full z-[999]">
      <TopNav />
      <TopNavbarMobile />
      {router.pathname.includes("rent") ? (
        router?.query?.symbol?.length > 0 ? (
          <ServiceSwitch />
        ) : (
          <> </>
        )
      ) : (
        <ServiceSwitch />
      )}
    </div>
  );
};

export default Navbar;
