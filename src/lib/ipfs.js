export async function uploadToPinata(metadata) {
  // Call the Next.js API route to upload metadata to Pinata
  try {
    const response = await fetch("/api/pinata-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinata upload failed: ${errText}`);
    }
    const data = await response.json();
    return data.gatewayUrl;
  } catch (error) {
    throw new Error("Failed to upload to Pinata: " + (error?.message || error));
  }
}