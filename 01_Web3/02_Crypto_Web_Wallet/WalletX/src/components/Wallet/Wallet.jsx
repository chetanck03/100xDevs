import React, { useState, useEffect } from 'react'
import Ethereum from './Ethereum'
import Solana from './Solana'

function Wallet() {
    const [selectedBlockchain, setSelectedBlockchain] = useState('')

    // Load selected blockchain from localStorage on component mount
    useEffect(() => {
        const savedBlockchain = localStorage.getItem('selected_blockchain')
        if (savedBlockchain) {
            setSelectedBlockchain(savedBlockchain)
        }
    }, [])

    const handleBlockchainSelect = (blockchain) => {
        setSelectedBlockchain(blockchain)
        localStorage.setItem('selected_blockchain', blockchain)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Crypto Wallet Generator</h1>

                    {/* Blockchain Selection */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Select Blockchain:</h2>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => handleBlockchainSelect('ethereum')}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${selectedBlockchain === 'ethereum'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Ethereum
                            </button>
                            <button
                                onClick={() => handleBlockchainSelect('solana')}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${selectedBlockchain === 'solana'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Solana
                            </button>
                        </div>
                    </div>

                    {/* Render Selected Blockchain Component */}
                    {selectedBlockchain === 'ethereum' && <Ethereum />}
                    {selectedBlockchain === 'solana' && <Solana />}

                    {!selectedBlockchain && (
                        <div className="text-center text-gray-500 mt-8">
                            Please select a blockchain to get started
                </div>
            )}
        </div>
    )
}

export default Wallet