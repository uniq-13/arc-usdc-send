# Arc USDC Send

Arc Testnet üzerinde çalışan basit USDC gönderim dApp'i.

## Özellikler

- Wallet bağlama
- Arc Testnet ağına geçiş
- ERC-20 USDC bakiyesi görüntüleme
- Testnet USDC gönderimi
- İşlem sonrası Arcscan explorer linki
- Faucet linki

## Canlı Demo

https://arc-usdc-send.vercel.app

## Teknoloji

- Vite
- React
- TypeScript
- Viem
- Arc Testnet

## Arc Testnet Bilgileri

| Alan | Değer |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Faucet | `https://faucet.circle.com` |
| Gas token | USDC |
| USDC ERC-20 | `0x3600000000000000000000000000000000000000` |

## Kurulum

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Kullanım

1. Siteyi aç.
2. Wallet bağla.
3. Arc Testnet ağına geç.
4. Faucet'ten test USDC al.
5. Alıcı adres ve miktar gir.
6. USDC gönder.
7. Explorer linkinden işlemi kontrol et.

## Güvenlik Notları

- Mainnet kullanılmaz.
- Private key veya API key gerekmez.
- Arc üzerinde gas token USDC'dir, ETH değildir.
- Native gas USDC 18 decimals, ERC-20 USDC interface 6 decimals kullanır.
