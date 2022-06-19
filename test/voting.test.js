const {
  BN,
  ether,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");
contract("Voting", function (accounts) {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];

  beforeEach(async function () {
    this.VotingInstance = await Voting.new();
  });

  it("Owner should add a new voter", async function () {
    let result = await this.VotingInstance.addVoter(voter1, { from: owner });

    expectEvent(result, "VoterRegistered", {
      voterAddress: voter1,
    });
  });
});
