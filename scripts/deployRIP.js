
const hre = require("hardhat");

async function main() {
  const RIP  = await hre.ethers.getContractFactory("RIPNFT"); //fetching bytecode and ABI
  const RIPNFT = await RIP.deploy('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', '1'); //creating an instance of our smart contract


  console.log("Deployed contract address:",`${RIPNFT.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});