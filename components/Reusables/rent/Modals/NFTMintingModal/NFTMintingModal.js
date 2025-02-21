import React, { useEffect, useState, useContext, Fragment } from "react";
import Modal from "@/components/Reusables/rent/Modals/Modal";
import * as Styles from "@/components/Reusables/rent/Modals/NFTMintingModal/nftMintingStyles";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  bundlrStorage,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { toast } from "react-toastify";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getMintMetadataById } from "@/services/rent";
import { useRouter } from "next/router";
import { checkPairing, mintNft } from "@/utils/hashConnectProvider";
import { ChainContext } from "@/context/ChainContext";
import Loader from "@/components/Reusables/loan/Loader";

const NFTMintingModal = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState({});
  const { selectedChain } = useContext(ChainContext);
  const connection = new Connection(clusterApiUrl("devnet"));

  const router = useRouter();

  //const wallet = Keypair.generate();

  const mintSolana = async () => {
    if (wallet.publicKey != null) {
      const metaplex = new Metaplex(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage());
      try {
        setLoading(true);

        /*const { nft } = await metaplex.nfts().create(
          {
            name: collectionData.name,
            symbol: collectionData.symbol,
            uri: collectionData.uri,
            sellerFeeBasisPoints: 500,
            collection: new PublicKey(collectionData.collectionMint),
          },
          { commitment: "finalized" }
        );

        if (nft) {
          toast.success("Test Ticket created in StreamTicket Collection");
          setLoading(false);
          setOpenModal(false);
        }*/

        const mint = new PublicKey(
          "5TH4zr4we3fEAS2PiamSwC2yUjC7s3iK69VSDeDQM8LQ"
        );
        const collection = new PublicKey(
          "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM"
        );
        const authority = wallet;
        const sign = await metaplex.nfts().verifyCollection({
          mintAddress: mint,
          collectionMintAddress: collection,
          collectionAuthority: wallet,
        });

        return nft;
      } catch (e) {
        setLoading(false);
        toast.error(e.message);
        console.error(e.message);
      }
    } else {
      setLoading(false);
      toast.error("Connect your wallet");
    }
  };

  const mintHedera = async () => {
    const checkPair = await checkPairing();
    if (JSON.parse(localStorage.getItem("connected")) === 0 || !checkPair) {
      toast.error("Connect your wallet");
      return;
    }
    try {
      setLoading(true);
      const res = await mintNft();

      if (res === "SUCCESS") {
        toast.success("Test Ticket created");
        setLoading(false);
        //setOpenModal(false);
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
  const claim = async () => {
    if (selectedChain === "Solana") {
      mintSolana();
    }
    if (
      (chainDetail?.chain_id == "296" || chainDetail?.chain_id == "295") &&
      selectedChain
    ) {
      mintHedera();
    }
  };

  useEffect(() => {
    const data = getMintMetadataById(router.query.symbol);
    setCollectionData(data);
  }, []);

  //const { program } = useProgram("E2JQdX2AQKcYdyxkom5AgKwPrh6W15ntAuc8uhMCXoak", "nft-drop")
  //const {data:metadata, isLoading:metadataisLoading}=useProgramMetadata(program)
  //const {data:conditions, isLoading:conditionsisLoading}=useClaimConditions(program)

  //const { mutateAsync: claim, isLoading, error } = useClaimNFT(program);

  return (
    <Modal
      headerText="Mint Test NFT"
      buttonText="Mint"
      buttonHandler={() => claim()}
    >
      <Styles.Wrapper>
        {loading ? (
          <Loader customMessage="Creating test ticket" />
        ) : (
          <Fragment>
            <img
              src={collectionData.image}
              alt="minting image"
              style={{ height: "150px", width: "200px" }}
            />

            <div className="content-section">
              <div className="content-row">
                <h5>Collection: </h5>
                <p>{collectionData.collection}</p>
              </div>
              <div className="content-row">
                <h5>Name: </h5>
                <p>{collectionData.name}</p>
              </div>
              <div className="content-row">
                <h5>Description: </h5>
                <p> {collectionData.description}</p>
              </div>
            </div>
          </Fragment>
        )}
      </Styles.Wrapper>
    </Modal>
  );
};

export { NFTMintingModal };
