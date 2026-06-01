import { defineChain } from 'viem'

export const ARC_CHAIN_ID = 5042002
export const ARC_CHAIN_ID_HEX = '0x4cef52'
export const ARC_RPC_URL = 'https://rpc.testnet.arc.network'
export const ARC_EXPLORER_URL = 'https://testnet.arcscan.app'
export const ARC_FAUCET_URL = 'https://faucet.circle.com'
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan Testnet',
      url: ARC_EXPLORER_URL,
    },
  },
  testnet: true,
})
