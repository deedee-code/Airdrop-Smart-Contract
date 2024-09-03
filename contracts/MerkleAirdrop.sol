// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop is Ownable {
    bytes32 public merkleRoot;
    IERC20 public token;
    mapping(address => bool) public claimed;

    event Claimed(address indexed claimant, uint256 amount);
    event MerkleRootUpdated(bytes32 merkleRoot);

    constructor(address tokenAddress, bytes32 root) Ownable (msg.sender) {
        token = IERC20(tokenAddress);
        merkleRoot = root;
    }

    function updateMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!claimed[msg.sender], "Airdrop already claimed.");
        
        // Create the leaf node
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        
        // Verify the provided proof
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof.");

        claimed[msg.sender] = true;
        require(token.transfer(msg.sender, amount), "Transfer failed.");

        emit Claimed(msg.sender, amount);
    }

    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens left to withdraw.");
        require(token.transfer(owner(), balance), "Withdrawal failed.");
    }
}
