import { HardhatRuntimeEnvironment, HttpNetworkConfig } from "hardhat/types"
import DexArgument from "../interface/dex.argument.interface"
import { configs, PoolType, TokenConfig } from "../utils/helper-config"
import axios from "axios"
import { ethers } from "ethers"
import { SyncSwapRouterABI } from "../utils/sync-swap-abi"

export async function interactWithDex(taskArgs: DexArgument, hre: HardhatRuntimeEnvironment) {
    try {
        console.log(taskArgs)
        const networksList = Object.keys(hre.config.networks)
        console.log("List of networks:", networksList)
        // Verify we are connected to the network
        for (const networkName of networksList) {
            const networkConfig = hre.config.networks[networkName]
            // Skip networks without a URL (e.g., local development network)
            if (!isHttpNetworkConfig(networkConfig)) {
                console.log(`Skipping network ${networkName} (no URL specified)`)
                continue
            }

            const provider = new hre.ethers.JsonRpcProvider(networkConfig.url)

            try {
                // Get the network information
                const network = await provider.getNetwork()
                console.log(`Connected to network: ${network.name} (ID: ${network.chainId})`)
                const signers = await hre.ethers.getSigners()
                const accountAddresses = signers.map((signer) => signer.address)
                // Get balances
                for (let i = 0; i < accountAddresses.length; i++) {
                    const balance = await provider.getBalance(accountAddresses[i])
                    console.log(
                        `Balance of ${accountAddresses[i]} on ${network.name} ${
                            network.chainId
                        }: ${hre.ethers.formatEther(balance)} ETH`
                    )
                    if (balance > 0) {
                        if (taskArgs.dexName == "SyncSwap") {
                            if (
                                taskArgs.initialCoin.toLocaleLowerCase() === "eth" &&
                                (taskArgs.endCoin.toLocaleLowerCase() === "usdc" ||
                                    taskArgs.endCoin.toLocaleLowerCase() === "usdt")
                            ) {
                                await executeSwapEthToCoin(
                                    network,
                                    provider,
                                    accountAddresses[i],
                                    signers[i],
                                    taskArgs.endCoin.toUpperCase()
                                )
                            } else if (
                                taskArgs.endCoin.toLocaleLowerCase() === "eth" &&
                                (taskArgs.initialCoin.toLocaleLowerCase() === "usdc" ||
                                    taskArgs.initialCoin.toLocaleLowerCase() === "usdt")
                            ) {
                                await executeSwapCoinToEth(
                                    network,
                                    provider,
                                    accountAddresses[i],
                                    signers[i],
                                    taskArgs.initialCoin.toUpperCase()
                                )
                            } else {
                                console.log(
                                    "In SyncSwap we don't configure this keyPair " +
                                        taskArgs.initialCoin +
                                        "/" +
                                        taskArgs.endCoin
                                )
                            }
                        } else {
                            console.log("This dex is not supported under this network " + network.chainId.toString())
                        }
                    } else {
                        console.log("This account " + accountAddresses[i] + " don't have enough Eth balance!")
                    }
                }
            } catch (error) {
                console.error(`Error connecting to network ${networkName}:`)
                console.error(error)
            }
        }
    } catch (error) {
        console.error("Error connecting to the RPC server:", error)
    }
}

async function executeSwapCoinToEth(
    network: ethers.Network,
    provider: ethers.JsonRpcProvider,
    accountAddress: string,
    signer: ethers.Signer,
    coin: string
) {
    const swapParams = configs[network.chainId.toString()]!.SyncSwap["ETH"] as TokenConfig
    const swapParamsCoin = configs[network.chainId.toString()]!.SyncSwap[coin] as TokenConfig
    if (swapParams && swapParamsCoin) {
        // Get amount out value
        const amountIn = parseFloat(configs[network.chainId.toString()]!.SyncSwap["amount" + coin] as string)
        const amountOut = await getEthFromCoin(
            configs[network.chainId.toString()]!.SyncSwap!.networkName,
            configs[network.chainId.toString()]!.SyncSwap!.poolAddress,
            amountIn,
            swapParams.baseOrQuote
        )
        if (amountOut != "") {
            //Approve token
            const erc20Contract = new ethers.Contract(
                swapParamsCoin.address,
                [
                    "function approve(address, uint256) returns (bool)",
                    "function allowance(address, address) view returns (uint256)",
                ],
                provider
            )
            const allowance = await erc20Contract.allowance(
                accountAddress,
                configs[network.chainId.toString()]!.SyncSwap!.routerAddress
            )
            console.log(allowance)
            if (allowance < amountIn) {
                const approveTx = await erc20Contract
                    .connect(signer)
                    .approve(
                        configs[network.chainId.toString()]!.SyncSwap!.routerAddress,
                        (amountIn * Math.pow(10, 6)).toString()
                    )
                const approveTxReceipt = await approveTx.wait(2)
                if (approveTxReceipt.status == "1") {
                    console.log("Approve Transaction Executed successfully " + approveTxReceipt.hash)
                    // Swap
                    await swapCoinToEth(
                        network,
                        provider,
                        swapParams,
                        swapParamsCoin,
                        signer,
                        accountAddress,
                        amountIn,
                        amountOut
                    )
                } else {
                    console.log("Approve Transaction Failed " + approveTxReceipt.hash)
                }
            } else {
                // Swap
                await swapCoinToEth(
                    network,
                    provider,
                    swapParams,
                    swapParamsCoin,
                    signer,
                    accountAddress,
                    amountIn,
                    amountOut
                )
            }
        } else {
            console.log("The amount to swap is not correct!")
        }
    } else {
        console.log("This coin is not supported!")
    }
}

