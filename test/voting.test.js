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

  /************************REGISTRATION TEST*************/

  it("Voter can be added only during voter registration phase", async function () {
    await this.VotingInstance.startProposalsRegistering({ from: owner });
    await expectRevert(
      this.VotingInstance.addVoter(voter1, { from: owner }),
      "Voters registration is not open yet"
    );
  });

  it("Owner should add a new voter", async function () {
    let result = await this.VotingInstance.addVoter(voter1, { from: owner });

    expectEvent(result, "VoterRegistered", {
      voterAddress: voter1,
    });
  });

  it("Only Owner should add a new voter", async function () {
    await expectRevert(
      this.VotingInstance.addVoter(voter2, { from: voter1 }),
      "Ownable: caller is not the owner"
    );
  });

  it("Voter can only be registrated once", async function () {
    let result = await this.VotingInstance.addVoter(voter1, { from: owner });

    await expectEvent(result, "VoterRegistered", {
      voterAddress: voter1,
    });

    await expectRevert(
      this.VotingInstance.addVoter(voter1, { from: owner }),
      "Already registered"
    );
  });
});
