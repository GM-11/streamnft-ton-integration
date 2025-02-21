import {
  telosTestnet,
  sepolia,
  polygonAmoy,
  ancient8Sepolia,
  taikoHekla,
  baseSepolia,
  kromaSepolia,
  mintSepoliaTestnet,
  kakarotSepolia,
  berachainTestnetbArtio,
  xdcTestnet,
} from "@wagmi/core/chains";

import {
  mintTestnet,
  openCampusTestnet,
  rariTestnet,
  skaleChainData,
  tanssiDemo,
  coreBlockchain,
  morphHolesky,
  metisTestnet,
  openCampusMainnet,
} from "./chain";

import { http } from "wagmi";

const chainArray = [
  {
    ...telosTestnet,
    iconUrl:
      "https://streamnft-chain.s3.ap-south-1.amazonaws.com/teloslogo.png",
  },
  sepolia,
  {
    ...ancient8Sepolia,
    iconUrl:
      "https://streamnft-chain.s3.ap-south-1.amazonaws.com/ancient8.webp",
  },
  skaleChainData,
  {
    ...polygonAmoy,
    iconUrl:
      "https://streamnft-chain.s3.ap-south-1.amazonaws.com/polygonLogo.png",
  },
  {
    ...taikoHekla,
    iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/taiko.png",
  },
  baseSepolia,
  {
    ...kromaSepolia,
    iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/kroma.png",
  },
  mintSepoliaTestnet,
  {
    ...mintTestnet,
    iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/mint.png",
  },
  {
    ...rariTestnet,
    iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/rari.jpg",
  },
  {
    ...openCampusTestnet,
    iconUrl:
      "https://streamnft-chain.s3.ap-south-1.amazonaws.com/opencampus.png ",
  },
  {
    ...openCampusMainnet,
    iconUrl:
      "https://streamnft-chain.s3.ap-south-1.amazonaws.com/opencampus.png ",
  },
  tanssiDemo,
  coreBlockchain,
  {
    ...kakarotSepolia,
    iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/kakarot.jpg",
  },
  berachainTestnetbArtio,
  morphHolesky,
  xdcTestnet,
  metisTestnet,
];

let transportsObject = {};

chainArray.forEach((chain) => {
  if (!transportsObject[chain.id]) {
    transportsObject[chain.id] = http();
  }
});

export { transportsObject, chainArray };
