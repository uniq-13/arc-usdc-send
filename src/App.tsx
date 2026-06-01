import { useEffect, useMemo, useState } from 'react'
import { createPublicClient, encodeFunctionData, erc20Abi, formatUnits, http, isAddress, parseUnits } from 'viem'
import { arcTestnet, ARC_CHAIN_ID, ARC_CHAIN_ID_HEX, ARC_EXPLORER_URL, ARC_FAUCET_URL, ARC_RPC_URL, USDC_ADDRESS } from './config/arc'
import { explorerTxUrl, shortAddress } from './utils/format'

type Status = 'idle' | 'pending' | 'success' | 'error'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function App() {
  const [account, setAccount] = useState<`0x${string}` | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  const publicClient = useMemo(() => createPublicClient({ chain: arcTestnet, transport: http(ARC_RPC_URL) }), [])
  const isArc = chainId === ARC_CHAIN_ID

  async function refreshAccount() {
    if (!window.ethereum) return
    const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
    setAccount(accounts[0] as `0x${string}` | undefined || null)
    const id = await window.ethereum.request({ method: 'eth_chainId' }) as string
    setChainId(Number.parseInt(id, 16))
  }

  async function refreshBalance(address = account) {
    if (!address) return
    const raw = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    })
    setBalance(formatUnits(raw, 6))
  }

  async function connectWallet() {
    setMessage('')
    if (!window.ethereum) {
      setMessage('Wallet bulunamadı. MetaMask/Rabby kur.')
      return
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
    setAccount(accounts[0] as `0x${string}`)
    await switchToArc()
  }

  async function switchToArc() {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_CHAIN_ID_HEX }] })
    } catch {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: ARC_CHAIN_ID_HEX,
          chainName: 'Arc Testnet',
          nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
          rpcUrls: [ARC_RPC_URL],
          blockExplorerUrls: [ARC_EXPLORER_URL],
        }],
      })
    }
    await refreshAccount()
  }

  async function sendUsdc() {
    setTxHash(null)
    setMessage('')
    setStatus('idle')
    if (!window.ethereum || !account) return setMessage('Önce wallet bağla.')
    if (!isArc) return setMessage('Önce Arc Testnet ağına geç.')
    if (!isAddress(recipient)) return setMessage('Alıcı adres hatalı.')
    if (!amount || Number(amount) <= 0) return setMessage('Miktar hatalı.')

    try {
      setStatus('pending')
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseUnits(amount, 6)],
      })
      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, to: USDC_ADDRESS, data, maxFeePerGas: '0x4a817c800', maxPriorityFeePerGas: '0x3b9aca00' }],
      }) as `0x${string}`
      setTxHash(hash)
      setStatus('success')
      await refreshBalance()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'İşlem başarısız.')
    }
  }

  useEffect(() => {
    refreshAccount()
    const handleAccounts = () => refreshAccount()
    const handleChain = () => refreshAccount()
    window.ethereum?.on?.('accountsChanged', handleAccounts)
    window.ethereum?.on?.('chainChanged', handleChain)
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccounts)
      window.ethereum?.removeListener?.('chainChanged', handleChain)
    }
  }, [])

  useEffect(() => {
    refreshBalance()
  }, [account])

  return <main>
    <section className="hero">
      <p className="pill">Arc Testnet · USDC gas</p>
      <h1>Arc USDC Send</h1>
      <p>Wallet bağla, Arc Testnet'e geç, testnet USDC gönder.</p>
    </section>

    <section className="card">
      <div className="row">
        <div>
          <strong>Wallet</strong>
          <p>{account ? shortAddress(account) : 'Bağlı değil'}</p>
        </div>
        <button onClick={connectWallet}>{account ? 'Yenile' : 'Wallet Bağla'}</button>
      </div>
      <div className="row">
        <div>
          <strong>Ağ</strong>
          <p>{chainId ? `${chainId}${isArc ? ' · Arc Testnet' : ' · yanlış ağ'}` : 'Bilinmiyor'}</p>
        </div>
        <button onClick={switchToArc}>Arc'a Geç</button>
      </div>
      <div className="row">
        <div>
          <strong>USDC Bakiye</strong>
          <p>{balance} USDC</p>
        </div>
        <a href={ARC_FAUCET_URL} target="_blank">Faucet</a>
      </div>
    </section>

    <section className="card form">
      <label>Alıcı adres<input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x..." /></label>
      <label>Miktar<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1.00" /></label>
      <button onClick={sendUsdc} disabled={status === 'pending'}>{status === 'pending' ? 'Gönderiliyor...' : 'USDC Gönder'}</button>
      {message && <p className="message">{message}</p>}
      {txHash && <a className="success" href={explorerTxUrl(txHash)} target="_blank">Explorer'da görüntüle</a>}
    </section>
  </main>
}

export default App
