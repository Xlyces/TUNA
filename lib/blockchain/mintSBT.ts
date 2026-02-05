import { ethers } from "ethers";
import { CONTRACT_ABI } from "./contractAbi";

/**
 * Mint a new SBT for a verified tutor
 * @param tutorAddress The wallet address of the tutor
 * @param credHash IPFS hash of the verification documents
 * @param examType 0 for DSE, 1 for IB
 * @returns The transaction hash
 */
export async function mintTutorSBT(
  tutorAddress: string,
  credHash: string,
  examType: 0 | 1
): Promise<string> {
  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    process.env.VITE_CONTRACT_ADDRESS ||
    "";
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS not set");

  // Client-side wallet (optional)
  if (typeof window !== "undefined") {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

  const tx = await contract.mintTutor(tutorAddress, credHash, examType);
  await tx.wait();

    return tx.hash;
  }

  // Server-side mint (demo): sponsor gas using env private key
  const privateKey =
    process.env.PAYMENT_ORACLE_PRIVATE_KEY ||
    process.env.PRIVATE_KEY ||
    "";
  if (!privateKey) {
    throw new Error("PAYMENT_ORACLE_PRIVATE_KEY not set");
  }
  const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL || process.env.POLYGON_MAINNET_RPC_URL;
  if (!rpcUrl) {
    throw new Error("Polygon RPC URL not set");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

  const tx = await contract.mintTutor(tutorAddress, credHash, examType);
  await tx.wait();
  return tx.hash;
}

