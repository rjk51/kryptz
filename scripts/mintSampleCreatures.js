const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Replace this address with your actual deployed CreatureNFT address
  const creatureAddress = "0x27106C685C507BDD2878B4C9A3D10B38889D8702";

  const creature = await hre.ethers.getContractAt("CreatureNFT", creatureAddress);

  console.log("Minting Creature #1...");
  const tx1 = await creature.mintCreature(
    deployer.address,
    "ipfs://QmSampleHash1", // Replace with a valid IPFS hash
    80, // power
    70, // speed
    60, // defense
    50, // intelligence
    "Rare"
  );
  await tx1.wait();

  console.log("Minting Creature #2...");
  const tx2 = await creature.mintCreature(
    deployer.address,
    "ipfs://QmSampleHash2", // Replace with a different IPFS hash
    90, // power
    60, // speed
    70, // defense
    40, // intelligence
    "Rare"
  );
  await tx2.wait();

  console.log("✅ Done! Two creatures minted.");
}

main().catch((err) => {
  console.error("❌ Error minting creatures:", err);
  process.exit(1);
});
