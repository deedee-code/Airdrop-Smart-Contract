const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleAirdrop", function () {
  let token, airdrop, owner, addr1, addr2, merkleTree, root;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("ERC20Token");
    token = await Token.deploy("Test Token", "TT", ethers.utils.parseUnits("1000", 18));
    await token.deployed();

    // Airdrop data
    const airdropData = [
      { address: addr1.address, amount: 100 },
      { address: addr2.address, amount: 200 },
    ];

    const leaves = airdropData.map((row) =>
      keccak256(ethers.utils.solidityPack(["address", "uint256"], [row.address, row.amount]))
    );
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    root = merkleTree.getHexRoot();

    const MerkleAirdrop = await ethers.getContractFactory("MerkleAirdrop");
    airdrop = await MerkleAirdrop.deploy(token.address, root);
    await airdrop.deployed();

    // Transfer tokens to the airdrop contract
    await token.transfer(airdrop.address, ethers.utils.parseUnits("300", 18));
  });

  it("Should allow valid claims", async function () {
    const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256"], [addr1.address, 100]));
    const proof = merkleTree.getHexProof(leaf);

    await expect(airdrop.connect(addr1).claim(100, proof))
      .to.emit(airdrop, "Claimed")
      .withArgs(addr1.address, 100);
  });

  it("Should reject double claims", async function () {
    const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256"], [addr1.address, 100]));
    const proof = merkleTree.getHexProof(leaf);

    await airdrop.connect(addr1).claim(100, proof);
    await expect(airdrop.connect(addr1).claim(100, proof)).to.be.revertedWith("Airdrop already claimed.");
  });

  it("Should reject invalid claims", async function () {
    const leaf = keccak256(ethers.utils.solidityPack(["address", "uint256"], [addr1.address, 100]));
    const invalidProof = [];

    await expect(airdrop.connect(addr1).claim(100, invalidProof)).to.be.revertedWith("Invalid proof.");
  });

  it("Should allow the owner to withdraw remaining tokens", async function () {
    await airdrop.withdrawRemainingTokens();
    const balance = await token.balanceOf(owner.address);
    expect(balance.toString()).to.equal(ethers.utils.parseUnits("300", 18).toString());
  });
});
