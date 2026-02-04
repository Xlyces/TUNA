import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param metadata The metadata object to upload
 * @returns The IPFS hash
 */
export async function uploadToIPFS(metadata: Record<string, any>): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys are not configured");
  }

  const data = JSON.stringify(metadata);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `tutor-metadata-${Date.now()}`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
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
export async function uploadFileToIPFS(
  file: File | Blob,
  fileName: string
): Promise<string> {
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
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
}

/**
 * Get IPFS URL from hash
 * @param hash The IPFS hash
 * @returns The full IPFS URL
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY}${hash}`;
}

