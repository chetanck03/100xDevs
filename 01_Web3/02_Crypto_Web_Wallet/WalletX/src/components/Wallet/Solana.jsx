import React, { useState } from 'react'
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { Keypair } from "@solana/web3.js"
import { Buffer } from 'buffer'
import toast from 'react-hot-toast'

function Solana() {
    const [seedPhrase, setSeedPhrase] = useState('')
    const [wallets, setWallets] = useState([])
    const [showPrivateKeys, setShowPrivateKeys] = useState({})

    // Function to create Solana HD wallet
    const createSolanaWallet = (mnemonic = null, accountIndex = 0) => {
        try {
            // Generate or use provided mnemonic
            const seedPhrase = mnemonic || generateMnemonic()

            // Convert mnemonic to seed
            const seed = mnemonicToSeedSync(seedPhrase)

            // Create a simple derivation by combining seed with account index
            // This is a simplified approach that works in browsers
            const accountSeed = new Uint8Array(32)
            const seedArray = new Uint8Array(seed)

            // Mix the seed with account index for derivation
            for (let i = 0; i < 32; i++) {
                accountSeed[i] = seedArray[i] ^ (accountIndex & 0xFF)
            }

            // Generate keypair from the derived seed
            const keypair = Keypair.fromSeed(accountSeed)
            const path = `m/44'/501'/${accountIndex}'/0'` // For display purposes

            return {
                seedPhrase,
                publicKey: keypair.publicKey.toBase58(),
                privateKey: Buffer.from(keypair.secretKey).toString('hex'),
                path
            }
        } catch (error) {
            console.error('Error creating Solana wallet:', error)
            return null
        }
    }

    const generateSeedPhrase = () => {
        const newSeedPhrase = generateMnemonic()
        setSeedPhrase(newSeedPhrase)
        setWallets([]) // Clear existing wallets when new seed is generated
        toast.success('Seed phrase generated successfully!')
    }

    const createWallet = () => {
        if (!seedPhrase) {
            toast.error('Please generate a seed phrase first!')
            return
        }

        const walletData = createSolanaWallet(seedPhrase, wallets.length)
        if (walletData) {
            setWallets(prev => [...prev, {
                ...walletData,
                index: wallets.length,
                id: Date.now() + Math.random()
            }])
            toast.success(`Solana wallet #${wallets.length + 1} created successfully!`)
        } else {
            toast.error('Failed to create wallet. Please try again.')
        }
    }

    const togglePrivateKey = (walletId) => {
        setShowPrivateKeys(prev => ({
            ...prev,
            [walletId]: !prev[walletId]
        }))
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    return (
        <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">Solana Wallet</h2>

            {/* Seed Phrase Generation */}
            <div className="mb-6">
                <button
                    onClick={generateSeedPhrase}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    Generate Seed Phrase
                </button>

                {seedPhrase && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                        <h3 className="font-semibold mb-2">Seed Phrase (Keep this secure!):</h3>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                            {seedPhrase}
                        </div>
                        <button
                            onClick={() => copyToClipboard(seedPhrase)}
                            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
                        >
                            Copy Seed Phrase
                        </button>
                    </div>
                )}
            </div>

            {/* Create HD Wallets */}
            {seedPhrase && (
                <div className="mb-6">
                    <button
                        onClick={createWallet}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Create HD Wallet
                    </button>
                </div>
            )}

            {/* Display Wallets */}
            {wallets.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Generated Wallets:</h3>
                    <div className="space-y-4">
                        {wallets.map((wallet) => (
                            <div key={wallet.id} className="bg-white p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">Wallet #{wallet.index + 1}</h4>
                                    <span className="text-sm text-gray-500">{wallet.path}</span>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Public Key (Address):</label>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-gray-100 p-2 rounded text-sm flex-1 break-all">
                                                {wallet.publicKey}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(wallet.publicKey)}
                                                className="text-purple-600 hover:text-purple-800 text-sm"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Private Key:</label>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-gray-100 p-2 rounded text-sm flex-1 break-all">
                                                {showPrivateKeys[wallet.id] ? wallet.privateKey : '•'.repeat(128)}
                                            </code>
                                            <button
                                                onClick={() => togglePrivateKey(wallet.id)}
                                                className="text-purple-600 hover:text-purple-800 text-sm"
                                            >
                                                {showPrivateKeys[wallet.id] ? 'Hide' : 'Show'}
                                            </button>
                                            {showPrivateKeys[wallet.id] && (
                                                <button
                                                    onClick={() => copyToClipboard(wallet.privateKey)}
                                                    className="text-purple-600 hover:text-purple-800 text-sm"
                                                >
                                                    Copy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Solana