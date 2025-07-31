import React, { useState } from 'react'
import { ethers } from "ethers"
import { generateMnemonic } from "bip39"
import toast from 'react-hot-toast'

function Ethereum() {
    const [seedPhrase, setSeedPhrase] = useState('')
    const [wallets, setWallets] = useState([])
    const [showPrivateKeys, setShowPrivateKeys] = useState({})

    // Function to create Ethereum HD wallet
    const createEthereumWallet = (mnemonic = null, accountIndex = 0) => {
        try {
            // Generate or use provided mnemonic
            const seedPhrase = mnemonic || generateMnemonic()

            // Derive path for Ethereum (coin type 60)
            const path = `m/44'/60'/${accountIndex}'/0/0`

            // Create HD wallet from mnemonic with specific path
            const derivedWallet = ethers.HDNodeWallet.fromPhrase(seedPhrase, path)

            return {
                seedPhrase,
                publicKey: derivedWallet.address,
                privateKey: derivedWallet.privateKey,
                path
            }
        } catch (error) {
            console.error('Error creating Ethereum wallet:', error)
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

        const walletData = createEthereumWallet(seedPhrase, wallets.length)
        if (walletData) {
            setWallets(prev => [...prev, {
                ...walletData,
                index: wallets.length,
                id: Date.now() + Math.random()
            }])
            toast.success(`Ethereum wallet #${wallets.length + 1} created successfully!`)
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
        <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Ethereum Wallet</h2>

            {/* Seed Phrase Generation */}
            <div className="mb-6">
                <button
                    onClick={generateSeedPhrase}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
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
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Private Key:</label>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-gray-100 p-2 rounded text-sm flex-1 break-all">
                                                {showPrivateKeys[wallet.id] ? wallet.privateKey : '•'.repeat(64)}
                                            </code>
                                            <button
                                                onClick={() => togglePrivateKey(wallet.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                {showPrivateKeys[wallet.id] ? 'Hide' : 'Show'}
                                            </button>
                                            {showPrivateKeys[wallet.id] && (
                                                <button
                                                    onClick={() => copyToClipboard(wallet.privateKey)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
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

export default Ethereum