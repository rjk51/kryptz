// Example usage for image and metadata upload with Pinata IPFS helper
import { uploadImageToIPFS, uploadMetadataToIPFS } from "./ipfs";

// Example: Upload an image file (from an <input type="file"> event)
async function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const imageUrl = await uploadImageToIPFS(file);
  console.log("Image IPFS URL:", imageUrl);
}

// Example: Upload NFT metadata
async function handleMetadataUpload() {
  const metadata = {
    name: "Kryptz Creature",
    description: "A dynamic NFT creature",
    image: "ipfs://<image_cid>", // Replace with actual image CID or URL
    attributes: [
      { trait_type: "Power", value: 100 },
      { trait_type: "Type", value: "Fire" },
    ],
  };
  const metadataUrl = await uploadMetadataToIPFS(metadata);
  console.log("Metadata IPFS URL:", metadataUrl);
}

// Export for use in components
export { handleImageUpload, handleMetadataUpload };
