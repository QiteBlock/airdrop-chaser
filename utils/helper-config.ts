import { ethers } from "ethers";

type PoolStep = {
  pool: string;
  data: string;
  callback: string;
  callbackData: string;
};

type Path = {
  steps: PoolStep[];
  tokenIn: string;
  amountIn: BigInt;
};

type TokenConfig = {
  paths: Path[];
};

type SyncSwapConfig = {
  networkName: string;
  routerAddress: string;
  poolAddress: string;
  pollFunctionInterface: ethers.Fragment[];
  amountIn: string;
  pollFunctionParams: string[];
  routerFunctionInterface: ethers.Fragment[];
  usdcContractAddress: string;
  wethContractAddress: string;
  withdrawIndex: string;
  USDC: TokenConfig;
  ETH: TokenConfig;
};

type Configs = {
  [networkId: string]: {
    SyncSwap: SyncSwapConfig;
  };
};

export type PoolType = {
  id: string;
  type: string;
  attributes: {
    base_token_price_quote_token: string;
    base_token_price_usd: string;
    reserve_in_usd: string;
  };
};

export const configs: Configs = {
  "534352": {
    SyncSwap: {
      networkName: "scroll",
      routerAddress: "0x80e38291e06339d10AAB483C65695D004dBD5C69",
      poolAddress: "0x78ea8E533c834049dE625e05F0B4DeFfe9DB5f6e",
      pollFunctionInterface: [
        ethers.Fragment.from(
          "function getAmountOut(address,uint,address) view returns (uint)"
        ),
        ethers.Fragment.from(
          "function getReserves() view returns (uint, uint)"
        ),
      ],
      amountIn: "0.001",
      pollFunctionParams: ["0x0000000000000000000000000000000000000000", ""],
      routerFunctionInterface: [
        ethers.Fragment.from(
          "function swap(((address,bytes,address,bytes)[],address,uint256)[], uint256, uint256) payable returns (uint)"
        ),
        ethers.Fragment.from(
          "function enteredPoolsLength(address) view returns (uint)"
        ),
      ],
      usdcContractAddress: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
      wethContractAddress: "0x5300000000000000000000000000000000000004",
      withdrawIndex: "2",
      USDC: {
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
            amountIn: ethers.toBigInt("0"),
          },
        ],
      },
      ETH: {
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
            tokenIn: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
            amountIn: ethers.toBigInt("0"),
          },
        ],
      },
    },
  },
};
