const fs = require('fs');
const csv = require('csv-parser');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Load CSV file
async function loadCSV(filename) {
    const data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', reject);
    });
}

// Generate Merkle Tree
async function generateMerkleRoot(filename) {
    const addresses = await loadCSV(filename);

    const leaves = addresses.map((row) => {
        const leaf = `${row.address}${row.amount}`;
        return keccak256(leaf);
    });

    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = merkleTree.getRoot().toString('hex');
    console.log(`Merkle Root: 0x${root}`);

    return { merkleTree, root };
}

generateMerkleRoot('airdrop.csv').then(({ merkleTree, root }) => {
    fs.writeFileSync('merkleRoot.txt', `0x${root}`);
    console.log('Merkle root saved to merkleRoot.txt');
});
