const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // ✅ Deploy CreatureNFT with deployer's address as initial owner
  const CreatureNFT = await hre.ethers.getContractFactory("CreatureNFT");
  const creature = await CreatureNFT.deploy(deployer.address);
  await creature.waitForDeployment();
  const addr = await creature.getAddress();
  console.log("✅ CreatureNFT deployed to:", addr);

  // Optionally set market operator if provided via env
  const operator = process.env.MARKET_OPERATOR || process.env.NEXT_PUBLIC_MARKET_OPERATOR;
  if (operator) {
    const tx = await creature.setMarketOperator(operator);
    await tx.wait();
    console.log("✅ Market operator set to:", operator);
  } else {
    console.log("ℹ️ MARKET_OPERATOR / NEXT_PUBLIC_MARKET_OPERATOR not provided. You can set it later via setMarketOperator(address).");
  }

  console.log("\n🚀 Deployment Summary:");
  console.log("📋 Contract: CreatureNFT");
  console.log("📍 Address:", addr);
  console.log("🔗 Network: Core Testnet (Chain ID: 1114)");
  console.log("👤 Owner:", deployer.address);
  if (operator) {
    console.log("🏪 Market Operator:", operator);
  }
  console.log("\n💡 Next steps:");
  console.log("1. Update your .env.local with NEXT_PUBLIC_CONTRACT_ADDRESS=" + addr);
  console.log("2. Fund the market operator wallet with CORE for gas fees");
  console.log("3. Test the marketplace functionality");
  const BattleGame = await hre.ethers.getContractFactory("BattleGame");
  const battleGame = await BattleGame.deploy();
  await battleGame.waitForDeployment();
  console.log("✅ BattleGame deployed at:", await battleGame.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
