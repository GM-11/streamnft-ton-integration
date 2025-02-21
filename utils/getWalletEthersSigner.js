import { BrowserProvider } from "ethers";

export async function clientToSigner(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = await provider.getSigner();
  return signer;
}

export async function getWalletSigner(walletClient) {
  if (!walletClient) {
    throw new Error("No wallet client available");
  }

  try {
    const signer = await clientToSigner(walletClient);
    return signer;
  } catch (error) {
    console.error("Error converting client to signer:", error);
    throw error;
  }
}
