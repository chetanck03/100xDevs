import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, RefreshCw, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import EthereumTransaction from './EthereumTransaction'
import SolanaTransaction from './SolanaTransaction'

function TransactionPage() {
    const { blockchain, address } = useParams()
    const navigate = useNavigate()
    const [walletData, setWalletData] = useState(null)

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Address copied to clipboard!')
    }

    useEffect(() => {
        // Get wallet data from localStorage based on blockchain and address
        const storageKey = `${blockchain}_wallets`
        const savedWallets = localStorage.getItem(storageKey)

        if (savedWallets) {
            try {
                const wallets = JSON.parse(savedWallets)
                const wallet = wallets.find(w => w.publicKey === address)
                if (wallet) {
                    setWalletData(wallet)
                } else {
                    toast.error('Wallet not found')
                    navigate('/')
                }
            } catch (error) {
                console.error('Error parsing wallet data:', error)
                toast.error('Error loading wallet data')
                navigate('/')
            }
        } else {
            toast.error('No wallets found')
            navigate('/')
        }
    }, [blockchain, address, navigate])

    if (!walletData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-lg text-gray-600">Loading wallet...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Wallets
                    </button>
                </div>

                {/* Wallet Info */}
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Send size={24} className={blockchain === 'ethereum' ? 'text-blue-600' : 'text-purple-600'} />
                        <h1 className="text-2xl font-bold capitalize">{blockchain} Wallet</h1>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wallet Address
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg">
                                <p className="font-mono text-sm break-all text-gray-800">{address}</p>
                            </div>
                            <button
                                onClick={() => copyToClipboard(address)}
                                className="flex items-center gap-1 px-3 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                                <Copy size={14} />
                                Copy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transaction Component */}
                {blockchain === 'ethereum' && (
                    <EthereumTransaction walletData={walletData} />
                )}
                {blockchain === 'solana' && (
                    <SolanaTransaction walletData={walletData} />
                )}
            </div>
        </div>
    )
}

export default TransactionPage