# Solana Development Guide
Link : https://petal-estimate-4e9.notion.site/Solana-Jargon-Programming-model-Tokens-45937002d4c24cda9d02fc02a6dedc1c
## Overview

Solana is a high-performance blockchain platform that uses a proof-of-stake mechanism to provide smart contract functionality. It was launched in 2020 by Solana Labs and is known for its high throughput and low transaction costs.

## Key Concepts

### Solana Account Model

Solana uses an account-based model where:
- An account either holds data or is an executable program
- Each account is owned by a program
- Only the owner program can modify the account's data

#### Types of Accounts

There are three main types of accounts in Solana:

1. **Program Accounts (Executable)**: These accounts store the executable code of smart contracts (programs). They have the `executable` flag set to true and are owned by a Loader Program. Program accounts cannot store state but can execute code.

2. **Data Accounts (Non-executable)**: These accounts store program state and data. They are created by programs to manage state and are owned by the program that created them. Examples include token accounts, mint accounts, and other program-specific storage.

3. **System Accounts (Wallet Accounts)**: These are accounts owned by the System Program that primarily store SOL balances. All wallet accounts on Solana are System Accounts. Only System Accounts can pay transaction fees.

Accounts can store up to 10MiB of data and require a "rent" deposit in SOL that's proportional to the amount of data stored.

### Tokens on Solana

- Tokens on Solana are referred to as SPL (Solana Program Library) Tokens
- The Token Program contains all instruction logic for interacting with tokens (both fungible and non-fungible)
- Each Token Account includes an owner field identifying who has authority over it
- Associated Token Accounts are created with addresses derived from the owner's address and the mint account's address

### Program Derived Address (PDA)

A key concept in Solana development is Program Derived Address (PDA), which allows programs to sign for certain addresses without needing a private key.

## Solana CLI Commands

### Environment Setup

```bash
# Check current configuration
solana config get

# Set network to Devnet (for testing)
solana config set --url https://api.devnet.solana.com

# Set network to Mainnet
solana config set --url https://api.mainnet-beta.solana.com
```

### Local Development

```bash
# Start a local validator for testing
solana-test-validator
```

### Account Management

```bash
# Get your public key (wallet address)
solana address

# Check your account balance
solana balance

# Request SOL tokens from faucet (only works on Devnet and Testnet)
solana airdrop 1  # Request 1 SOL
```

### Rent in Solana

Rent is a mechanism on Solana that ensures efficient usage of blockchain resources. Accounts must maintain a minimum balance (rent-exempt threshold) proportional to the amount of data they store.

- Accounts that maintain the rent-exempt threshold don't pay rent
- If an account's balance falls below this threshold, it may be removed from the network
- Rent is refundable when an account is closed
- Even accounts with no data (0 bytes) require a minimum balance

#### Rent Commands

```bash
# Calculate rent-exempt minimum for an account with specific data size (in bytes)
solana rent <DATA_SIZE>

# Calculate rent-exempt minimum for common account types
solana rent nonce    # For nonce accounts
solana rent stake    # For stake accounts
solana rent system   # For system accounts
solana rent vote     # For vote accounts

# Example: Calculate rent for an account with 1KB of data
solana rent 1024

# Example: Calculate rent for an account with no data
solana rent 0
```

The output will show the rent-exempt minimum in SOL, which is the minimum balance required to keep the account on the network indefinitely.

### Token Operations

```bash
# Create a new token
spl-token create-token

# Create an account to hold tokens
spl-token create-account <TOKEN_ADDRESS>

# Mint tokens
spl-token mint <TOKEN_ADDRESS> <AMOUNT> <RECIPIENT_ADDRESS>

# Transfer tokens
spl-token transfer <TOKEN_ADDRESS> <AMOUNT> <RECIPIENT_ADDRESS>
```

## Development Workflow

1. **Setup Environment**: Install Rust, Solana CLI, and optionally Anchor Framework
2. **Create Project**: Initialize a new Solana program or use Anchor to scaffold a project
3. **Write Code**: Develop your program logic in Rust
4. **Test Locally**: Use `solana-test-validator` for local testing
5. **Deploy**: Deploy your program to Devnet for testing or Mainnet for production

## Best Practices

- Always test thoroughly on Devnet before deploying to Mainnet
- Use PDAs for program-controlled accounts
- Be mindful of account size limitations and rent exemption
- Follow security best practices to prevent vulnerabilities

## Resources

- [Official Solana Documentation](https://solana.com/docs)
- [Solana Account Model](https://solana.com/docs/core/accounts)
- [Solana Program Library (SPL)](https://spl.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)