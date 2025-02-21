import React, { useContext, useState } from "react";
import Modal from "../Modal";
import * as Styles from "./nftMintingStyles";

import { toast } from "react-toastify";
import { mintNft } from "@/utils/hashConnectProvider";
import { HederaContext } from "@/context/HederaContext";
import { Loader } from "@solana/web3.js";

const NFTMintingModal = (setMintModal) => {
  const [loading, setLoading] = useState(false);
  const { isPaired } = useContext(HederaContext);

  const claim = async () => {
    if (JSON.parse(localStorage.getItem("connected")) === 0 || !isPaired) {
      toast.error("Connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const res = await mintNft();
      if (res === "SUCCESS") {
        toast.success("Test Ticket created in StreamTicket Collection");
        setLoading(false);
      } else {
        toast.error("Something went wrong");
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toast.error(e.message);
      console.error(e.message);
    }
  };

  //const { program } = useProgram("E2JQdX2AQKcYdyxkom5AgKwPrh6W15ntAuc8uhMCXoak", "nft-drop")
  //const {data:metadata, isLoading:metadataisLoading}=useProgramMetadata(program)
  //const {data:conditions, isLoading:conditionsisLoading}=useClaimConditions(program)

  //const { mutateAsync: claim, isLoading, error } = useClaimNFT(program);

  return (
    <Modal
      headerText="Mint Test NFT"
      buttonText="Mint"
      handelButton={() => claim()}
    >
      {loading ? (
        <Loader customMessage="Creating test ticket" />
      ) : (
        <Styles.Wrapper>
          <img
            src="https://arweave.net/6TKUpexnbnDtEPdcGsTi95ahC5X-nZyqfwDrBc2Rxx4?ext=png"
            alt="minting image"
            style={{ height: "150px", width: "200px" }}
          />

          <div className="content-section">
            <div className="content-row">
              <h5>Collection: </h5>
              <p>Honeyland</p>
            </div>
            <div className="content-row">
              <h5>Name: </h5>
              <p>Honeyland Test#01</p>
            </div>
            <div className="content-row">
              <h5>Description: </h5>
              <p>
                The Honeyland Genesis collection is limited to 11,000 NFTs, made
                up of 1,000 Queen Bees and 10,000 Bees. These will be minted as
                eggs and can be hatched into Bees for play in Honeyland by using
                the hatching machine from any open Honeyland universe",
                collection: "Honeyland
              </p>
            </div>
          </div>
        </Styles.Wrapper>
      )}
    </Modal>
  );
};

export default NFTMintingModal;
