import React, { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { generateMnemonic, validateMnemonic } from "bip39"
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, RefreshCw, Trash2, Eye, EyeOff, Copy, Send, Download } from 'lucide-react'

function Ethereum() {
    const navigate = useNavigate()
    const [seedPhrase, setSeedPhrase] = useState('')
    const [wallets, setWallets] = useState([])
    const [showPrivateKeys, setShowPrivateKeys] = useState({})
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [importSeedInput, setImportSeedInput] = useState('')

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedSeedPhrase = localStorage.getItem('ethereum_seed_phrase')
        const savedWallets = localStorage.getItem('ethereum_wallets')

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
            localStorage.setItem('ethereum_seed_phrase', seedPhrase)
        }
    }, [seedPhrase])

    useEffect(() => {
        if (wallets.length > 0) {
            localStorage.setItem('ethereum_wallets', JSON.stringify(wallets))
        } else {
            localStorage.removeItem('ethereum_wallets')
        }
    }, [wallets])

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
        localStorage.removeItem('ethereum_wallets') // Clear saved wallets
        toast.success('New seed phrase generated successfully!')
    }

    const importSeedPhrase = (importedPhrase) => {
        try {
            // Validate the seed phrase
            const trimmedPhrase = importedPhrase.trim()
            if (!trimmedPhrase) {
                toast.error('Please enter a seed phrase')
                return false
            }

            // Validate using bip39
            if (!validateMnemonic(trimmedPhrase)) {
                toast.error('Invalid seed phrase. Please check your words and try again.')
                return false
            }

            // Test if we can create a wallet with this phrase
            const testWallet = createEthereumWallet(trimmedPhrase, 0)
            if (!testWallet) {
                toast.error('Failed to create wallet from seed phrase')
                return false
            }

            // If valid, set the seed phrase and clear existing wallets
            setSeedPhrase(trimmedPhrase)
            setWallets([])
            setShowPrivateKeys({})
            localStorage.removeItem('ethereum_wallets')
            toast.success('Seed phrase imported successfully!')
            return true
        } catch (error) {
            console.error('Error importing seed phrase:', error)
            toast.error('Invalid seed phrase')
            return false
        }
    }

    const handleImportSubmit = () => {
        if (importSeedPhrase(importSeedInput)) {
            setShowImportModal(false)
            setImportSeedInput('')
        }
    }

    const handleImportCancel = () => {
        setShowImportModal(false)
        setImportSeedInput('')
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
        localStorage.removeItem('ethereum_seed_phrase')
        localStorage.removeItem('ethereum_wallets')
        toast.success('All Ethereum wallet data cleared!')
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

    const toggleSeedPhrase = () => {
        setShowSeedPhrase(prev => !prev)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    const handleSendTransaction = (publicKey) => {
        navigate(`/transaction/ethereum/${publicKey}`)
    }

    return (
        <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Ethereum Wallet</h2>

            {/* Seed Phrase Generation */}
            <div className="mb-6">
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={generateSeedPhrase}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        {seedPhrase ? 'Regenerate Seed Phrase' : 'Generate Seed Phrase'}
                    </button>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <Download size={18} />
                        Import Seed Phrase
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
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                                {showSeedPhrase ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showSeedPhrase ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {showSeedPhrase && (
                            <button
                                onClick={() => copyToClipboard(seedPhrase)}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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
                                                {showPrivateKeys[wallet.id] ? wallet.privateKey : '•'.repeat(64)}
                                            </code>
                                            <button
                                                onClick={() => togglePrivateKey(wallet.id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                            >
                                                {showPrivateKeys[wallet.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                {showPrivateKeys[wallet.id] ? 'Hide' : 'Show'}
                                            </button>
                                            {showPrivateKeys[wallet.id] && (
                                                <button
                                                    onClick={() => copyToClipboard(wallet.privateKey)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
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

            {/* Import Seed Phrase Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Import Seed Phrase</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter your existing seed phrase to import your wallet. This will replace any current seed phrase.
                        </p>
                        <textarea
                            value={importSeedInput}
                            onChange={(e) => setImportSeedInput(e.target.value)}
                            placeholder="Enter your 12 or 24 word seed phrase..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
                            rows={3}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleImportSubmit}
                                disabled={!importSeedInput.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Import
                            </button>
                            <button
                                onClick={handleImportCancel}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Ethereum