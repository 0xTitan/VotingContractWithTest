# VotingContractWithTest

1- This is a truffle project, make sure to have truffle by using command :
npm install -g truffle

2- Make sure to have at ganache install :
npm install -g ganache-cli

3- Start ganache using the command :
ganache

4- To Compile the project, use command :
truffle compile

5- To deploy the voting contract, use command :
truffle deploy --reset --migrate-all --network develop

NB : truffle-config.js already contains a network config with name develop setup to connect to ganache default config (ip: 127.0.0.1, port 8545)

6- Test voting contract
truffle test test/voting.test.js --network develop
