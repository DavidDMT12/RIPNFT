const FakeDAI = artifacts.require("FakeDAI");
const RIPNFT = artifacts.require("RIPNFT");
const { time } = require('@openzeppelin/test-helpers');

contract("Contract Deployment", async (accounts) => {
  let fakeDAIInstance;
  let ripNFTInstance;
  const owner = accounts[0];
  const creator = accounts[1];
  const supporter = accounts[2];
  const supporter2 = accounts[3];

  beforeEach(async () => {
    // Deploy FakeDAI contract
    fakeDAIInstance = await FakeDAI.new();

    // Deploy RIPNFT contract, passing FakeDAI address
    ripNFTInstance = await RIPNFT.new(fakeDAIInstance.address, "1");
  });

  it("should deploy FakeDAI and RIPNFT contracts", async () => {
    assert.ok(fakeDAIInstance.address, "FakeDAI contract deployment failed");
    assert.ok(ripNFTInstance.address, "RIPNFT contract deployment failed");
  });

  it("should deploy RIPNFT using the FakeDAI address", async () => {
    const fakeDAIaddress = await ripNFTInstance.daiTokenAddress();
    assert.equal(
      fakeDAIaddress,
      fakeDAIInstance.address,
      "RIPNFT did not use the expected FakeDAI address"
    );
  });

  it("should deploy RIPNFT using '1' as URI", async () => {
    const uri = await ripNFTInstance.uri(0);
    assert.equal(
      uri,
      "1",
      "RIPNFT did not use '1' as the URI"
    );
  });

  it("should start an event named test1 and have correct owner", async () => {
    await ripNFTInstance.startEvent("test1", "2", 1, 100, { from: creator });

    // Retrieve the name of the event at index 1
    const event = await ripNFTInstance.events(1);

    assert.equal(
      event.Name,
      "test1",
      "The name of the event is not 'test1'"
    );

    assert.equal(
      event.Creator,
      creator,
      "The event creator address is incorrect"
    );
  });

  it("should start 3 events and check that test3 is on index 3", async () => {
    await ripNFTInstance.startEvent("test1", "2", 1, 100, { from: creator });
    await ripNFTInstance.startEvent("test2", "2", 1, 100, { from: creator });
    await ripNFTInstance.startEvent("test3", "2", 1, 100, { from: creator });

    // Retrieve the name of the event at index 1
    const event = await ripNFTInstance.events(3);

    assert.equal(
      event.Name,
      "test3",
      "The name of the event3 is not 'test3'"
    );

    assert.equal(
      event.Creator,
      creator,
      "The event creator address is incorrect"
    );
  });

  it("should donate 100 DAI to test1", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 1000, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 1000, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(100, { from: supporter });
    await ripNFTInstance.payRespects(1, 100, { from: supporter });
    const event = await ripNFTInstance.events(1);
    const balance = await fakeDAIInstance.balanceOf(supporter)

    assert.equal(
      event.FCoins,
      100,
      "the donated amount is incorrect"
    );

    assert.equal(
        balance.toString(),
      "900",
      "The donated amount was incorrect"
    );
    
  }); 

  it("should fail if not enough DAI when donating", async () => {
    await ripNFTInstance.startEvent("test1", "2", 1000, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 10, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    try {
        await ripNFTInstance.getFcoins(100, { from: supporter });
        assert.fail("Transaction should have failed");
    } catch (error) {
        assert(error.message.includes("revert"), "Expected revert error");
    }
  });

  it("should fail if not enough Fcoins donated", async () => {
    await ripNFTInstance.startEvent("test1", "2", 1000, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 100, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(10, { from: supporter });
    try {
        await ripNFTInstance.payRespects(1, 100, { from: supporter });
        assert.fail("Transaction should have failed");
    } catch (error) {
        assert(error.message.includes("revert"), "Expected revert error");
    }
  });

  it("should fail if not enough time has passed before end", async () => {
    await ripNFTInstance.startEvent("test1", "2", 10, 100, { from: creator });
    await time.increase(time.duration.minutes(5));
    try {
        await ripNFTInstance.endEvent(1, { from: supporter });
        assert.fail("Transaction should have failed");
    } catch (error) {
        assert(error.message.includes("revert"), "Expected revert error");
    }
  });

  it("should mint an NFT for supporter", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 2, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 1000, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(100, { from: supporter });
    await ripNFTInstance.payRespects(1, 100, { from: supporter });
    await time.increase(time.duration.minutes(5));
    await ripNFTInstance.endEvent(1, { from: supporter });
    await ripNFTInstance.mintNFT(1, { from: supporter });
    const balance = await ripNFTInstance.balanceOf(supporter, 1)
    assert.equal(
        balance,
      1,
      "The NFT was not minted"
    );
  });

  it("should end event and mint NFT to creator", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 2, 100, { from: creator });
    await time.increase(time.duration.minutes(5));
    await ripNFTInstance.endEvent(1, { from: supporter });
    const event = await ripNFTInstance.events(1);
    const balance = await ripNFTInstance.balanceOf(creator, 1)
    assert.equal(
      event.HasEnded,
      true,
      "the event was not ended"
    );

    assert.equal(
        balance,
      1,
      "The NFT was not minted"
    );
  });

  it("should fail on remint", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 2, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 1000, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(100, { from: supporter });
    await ripNFTInstance.payRespects(1, 100, { from: supporter });
    await time.increase(time.duration.minutes(5));
    await ripNFTInstance.endEvent(1, { from: supporter });
    await ripNFTInstance.mintNFT(1, { from: supporter });
    const balance = await ripNFTInstance.balanceOf(supporter, 1)
    try {
        await ripNFTInstance.mintNFT(1, { from: supporter });
        assert.fail("Transaction should have failed");
    } catch (error) {
        assert(error.message.includes("revert"), "Expected revert error");
    }
  });

  it("should fail if not member", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 2, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 1000, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(100, { from: supporter });
    await ripNFTInstance.payRespects(1, 100, { from: supporter });
    await time.increase(time.duration.minutes(5));
    await ripNFTInstance.endEvent(1, { from: supporter });
    await ripNFTInstance.mintNFT(1, { from: supporter });
    const balance = await ripNFTInstance.balanceOf(supporter, 1)
    try {
        await ripNFTInstance.mintNFT(1, { from: supporter2 });
        assert.fail("Transaction should have failed");
    } catch (error) {
        assert(error.message.includes("revert"), "Expected revert error");
    }
  });

  it("should allow for several supporters", async () => { //Note not working with decimals
    await ripNFTInstance.startEvent("test1", "2", 2, 100, { from: creator });
    await fakeDAIInstance.mint(supporter, 1000, { from: supporter });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter });
    await ripNFTInstance.getFcoins(100, { from: supporter });
    await ripNFTInstance.payRespects(1, 100, { from: supporter });

    await fakeDAIInstance.mint(supporter2, 1000, { from: supporter2 });
    await fakeDAIInstance.approve(ripNFTInstance.address, 1000, { from: supporter2 });
    await ripNFTInstance.getFcoins(100, { from: supporter2 });
    await ripNFTInstance.payRespects(1, 100, { from: supporter2 });

    await time.increase(time.duration.minutes(5));
    await ripNFTInstance.endEvent(1, { from: supporter });
    await ripNFTInstance.mintNFT(1, { from: supporter });
    await ripNFTInstance.mintNFT(1, { from: supporter2 });

    const balance = await ripNFTInstance.balanceOf(creator, 1)
    const balance2 = await ripNFTInstance.balanceOf(supporter, 1)
    const balance3 = await ripNFTInstance.balanceOf(supporter2, 1)
    assert.equal(
        balance,
      1,
      "The NFT1 was not minted"
    );

    assert.equal(
        balance2,
      1,
      "The NFT2 was not minted"
    );

    assert.equal(
        balance3,
      1,
      "The NFT2 was not minted"
    );
    });

});