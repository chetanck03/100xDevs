# Solana Token Launchpad

A React application that allows users to create their own SPL tokens on the Solana blockchain through a simple web interface.

## 🚀 Features

- **Token Creation**: Create custom SPL tokens with name, symbol, and image
- **Wallet Integration**: Connect with popular Solana wallets (Phantom, Solflare, etc.)
- **User-Friendly Interface**: Simple form-based token creation
- **Real-time Feedback**: Transaction signatures and mint addresses displayed

## 📋 Prerequisites

- Node.js (v16 or higher)
- A Solana wallet (Phantom, Solflare, etc.)
- Some SOL for transaction fees

## 🛠️ Installation

### 1. Wallet Adapter Setup

Install the core wallet adapter packages:

```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

### 2. Token Creation Dependencies

Install SPL token libraries:

```bash
npm install @solana/spl-token @solana/web3.js
```

### 3. Browser Polyfills

Add Node.js polyfills for browser compatibility:

```bash
npm install --save-dev vite-plugin-node-polyfills
```

### 4. Vite Configuration

Update your `vite.config.js` file:

```javascript
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills(),
  ],
})
```

## 🏗️ Project Structure

```
src/
├── components/
│   └── Token.jsx          # Main token creation component
├── App.jsx               # Main app with wallet provider
├── main.jsx             # App entry point
└── index.css            # Styles
```

## 💡 How It Works

### Token Creation Process

1. **User Input**: Collects token metadata (name, symbol, image URL, supply)
2. **Account Creation**: Creates a new mint account on Solana
3. **Mint Initialization**: Sets up the token with specified parameters
4. **Transaction Signing**: User approves transaction through their wallet
5. **Blockchain Submission**: Transaction is sent to Solana network

### Key Components Explained

#### Token.jsx Component

- **Form Interface**: Collects token details from user
- **Wallet Integration**: Uses `useWallet` and `useConnection` hooks
- **Transaction Building**: Creates SystemProgram and token instructions
- **Error Handling**: Manages transaction failures and user feedback

#### Technical Details

- **Decimals**: Set to 6 (standard for most Solana tokens)
- **Mint Authority**: Set to user's wallet (allows minting new tokens)
- **Freeze Authority**: Set to user's wallet (allows freezing accounts)
- **Rent Exemption**: Automatically calculates required SOL for account

## 🔧 Usage

1. **Connect Wallet**: Click connect button and approve wallet connection
2. **Fill Form**: Enter token name, symbol, image URL, and initial supply
3. **Create Token**: Click "Create Token" button
4. **Approve Transaction**: Confirm transaction in your wallet
5. **Get Results**: Copy the new token mint address from console

## 🚨 Important Notes

### Why We Don't Use `createMint` Function

The `createMint` helper function requires a local keypair as the payer:

```javascript
// This approach requires a local keypair (not suitable for web apps)
const mint = await createMint(
    connection,
    payer,        // Local keypair required
    mintAuthority,
    null,
    6,
    TOKEN_PROGRAM_ID
);
```

Instead, we use manual transaction building because:
- **User Pays**: The end user pays for their own token creation
- **Wallet Approval**: User must approve the transaction through their wallet
- **Security**: We don't handle private keys directly
- **Decentralization**: No backend server required

### Current Limitations

- **Initial Supply**: Form collects supply but doesn't mint initial tokens yet
- **Metadata**: Token metadata (name, symbol, image) not stored on-chain
- **Error Handling**: Basic error handling, could be more user-friendly

## 🔮 Future Enhancements

- [ ] Implement initial token minting
- [ ] Add metadata program integration
- [ ] Improve error handling and user feedback
- [ ] Add token management features
- [ ] Implement token metadata standards

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Program](https://spl.solana.com/token)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Project Notes](https://petal-estimate-4e9.notion.site/Token-launchpad-in-react-f0027bd023d4467ab5eb87d16ab21b40)

## 🐛 Known Issues

- Fixed typo in `createInitializeMint2Instruction` (was `wallet.public`, now `wallet.publicKey`)
- Removed unused `createMint` import to clean up warnings
- Added comprehensive error handling in token creation function