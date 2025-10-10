import {
  getMinimumBalanceForRentExemptMint, 
  MINT_SIZE, 
  TOKEN_PROGRAM_ID, 
  createInitializeMint2Instruction 
} from "@solana/spl-token"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js"

function Token() {
  // Get wallet connection and methods from wallet adapter
  const wallet = useWallet()
  const { connection } = useConnection()

  /**
   * Creates a new SPL token on Solana blockchain
   * This function handles the complete token creation process:
   * 1. Collects token metadata from form inputs
   * 2. Creates a new mint account
   * 3. Initializes the mint with specified parameters
   * 4. Sends transaction to blockchain
   */
  const createToken = async () => {
    // Extract token details from form inputs
    const name = document.getElementById("name").value
    const symbol = document.getElementById("symbol").value
    const img = document.getElementById("img").value
    const supply = document.getElementById("supply").value

    // Log token details for debugging
    console.log("\n", "Name:", name, "\n", "Symbol:", symbol, "\n", "Img:", img, "\n", "Supply:", supply)

    try {
      // Step 1: Calculate minimum lamports needed for rent exemption
      // This ensures the account won't be deleted due to insufficient balance
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      // Step 2: Generate a new keypair for the token mint account
      // This will be the unique address of our new token
      const keypair = Keypair.generate()

      // Step 3: Build transaction with two instructions
      const transaction = new Transaction().add(
        // First instruction: Create the mint account
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,        // User's wallet pays for creation
          newAccountPubkey: keypair.publicKey, // New mint account address
          space: MINT_SIZE,                    // Required space for mint account
          lamports,                            // SOL needed for rent exemption
          programId: TOKEN_PROGRAM_ID,         // Assign to token program
        }),

        // Second instruction: Initialize the mint with token parameters
        createInitializeMint2Instruction(
          keypair.publicKey,    // Mint account address
          6,                    // Decimals (6 is standard for most tokens)
          wallet.publicKey,     // Mint authority (who can mint new tokens)
          wallet.publicKey,     // Freeze authority (who can freeze accounts) 
          TOKEN_PROGRAM_ID      // Token program ID
        ),
      );

      // Step 4: Set transaction metadata
      const recentBlockhash = await connection.getLatestBlockhash()
      transaction.recentBlockhash = recentBlockhash.blockhash // Recent blockhash for transaction validity
      transaction.feePayer = wallet.publicKey                 // User pays transaction fees

      // Step 5: Sign transaction with the mint keypair
      // This is required because we're creating an account with this keypair
      transaction.partialSign(keypair)

      // Step 6: Send transaction through user's wallet
      // Wallet will prompt user to approve and sign the transaction
      let res = await wallet.sendTransaction(transaction, connection)

      console.log("Token creation transaction signature:", res)

      // Token creation transaction signature: 2e84m6q3UTyMf1UywkbVxQ342SZemYhmDanL7py8Q8oVRhJQM2RJ12vLMs8eLaWe1Bhh2AFFKnhLmq5ffJVbggW9
      console.log("New token mint address:", keypair.publicKey.toString())
      // New token mint address: 3QVQd8CdVkN9CMxrz9Rm645yVLc2Hzn8hATbDJoYPvdx

    } catch (error) {
      console.error("Error creating token:", error)
    }
  }

  return (
    <div className='flex items-center flex-col border bg-blue-400 '>
      <h1>Solana Token Launchpad</h1>

      {/* Token Name Input */}
      <label className='p-2 m-2'>Name
        <input
          id='name'
          type="text"
          placeholder='Enter token name (e.g., My Awesome Token)'
          className='border mx-2'
        />
      </label>

      <label className='p-2 m-2'>Symbol
        <input
          id='symbol'
          type="text"
          placeholder='Enter symbol (e.g., MAT)'
          className='border mx-2'
        />
      </label>

      <label className='p-2 m-2'>Image URL
        <input
          id='img'
          type="text"
          placeholder='Enter image URL for token logo'
          className='border mx-2'
        />
      </label>

      <label className='p-2 m-2'>Initial Supply
        <input
          id='supply'
          type="text"
          placeholder='Enter initial supply (e.g., 1000000)'
          className='border mx-2'
        />
      </label>

      <button
        className='border p-3 m-2 bg-red-500 hover:bg-red-600 text-white rounded'
        onClick={createToken}
      >
        Create Token
      </button>
    </div>
  )
}

export default Token