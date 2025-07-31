import React, { useState, useEffect } from 'react'
import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Wallet, Send, RefreshCw, AlertCircle, Droplets } from 'lucide-react'
import toast from 'react-hot-toast'
import { Buffer } from 'buffer'
import TransactionHistory from './TransactionHistory'

function SolanaTransaction({ walletData }) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState('devnet')
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: ''
  })
  const [sending, setSending] = useState(false)

  const getConnection = () => {
    const mainnetUrl = import.meta.env.VITE_SOLANA_MAINNET_RPC_URL
    const devnetUrl = import.meta.env.VITE_SOLANA_DEVNET_RPC_URL

    // Fallback URLs in case environment variables are not loaded
    const fallbackMainnet = 'https://api.mainnet-beta.solana.com'
    const fallbackDevnet = 'https://api.devnet.solana.com'

    const rpcUrl = network === 'mainnet'
      ? (mainnetUrl || fallbackMainnet)
      : (devnetUrl || fallbackDevnet)

    if (!rpcUrl || (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://'))) {
      console.error('Invalid RPC URL:', rpcUrl)
      toast.error('Invalid RPC configuration')
      return null
    }

    return new Connection(rpcUrl, 'confirmed')
  }

  const fetchBalance = async () => {
    setLoading(true)
    try {
      const currentConnection = getConnection()
      if (!currentConnection) {
        throw new Error('Failed to create connection')
      }

      const publicKey = new PublicKey(walletData.publicKey)
      const balanceLamports = await currentConnection.getBalance(publicKey)
      const balanceSol = balanceLamports / LAMPORTS_PER_SOL
      setBalance(balanceSol)
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

    try {
      new PublicKey(sendForm.to)
    } catch {
      toast.error('Invalid recipient address')
      return
    }

    const amount = parseFloat(sendForm.amount)
    if (amount <= 0 || amount > balance) {
      toast.error('Invalid amount')
      return
    }

    setSending(true)
    try {
      // Create keypair from private key
      const privateKeyBuffer = Buffer.from(walletData.privateKey, 'hex')
      const keypair = Keypair.fromSecretKey(privateKeyBuffer)

      // Create recipient public key
      const recipientPubkey = new PublicKey(sendForm.to)

      // Get current connection
      const currentConnection = getConnection()
      if (!currentConnection) {
        throw new Error('Failed to create connection')
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL)
        })
      )

      // Get recent blockhash
      const { blockhash } = await currentConnection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = keypair.publicKey

      // Sign and send transaction
      const signature = await currentConnection.sendTransaction(transaction, [keypair])
      toast.success(`Transaction sent! Signature: ${signature}`)

      // Confirm transaction
      const confirmation = await currentConnection.confirmTransaction(signature, 'confirmed')
      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      toast.success('Transaction confirmed!')

      // Reset form and refresh balance
      setSendForm({ to: '', amount: '' })
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
    setSendForm({ to: '', amount: '' })
  }

  const openFaucet = () => {
    if (network === 'devnet') {
      window.open('https://faucet.solana.com/', '_blank')
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-800 font-medium"
          >
            <option value="devnet">Solana Devnet</option>
            <option value="mainnet">Solana Mainnet</option>
          </select>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wallet className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">Wallet Balance</h2>
          </div>
          <div className="flex gap-2">
            {network === 'devnet' && (
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-3xl font-bold text-purple-800">
            {loading ? '...' : `${balance.toFixed(6)} SOL`}
          </p>
          <p className="text-sm text-purple-600 mt-1 capitalize">{network === 'mainnet' ? 'Solana Mainnet' : 'Solana Devnet'}</p>
        </div>
      </div>

      {/* Send Transaction Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Send className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold">Send SOL</h2>
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
                placeholder="Base58 address..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (SOL) *
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
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('amount', (balance * 0.9).toFixed(6))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 text-xs hover:text-purple-800 bg-purple-50 px-2 py-1 rounded"
                >
                  Max
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {balance.toFixed(6)} SOL
              </p>
            </div>
          </div>

          {network === 'mainnet' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5" size={16} />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Mainnet Transaction</p>
                  <p>This transaction will be sent on Solana Mainnet using real SOL. Double-check all details before proceeding.</p>
                </div>
              </div>
            </div>
          )}

          {network === 'devnet' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Devnet Transaction</p>
                  <p>This transaction will be sent on Solana Devnet. Make sure you have devnet SOL for transaction fees.</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || loading || balance === 0}
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
                Send SOL
              </>
            )}
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <TransactionHistory 
        walletAddress={walletData.publicKey}
        blockchain="solana"
        network={network}
      />
    </div>
  )
}

export default SolanaTransaction