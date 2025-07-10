// 📁 src/lib/ipfs.js

export async function uploadToPinata(metadata, pinataJWT, gateway) {
  const url = `https://${gateway}/pinning/pinJSONToIPFS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pinataJWT}`,
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: metadata.name,
      },
      pinataContent: metadata,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Pinata upload failed: ${errText}`);
  }

  const result = await res.json();
  return `ipfs://${result.IpfsHash}`;
}
