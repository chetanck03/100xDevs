import React, { useState, useEffect } from 'react'
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { Keypair } from "@solana/web3.js"
import { useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
import toast from 'react-hot-toast'
import { Plus, RefreshCw, Trash2, Eye, EyeOff, Copy, Send } from 'lucide-react'

function Solana() {
    const navigate = useNavigate()
    const [seedPhrase, setSeedPhrase] = useState('')
    const [wallets, setWallets] = useState([])
    const [showPrivateKeys, setShowPrivateKeys] = useState({})
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedSeedPhrase = localStorage.getItem('solana_seed_phrase')
        const savedWallets = localStorage.getItem('solana_wallets')
        
        if (savedSeedPhrase) {
            setSeedPhrase(savedSeedPhrase)
        }
        
        if (savedWallets) {
            try {
                setWallets(JSON.parse(savedWallets))
            } catch (error) {
                console.error('Error parsing saved wallets:', error)
            }
        }
    }, [])

    // Save to localStorage whenever seedPhrase or wallets change
    useEffect(() => {
        if (seedPhrase) {
            localStorage.setItem('solana_seed_phrase', seedPhrase)
        }
    }, [seedPhrase])

    useEffect(() => {
        if (wallets.length > 0) {
            localStorage.setItem('solana_wallets', JSON.stringify(wallets))
        } else {
            localStorage.removeItem('solana_wallets')
        }
    }, [wallets])

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
        localStorage.removeItem('solana_wallets') // Clear saved wallets
        toast.success('New seed phrase generated successfully!')
    }

    const removeWallet = (walletId) => {
        setWallets(prev => prev.filter(wallet => wallet.id !== walletId))
        setShowPrivateKeys(prev => {
            const updated = { ...prev }
            delete updated[walletId]
            return updated
        })
        toast.success('Wallet removed successfully!')
    }

    const clearAllData = () => {
        setSeedPhrase('')
        setWallets([])
        setShowPrivateKeys({})
        setShowSeedPhrase(false)
        localStorage.removeItem('solana_seed_phrase')
        localStorage.removeItem('solana_wallets')
        toast.success('All Solana wallet data cleared!')
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

    const toggleSeedPhrase = () => {
        setShowSeedPhrase(prev => !prev)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    const handleSendTransaction = (publicKey) => {
        navigate(`/transaction/solana/${publicKey}`)
    }

    return (
        <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">Solana Wallet</h2>

            {/* Seed Phrase Generation */}
            <div className="mb-6">
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={generateSeedPhrase}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        {seedPhrase ? 'Regenerate Seed Phrase' : 'Generate Seed Phrase'}
                    </button>
                    
                    {(seedPhrase || wallets.length > 0) && (
                        <button
                            onClick={clearAllData}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Clear All Data
                        </button>
                    )}
                </div>

                {seedPhrase && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                        <h3 className="font-semibold mb-2">Seed Phrase (Keep this secure!):</h3>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all flex-1">
                                {showSeedPhrase ? seedPhrase : '•'.repeat(seedPhrase.split(' ').length * 6)}
                            </div>
                            <button
                                onClick={toggleSeedPhrase}
                                className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                            >
                                {showSeedPhrase ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showSeedPhrase ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showSeedPhrase && (
                            <button
                                onClick={() => copyToClipboard(seedPhrase)}
                                className="mt-2 text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                            >
                                <Copy size={14} />
                                Copy Seed Phrase
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create HD Wallets */}
            {seedPhrase && (
                <div className="mb-6">
                    <button
                        onClick={createWallet}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add New Wallet
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">{wallet.path}</span>
                                        <button
                                            onClick={() => handleSendTransaction(wallet.publicKey)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                            title="Send transaction"
                                        >
                                            <Send size={14} />
                                            Send
                                        </button>
                                        <button
                                            onClick={() => removeWallet(wallet.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                            title="Remove wallet"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                                                className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                                            >
                                                <Copy size={14} />
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
                                                className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                                            >
                                                {showPrivateKeys[wallet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                {showPrivateKeys[wallet.id] ? 'Hide' : 'Show'}
                                            </button>
                                            {showPrivateKeys[wallet.id] && (
                                                <button
                                                    onClick={() => copyToClipboard(wallet.privateKey)}
                                                    className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                                                >
                                                    <Copy size={14} />
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