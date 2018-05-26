# Blockhead
##### A simple implementation of a blockchain ledger using Node-JS

This project implements a blockchain ledger a-la Bitcoin in Node-JS. The application receives properly formatted and signed transactions which are kept in a transaction pool. The main application then selects a fixed amount of transactions from the pool, validates each one (checks if the RSA signature is valid and if the associated public key has enough unspent inputs), and then adds the mining reward transaction as well as a transaction with the summed fees of all the transactions (should there be any fees). The resulting data is then formatted and mined based on a pre-specified difficulty using SHA-256, and added to the chain.

At the moment, the project is set up so that upon start, the genesis block allocates a large amount of money to a "master wallet". Then a simulator creates fake users and the master wallet sends them a large starting amount. Finally, the simulator generates a preset amount of transactions between pairs of the users, which are then submitted to the transactions pool to be processed by the blockchain.

### Issues

- Currently, there is no consensus protocol, so the blockchain operates on it's own.
- The blockchain doesn't have storage implemented, meaning it is deleted once the application is closed.
- Variables such as transactions per block or difficulty have to be specified on start, unlike in Bitcoin where they change depending on activity.
- Transactions pool passes along transactions on a first-come, first-served basis. No prioritization based on fees.


### To-Do

- [ ] Add the gossip protocol.
- [ ] Add a client version, so that transactions can be properly formatted through the browser and then submitted. (Could add the option of mining using the browser, where the client downloads the blockchain and participates in consensus)
- [ ] Add prioritization of transactions in the transactions pool. Currently, transactions are passed to the blockchain on a first-come, first-served basis, but they should be prioritized based on the fee they offer.
- [ ] Also add the ability to track pending spent outputs. This is for the case where someone would want to submit a second transaction before the first is completed, so that one user could have multiple transactions in the same block.
