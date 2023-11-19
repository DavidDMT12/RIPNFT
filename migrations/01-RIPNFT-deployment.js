const FakeDAI = artifacts.require("FakeDAI");
const RIPNFT = artifacts.require("RIPNFT");

module.exports = function (deployer) {
  deployer.deploy(FakeDAI)
    .then(() => {
      return deployer.deploy(RIPNFT, FakeDAI.address, "1"); // Pass address of the first contract to the second contract
    });
};