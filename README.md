# VotingContractWithTest

## Installation

1- This is a truffle project, make sure to have truffle by using command :

```sh
npm install -g truffle
```

2- Make sure to have at ganache install :

```sh
npm install -g ganache-cli
```

3- Make sure to have openZeppelin contracts :

```sh
npm install @openzeppelin/contracts
```

4- Make sure to have at openZeppelin test-helpers :

```sh
npm install @openzeppelin/test-helpers
```

5- Start ganache using the command :

```sh
ganache
```

6- To Compile the project, use command :

```sh
truffle compile
```

7- To deploy the voting contract, use command :

```sh
truffle deploy --reset --migrate-all --network develop
```

NB : truffle-config.js already contains a network config with name develop setup to connect to ganache default config (ip: 127.0.0.1, port 8545)

8- Test voting contract

```sh
truffle test test/voting.test.js --network develop
```

9 - Optional eth gas reporter installation :

```sh
npm install eth-gas-reporter
```

## Test logic - total test number : 34

Tests are executed in two ways.
The first two tests are used to validate contract deployment and worflow process update.

- INITIAL STATE
- WORKFLOW STATUS UPDATE

Once validated tests are executed following workflow :

- VOTER REGISTRATION
- PROPOSAL REGISTRATION
- VOTE
- GET WINNER

For each test category, they are subdivision to test :

- actual workflow status
- user action (owner, voter)
- data check (voter, proposal, vote)
- next workflow status

So tests are all organised in the same way.

# Test result expected

# Contract: Voting

# INITIAL STATE

- Init phase is voter registration phase
- No proposal registered

# WORKFLOW STATUS UPDATE

> SUNNY CASE

- Init phase is voter registration phase
- Should update workflow from voter registration to tally vote - 5/5 event emitted
  > ERROR CASE - EXPECT REVERT
- Only owner can update the workflow
- Expect revert if phase is not following the workflow

# VOTER REGISTRATION

> VOTER REGISTRATION - WORKFLOW CHECK

- Worklow status should be : RegisteringVoters
- Should revert if voter is added in phase different from : RegisteringVoters. 5/5 expectRevert
  > VOTER REGISTRATION - OWNER ACTION CHECK
- Owner should add a new voter - event emitted
- Should revert when address different from owner tries to add a new voter
  > VOTER REGISTRATION - VOTER DATA CHECK
- Voter should be registered
- Voter has no yet voted
- Voter can only be registered once

# PROPOSAL REGISTRATION

> PROPOSAL REGISTRATION - WORKFLOW CHECK

- Worklow status should be : ProposalsRegistrationStarted
- Should revert if proposal is added in phase different from : ProposalsRegistrationStarted. 4/4 expectRevert
  > PROPOSAL REGISTRATION - VOTER ACTION CHECK
- Registered voter can add a new proposal - event emitted
- Should revert if non registered voter tries to add a new proposal
  > PROPOSAL REGISTRATION - PROPOSAL DATA CHECK
- Should proposal exist with (21ms)
- Should proposal exist with no vote count yet
- Empty proposal registration is forbidden
  > PROPOSAL REGISTRATION - OWNER ACTION CHECK
- Owner Should end proposal registration

# VOTE

> VOTE - WORKFLOW STATUS CHECK

- Worklow status should be : startVotingSession
- Should revert if a voter tries to vote in phase different from : startVotingSession. 2/2 expectRevert
  > VOTE - VOTER ACTION CHECK
- Register new vote - event emitted
- Voter cannot vote twice
- Should revert in case a non voter tries to vote
  > VOTE - VOTER DATA CHECK
- Should voter marked has voted
- Should voter proposalId correctly registered
  > VOTE - PROPOSAL DATA CHECK
- Should vote count increased
- Should revert in case proposal id doesn't exist
  > VOTE - OWNER ACTION CHECK
- Should end voting session

# GET WINNER

> GET WINNER - WORKFLOW STATUS CHECK

- No Winner when workflow is not last one - tally vote
- Should move to tally vote phase
  > GET WINNER - CHECK RESULT
- Winner should be proposal 2

# Gas ether report

| Solc version: 0.8.14+commit.80d49f3 | Optimizer enabled: false | Optimizer enabled: false | Optimizer enabled: false |
| ----------------------------------- | ------------------------ | ------------------------ | ------------------------ |

| Methods                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------|

| Contract    | Method                    | Min   | Max   | Avg     | # calls    | eur (avg) |
| ----------- | ------------------------- | ----- | ----- | ------- | ---------- | --------- |
| Voting      | addProposal               |       |       | 76632   | 10         |
| Voting      | addVoter                  | -     | -     | 50196   | 16         |           |
| Voting      | endProposalsRegistering   | -     | -     | 30575   | 11         |           |
| Voting      | endVotingSession          | -     | -     | 30509   | 9          |           |
| Voting      | setVote                   | -     | -     | 58101   | 12         |           |
| Voting      | startProposalsRegistering | -     | -     | 47653   | 11         |           |
| Voting      | startVotingSession        | -     | -     | 30530   | 12         |           |
| Voting      | tallyVotes                | 34921 | 60637 | 40355   | 10         |           |
| Deployments |                           |       |       |         | % of limit |
| Voting      |                           |       |       | 2137238 | 31.8 %     |
