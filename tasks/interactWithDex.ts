import { HardhatRuntimeEnvironment, HttpNetworkConfig } from "hardhat/types";
import DexArgument from "../interface/dex.argument.interface";
import { configs, PoolType } from "../utils/helper-config";
import axios from "axios";
import { ethers } from "ethers";

export async function interactWithDex(
  taskArgs: DexArgument,
  hre: HardhatRuntimeEnvironment
) {
  try {
    console.log(taskArgs);
    const networksList = Object.keys(hre.config.networks);
    console.log("List of networks:", networksList);
    // Verify we are connected to the network
    for (const networkName of networksList) {
      const networkConfig = hre.config.networks[networkName];
      // Skip networks without a URL (e.g., local development network)
      if (!isHttpNetworkConfig(networkConfig)) {
        console.log(`Skipping network ${networkName} (no URL specified)`);
        continue;
      }

      const provider = new hre.ethers.JsonRpcProvider(networkConfig.url);

      try {
        // Get the network information
        const network = await provider.getNetwork();
        console.log(
          `Connected to network: ${network.name} (ID: ${network.chainId})`
        );
        const signers = await hre.ethers.getSigners();
        const accountAddresses = signers.map((signer) => signer.address);
        console.log(accountAddresses);
        // Get balances
        for (let i = 0; i < accountAddresses.length; i++) {
          const balance = await provider.getBalance(accountAddresses[i]);
          console.log(
            `Balance of ${accountAddresses[i]} on ${network.name} ${
              network.chainId
            }: ${hre.ethers.formatEther(balance)} ETH`
          );
          if (balance > 0) {
            if (
              taskArgs.initialCoin.toLocaleLowerCase() === "eth" &&
              taskArgs.endCoin.toLocaleLowerCase() === "usdc"
            ) {
              if (configs[network.chainId.toString()]?.SyncSwap) {
                // Get amount out value
                const amountOut = await getUsdcFromEth(
                  configs[network.chainId.toString()]!.SyncSwap!.networkName,
                  configs[network.chainId.toString()]!.SyncSwap!.poolAddress,
                  parseFloat(
                    configs[network.chainId.toString()]!.SyncSwap!.amountIn
                  )
                );
                const routerContract = new ethers.Contract(
                  configs[network.chainId.toString()]!.SyncSwap!.routerAddress,
                  configs[
                    network.chainId.toString()
                  ]!.SyncSwap!.routerFunctionInterface,
                  provider
                );
                const swapParams =
                  configs[network.chainId.toString()]!.SyncSwap!.USDC;
                const currentTimestamp = Math.floor(Date.now() / 1000);
                const fiveMinutesLater = currentTimestamp + 5 * 60;
                swapParams.paths[0].steps[0].data =
                  ethers.AbiCoder.defaultAbiCoder().encode(
                    ["address", "address", "uint8"],
                    [
                      configs[network.chainId.toString()]!.SyncSwap!
                        .wethContractAddress,
                      accountAddresses[0],
                      configs[network.chainId.toString()]!.SyncSwap!
                        .withdrawIndex,
                    ]
                  );
                swapParams.paths[0].amountIn = ethers.parseEther(
                  configs[network.chainId.toString()]!.SyncSwap!.amountIn
                );
                const tx = await routerContract.connect(signers[i]).swap(
                  swapParams.paths,
                  ethers.toBigInt(amountOut),
                  ethers.toBigInt(fiveMinutesLater)
                );
                const txReceipt = await tx.wait();
                console.log(txReceipt);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error connecting to network ${networkName}:`);
        console.error(error);
      }
    }
  } catch (error) {
    console.error("Error connecting to the RPC server:", error);
  }
}

async function getUsdcFromEth(
  networkName: string,
  pollAddress: string,
  amountIn: number
) {
  try {
    const apiUrl =
      "https://api.geckoterminal.com/api/v2/networks/" +
      networkName +
      "/pools/" +
      pollAddress;

    const response = await axios.get(apiUrl);
    let responseData: PoolType = response.data.data;
    const baseTokenPriceUSD = parseFloat(
      responseData.attributes.base_token_price_usd
    );
    // Convert ETH amount to the same decimal scale as USDC (6 decimals)
    const amountETHScaled = amountIn * Math.pow(10, 18 - 6);
    let amountMin = amountETHScaled * (1 - 0.05) * baseTokenPriceUSD;
    amountMin = amountMin / Math.pow(10, 6);
    return Math.round(amountMin).toString();
  } catch (error) {
    // Handle errors
    console.error("Error fetching data:", error);
  }
  return "";
}

function isHttpNetworkConfig(config: any): config is HttpNetworkConfig {
  return (
    config &&
    typeof config.url === "string" &&
    !config.url.includes("127.0.0.1") &&
    !config.url.includes("sepolia.infura.io")
  );
}

module.exports = { interactWithDex };
