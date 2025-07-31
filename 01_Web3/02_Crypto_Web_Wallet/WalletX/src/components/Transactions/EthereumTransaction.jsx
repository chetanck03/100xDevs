import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Wallet, Send, RefreshCw, AlertCircle, Droplets } from 'lucide-react'
import toast from 'react-hot-toast'
import TransactionHistory from './TransactionHistory'

function EthereumTransaction({ walletData }) {
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState('sepolia')
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    gasLimit: '21000'
  })
  const [sending, setSending] = useState(false)

  const getProvider = () => {
    const mainnetUrl = import.meta.env.VITE_ETHEREUM_MAINNET_RPC_URL
    const sepoliaUrl = import.meta.env.VITE_ETHEREUM_SEPOLIA_RPC_URL
    
    // Fallback URLs in case environment variables are not loaded
    const fallbackMainnet = 'https://eth.llamarpc.com'
    const fallbackSepolia = 'https://ethereum-sepolia-rpc.publicnode.com'
    
    const rpcUrl = network === 'mainnet'
      ? (mainnetUrl || fallbackMainnet)
      : (sepoliaUrl || fallbackSepolia)
    
    if (!rpcUrl || (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://'))) {
      console.error('Invalid RPC URL:', rpcUrl)
      toast.error('Invalid RPC configuration')
      return null
    }
    
    return new ethers.JsonRpcProvider(rpcUrl)
  }

  const fetchBalance = async () => {
    setLoading(true)
    try {
      const currentProvider = getProvider()
      if (!currentProvider) {
        throw new Error('Failed to create provider')
      }
      
      const balanceWei = await currentProvider.getBalance(walletData.publicKey)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (error) {
      console.error('Error fetching balance:', error)
      toast.error('Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [walletData.publicKey, network])

  const handleSendTransaction = async (e) => {
    e.preventDefault()

    if (!sendForm.to || !sendForm.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!ethers.isAddress(sendForm.to)) {
      toast.error('Invalid recipient address')
      return
    }

    const amount = parseFloat(sendForm.amount)
    if (amount <= 0 || amount > parseFloat(balance)) {
      toast.error('Invalid amount')
      return
    }

    setSending(true)
    try {
      // Create wallet instance
      const currentProvider = getProvider()
      if (!currentProvider) {
        throw new Error('Failed to create provider')
      }
      
      const wallet = new ethers.Wallet(walletData.privateKey, currentProvider)

      // Get current gas price
      const gasPrice = await currentProvider.getFeeData()

      // Create transaction
      const tx = {
        to: sendForm.to,
        value: ethers.parseEther(sendForm.amount),
        gasLimit: parseInt(sendForm.gasLimit),
        gasPrice: gasPrice.gasPrice
      }

      // Send transaction
      const txResponse = await wallet.sendTransaction(tx)
      toast.success(`Transaction sent! Hash: ${txResponse.hash}`)

      // Wait for confirmation
      const receipt = await txResponse.wait()
      toast.success(`Transaction confirmed in block ${receipt.blockNumber}`)

      // Reset form and refresh balance
      setSendForm({ to: '', amount: '', gasLimit: '21000' })
      fetchBalance()

    } catch (error) {
      console.error('Transaction error:', error)
      toast.error(`Transaction failed: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (field, value) => {
    setSendForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNetworkChange = (newNetwork) => {
    setNetwork(newNetwork)
    setSendForm({ to: '', amount: '', gasLimit: '21000' })
  }

  const openFaucet = () => {
    if (network === 'sepolia') {
      window.open('https://sepoliafaucet.com/', '_blank')
    } else {
      toast.error('Faucets are only available for testnets')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Network Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-4">
            Network Selection
          </label>
          <select
            value={network}
            onChange={(e) => handleNetworkChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 font-medium"
          >
            <option value="sepolia">Sepolia Testnet</option>
            <option value="mainnet">Ethereum Mainnet</option>
          </select>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Wallet Balance</h2>
          </div>
          <div className="flex gap-2">
            {network === 'sepolia' && (
              <button
                onClick={openFaucet}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Droplets size={16} />
                Faucet
              </button>
            )}
            <button
              onClick={fetchBalance}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-3xl font-bold text-blue-800">
            {loading ? '...' : `${parseFloat(balance).toFixed(6)} ETH`}
          </p>
          <p className="text-sm text-blue-600 mt-1 capitalize">{network === 'mainnet' ? 'Ethereum Mainnet' : 'Sepolia Testnet'}</p>
        </div>
      </div>

      {/* Send Transaction Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Send className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold">Send ETH</h2>
        </div>

        <form onSubmit={handleSendTransaction} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address *
              </label>
              <input
                type="text"
                value={sendForm.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    max={balance}
                    value={sendForm.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.001"
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange('amount', (parseFloat(balance) * 0.9).toFixed(6))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-xs hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Max
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {parseFloat(balance).toFixed(6)} ETH
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gas Limit
                </label>
                <input
                  type="number"
                  min="21000"
                  value={sendForm.gasLimit}
                  onChange={(e) => handleInputChange('gasLimit', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Standard: 21,000
                </p>
              </div>
            </div>
          </div>

          {network === 'mainnet' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5" size={16} />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Mainnet Transaction</p>
                  <p>This transaction will be sent on Ethereum Mainnet using real ETH. Double-check all details before proceeding.</p>
                </div>
              </div>
            </div>
          )}

          {network === 'sepolia' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Testnet Transaction</p>
                  <p>This transaction will be sent on Ethereum Sepolia testnet. Make sure you have testnet ETH for gas fees.</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || loading || parseFloat(balance) === 0}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {sending ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Sending Transaction...
              </>
            ) : (
              <>
                <Send size={16} />
                Send ETH
              </>
            )}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <TransactionHistory 
        walletAddress={walletData.publicKey}
        blockchain="ethereum"
        network={network}
      />
    </div>
  )
}

export default EthereumTransaction