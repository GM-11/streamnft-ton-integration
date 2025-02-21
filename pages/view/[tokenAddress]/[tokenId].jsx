import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { ChainContext } from "@/context/ChainContext";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Button from "@/components/Reusables/rent/Button";
import { shopBaseURL } from "@/services/axios";
import Link from "next/link";
import Loader from "@/components/Reusables/loan/Loader";
import { useUserWalletContext } from "@/context/UserWalletContext";

const SERVER_URL = shopBaseURL;

function App() {
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  const [fileUrl, setFileUrl] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const router = useRouter();
  const { isConnected, address } = useUserWalletContext();
  const { chainDetail } = useContext(ChainContext);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.JsonRpcProvider(chainDetail?.rpc_url);
      setProvider(provider);
    }
    setTokenAddress(router?.query?.tokenAddress);
    setTokenId(router?.query?.tokenId);
  }, [router, chainDetail]);

  useEffect(() => {
    setWalletConnected(isConnected);
    if (isConnected && tokenAddress && tokenId && address) {
      verifyAndFetchContent(address, tokenAddress, tokenId);
    }
  }, [isConnected, tokenAddress, tokenId, address]);

  const AudioPlayer = ({ url }) => (
    <audio controls controlsList="nodownload" className="w-full">
      <source src={url} type="audio/mp3" />
      <source src={url} type="audio/mpeg" />
      <source src={url} type="audio/ogg" />
    </audio>
  );

  const PDFViewer = ({ url }) => (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
      <div style={{ height: "750px", border: "1px solid #ddd" }}>
        <Viewer fileUrl={url} />
      </div>
    </Worker>
  );

  const VideoPlayer = ({ url }) => (
    <video
      controls
      controlsList="nodownload"
      width="100%"
      className="rounded-lg shadow-lg mb-4"
      src={url}
    ></video>
  );

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      setAccount(walletAddress);

      verifyAccess(walletAddress, tokenAddress, tokenId);
    } catch (error) {
      console.error(error);
    }
  };

  const verifyAndFetchContent = async (
    walletAddress,
    tokenAddress,
    tokenId
  ) => {
    if (!walletAddress || !tokenAddress || !tokenId) {
      return;
    }

    try {
      setLoading(true);
      // Verify NFT access
      const accessResponse = await fetch(`${SERVER_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: walletAddress,
          tokenAddress: tokenAddress,
          tokenId: tokenId,
        }),
      });

      const accessData = await accessResponse.json();

      // If access is granted, fetch the content (PDF)
      if (accessData.accessGranted) {
        setHasNFT(true);

        const contentResponse = await fetch(
          `${SERVER_URL}/protected-content?tokenAddress=${tokenAddress}&tokenId=${tokenId}`,
          {
            headers: {
              "X-Wallet-Address": walletAddress,
            },
          }
        );

        const contentData = await contentResponse.json();

        if (contentData.fileUrl) {
          setFileUrl(contentData.fileUrl);
          setLoading(false);
        } else {
          setLoading(false);
          console.error("No file URL returned");
        }
      } else {
        setLoading(false);
        setHasNFT(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error verifying access or fetching content:", error);
    }
  };

  useEffect(() => {
    function getFileCategory(url) {
      const fileName = url.substring(url.lastIndexOf("/") + 1);
      const extension = fileName.split("?")[0].split(".").pop().toLowerCase();
      const fileTypes = {
        image: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
        audio: ["mp3", "wav", "aac", "ogg", "flac", "m4a", "mpeg"],
        video: ["mp4", "avi", "mkv", "mov", "wmv", "flv"],
        pdf: ["pdf"],
      };

      for (const category in fileTypes) {
        if (fileTypes[category].includes(extension)) {
          return category;
        }
      }

      return "unknown";
    }

    if (fileUrl) {
      setContentType(getFileCategory(fileUrl));
    }
  }, [fileUrl]);

  //
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-purple-800 p-8 font-numans text-white">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-green-5">
          Exclusive Content Portal
        </h1>
        <p className="text-lg">
          Unlock premium content by connecting your wallet and holding the
          required NFTs.
        </p>
      </header>

      {loading ? (
        <Loader />
      ) : !walletConnected ? (
        <section className="flex flex-col items-center justify-center">
          <p className="mb-6 text-lg">
            Please connect your MetaMask wallet to proceed.
          </p>
          <Button
            clickHandler={connectWallet}
            className="px-8 py-4 bg-green-500 text-black rounded-full shadow-md hover:bg-green-600 transition-all"
          >
            Connect MetaMask
          </Button>
        </section>
      ) : hasNFT ? (
        <article className="mt-8 text-center">
          {contentType && (
            <>
              <h2 className="text-3xl font-bold mb-6">Welcome NFT Holder!</h2>
              <p className="mb-6">
                Enjoy access to the exclusive content below:
              </p>
            </>
          )}

          {contentType === "video" ? (
            <div className="media-container">
              <VideoPlayer url={fileUrl} />
              <p className="mt-4 text-sm text-green-2">
                Exclusive video content available for NFT holders.
              </p>
            </div>
          ) : contentType === "audio" ? (
            <div className="media-container">
              <AudioPlayer url={fileUrl} />
              <p className="mt-4 text-sm text-green-2">
                Listen to this premium audio content.
              </p>
            </div>
          ) : contentType === "pdf" ? (
            <div className="media-container">
              <PDFViewer url={fileUrl} />
              <p className="mt-4 text-sm text-green-2">
                Download or view the exclusive PDF content.
              </p>
            </div>
          ) : contentType === "image" ? (
            <div className="media-container">
              <img
                src={fileUrl}
                alt="Exclusive NFT content"
                className="rounded-lg shadow-lg mb-4"
              />
              <p className="mt-4 text-sm text-green-2">
                View this exclusive image content.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 border border-red-600 bg-red-100 text-red-700 rounded-lg shadow-md">
              <p className="font-bold">
                There is no secured content associated with the NFT.
                <br /> <br /> Rent secured content NFT{" "}
                <Link href="https://eduverse.streamnft.tech/rent/EduLibrary/marketplace">
                  <span className="text-green-4 underline hover:text-red-600 transition">
                    Here
                  </span>
                </Link>{" "}
                to see gated content. <br /> OR <br />
                Create your own token gated content{" "}
                <Link href="https://eduverse.streamnft.tech/mint">
                  <span className="text-green-4 underline hover:text-red-600 transition">
                    Here
                  </span>
                </Link>
                .
              </p>
            </div>
          )}
        </article>
      ) : (
        <section className="text-center mt-8">
          <p className="text-lg font-semibold text-red-400">
            You do not have the required NFT to access this content.
          </p>
          <p className="mt-4 text-green-2">
            Ensure you hold the correct NFT to unlock premium features.
          </p>
        </section>
      )}
    </div>
  );
}

export default App;
