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

## Test logic

Tests are executed in chronologic way following the workflow status

## Test result expected

Contract: Voting
INITIAL STATE
- Init phase is voter registration phase (25ms)
- No proposal registered (1017ms, 50196 gas)
WORKFLOW STATUS UPDATE
SUNNY CASE
- Init phase is voter registration phase (4ms)
- Should update workflow from voter registration to tally vote - 5/5 event emitted (257ms, 174188 gas)
  ERROR CASE - EXPECT REVERT
  ✓ Only owner can update the workflow (579ms, 174188 gas)
  ✓ Expect revert if phase is not following the workflow (762ms, 174188 gas)
  VOTER REGISTRATION
  VOTER REGISTRATION - WORKFLOW CHECK
  ✓ Worklow status should be : RegisteringVoters (5ms)
  ✓ Should revert if voter is added in phase different from : RegisteringVoters. 5/5 expectRevert (335ms, 174188 gas)
  VOTER REGISTRATION - OWNER ACTION CHECK
  ✓ Owner should add a new voter - event emitted (27ms, 50196 gas)
  ✓ Should revert when address different from owner tries to add a new voter (22ms)
  VOTER REGISTRATION - VOTER DATA CHECK
  ✓ Voter should be registered (24ms)
  ✓ Voter has no yet voted (104ms)
  ✓ Voter can only be registered once (72ms)
  PROPOSAL REGISTRATION
  PROPOSAL REGISTRATION - WORKFLOW CHECK
  ✓ Worklow status should be : ProposalsRegistrationStarted (63ms, 47653 gas)
  ✓ Should revert if proposal is added in phase different from : ProposalsRegistrationStarted. 4/4 expectRevert (109ms, 126535 gas)
  PROPOSAL REGISTRATION - VOTER ACTION CHECK
  ✓ Registered voter can add a new proposal - event emitted (23ms, 76632 gas)
  ✓ Should revert if non registered voter tries to add a new proposal (8ms)
  PROPOSAL REGISTRATION - PROPOSAL DATA CHECK
  ✓ Should proposal exist with (21ms)
  ✓ Should proposal exist with no vote count yet (6ms)
  ✓ Empty proposal registration is forbidden (12ms)
  VOTER REGISTRATION - OWNER ACTION CHECK
  ✓ Owner Should end proposal registration (22ms, 30575 gas)
  VOTE
  VOTE - WORKFLOW STATUS CHECK
  ✓ Worklow status should be : startVotingSession (28ms, 30530 gas)
  ✓ Should revert if a voter tries to vote in phase different from : startVotingSession. 2/2 expectRevert (56ms, 68334 gas)
  VOTE - VOTER ACTION CHECK
  ✓ Register new vote - event emitted (31ms, 58101 gas)
  ✓ Voter cannot vote twice (8ms)
  ✓ Should revert in case a non voter tries to vote (23ms)
  VOTE - VOTER DATA CHECK
  ✓ Should voter marked has voted (6ms)
  ✓ Should voter proposalId correctly registered (18ms)
  VOTE - PROPOSAL DATA CHECK
  ✓ Should vote count increased (20ms)
  ✓ Should revert in case proposal id doesn't exist (22ms)
  VOTE - OWNER ACTION CHECK
  ✓ Should end voting session (99ms, 30509 gas)
  GET WINNER
  GET WINNER - WORKFLOW STATUS CHECK
  ✓ No Winner when workflow is not last one - tally vote (4ms)
  ✓ Should move to tally vote phase (28ms, 60637 gas)
  GET WINNER - CHECK RESULT
  ✓ Winner should be proposal 2 (536ms)

·------------------------------------------|----------------------------|-------------|----------------------------·
| Solc version: 0.8.14+commit.80d49f37 · Optimizer enabled: false · Runs: 200 · Block limit: 6718946 gas │
···········································|····························|·············|·····························
| Methods │
·············|·····························|··············|·············|·············|··············|··············
| Contract · Method · Min · Max · Avg · # calls · eur (avg) │
·············|·····························|··············|·············|·············|··············|··············
| Voting · addProposal · - · - · 76632 · 10 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · addVoter · - · - · 50196 · 16 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · endProposalsRegistering · - · - · 30575 · 11 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · endVotingSession · - · - · 30509 · 9 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · setVote · - · - · 58101 · 12 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · startProposalsRegistering · - · - · 47653 · 11 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · startVotingSession · - · - · 30530 · 12 · - │
·············|·····························|··············|·············|·············|··············|··············
| Voting · tallyVotes · 34921 · 60637 · 40355 · 10 · - │
·············|·····························|··············|·············|·············|··············|··············
| Deployments · · % of limit · │
···········································|··············|·············|·············|··············|··············
| Voting · - · - · 2137238 · 31.8 % · - │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·
