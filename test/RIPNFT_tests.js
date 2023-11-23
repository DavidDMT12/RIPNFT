const { ethers } = require('hardhat');
const { expect } = require('chai');
const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  
  describe("deploy fixture", function () {

    async function deployFixture() {
      
    [owner, creator, supporter, supporter2] = await ethers.getSigners();
  
      
     // Deploy FakeDAI contract
    const FakeDAI = await ethers.getContractFactory("FakeDAI");
    FakeDAIInstance = await FakeDAI.deploy();

    // Deploy RIPNFT contract, passing FakeDAI address and URI as constructor arguments
    const RIPNFT = await ethers.getContractFactory("RIPNFT");
    RIPNFTInstance = await RIPNFT.deploy(FakeDAIInstance.target, "1");
  
      // Fixtures can return anything you consider useful for your tests
      return { FakeDAIInstance, RIPNFTInstance, owner, creator, supporter, supporter2 };
    }
  

describe("Deployment", function () {

  it("should deploy RIPNFT using the FakeDAI address", async () => {
    const { RIPNFTInstance, FakeDAIInstance } = await loadFixture(deployFixture);
    const daiTokenAddress = await RIPNFTInstance.daiTokenAddress();
    expect(daiTokenAddress).to.equal(FakeDAIInstance.target);
  });

  it("should deploy RIPNFT using '1' as URI", async () => {
    const { RIPNFTInstance, FakeDAIInstance } = await loadFixture(deployFixture);
    const uri = await RIPNFTInstance.uri(0);
    expect(uri).to.equal("1");
  });

  it("should start an event named test1 and have correct owner", async () => {
    const { RIPNFTInstance, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 1, 100);

    // Retrieve the name of the event at index 1
    const event = await RIPNFTInstance.events(1);

    expect(event.Name).to.equal("test1");
    expect(event.Creator).to.equal(creator.address);
  });

  it("should start 3 events and check that test3 is at index 3", async () => {
    const { RIPNFTInstance, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 1, 100);
    await RIPNFTInstance.connect(creator).startEvent("test2", "2", 1, 100);
    await RIPNFTInstance.connect(creator).startEvent("test3", "2", 1, 100);

    const event = await RIPNFTInstance.events(3);

    expect(event.Name).to.equal("test3");
    expect(event.Creator).to.equal(creator.address);
  });

  it("should donate 100 DAI to test1", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter } = await loadFixture(deployFixture);
    await RIPNFTInstance.startEvent("test1", "2", 1000, 100);
    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    const event = await RIPNFTInstance.events(1);
    const balance = await FakeDAIInstance.balanceOf(supporter);

    expect(event.FCoins).to.equal(100);
    expect(balance.toString()).to.equal("900");
  });

  it("should fail if not enough Fcoins donated", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter } = await loadFixture(deployFixture);
    await RIPNFTInstance.startEvent("test1", "2", 1000, 100);
    await FakeDAIInstance.connect(supporter).mint(supporter, 100);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(10);

    await expect(
      RIPNFTInstance.connect(supporter).payRespects(1, 100)
    ).to.be.reverted;
  });

  it("should fail if not enough time has passed before end", async () => {
    const { RIPNFTInstance, supporter } = await loadFixture(deployFixture);
    await RIPNFTInstance.startEvent("test1", "2", 10, 100);
    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes

    await expect(
      RIPNFTInstance.connect(supporter).endEvent(1)
    ).to.be.revertedWith("The event is still ongoing");
  });

  it("should mint an NFT for supporter", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);
    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);
    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(supporter).mintNFT(1);
    const balance = await RIPNFTInstance.balanceOf(supporter, 1);
    expect(balance).to.equal(1);
  });

  it("should end event and mint NFT to creator", async () => {
    const { RIPNFTInstance, supporter, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);
    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    const balance = await RIPNFTInstance.balanceOf(creator, 1);
    expect(balance).to.equal(1);
  });

  it("should fail on remint", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);
    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);
    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(supporter).mintNFT(1);
    try {
      await RIPNFTInstance.connect(supporter).mintNFT(1);
      expect.fail("Transaction should have failed");
    } catch (error) {
      expect(error.message).to.include("You have already minted your NFT");
    }
  });

  it("should fail if not a member", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);
    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);
    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(supporter).mintNFT(1);
    try {
      await RIPNFTInstance.connect(supporter2).mintNFT(1);
      expect.fail("Transaction should have failed");
    } catch (error) {
      expect(error.message).to.include("You are not a member.");
    }
  });

  it("should mint an NFT for supporter", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);

    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    await FakeDAIInstance.connect(supporter2).mint(supporter2, 1000);
    await FakeDAIInstance.connect(supporter2).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter2).getFcoins(100);
    await RIPNFTInstance.connect(supporter2).payRespects(1, 100);

    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(supporter).mintNFT(1);
    await RIPNFTInstance.connect(supporter2).mintNFT(1);

    const balanceCreator = await RIPNFTInstance.balanceOf(creator, 1);
    const balanceSupporter = await RIPNFTInstance.balanceOf(supporter, 1);
    const balanceSupporter2 = await RIPNFTInstance.balanceOf(supporter2, 1);

    expect(balanceCreator).to.equal(1, "The creator's NFT was not minted");
    expect(balanceSupporter).to.equal(1, "Supporter's NFT was not minted");
    expect(balanceSupporter2).to.equal(1, "Supporter2's NFT was not minted");
  });

  it("should let the creator withdraw 194 DAI", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);

    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    await FakeDAIInstance.connect(supporter2).mint(supporter2, 1000);
    await FakeDAIInstance.connect(supporter2).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter2).getFcoins(100);
    await RIPNFTInstance.connect(supporter2).payRespects(1, 100);

    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(creator).claimDAI();
    
    const balance = await FakeDAIInstance.balanceOf(creator);
    expect(balance).to.equal(194, "The balance is not 194");
  });

  it("should let the owner withdraw 6 DAI", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator, owner } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);

    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    await FakeDAIInstance.connect(supporter2).mint(supporter2, 1000);
    await FakeDAIInstance.connect(supporter2).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter2).getFcoins(100);
    await RIPNFTInstance.connect(supporter2).payRespects(1, 100);

    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(owner).takeprofits();
    
    const balance = await FakeDAIInstance.balanceOf(owner);
    expect(balance).to.equal(6, "The balance is not 194");
  });

  it("should fail if the owner withdraw 0 DAI", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator, owner } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);

    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    await FakeDAIInstance.connect(supporter2).mint(supporter2, 1000);
    await FakeDAIInstance.connect(supporter2).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter2).getFcoins(100);
    await RIPNFTInstance.connect(supporter2).payRespects(1, 100);

    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(owner).takeprofits();
    
    try {
      await RIPNFTInstance.connect(owner).takeprofits();
      expect.fail("Transaction should have failed");
    } catch (error) {
      expect(error.message).to.include("No profits to take");
    }

  });

  it("should fail if the creator withdraw 0 DAI", async () => {
    const { RIPNFTInstance, FakeDAIInstance, supporter, supporter2, creator } = await loadFixture(deployFixture);
    await RIPNFTInstance.connect(creator).startEvent("test1", "2", 2, 100);

    await FakeDAIInstance.connect(supporter).mint(supporter, 1000);
    await FakeDAIInstance.connect(supporter).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter).getFcoins(100);
    await RIPNFTInstance.connect(supporter).payRespects(1, 100);

    await FakeDAIInstance.connect(supporter2).mint(supporter2, 1000);
    await FakeDAIInstance.connect(supporter2).approve(RIPNFTInstance.target, 1000);
    await RIPNFTInstance.connect(supporter2).getFcoins(100);
    await RIPNFTInstance.connect(supporter2).payRespects(1, 100);

    await ethers.provider.send("evm_increaseTime", [5 * 60]); // Increase time by 5 minutes
    await RIPNFTInstance.connect(supporter).endEvent(1);
    await RIPNFTInstance.connect(creator).claimDAI();
    
    try {
      await RIPNFTInstance.connect(creator).claimDAI();
      expect.fail("Transaction should have failed");
    } catch (error) {
      expect(error.message).to.include("No DAI to claim");
    }

  });

  });

}); 
