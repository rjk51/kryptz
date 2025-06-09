require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { PRIVATE_KEY, CORE_RPC_URL } = process.env;

module.exports = {
  solidity: "0.8.27",
  networks: {
    coretestnet: {
      url: CORE_RPC_URL || "https://rpc.test2.btcs.network",
      chainId: 1114,
      accounts: [PRIVATE_KEY || (() => { throw new Error("Missing PRIVATE_KEY in .env"); })()],
    },
  },
};
