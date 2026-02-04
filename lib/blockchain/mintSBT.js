"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintTutorSBT = mintTutorSBT;
const ethers_1 = require("ethers");
const config_1 = require("./config");
/**
 * Mint a new SBT for a verified tutor
 * @param tutorAddress The wallet address of the tutor
 * @param credHash IPFS hash of the verification documents
 * @param examType 0 for DSE, 1 for IB
 * @returns The transaction hash
 */
async function mintTutorSBT(tutorAddress, credHash, examType) {
    if (typeof window === "undefined") {
        throw new Error("This function must be called from the client side");
    }
    const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers_1.ethers.Contract(config_1.CONTRACT_ADDRESS, config_1.CONTRACT_ABI, signer);
    const tx = await contract.mintTutor(tutorAddress, credHash, examType);
    await tx.wait();
    return tx.hash;
}
