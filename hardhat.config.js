require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();

const ALCHEMY_API_URL= process.env.ALCHEMY_URL;

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_KEY;

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: ALCHEMY_API_URL,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};