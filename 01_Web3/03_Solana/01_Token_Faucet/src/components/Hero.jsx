import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect, useRef } from "react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

function Hero() {
    const { publicKey } = useWallet();
    const { connection } = useConnection()
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [balance, setBalance] = useState(0)
    const lastRequestTime = useRef(0)

    // Get wallet balance
    useEffect(() => {

        if (publicKey) {
            const getBalance = async () => {
                try {
                    const bal = await connection.getBalance(publicKey)
                   
                        setBalance(bal / LAMPORTS_PER_SOL)
                    
                } catch (error) {
                    
                        console.error("Error fetching balance:", error)
                    
                }
            }
            getBalance()
        } else {
            setBalance(0)
        }

       
    }, [publicKey])

    async function sendAirDropTokens() {
        // Prevent multiple clicks and rapid requests
        const now = Date.now()
        if (loading || (now - lastRequestTime.current < 2000)) {
            console.log("Request blocked - too soon or already loading")
            return
        }
        lastRequestTime.current = now

        if (!publicKey) {
            alert("Please connect your wallet first!")
            return
        }

        if (!amount || amount <= 0) {
            alert("Please enter a valid amount!")
            return
        }

        try {
            setLoading(true)
            console.log("Requesting airdrop for:", publicKey.toString())

            // Convert SOL to lamports
            const lamports = parseFloat(amount) * LAMPORTS_PER_SOL


            // Request airdrop - this should only happen once
            console.log("Making airdrop request...")
            const signature = await connection.requestAirdrop(publicKey, lamports)
            console.log("Airdrop signature:", signature)

            // Wait for confirmation with proper method
            console.log("Waiting for confirmation...")
            const latestBlockHash = await connection.getLatestBlockhash()
            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature,
            })

            // Update balance
            const newBalance = await connection.getBalance(publicKey)
            setBalance(newBalance / LAMPORTS_PER_SOL)

            alert(`Successfully airdropped ${amount} SOL to your account!`)
            setAmount("") // Clear input

        } catch (error) {
            console.error("Airdrop failed:", error)

            if (error.message.includes("airdrop request limit") || error.message.includes("rate limit")) {
                alert("Airdrop rate limit exceeded. Wait a few minutes and try again with a smaller amount (max 0.5 SOL).")
            } else if (error.message.includes("insufficient lamports") || error.message.includes("insufficient funds")) {
                alert("Your wallet has insufficient SOL for this transaction. Try a smaller amount or get some SOL first.")
            } else if (error.message.includes("custom program error: 0x1")) {
                alert("Transaction failed due to insufficient funds. Your current balance is too low.")
            } else {
                alert(`Airdrop failed: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>
                <div className="text-center">
                    <div className="mb-2">
                        Solana Wallet Address: {" "}
                        <span className="bg-blue-500 px-2 text-white rounded">
                            {publicKey ? publicKey.toString() : "Not Connected"}
                        </span>
                    </div>
                    {publicKey && (
                        <div className="text-sm text-gray-600">
                            Current Balance: {balance.toFixed(4)} SOL
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <input
                        type="number"
                        placeholder="Enter SOL amount (max 0.5)"
                        className="border px-2 py-1 rounded"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        required
                    />
                    <button
                        className={`px-4 py-1 rounded ml-2 text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                            }`}
                        onClick={sendAirDropTokens}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Send Airdrop"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Hero;
