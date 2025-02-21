import React, { Fragment, useContext, useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import SessionExpiredModal from "./utility/Modals/SessionExpiredModal";
import { ChainContext } from "@/context/ChainContext";
import {
  indexerAxiosInstance,
  nftCacheAxiosInstance,
  scoreAxiosInstance,
  utilityAxiosInstance,
} from "@/services/axios";
import { useAccount, useDisconnect } from "wagmi";
import GlobalLoaderModal from "./utility/Modals/GlobalLoaderModal";
import { ModalContext } from "@/context/ModalContext";
import { isTokenExpired, refreshToken } from "@/utils/generalUtils";
import { useUserWalletContext } from "@/context/UserWalletContext";
import Footer from "./loan/Footer/Footer";
import { useRouter } from "next/router";

const MainWrapper = ({ children }) => {
  const { isConnected, address } = useAccount();

  const { disconnect } = useDisconnect();

  const {
    setIsTokenSet,
    setIsTokenValid,
    isTransactionOngoing,
    showSignInModal,
    setShowSignInModal,
  } = useUserWalletContext();

  const { openGlobalLoader, setOpenGlobalLoader } = useContext(ChainContext);

  const { openModal } = useContext(ModalContext);

  const setupAxiosInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { response } = error;

        if (isConnected && response?.status === 401) {
          setIsTokenValid(false);
          setIsTokenSet(false);
          // setShowSignInModal(true);
        } else if (response?.status === 403) {
          const tokenExpired = await isTokenExpired();
          setIsTokenValid(!tokenExpired);
          setIsTokenSet(true);
        } else {
          setIsTokenValid(true);
          setIsTokenSet(true);
        }

        return Promise.reject(error);
      }
    );
  };

  [
    indexerAxiosInstance,
    utilityAxiosInstance,
    nftCacheAxiosInstance,
    scoreAxiosInstance,
  ].forEach(setupAxiosInterceptor);

  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [openModal]);

  useEffect(() => {
    localStorage.setItem("walletAddress", address);
  }, [address]);

  useEffect(() => {
    const handleTokenExpiry = () => {
      disconnect();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("walletAddress"); // refreshToken();
    };

    const checkTokenExpiry = async () => {
      const tokenExpired = await isTokenExpired();

      if (tokenExpired && !isTransactionOngoing) {
        handleTokenExpiry();
      }
    };

    const intervalId = setInterval(checkTokenExpiry, 300);

    checkTokenExpiry();

    return () => clearInterval(intervalId);
  }, []);

  const router = useRouter();

  return (
    <>
      {router?.pathname === "/" ? (
        <>{children}</>
      ) : (
        <Fragment>
          <Navbar />
          <div className="pt-[92px] min-h-[calc(100vh-96px)] h-full">
            {children}
          </div>
          <Footer />
          {isConnected && showSignInModal && !openGlobalLoader && (
            <SessionExpiredModal
              open={showSignInModal}
              handleClose={() => {
                // disconnect();
                setShowSignInModal(false);
              }}
            />
          )}
          {openGlobalLoader && (
            <GlobalLoaderModal
              open={openGlobalLoader}
              handleClose={() => {
                setOpenGlobalLoader(false);
              }}
            />
          )}
        </Fragment>
      )}
    </>
  );
};

export default MainWrapper;
