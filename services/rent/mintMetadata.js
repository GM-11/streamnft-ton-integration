export function getMintMetadata(symbol) {
  const metadataCollection = [
    {
      name: "Honeyland Test#0",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs, made up of 1,000 Queen Bees and 10,000 Bees. These will be minted as eggs and can be hatched into Bees for play in Honeyland by using the hatching machine from any open Honeyland universe",
      collection: "Honeyland",
    },
    {
      name: "StreamTicket#0",
      collection: "StreamTicket",
      symbol: "STRM",
      uri: "https://arweave.net/RpA426bpvuptNcGF6jf-smCVc35BSmIC5Oug8FlAAos",
      collectionMint: "FXptWotMQM9q8gSW3NUcKiwBkrYLWvxk8sqXkrz5ZpWN",
      description: "Collection of StreamTickets for testing StreamNFT platform",
    },
    {
      name: "Claymaker #4141",
      symbol: "DINO",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmS8eqP3hKuULcvg66PvJdyYhawpLGb57ZEuhoBx9KHgsg/16",
      collectionMint: "7xDMDBes6GWSDkCnJtvWPDMhRZ7EPwoXLrK9iX3wUkoT",
      description: "Claymaker machine",
      collection: "Claymaker",
    },
    {
      name: "UGS Test#0",
      symbol: "UGS",
      uri: "https://arweave.net/WgwxCnOxZ98mzxKgTXQYBuIzF_KHBgXFeW3LmD9_AU0",
      collectionMint: "4FgZwqSP89G2xWAmsdLFJH9M4w4JKGDsrc8Cu78ixHZV",
      description: "Underground Society NFTs",
      collection: "Underground Society",
    },
    {
      name: "Aurorian #01",
      symbol: "AUROR",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmbzYFK121ZRDrr1V4cJx1K992TJsYHftpH5Ey2ZTCgDzK/16",
      collectionMint: "DQdZCfTKB7QSPj19nH2JifqmyNtaPhNy55mj3F36Ssz9",
      description: "Aurory Project- NFTs",
      collection: "Aurory",
    },
    {
      name: "Cet #01",
      symbol: "CoC",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmZNms3bDHoqgLyy8qztu33JzmiBUbZsHB4SwEyqcuT2Uo/0",
      collectionMint: "zor3r1hZCD7xoUP7CxrZotqf2U3fCBDsvKc6sbzEHu8",
      description: "It’s just a bunch of crecked cets, who’re upto a whole of rat shit that are livin’, and chillin’ and vibin’ together. They’re picking bullshit catfights, posting their own mugshots, cat calling the cops and stirring whatever they can to keep the high going",
      collection: "Cets",
    }
  ];

  const res = metadataCollection.filter((a) =>
    a.symbol.toLowerCase().includes(symbol.toLowerCase())
  );

  if (res.length === 0) {
    const honeyland = [{
      name: "Honeyland Test#0",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs, made up of 1,000 Queen Bees and 10,000 Bees. These will be minted as eggs and can be hatched into Bees for play in Honeyland by using the hatching machine from any open Honeyland universe",
      collection: "Honeyland",
    }];
    return honeyland;
  }

  return res[0];
}


