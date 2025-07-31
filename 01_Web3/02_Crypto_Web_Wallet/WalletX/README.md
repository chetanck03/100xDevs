# WalletX - HD Wallet Generator

A React application that generates Hierarchical Deterministic (HD) wallets for Ethereum and Solana blockchains using industry-standard cryptographic methods.

## What This Application Does

This application provides two core functions for creating cryptocurrency wallets:

1. **Ethereum HD Wallet Generation** - Creates wallets compatible with Ethereum and EVM-based blockchains
2. **Solana HD Wallet Generation** - Creates wallets compatible with the Solana blockchain

Both functions generate:
- **Seed Phrase** (12-word mnemonic)
- **Public Key** (wallet address)
- **Private Key** (for signing transactions)
- **Derivation Path** (for wallet recovery)

## How HD Wallets Work

### 1. Mnemonic Generation (BIP-39)
```
Random Entropy → Mnemonic Phrase (12 words)
Example: "abandon ability able about above absent absorb abstract absurd abuse access accident"
```

The application uses BIP-39 standard to generate a human-readable seed phrase from cryptographic randomness. This 12-word phrase can recreate your entire wallet.

### 2. Seed Derivation
```
Mnemonic Phrase → Binary Seed (512 bits)
```

The mnemonic is converted into a binary seed using PBKDF2 key stretching, creating the master seed for all key derivation.

### 3. Hierarchical Key Derivation (BIP-44)
```
Master Seed → Derivation Path → Private Key → Public Key
```

Using derivation paths, multiple wallets can be generated from a single seed:

**Ethereum Path**: `m/44'/60'/0'/0/0`
- `44'` = BIP-44 standard
- `60'` = Ethereum coin type
- `0'` = Account index
- `0` = External addresses (receiving)
- `0` = Address index

**Solana Path**: `m/44'/501'/0'/0'`
- `44'` = BIP-44 standard
- `501'` = Solana coin type
- `0'` = Account index
- `0'` = Address index

## Technical Implementation

### Dependencies Used

```json
{
  "bip39": "Mnemonic generation and seed derivation",
  "ed25519-hd-key": "Hierarchical key derivation for Ed25519",
  "tweetnacl": "Cryptographic operations for Solana",
  "@solana/web3.js": "Solana blockchain utilities",
  "ethers": "Ethereum blockchain utilities"
}
```

```
npm install bip39 ed25519-hd-key tweetnacl @solana/web3.js ethers
```


### Function Logic

#### `createSolanaWallet(mnemonic, accountIndex)`

```javascript
1. Generate/use mnemonic phrase (BIP-39)
2. Convert mnemonic to binary seed
3. Derive Ed25519 key using path m/44'/501'/accountIndex'/0'
4. Generate Solana keypair using tweetnacl
5. Return wallet data (seed, public key, private key, path)
```

#### `createEthereumWallet(mnemonic, accountIndex)`

```javascript
1. Generate/use mnemonic phrase (BIP-39)
2. Create HD wallet from mnemonic using ethers
3. Derive wallet using path m/44'/60'/accountIndex'/0/0
4. Return wallet data (seed, address, private key, path)
```

### Security Features

- **Deterministic**: Same seed always generates same wallets
- **Hierarchical**: Multiple accounts from single seed
- **Standard Compliant**: BIP-39, BIP-44 compatible
- **Cross-Platform**: Works with other wallets (Phantom, MetaMask, etc.)
- **Error Handling**: Try-catch blocks prevent crashes

## Usage Examples

### Generate New Wallets
```javascript
// Create new Solana wallet
const solanaWallet = createSolanaWallet()
console.log(solanaWallet.publicKey) // Solana address
console.log(solanaWallet.seedPhrase) // 12-word mnemonic

// Create new Ethereum wallet  
const ethWallet = createEthereumWallet()
console.log(ethWallet.publicKey) // Ethereum address
console.log(ethWallet.privateKey) // Private key for signing
```

### Restore from Existing Seed
```javascript
const existingSeed = "abandon ability able about above absent absorb abstract absurd abuse access accident"

// Restore Solana wallet
const restoredSol = createSolanaWallet(existingSeed)

// Restore Ethereum wallet
const restoredEth = createEthereumWallet(existingSeed)
```

### Generate Multiple Accounts
```javascript
// Generate multiple Solana accounts from same seed
for (let i = 0; i < 5; i++) {
  const wallet = createSolanaWallet(seedPhrase, i)
  console.log(`Account ${i}: ${wallet.publicKey}`)
}
```

## Wallet Compatibility

The generated wallets are compatible with:

**Solana Wallets:**
- Phantom
- Solflare  
- Backpack
- Sollet

**Ethereum Wallets:**
- MetaMask
- Trust Wallet
- Coinbase Wallet
- Hardware wallets (Ledger, Trezor)

## Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

### Dependencies
```bash
npm install bip39 ed25519-hd-key tweetnacl @solana/web3.js ethers
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never share private keys or seed phrases**
2. **Store seed phrases securely offline**
3. **Use HTTPS in production**
4. **Validate all inputs**
5. **Consider hardware wallets for large amounts**

## Technical References

- [BIP-39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP-44 Specification](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [Solana Wallet Standard](https://docs.solana.com/wallet-guide)
- [Ethereum HD Wallets](https://ethereum.org/en/developers/docs/accounts/#externally-owned-accounts-and-key-pairs)

## Built With

- React 19
- Vite
- TailwindCSS
- Modern cryptographic libraries
