
const hre = require("hardhat");

async function main() {
  const RIP  = await hre.ethers.getContractFactory("RIPNFT"); //fetching bytecode and ABI
  const RIPNFT = await RIP.deploy('0x3042EC71201Df1A9aE4A2285371802F6efeC1a42', 'https://raw.githubusercontent.com/DavidDMT12/RIPNFT/Front-end/client/src/JSON/FCoin.json'); //creating an instance of our smart contract


  console.log("Deployed contract address:",`${RIPNFT.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});