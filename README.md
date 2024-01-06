# airdrop-chaser

This project main role is to be able to let airdrop chaser configure automatic interaction with blockchain project in order to get the airdrop at the end.

# DEX Interaction

This project provides a template for interacting with multiple blockchain decentralized exchange (DEX) projects (Or other type of smart contract) using Hardhat and Ethers.js.

## Prerequisites

Make sure you have the following installed on your machine:

-   Node.js
-   npm (Node Package Manager)

## Getting Started

1. **Clone this repository:**

```bash
  git clone https://github.com/QiteBlock/airdrop-chaser.git
```

2. **Navigate to the project directory:**

```bash
cd dex-interaction-project
```

3. **Install dependencies:**

```bash
npm install
```

4. **Update the hardhat.config.js file:**

Specify the networks you want to interact with.

```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-ethers")

module.exports = {
    networks: {
        hardhat: {},
        sepolia: {
            url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
            accounts: [privateKey1, privateKey2],
        },
        // Add more networks as needed
    },
    solidity: "0.8.19",
}
```

5. **Running the Script:**

To interact with DEX contracts on multiple networks, run the following command:

If you want to swap from USDC to ETH with SyncSwap

```bash
npx hardhat interact-with-dex SyncSwap USDC ETH --network scroll
```

If you want to swap from ETH to USDC with SyncSwap

```bash
npx hardhat interact-with-dex SyncSwap ETH USDC --network scroll
```

This command will execute the script for each network specified in the networks array.

## License

This project is licensed under the GNU General Public License v3.0 License - see the LICENSE file for details.
