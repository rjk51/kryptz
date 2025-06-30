export async function POST(req) {
  try {
    const { metadata } = await req.json();
    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.GATEWAY_URL;

    if (!metadata || !pinataJwt || !pinataGateway) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const json = JSON.stringify(metadata);
    const formData = new FormData();
    const blob = new Blob([json], { type: "application/json" });
    formData.append("file", blob, "metadata.json");
    formData.append("network", "public");

    const response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), { status: response.status });
    }

    const data = await response.json();
    const cid = data?.data?.cid;
    if (!cid) {
      return new Response(JSON.stringify({ error: "No CID returned from Pinata" }), { status: 500 });
    }
    return new Response(JSON.stringify({
      gatewayUrl: `https://${pinataGateway}/ipfs/${cid}`,
      ipfsHash: cid,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message || error }), { status: 500 });
  }
}
