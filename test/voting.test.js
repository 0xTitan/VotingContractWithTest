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
    before(async () => {
      this.VotingInstance = await Voting.new();
    });

    it("Init phase is voter registration phase", async () => {
      expect(await this.VotingInstance.workflowStatus()).to.be.bignumber.equal(
        new BN(0)
      );
    });
    it("No proposal registered", async () => {
      let result = await this.VotingInstance.addVoter(voter1, { from: owner });
      await expectRevert.unspecified(this.VotingInstance.getOneProposal(0), {
        from: voter1,
      });
    });
  });

  describe("WORKFLOW STATUS UPDATE", () => {
    beforeEach(async () => {
      this.VotingInstance = await Voting.new();
    });
    describe("SUNNY CASE", () => {
      it("Init phase is voter registration phase", async () => {
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(0));
      });

      it("Should update workflow from voter registration to tally vote - 5/5 event emitted", async () => {
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
    });

    describe("ERROR CASE - EXPECT REVERT", async () => {
      //test each possiblity for a non owner to change the workflow status
      it("Only owner can update the workflow", async () => {
        let result;
        for (var i = 1; i < 6; i++) {
          switch (true) {
            case i == 1:
              await expectRevert(
                this.VotingInstance.startProposalsRegistering({ from: voter1 }),
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
      it("Expect revert if phase is not following the workflow", async () => {
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
  });

  /************************VOTER REGISTRATION TEST*************/
  describe("VOTER REGISTRATION", () => {
    describe("VOTER REGISTRATION - WORKFLOW CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
      });

      it("Worklow status should be : RegisteringVoters", async () => {
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(0));
      });

      it("Should revert if voter is added in phase different from : RegisteringVoters. 5/5 expectRevert", async () => {
        for (var n = 1; n < 6; n++) {
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
          await expectRevert(
            this.VotingInstance.addVoter(voter1, { from: owner }),
            "Voters registration is not open yet"
          );
        }
      });
    });

    describe("VOTER REGISTRATION - OWNER ACTION CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
      });

      it("Owner should add a new voter - event emitted", async () => {
        let result = await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });

        expectEvent(result, "VoterRegistered", {
          voterAddress: voter1,
        });
      });

      it("Should revert when address different from owner tries to add a new voter", async () => {
        await expectRevert(
          this.VotingInstance.addVoter(voter2, { from: voter1 }),
          "Ownable: caller is not the owner"
        );
      });
    });

    describe("VOTER REGISTRATION - VOTER DATA CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voter
        await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });
      });

      it("Voter should be registered", async () => {
        //test voter exist and registered
        let voter = await this.VotingInstance.getVoter(voter1, {
          from: voter1,
        });
        expect(voter.isRegistered).to.equal(true);
      });

      //test voter has not voted
      it("Voter has no yet voted", async () => {
        //test voter exist and registered
        let voter = await this.VotingInstance.getVoter(voter1, {
          from: voter1,
        });
        expect(voter.hasVoted).to.equal(false);
      });

      it("Voter can only be registered once", async () => {
        await expectRevert(
          this.VotingInstance.addVoter(voter1, { from: owner }),
          "Already registered"
        );
      });
    });
  });

  /************************PROPOSAL REGISTRATION TEST*************/
  describe("PROPOSAL REGISTRATION", () => {
    describe("PROPOSAL REGISTRATION - WORKFLOW CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voter
        await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });
      });

      it("Worklow status should be : ProposalsRegistrationStarted", async () => {
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(1));
      });

      it("Should revert if proposal is added in phase different from : ProposalsRegistrationStarted. 4/4 expectRevert", async () => {
        for (var n = 1; n < 5; n++) {
          switch (true) {
            case n == 1:
              result = await this.VotingInstance.endProposalsRegistering({
                from: owner,
              });
              break;
            case n == 2:
              result = await this.VotingInstance.startVotingSession({
                from: owner,
              });
              break;
            case n == 3:
              result = await this.VotingInstance.endVotingSession({
                from: owner,
              });
              break;
            case n == 4:
              result = await this.VotingInstance.tallyVotes({
                from: owner,
              });
              break;
          }
          await expectRevert(
            this.VotingInstance.addProposal(proposal1, { from: voter1 }),
            "Proposals are not allowed yet"
          );
        }
      });
    });

    describe("PROPOSAL REGISTRATION - VOTER ACTION CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voter
        await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });
        //status startProposalsRegistering
        await this.VotingInstance.startProposalsRegistering({ from: owner });
      });

      it("Registered voter can add a new proposal - event emitted", async () => {
        let result = await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
        //test event emitted
        expectEvent(result, "ProposalRegistered", {
          proposalId: new BN(0),
        });
      });

      it("Should revert if non registered voter tries to add a new proposal", async () => {
        await expectRevert(
          this.VotingInstance.addProposal(proposal1, {
            from: voter2,
          }),
          "You're not a voter"
        );
      });
    });

    describe("PROPOSAL REGISTRATION - PROPOSAL DATA CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voter
        await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });
        //status startProposalsRegistering
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
      });

      it("Should proposal exist with ", async () => {
        //test proposal exist
        let proposal = await this.VotingInstance.getOneProposal(new BN(0), {
          from: voter1,
        });
        expect(proposal.description).to.equal(proposal1);
      });

      it("Should proposal exist with no vote count yet", async () => {
        //test proposal exist with no vote count
        let proposal = await this.VotingInstance.getOneProposal(new BN(0), {
          from: voter1,
        });
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(0));
      });

      it("Empty proposal registration is forbidden", async () => {
        await expectRevert(
          this.VotingInstance.addProposal(emptyProposal, {
            from: voter1,
          }),
          "Vous ne pouvez pas ne rien proposer"
        );
      });
    });

    describe("PROPOSAL REGISTRATION - OWNER ACTION CHECK", () => {
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voter
        await this.VotingInstance.addVoter(voter1, {
          from: owner,
        });
        //status startProposalsRegistering
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
      });

      it("Owner Should end proposal registration", async () => {
        await this.VotingInstance.endProposalsRegistering({ from: owner });
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(2));
      });
    });
  });

  /************************VOTE TEST*************/
  describe("VOTE", () => {
    //use before to keep state
    before(async () => {
      this.VotingInstance = await Voting.new();
      //add voters
      await this.VotingInstance.addVoter(voter1, { from: owner });
      await this.VotingInstance.addVoter(voter2, { from: owner });
      //move to proposal registration
      await this.VotingInstance.startProposalsRegistering({ from: owner });
      //add proposal
      await this.VotingInstance.addProposal(proposal1, {
        from: voter1,
      });
      //end registration phase
      await this.VotingInstance.endProposalsRegistering({ from: owner });
    });

    describe("VOTE - WORKFLOW STATUS CHECK", () => {
      it("Worklow status should be : startVotingSession", async () => {
        await this.VotingInstance.startVotingSession({ from: owner });
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(3));
      });

      it("Should revert if a voter tries to vote in phase different from : startVotingSession. 2/2 expectRevert", async () => {
        for (var n = 1; n < 3; n++) {
          switch (true) {
            case n == 1:
              result = await this.VotingInstance.endVotingSession({
                from: owner,
              });
              break;
            case n == 2:
              result = await this.VotingInstance.tallyVotes({
                from: owner,
              });
              break;
          }
          await expectRevert(
            this.VotingInstance.setVote(new BN(0), { from: voter1 }),
            "Voting session havent started yet"
          );
        }
      });
    });

    describe("VOTE - VOTER ACTION CHECK", () => {
      //use before to keep state
      before(async () => {
        this.VotingInstance = await Voting.new();
        //add voters
        await this.VotingInstance.addVoter(voter1, { from: owner });
        await this.VotingInstance.addVoter(voter2, { from: owner });
        //move to proposal registration
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        //add proposal
        await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
        //end registration phase
        await this.VotingInstance.endProposalsRegistering({ from: owner });
        //start voting session
        await this.VotingInstance.startVotingSession({ from: owner });
      });

      it("Register new vote - event emitted", async () => {
        let result = await this.VotingInstance.setVote(new BN(0), {
          from: voter1,
        });
        //test event emiited
        expectEvent(result, "Voted", {
          voter: voter1,
          proposalId: new BN(0),
        });
      });

      //user cannot vote twice
      it("Voter cannot vote twice", async () => {
        await expectRevert(
          this.VotingInstance.setVote(new BN(0), {
            from: voter1,
          }),
          "You have already voted"
        );
      });

      it("Should revert in case a non voter tries to vote", async () => {
        await expectRevert(
          this.VotingInstance.setVote(new BN(0), { from: voter3 }),
          "You're not a voter"
        );
      });
    });

    describe("VOTE - VOTER DATA CHECK", () => {
      beforeEach(async () => {
        this.VotingInstance = await Voting.new();
        //add voters
        await this.VotingInstance.addVoter(voter1, { from: owner });
        await this.VotingInstance.addVoter(voter2, { from: owner });
        //move to proposal registration
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        //add proposal
        await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
        //end registration phase
        await this.VotingInstance.endProposalsRegistering({ from: owner });
        //start voting session
        await this.VotingInstance.startVotingSession({ from: owner });
        //register vote
        await this.VotingInstance.setVote(new BN(0), { from: voter1 });
      });

      //user has voted
      it("Should voter marked has voted", async () => {
        //test voter exist and registered
        let voter = await this.VotingInstance.getVoter(voter1, {
          from: voter1,
        });
        expect(voter.hasVoted).to.equal(true);
      });

      //user proposalId is registered
      it("Should voter proposalId correctly registered", async () => {
        let voter = await this.VotingInstance.getVoter(voter1, {
          from: voter1,
        });
        expect(voter.votedProposalId).to.be.bignumber.equal(new BN(0));
      });
    });

    describe("VOTE - PROPOSAL DATA CHECK", () => {
      beforeEach(async () => {
        this.VotingInstance = await Voting.new();
        //add voters
        await this.VotingInstance.addVoter(voter1, { from: owner });
        await this.VotingInstance.addVoter(voter2, { from: owner });
        //move to proposal registration
        await this.VotingInstance.startProposalsRegistering({ from: owner });
        //add proposal
        await this.VotingInstance.addProposal(proposal1, {
          from: voter1,
        });
        //end registration phase
        await this.VotingInstance.endProposalsRegistering({ from: owner });
        //start voting session
        await this.VotingInstance.startVotingSession({ from: owner });
        //register vote
        await this.VotingInstance.setVote(new BN(0), { from: voter1 });
      });

      it("Should vote count increased", async () => {
        let proposal = await this.VotingInstance.getOneProposal(new BN(0), {
          from: voter1,
        });
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(1));
      });

      //should revert in case proposal id is out of range
      it("Should revert in case proposal id doesn't exist", async () => {
        await expectRevert(
          this.VotingInstance.setVote(new BN(1), {
            from: voter2,
          }),
          "Proposal not found"
        );
      });
    });

    describe("VOTE - OWNER ACTION CHECK", () => {
      it("Should end voting session", async () => {
        await this.VotingInstance.endVotingSession({ from: owner });
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(4));
      });
    });
  });

  /************************VOTE TEST*************/
  describe("GET WINNER", () => {
    //use before to keep state
    before(async () => {
      this.VotingInstance = await Voting.new();
      //add voters
      await this.VotingInstance.addVoter(voter1, { from: owner });
      await this.VotingInstance.addVoter(voter2, { from: owner });
      //move to proposal registration
      await this.VotingInstance.startProposalsRegistering({ from: owner });
      //add proposals
      await this.VotingInstance.addProposal(proposal1, {
        from: voter1,
      });
      await this.VotingInstance.addProposal(proposal2, {
        from: voter2,
      });
      //end registration phase
      await this.VotingInstance.endProposalsRegistering({ from: owner });
      //start voting
      await this.VotingInstance.startVotingSession({ from: owner });
      //vote
      let result = await this.VotingInstance.setVote(new BN(1), {
        from: voter1,
      });
      //end voting session
      await this.VotingInstance.endVotingSession({ from: owner });
    });

    describe("GET WINNER - WORKFLOW STATUS CHECK", () => {
      it("No Winner when workflow is not last one - tally vote", async () => {
        expect(
          await this.VotingInstance.winningProposalID()
        ).to.be.bignumber.equal(new BN(0));
      });

      it("Should move to tally vote phase", async () => {
        await this.VotingInstance.tallyVotes({ from: owner });
        expect(
          await this.VotingInstance.workflowStatus()
        ).to.be.bignumber.equal(new BN(5));
      });
    });

    describe("GET WINNER - CHECK RESULT", () => {
      it("Winner should be proposal 2", async () => {
        expect(
          await this.VotingInstance.winningProposalID()
        ).to.be.bignumber.equal(new BN(1));
      });
    });

    //test modifier
  });
});
