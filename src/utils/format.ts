export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function explorerTxUrl(hash: string) {
  return `https://testnet.arcscan.app/tx/${hash}`
}
