require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const CreatureNFT = await ethers.getContractFactory("CreatureNFT");
  const contract = await CreatureNFT.deploy();
  await contract.waitForDeployment();
  const myContractDeployedAddress = await contract.getAddress();
  console.log("CreatureNFT deployed to:", myContractDeployedAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
