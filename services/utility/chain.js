const ancient8Testnet = {
  id: 28122024,
  name: "Ancient8 Testnet",
  iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/ancient8.webp",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Ancient8",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpcv2-testnet.ancient8.gg/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ancient8 Scan",
      url: "https://scanv2-testnet.ancient8.gg/",
    },
  },
  testnet: true,
};

const hederaTestnet = {
  id: 296,
  name: "Hedera testnet",
  iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/hederaLogo.png",
  iconBackground: "#000",
  nativeCurrency: {
    decimals: 8,
    name: "Hedera testnet",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/testnet/dashboard",
    },
  },
  testnet: true,
};

const skaleTestnet = {
  id: 37084624,
  name: "SKALE Nebula Hub Testnet",
  iconUrl:
    "https://streamnft-chain.s3.ap-south-1.amazonaws.com/skale-skl-seeklogo.svg",
  iconBackground: "#000",
  nativeCurrency: { name: "sFUEL", symbol: "sFUEL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com",
      standard: "EIP3091",
    },
  },
  testnet: true,
};

const mintTestnet = {
  id: 1687,
  name: "Mint Sepolia Testnet",
  iconUrl: "https://streamnft-chain.s3.ap-south-1.amazonaws.com/ethLogo.png",
  iconBackground: "#000",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-testnet-rpc.mintchain.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mint explorer",
      url: "https://sepolia-testnet-explorer.mintchain.io",
    },
  },
  testnet: true,
};

const rariTestnet = {
  name: "RARI Chain Testnet",
  chain: "RARI",
  faucets: [],
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  infoURL: "https://rarichain.org/",
  id: 1918988905,
  rpcUrls: {
    default: {
      http: ["https://testnet.rpc.rarichain.org/http"],
    },
  },
  explorers: {
    default: {
      name: "rarichain-testnet-explorer",
      url: "https://explorer.rarichain.org",
      standard: "EIP3091",
    },
  },
};

const openCampus = {
  name: "Open Campus Codex",
  chain: "Open Campus Codex",
  icon: "open-campus-codex",
  rpcUrls: {
    default: {
      http: ["https://rpc.open-campus-codex.gelato.digital"],
    },
  },
  faucets: [],
  nativeCurrency: { name: "EDU", symbol: "EDU", decimals: 18 },
  infoURL:
    "https://raas.gelato.network/rollups/details/public/open-campus-codex",
  shortName: "open-campus-codex",
  id: 656476,
  networkId: 656476,
  explorers: {
    default: {
      name: "Open Campus Codex",
      url: "https://opencampus-codex.blockscout.com",
      icon: "open-campus-codex",
      standard: "none",
    },
  },
};

const coreBlockchain = {
  name: "Core Blockchain Testnet",
  chain: "Core",
  icon: "core",
  rpcUrls: {
    default: {
      http: ["https://rpc.test.btcs.network/"],
    },
  },
  faucets: ["https://scan.test.btcs.network/faucet"],
  nativeCurrency: {
    name: "Core Blockchain Testnet Native Token",
    symbol: "tCORE",
    decimals: 18,
  },
  infoURL: "https://www.coredao.org",
  shortName: "tcore",
  id: 1115,
  networkId: 1115,
  slip44: 1,
  explorers: {
    default: {
      name: "Core Scan Testnet",
      url: "https://scan.test.btcs.network",
      icon: "core",
      standard: "EIP3091",
    },
  },
};

const tanssiDemo = {
  name: "Tanssi Demo",
  chain: "TANGO",
  rpcUrls: {
    default: {
      http: ["https://fraa-dancebox-3001-rpc.a.dancebox.tanssi.network"],
    },
  },
  faucets: [],
  nativeCurrency: { name: "TANGO", symbol: "TANGO", decimals: 18 },
  infoURL:
    "https://docs.tanssi.network/builders/tanssi-network/networks/dancebox/demo-evm-containerchain",
  shortName: "tango",
  id: 5678,
  networkId: 5678,
  explorers: {
    default: {
      name: "BlockScout",
      url: "https://3001-blockscout.a.dancebox.tanssi.network",
      standard: "EIP3091",
    },
  },
};

export {
  ancient8Testnet,
  hederaTestnet,
  skaleTestnet,
  mintTestnet,
  rariTestnet,
  openCampus,
  coreBlockchain,
  tanssiDemo,
};
