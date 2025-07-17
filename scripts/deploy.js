const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // ✅ Deploy CreatureNFT with deployer's address as initial owner
  const CreatureNFT = await hre.ethers.getContractFactory("CreatureNFT");
  const creature = await CreatureNFT.deploy(deployer.address);
  await creature.waitForDeployment();
  console.log("✅ CreatureNFT deployed to:", await creature.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
