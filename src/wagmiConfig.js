import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';

export const coreTestnet = {
  id: 1114,
  name: 'Core Blockchain TestNet',
  network: 'core-testnet',
  nativeCurrency: {
    name: 'tCORE2',
    symbol: 'tCORE2',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test2.btcs.network'],
    },
    public: {
      http: ['https://rpc.test2.btcs.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Core Testnet Explorer', url: 'https://scan.test2.btcs.network' },
  },
  testnet: true,
};

const chains = [coreTestnet];

const { connectors } = getDefaultWallets({
  appName: 'Kryptz',
  projectId: 'kryptz-core-testnet',
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  chains,
  transports: {
    [coreTestnet.id]: http(),
  },
});

export { chains };
