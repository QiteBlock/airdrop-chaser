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
    baseOrQuote: string
    address: string
    paths: Path[]
}

type SyncSwapConfig = {
    networkName: string
    routerAddress: string
    poolAddress: string
    amountIn: string
    wethContractAddress: string
    [key: string]: TokenConfig | string
}

type Configs = {
    [networkId: string]: {
        SyncSwap: SyncSwapConfig
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
}

export const configs: Configs = {
    "534352": {
        SyncSwap: {
            networkName: "scroll",
            routerAddress: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
            poolAddress: "0x814A23B053FD0f102AEEda0459215C2444799C70",
            amountIn: "0.001",
            amountUSDT: "2",
            amountUSDC: "2",
            wethContractAddress: "0x5300000000000000000000000000000000000004",
            USDC: {
                address: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
                withdrawIndex: "2",
                baseOrQuote: "base_token_price_usd",
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
                baseOrQuote: "quote_token_price_usd",
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
                address: "",
                baseOrQuote: "quote_token_price_usd",
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