export function getMintMetadataById(id) {
  const metadataCollection = [
    {
      name: "Honeyland Test#011",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs, made up of 1,000 Queen Bees and 10,000 Bees. These will be minted as eggs and can be hatched into Bees for play in Honeyland by using the hatching machine from any open Honeyland universe",
      collection: "Honeyland",
      image: "https://arweave.net/6TKUpexnbnDtEPdcGsTi95ahC5X-nZyqfwDrBc2Rxx4?ext=png",
      route: "Honeyland" 
    },
    {
      name: "StreamTicket#01",
      collection: "StreamTicket",
      symbol: "STRM",
      uri: "https://arweave.net/RpA426bpvuptNcGF6jf-smCVc35BSmIC5Oug8FlAAos",
      collectionMint: "FXptWotMQM9q8gSW3NUcKiwBkrYLWvxk8sqXkrz5ZpWN",
      description: "Collection of StreamTickets for testing StreamNFT platform",
      image: "https://arweave.net/cFCooN1vY8seGzXw37MmSCLJxT_EYqgY4QNE205FNxM?ext=png",
      route:"OTHER"
    },
    {
      name: "Claymaker #01",
      symbol: "DINO",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmS8eqP3hKuULcvg66PvJdyYhawpLGb57ZEuhoBx9KHgsg/16",
      collectionMint: "7xDMDBes6GWSDkCnJtvWPDMhRZ7EPwoXLrK9iX3wUkoT",
      description: "Claymaker machine",
      collection: "Claymaker",
      image: "https://nftstorage.link/ipfs/bafybeih5faqilucmm7gah4eiior62yoggr4u5e7vuimrodqxmi4tm7zp4y",
      route: "Claymaker"
    },
    {
      name: "UGS Test#01",
      symbol: "UGS",
      uri: "https://arweave.net/WgwxCnOxZ98mzxKgTXQYBuIzF_KHBgXFeW3LmD9_AU0",
      collectionMint: "4FgZwqSP89G2xWAmsdLFJH9M4w4JKGDsrc8Cu78ixHZV",
      description: "Underground Society NFTs",
      collection: "Underground Society",
      image: "https://arweave.net/TKPsV1DoEls8ovqflAiTrEjALXB8xKO3aVlV11rEaUY?ext=png",
      route: "Underground Society"
    },
    {
      name: "Aurorian #01",
      symbol: "AUROR",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmbzYFK121ZRDrr1V4cJx1K992TJsYHftpH5Ey2ZTCgDzK/16",
      collectionMint: "DQdZCfTKB7QSPj19nH2JifqmyNtaPhNy55mj3F36Ssz9",
      description: "Aurory Project- NFTs",
      collection: "Aurory",
      image: "https://arweave.net/r2J03fT7-54v7VhOVar5_zZ56aP8UAwhL0nhQdpYvUc",
      route: "Aurory"
    },
    {
      name: "Cet #01",
      symbol: "CoC",
      uri: "https://ipfs.thirdwebcdn.com/ipfs/QmZNms3bDHoqgLyy8qztu33JzmiBUbZsHB4SwEyqcuT2Uo/0",
      collectionMint: "zor3r1hZCD7xoUP7CxrZotqf2U3fCBDsvKc6sbzEHu8",
      description: "It’s just a bunch of crecked cets, who’re upto a whole of rat shit that are livin’, and chillin’ and vibin’ together. They’re picking bullshit catfights, posting their own mugshots, cat calling the cops and stirring whatever they can to keep the high going",
      collection: "Cets",
      image: "https://arweave.net/r2J03fT7-54v7VhOVar5_zZ56aP8UAwhL0nhQdpYvUc",
      route: "Cets"
    }
  ];

  const res = metadataCollection.filter((a) =>
    a.route.toLowerCase().includes(id.toLowerCase())
  );

  if (res.length === 0) {
    const honeyland = {
      name: "Honeyland Test#0",
      symbol: "HLDEV",
      uri: "https://arweave.net/P_vhW753UMNuTFmT676TeVPPDrSwGtznBlFl0Jz1zmw",
      collectionMint: "87QWrV8E92ks7NLaeorsDXjuAy5S7jaynAaPYpQMPaVM",
      description:
        "The Honeyland Genesis collection is limited to 11,000 NFTs, made up of 1,000 Queen Bees and 10,000 Bees. These will be minted as eggs and can be hatched into Bees for play in Honeyland by using the hatching machine from any open Honeyland universe",
      collection: "Honeyland",
      image: "https://arweave.net/6TKUpexnbnDtEPdcGsTi95ahC5X-nZyqfwDrBc2Rxx4?ext=png"
    };
    return honeyland;
  }

  return res[0];
}