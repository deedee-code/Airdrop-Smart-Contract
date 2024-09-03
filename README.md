# Merkle Airdrop

## Overview

This project implements a Merkle tree-based airdrop contract that allows whitelisted users to claim tokens. The Merkle tree ensures efficient verification of claims. It implement a smart contract for an ERC20 token airdrop using a Merkle tree for whitelisting addresses. The airdrop ensures that only eligible addresses can claim tokens by verifying their inclusion in the Merkle tree using Merkle proofs.

This project includes:

- Merkle Tree Generation: A Node.js script (merkle.js) that reads a CSV file of eligible addresses and their token amounts, hashes each entry, and generates a Merkle tree. The Merkle root is used in the smart contract to verify claims.

- Smart Contract: A Solidity smart contract (MerkleAirdrop.sol) that allows users to claim their airdropped tokens by providing a valid Merkle proof. The contract verifies the proof against the stored Merkle root, ensuring that only eligible addresses can claim tokens.

- Testing: A suite of tests written in Hardhat to ensure the contract functions as expected, including tests for valid and invalid claims, double claims, and more.

## Setup and Running

### Prerequisite

- Node.js
- npm
- Hardhat

### Steps

1. Clone this repository:

   ```bash
   git clone https://github.com/deedee-code/Airdrop-Smart-Contract
   cd Airdrop-Smart-Contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
