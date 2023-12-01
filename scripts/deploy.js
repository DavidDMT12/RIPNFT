
const hre = require("hardhat");

async function main() {
  const FAKEDAI  = await hre.ethers.getContractFactory("FakeDAI"); //fetching bytecode and ABI
  const FakeDAI = await FAKEDAI.deploy(); //creating an instance of our smart contract


  console.log("Deployed contract address:",`${FakeDAI.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
//0x3042EC71201Df1A9aE4A2285371802F6efeC1a42 for FakeDAISepolia