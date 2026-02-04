import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";

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
  if (typeof window === "undefined") {
    throw new Error("This function must be called from the client side");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.mintTutor(tutorAddress, credHash, examType);
  await tx.wait();

  return tx.hash;
}

