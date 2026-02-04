"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToIPFS = uploadToIPFS;
exports.uploadFileToIPFS = uploadFileToIPFS;
exports.getIPFSUrl = getIPFSUrl;
const axios_1 = __importDefault(require("axios"));
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
/**
 * Upload JSON metadata to IPFS via Pinata
 * @param metadata The metadata object to upload
 * @returns The IPFS hash
 */
async function uploadToIPFS(metadata) {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API keys are not configured");
    }
    const data = JSON.stringify(metadata);
    try {
        const response = await axios_1.default.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            pinataContent: metadata,
            pinataMetadata: {
                name: `tutor-metadata-${Date.now()}`,
            },
        }, {
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            },
        });
        return response.data.IpfsHash;
    }
    catch (error) {
        console.error("Error uploading to IPFS:", error);
        throw error;
    }
}
/**
 * Upload a file to IPFS via Pinata
 * @param file The file to upload
 * @param fileName The name of the file
 * @returns The IPFS hash
 */
async function uploadFileToIPFS(file, fileName) {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        throw new Error("Pinata API keys are not configured");
    }
    const formData = new FormData();
    formData.append("file", file);
    const metadata = JSON.stringify({
        name: fileName,
    });
    formData.append("pinataMetadata", metadata);
    try {
        const response = await axios_1.default.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY,
            },
        });
        return response.data.IpfsHash;
    }
    catch (error) {
        console.error("Error uploading file to IPFS:", error);
        throw error;
    }
}
/**
 * Get IPFS URL from hash
 * @param hash The IPFS hash
 * @returns The full IPFS URL
 */
function getIPFSUrl(hash) {
    return `${PINATA_GATEWAY}${hash}`;
}
