export enum Token {
    ETH = "ETH",
    USDC = "USDC",
    USDT = "USDT",
}

type PoolStep = {
    pool: string
    data: string
    callback: string
    callbackData: string
}

type Path = {
    steps: PoolStep[]
    tokenIn: string
    amountIn: string
}

export type TokenConfig = {
    withdrawIndex: string
    decimals: number
    address: string
    amount: string
    paths: Path[]
}

type SyncSwapConfig = {
    networkName: string
    routerAddress: string
    poolAddress: string
    wethContractAddress: string
    [key: string]: TokenConfig | string
}

type Configs = {
    [networkId: string]: {
        SyncSwap: SyncSwapConfig
    }
}

type TokenData = {
    id: string
    type: string
}

type Relationships = {
    base_token: {
        data: TokenData
    }
    quote_token: {
        data: TokenData
    }
    dex: {
        data: {
            id: string
            type: string
        }
    }
}

export type PoolType = {
    id: string
    type: string
    attributes: {
        quote_token_price_usd: string
        base_token_price_usd: string
        reserve_in_usd: string
        [key: string]: string
    }
    relationships: Relationships
}

export const configs: Configs = {
    "324": {
        SyncSwap: {
            networkName: "zksync",
            routerAddress: "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295",
            poolAddress: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
            wethContractAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
            USDC: {
                address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
                withdrawIndex: "2",
                decimals: 6,
                amount: "2",
                paths: [
                    {
                        steps: [
                            {
                                pool: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "0x0000000000000000000000000000000000000000",
                        amountIn: "1000000000000000",
                    },
                ],
            },
            USDT: {
                address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
                withdrawIndex: "2",
                decimals: 6,
                amount: "2",
                paths: [
                    {
                        steps: [
                            {
                                pool: "0xd3D91634Cf4C04aD1B76cE2c06F7385A897F54D3",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "0x0000000000000000000000000000000000000000",
                        amountIn: "1000000000000000",
                    },
                ],
            },
            ETH: {
                address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
                decimals: 18,
                withdrawIndex: "1",
                amount: "0.001",
                paths: [
                    {
                        steps: [
                            {
                                pool: "",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "",
                        amountIn: "0",
                    },
                ],
            },
        },
    },
    "534352": {
        SyncSwap: {
            networkName: "scroll",
            routerAddress: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
            poolAddress: "0x814A23B053FD0f102AEEda0459215C2444799C70",
            wethContractAddress: "0x5300000000000000000000000000000000000004",
            USDC: {
                address: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
                withdrawIndex: "2",
                amount: "2",
                decimals: 6,
                paths: [
                    {
                        steps: [
                            {
                                pool: "0x814A23B053FD0f102AEEda0459215C2444799C70",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "0x0000000000000000000000000000000000000000",
                        amountIn: "1000000000000000",
                    },
                ],
            },
            USDT: {
                address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
                decimals: 6,
                amount: "2",
                withdrawIndex: "2",
                paths: [
                    {
                        steps: [
                            {
                                pool: "0x78ea8E533c834049dE625e05F0B4DeFfe9DB5f6e",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "0x0000000000000000000000000000000000000000",
                        amountIn: "1000000000000000",
                    },
                ],
            },
            ETH: {
                address: "0x5300000000000000000000000000000000000004",
                decimals: 18,
                amount: "0.001",
                withdrawIndex: "1",
                paths: [
                    {
                        steps: [
                            {
                                pool: "",
                                data: "0x",
                                callback: "0x0000000000000000000000000000000000000000",
                                callbackData: "0x",
                            },
                        ],
                        tokenIn: "",
                        amountIn: "0",
                    },
                ],
            },
        },
    },
}
