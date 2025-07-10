const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const CreatureNFT = await hre.ethers.getContractFactory("CreatureNFT");
  const creatureNFT = await CreatureNFT.deploy(deployer.address);
  await creatureNFT.waitForDeployment();
  console.log("✅ CreatureNFT deployed at:", await creatureNFT.getAddress());

  const BattleGame = await hre.ethers.getContractFactory("BattleGame");
  const battleGame = await BattleGame.deploy();
  await battleGame.waitForDeployment();
  console.log("✅ BattleGame deployed at:", await battleGame.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
