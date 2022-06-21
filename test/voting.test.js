const {
  BN,
  constants,
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
  const proposal1 = "proposal 1";
  const proposal2 = "proposal 2";
  const emptyProposal = "";

  // ::::::::::::: INITIAL STATE ::::::::::::: //

  describe("INITIAL STATE", () => {
    before(async function () {
      this.VotingInstance = await Voting.new();
    });

    it("Init phase is voter registration phase", async function () {
      expect(await this.VotingInstance.workflowStatus()).to.be.bignumber.equal(
        new BN(0)
      );
    });
    it("No proposal registered", async function () {
      let result = await this.VotingInstance.addVoter(voter1, { from: owner });
      await expectRevert.unspecified(this.VotingInstance.getOneProposal(0), {
        from: voter1,
      });
    });
  });

  describe("WORKFLOW STATUS UPDATE", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new();
    });

    it("Init phase is voter registration phase", async function () {
      expect(await this.VotingInstance.workflowStatus()).to.be.bignumber.equal(
        new BN(0)
      );
    });
    it("Only owner can update the workflow", async function () {
      let result;
      for (var i = 1; i < 6; i++) {
        switch (true) {
          case i == 1:
            await expectRevert(
              this.VotingInstance.startProposalsRegistering({
                from: voter1,
              }),
              "Ownable: caller is not the owner"
            );
            result = await this.VotingInstance.startProposalsRegistering({
              from: owner,
            });
            break;
          case i == 2:
            await expectRevert(
              this.VotingInstance.endProposalsRegistering({
                from: voter1,
              }),
              "Ownable: caller is not the owner"
            );
            result = await this.VotingInstance.endProposalsRegistering({
              from: owner,
            });
            break;
          case i == 3:
            await expectRevert(
              this.VotingInstance.startVotingSession({
                from: voter1,
              }),
              "Ownable: caller is not the owner"
            );
            result = await this.VotingInstance.startVotingSession({
              from: owner,
            });
            break;
          case i == 4:
            await expectRevert(
              this.VotingInstance.endVotingSession({
                from: voter1,
              }),
              "Ownable: caller is not the owner"
            );
            result = await this.VotingInstance.endVotingSession({
              from: owner,
            });
            break;
          case i == 5:
            await expectRevert(
              this.VotingInstance.tallyVotes({
                from: voter1,
              }),
              "Ownable: caller is not the owner"
            );
            result = await this.VotingInstance.tallyVotes({
              from: owner,
            });
            break;
        }

        expectEvent(result, "WorkflowStatusChange", {
          previousStatus: new BN(i - 1),
          newStatus: new BN(i),
        });
      }
    });
    it("Normal update to next step", async function () {
      let result;
      for (var i = 1; i < 6; i++) {
        switch (true) {
          case i == 1:
            result = await this.VotingInstance.startProposalsRegistering({
              from: owner,
            });
            break;
          case i == 2:
            result = await this.VotingInstance.endProposalsRegistering({
              from: owner,
            });
            break;
          case i == 3:
            result = await this.VotingInstance.startVotingSession({
              from: owner,
            });
            break;
          case i == 4:
            result = await this.VotingInstance.endVotingSession({
              from: owner,
            });
            break;
          case i == 5:
            result = await this.VotingInstance.tallyVotes({
              from: owner,
            });
            break;
        }

        expectEvent(result, "WorkflowStatusChange", {
          previousStatus: new BN(i - 1),
          newStatus: new BN(i),
        });
      }
    });
    it("Except revert if phase is not following the workflow", async function () {
      let result;
      //for each phase test that we can only go to the next one, so we expect a revert in case next phase is not allowed
      for (var n = 0; n < 6; n++) {
        switch (true) {
          case n == 1:
            result = await this.VotingInstance.startProposalsRegistering({
              from: owner,
            });
            break;
          case n == 2:
            result = await this.VotingInstance.endProposalsRegistering({
              from: owner,
            });
            break;
          case n == 3:
            result = await this.VotingInstance.startVotingSession({
              from: owner,
            });
            break;
          case n == 4:
            result = await this.VotingInstance.endVotingSession({
              from: owner,
            });
            break;
          case n == 5:
            result = await this.VotingInstance.tallyVotes({
              from: owner,
            });
            break;
        }
        for (var i = 1; i < 6; i++) {
          if (i != n) {
            switch (true) {
              case i == 1 && n != 0:
                await expectRevert(
                  this.VotingInstance.startProposalsRegistering({
                    from: owner,
                  }),
                  "Registering proposals cant be started now"
                );
                break;
              case i == 2 && n != 1:
                await expectRevert(
                  this.VotingInstance.endProposalsRegistering({
                    from: owner,
                  }),
                  "Registering proposals havent started yet"
                );
                break;
              case i == 3 && n != 2:
                await expectRevert(
                  this.VotingInstance.startVotingSession({
                    from: owner,
                  }),
                  "Registering proposals phase is not finished"
                );
                break;
              case i == 4 && n != 3:
                await expectRevert(
                  this.VotingInstance.endVotingSession({
                    from: owner,
                  }),
                  "Voting session havent started yet"
                );
                break;
              case i == 5 && n != 4:
                await expectRevert(
                  this.VotingInstance.tallyVotes({
                    from: owner,
                  }),
                  "Current status is not voting session ended"
                );
                break;
            }
          }
        }
      }
    });
  });

  /************************VOTER REGISTRATION TEST*************/
  describe("VOTER REGISTRATION", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new();
    });

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

    it("Only Owner can add a new voter", async function () {
      await expectRevert(
        this.VotingInstance.addVoter(voter2, { from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("Voter can only be registered once", async function () {
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

  /************************PROPOSAL REGISTRATION TEST*************/
  describe("PROPOSAL REGISTRATION", () => {
    //use before to keep state
    before(async function () {
      this.VotingInstance = await Voting.new();
    });

    it("Proposal can be added only during proposal registration phase", async function () {
      //add voter
      let result = await this.VotingInstance.addVoter(voter1, { from: owner });

      expectEvent(result, "VoterRegistered", {
        voterAddress: voter1,
      });
      //add proposal
      await expectRevert(
        this.VotingInstance.addProposal(proposal1, { from: voter1 }),
        "Proposals are not allowed yet"
      );
    });

    it("Registered voter can add a new proposal", async function () {
      await this.VotingInstance.startProposalsRegistering({ from: owner });
      let result = await this.VotingInstance.addProposal(proposal1, {
        from: voter1,
      });

      expectEvent(result, "ProposalRegistered", {
        proposalId: new BN(0),
      });
    });

    it("Only registered voter can add a new proposal", async function () {
      await expectRevert(
        this.VotingInstance.addProposal(proposal1, {
          from: voter2,
        }),
        "You're not a voter"
      );
    });

    it("Empty proposal registration is forbidden", async function () {
      await expectRevert(
        this.VotingInstance.addProposal(emptyProposal, {
          from: voter1,
        }),
        "Vous ne pouvez pas ne rien proposer"
      );
    });

    /*it("Only Owner should add a new voter", async function () {
      await expectRevert(
        this.VotingInstance.addVoter(voter2, { from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("Voter can only be registered once", async function () {
      let result = await this.VotingInstance.addVoter(voter1, { from: owner });

      await expectEvent(result, "VoterRegistered", {
        voterAddress: voter1,
      });

      await expectRevert(
        this.VotingInstance.addVoter(voter1, { from: owner }),
        "Already registered"
      );
    });*/
  });
});
