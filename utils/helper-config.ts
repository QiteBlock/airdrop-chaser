const networkConfigs = {
  300: {
    name: "zksyncSepolia",
    dexContract: "",
    usdc: "",
    functionInterface: "",
    functionName: "",
  },
  534351: {
    name: "scrollSepolia",
    dexContract: "0xaaAAAaa6612bd88cD409cb0D70C99556C87A0E8c",
    usdc: "0x4D65fB724CEd0CFC6ABFD03231C9CDC2C36A587B",
    functionInterface:
      "swap(address,address,uint256,bool,bool,uint128,uint16,uint128,uint128,uint8)",
    functionName: "swap",
  },
};

module.exports = {
  networkConfigs,
};