async function swapCoinToEth(
    network: ethers.Network,
    provider: ethers.JsonRpcApiProvider,
    swapParams: TokenConfig,
    swapParamsCoin: TokenConfig,
    signer: ethers.Signer,
    accountAddress: string,
    amountIn: number,
    amountOut: string
) {
    const routerContract = new ethers.Contract(
        configs[network.chainId.toString()]!.SyncSwap!.routerAddress,
        SyncSwapRouterABI,
        provider
    )
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const fiveMinutesLater = currentTimestamp + 5 * 60
    swapParams.paths[0].steps[0].data = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint8"],
        [swapParamsCoin.address, accountAddress, swapParams.withdrawIndex]
    )
    swapParams.paths[0].steps[0].pool = swapParamsCoin.paths[0].steps[0].pool
    swapParams.paths[0].tokenIn = swapParamsCoin.address
    swapParams.paths[0].amountIn = (amountIn * Math.pow(10, 6)).toString()
    const tx = await routerContract
        .connect(signer)
        .swap(swapParams.paths, ethers.toBigInt(amountOut), ethers.toBigInt(fiveMinutesLater))
    const txReceipt = await tx.wait()
    if (txReceipt.status == "1") {
        console.log("Transaction Executed successfully " + txReceipt.hash)
    } else {
        console.log("Transaction Failed " + txReceipt.hash)
    }
}

async function executeSwapEthToCoin(
    network: ethers.Network,
    provider: ethers.JsonRpcProvider,
    accountAddress: string,
    signer: ethers.Signer,
    coin: string
) {
    const swapParams = configs[network.chainId.toString()]!.SyncSwap[coin] as TokenConfig
    if (swapParams) {
        // Get amount out value
        const amountOut = await getCoinFromEth(
            configs[network.chainId.toString()]!.SyncSwap!.networkName,
            swapParams.paths[0].steps[0].pool,
            parseFloat(configs[network.chainId.toString()]!.SyncSwap!.amountIn),
            swapParams.baseOrQuote
        )
        if (amountOut != "") {
            const routerContract = new ethers.Contract(
                configs[network.chainId.toString()]!.SyncSwap!.routerAddress,
                SyncSwapRouterABI,
                provider
            )
            const currentTimestamp = Math.floor(Date.now() / 1000)
            const fiveMinutesLater = currentTimestamp + 5 * 60
            swapParams.paths[0].steps[0].data = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "address", "uint8"],
                [
                    configs[network.chainId.toString()]!.SyncSwap!.wethContractAddress,
                    accountAddress,
                    swapParams.withdrawIndex,
                ]
            )
            const tx = await routerContract
                .connect(signer)
                .swap(swapParams.paths, ethers.toBigInt(amountOut), ethers.toBigInt(fiveMinutesLater), {
                    value: swapParams.paths[0].amountIn,
                })
            const txReceipt = await tx.wait()
            if (txReceipt.status == "1") {
                console.log("Transaction Executed successfully " + txReceipt.hash)
            } else {
                console.log("Transaction Failed " + txReceipt.hash)
            }
        } else {
            console.log("The amount to swap is not correct!")
        }
    } else {
        console.log("This coin is not supported!")
    }
}

async function getEthFromCoin(networkName: string, pollAddress: string, amountIn: number, baseOrQuote: string) {
    try {
        const apiUrl = "https://api.geckoterminal.com/api/v2/networks/" + networkName + "/pools/" + pollAddress

        const response = await axios.get(apiUrl)
        let responseData: PoolType = response.data.data
        // USDC price in USD and its decimal scale (6 decimals)
        const usdcPriceUSD = parseFloat(responseData.attributes.base_token_price_usd)
        // Calculate the equivalent amount in USD for the given amount of USDT
        const amountUSD = amountIn * usdcPriceUSD
        // ETH price in USD and its decimal scale (18 decimals)
        const ethPriceUSD = parseFloat(responseData.attributes[baseOrQuote])
        // Calculate the equivalent amount in ETH for the given amount of USD
        const amountETH = (amountUSD / ethPriceUSD) * Math.pow(10, 18) * (1 - 0.05)
        return Math.round(amountETH).toString()
    } catch (error) {
        // Handle errors
        console.error("Error fetching data:", error)
    }
    return ""
}

async function getCoinFromEth(networkName: string, pollAddress: string, amountIn: number, baseOrQuote: string) {
    try {
        const apiUrl = "https://api.geckoterminal.com/api/v2/networks/" + networkName + "/pools/" + pollAddress

        const response = await axios.get(apiUrl)
        let responseData: PoolType = response.data.data
        const baseTokenPriceUSD = parseFloat(responseData.attributes[baseOrQuote])
        // Convert ETH amount to the same decimal scale as USDC (6 decimals)
        const amountETHScaled = amountIn * Math.pow(10, 18 - 6)
        let amountMin = amountETHScaled * (1 - 0.05) * baseTokenPriceUSD
        amountMin = amountMin / Math.pow(10, 6)
        return Math.round(amountMin).toString()
    } catch (error) {
        // Handle errors
        console.error("Error fetching data:", error)
    }
    return ""
}

function isHttpNetworkConfig(config: any): config is HttpNetworkConfig {
    return (
        config &&
        typeof config.url === "string" &&
        !config.url.includes("127.0.0.1") &&
        !config.url.includes("sepolia.infura.io")
    )
}

module.exports = { interactWithDex }
