import { ethers } from "ethers";
import MerkleTree from "merkletreejs";

let balances = [
  {
    addr: "0xb7e390864a90b7b923c9f9310c6f98aafe43f707",
  },
  {
    addr: "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
  },
  {
    addr: "0xea674fdde714fd979de3edf0f56aa9546b898ec8",
  },
  {
    addr: "0xf11d8A2BF17D04C50CfB6ba505e1e88c4BD4b673",
  },
];

export const generateLeafNode = (address) => {
  return ethers.keccak256(Buffer.from(address.replace("0x", ""), "hex"));
};

// export const userLeafNode = generateLeafNode(address);
// const generateLeafNode = () => {
//   const {address}=useUserWalletContext();
//   return ethers.keccak256(Buffer.from(address.replace("0x", ""), "hex"));
// };

// export const userLeafNode = "";

export const leafNodes = balances.map((balance) =>
  ethers.keccak256(Buffer.from(balance.addr.replace("0x", ""), "hex"))
);

export const merkleTree = new MerkleTree(leafNodes, ethers.keccak256, {
  sortPairs: true,
});

//getHexproof(leafNodes[0])
