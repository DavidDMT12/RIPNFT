
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
//0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 for FakeDAI