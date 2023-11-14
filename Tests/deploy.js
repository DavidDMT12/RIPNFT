const { ethers } = require("ethers");

const alchemyApiKey = "ALCHEMY_API_KEY";
const daiTokenAddress = "DAI_ADDRESS";
const uri = "https://github.com/DavidDMT12/FCoin/tree/48eaef51396aa8ece707911af0a48c8657e55735/JSON/";

async function deployContract() {
  const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.alchemyapi.io/v2/${alchemyApiKey}`);
  const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider); // Replace with your wallet's private key

  const RIPNFT = new ethers.ContractFactory(
    [
      // Replace with ABI of the contract
    ],
    (await wallet).connect(wallet)
  );

  const contract = await RIPNFT.deploy(daiTokenAddress, uri);
  await contract.deployed();

  console.log("RIPNFT Contract deployed to:", contract.address);
}

deployContract();
