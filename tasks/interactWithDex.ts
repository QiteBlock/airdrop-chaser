import {
  ActionType,
  HardhatRuntimeEnvironment,
  HttpNetworkConfig,
} from "hardhat/types";
import DexArgument from "../interface/dex.argument.interface";
import { networkConfigs } from "../utils/helper-config";

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
            if (taskArgs.initialCoin.toLocaleLowerCase() === "eth") {
              if (
                networkConfigs[network.chainId.toString()].dexContract &&
                networkConfigs[network.chainId.toString()].dexContract !== "" &&
                networkConfigs[network.chainId.toString()].functionInterface &&
                networkConfigs[network.chainId.toString()].functionInterface !==
                  ""
              ) {
                const ABI = [
                  networkConfigs[network.chainId.toString()].functionInterface,
                ];
                const smartContract = new hre.ethers.Contract(
                  networkConfigs[network.chainId.toString()].dexContract,
                  ABI,
                  provider
                );
                // to be continued
                smartContract[
                  networkConfigs[network.chainId.toString()].functionName
                ](
                  "0x0000000000000000000000000000000000000000",
                  "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
                  "420"
                );
              }
            }
            if (taskArgs.initialCoin.toLocaleLowerCase() === "usdc") {
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

function isHttpNetworkConfig(config: any): config is HttpNetworkConfig {
  return (
    config &&
    typeof config.url === "string" &&
    !config.url.includes("127.0.0.1") &&
    !config.url.includes("sepolia.infura.io")
  );
}

module.exports = { interactWithDex };
