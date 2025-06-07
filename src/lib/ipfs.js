import axios from "axios";

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error(
    "Pinata API keys are missing. Set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY in your .env.local file."
  );
}

// Upload an image file to IPFS via Pinata
export async function uploadImageToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });
  return `${PINATA_GATEWAY}${res.data.IpfsHash}`;
}

// Upload JSON metadata to IPFS via Pinata
export async function uploadMetadataToIPFS(metadata) {
  const res = await axios.post(`${PINATA_BASE_URL}/pinJSONToIPFS`, metadata, {
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });
  return `${PINATA_GATEWAY}${res.data.IpfsHash}`;
}
