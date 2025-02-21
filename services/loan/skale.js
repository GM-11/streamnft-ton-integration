import { JsonRpcProvider, parseEther, Wallet } from "ethers";


const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
const PRIVATE_KEY=process.env.NEXT_PUBLIC_PRIVATE_KEY;
const DISTRIBUTION_VALUE = parseEther("0.00001");

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

export const getBalance = async () => {
    const balance = await provider.getBalance(wallet.address);
    return balance.toString();
};

export async function Distribute({ address }) {
    return await wallet.sendTransaction({
        to: address,
        value: DISTRIBUTION_VALUE
    });
}



