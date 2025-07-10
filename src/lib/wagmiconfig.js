// 📁 src/lib/wagmiconfig.js

import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { createPublicClient } from "viem";

const coreTestnet = {
  id: 1114,
  name: "Core Testnet",
  network: "core-testnet",
  nativeCurrency: {
    name: "tCORE",
    symbol: "tCORE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.test2.btcs.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "CoreScan",
      url: "https://scan.test.btcs.network/",
    },
  },
  testnet: true,
};

const { connectors } = getDefaultWallets({
  appName: "Kryptz",
  projectId: "kryptz-battle-app",
  chains: [coreTestnet],
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient: createPublicClient({
    chain: coreTestnet,
    transport: http(),
  }),
});

export const chains = [coreTestnet];
