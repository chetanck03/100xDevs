import React, { useState, useEffect } from 'react'
import { ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

function TransactionHistory({ walletAddress, blockchain, network }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      if (blockchain === 'ethereum') {
        await fetchEthereumTransactions()
      } else if (blockchain === 'solana') {
        await fetchSolanaTransactions()
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transaction history')
    } finally {
      setLoading(false)
    }
  }

  const fetchEthereumTransactions = async () => {
    try {
      const rpcUrl = network === 'mainnet' 
        ? import.meta.env.VITE_ETHEREUM_MAINNET_RPC_URL 
        : import.meta.env.VITE_ETHEREUM_SEPOLIA_RPC_URL

      // Fetch both sent and received transactions
      const [sentResponse, receivedResponse] = await Promise.all([
        // Sent transactions
        fetch(`${rpcUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromBlock: '0x0',
              toBlock: 'latest',
              fromAddress: walletAddress,
              category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
              withMetadata: true,
              excludeZeroValue: true,
              maxCount: '0x14'
            }]
          })
        }),
        // Received transactions
        fetch(`${rpcUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 2,
            jsonrpc: '2.0',
            method: 'alchemy_getAssetTransfers',
            params: [{
              fromBlock: '0x0',
              toBlock: 'latest',
              toAddress: walletAddress,
              category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
              withMetadata: true,
              excludeZeroValue: true,
              maxCount: '0x14'
            }]
          })
        })
      ])

      const [sentData, receivedData] = await Promise.all([
        sentResponse.json(),
        receivedResponse.json()
      ])
      
      const allTransfers = []
      
      // Process sent transactions
      if (sentData.result && sentData.result.transfers) {
        sentData.result.transfers.forEach(tx => {
          allTransfers.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: parseFloat(tx.value || 0),
            asset: tx.asset || 'ETH',
            tokenSymbol: tx.asset || 'ETH',
            timestamp: new Date(tx.metadata.blockTimestamp).getTime(),
            type: 'sent',
            status: 'confirmed',
            blockNumber: parseInt(tx.blockNum, 16),
            category: tx.category
          })
        })
      }
      
      // Process received transactions
      if (receivedData.result && receivedData.result.transfers) {
        receivedData.result.transfers.forEach(tx => {
          allTransfers.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: parseFloat(tx.value || 0),
            asset: tx.asset || 'ETH',
            tokenSymbol: tx.asset || 'ETH',
            timestamp: new Date(tx.metadata.blockTimestamp).getTime(),
            type: 'received',
            status: 'confirmed',
            blockNumber: parseInt(tx.blockNum, 16),
            category: tx.category
          })
        })
      }
      
      // Remove duplicates and sort by timestamp
      const uniqueTransactions = allTransfers.filter((tx, index, self) => 
        index === self.findIndex(t => t.hash === tx.hash && t.from === tx.from && t.to === tx.to)
      )
      
      setTransactions(uniqueTransactions.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('Error fetching Ethereum transactions:', error)
      setTransactions([])
    }
  }

  const fetchSolanaTransactions = async () => {
    try {
      const rpcUrl = network === 'mainnet' 
        ? import.meta.env.VITE_SOLANA_MAINNET_RPC_URL 
        : import.meta.env.VITE_SOLANA_DEVNET_RPC_URL

      // First, get transaction signatures
      const signaturesResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [walletAddress, { limit: 10 }] // Reduced limit for detailed fetching
        })
      })

      const signaturesData = await signaturesResponse.json()
      
      if (!signaturesData.result || signaturesData.result.length === 0) {
        setTransactions([])
        return
      }

      // Get detailed transaction information for each signature
      const detailedTransactions = await Promise.all(
        signaturesData.result.slice(0, 10).map(async (txSig) => {
          try {
            const txResponse = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [
                  txSig.signature,
                  {
                    encoding: 'jsonParsed',
                    maxSupportedTransactionVersion: 0
                  }
                ]
              })
            })

            const txData = await txResponse.json()
            
            if (!txData.result) return null

            const transaction = txData.result
            const meta = transaction.meta
            const message = transaction.transaction.message
            
            // Calculate SOL transfer amount
            let solAmount = 0
            let transferType = 'unknown'
            let fromAddress = ''
            let toAddress = ''

            // Check for SOL transfers in pre/post balances
            if (meta && meta.preBalances && meta.postBalances) {
              const accountKeys = message.accountKeys.map(key => 
                typeof key === 'string' ? key : key.pubkey
              )
              
              const walletIndex = accountKeys.findIndex(key => key === walletAddress)
              
              if (walletIndex !== -1) {
                const preBalance = meta.preBalances[walletIndex] || 0
                const postBalance = meta.postBalances[walletIndex] || 0
                const balanceChange = (postBalance - preBalance) / 1000000000 // Convert lamports to SOL
                
                if (balanceChange !== 0) {
                  solAmount = Math.abs(balanceChange)
                  transferType = balanceChange > 0 ? 'received' : 'sent'
                  
                  // Try to find the other party in the transaction
                  if (transferType === 'sent') {
                    fromAddress = walletAddress
                    // Find account with positive balance change
                    for (let i = 0; i < meta.preBalances.length; i++) {
                      const change = (meta.postBalances[i] - meta.preBalances[i]) / 1000000000
                      if (change > 0 && accountKeys[i] !== walletAddress) {
                        toAddress = accountKeys[i]
                        break
                      }
                    }
                  } else {
                    toAddress = walletAddress
                    // Find account with negative balance change
                    for (let i = 0; i < meta.preBalances.length; i++) {
                      const change = (meta.postBalances[i] - meta.preBalances[i]) / 1000000000
                      if (change < 0 && accountKeys[i] !== walletAddress) {
                        fromAddress = accountKeys[i]
                        break
                      }
                    }
                  }
                }
              }
            }

            return {
              hash: txSig.signature,
              from: fromAddress || 'Unknown',
              to: toAddress || 'Unknown',
              value: solAmount,
              asset: 'SOL',
              tokenSymbol: 'SOL',
              timestamp: (txSig.blockTime || 0) * 1000,
              type: transferType,
              status: txSig.err ? 'failed' : 'confirmed',
              blockNumber: txSig.slot,
              fee: meta ? (meta.fee / 1000000000) : 0 // Convert lamports to SOL
            }
          } catch (error) {
            console.error('Error fetching transaction details:', error)
            return {
              hash: txSig.signature,
              from: 'Unknown',
              to: 'Unknown',
              value: 0,
              asset: 'SOL',
              tokenSymbol: 'SOL',
              timestamp: (txSig.blockTime || 0) * 1000,
              type: 'unknown',
              status: txSig.err ? 'failed' : 'confirmed',
              blockNumber: txSig.slot,
              fee: 0
            }
          }
        })
      )

      // Filter out null results and sort by timestamp
      const validTransactions = detailedTransactions
        .filter(tx => tx !== null)
        .sort((a, b) => b.timestamp - a.timestamp)

      setTransactions(validTransactions)
    } catch (error) {
      console.error('Error fetching Solana transactions:', error)
      setTransactions([])
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchTransactions()
    }
  }, [walletAddress, blockchain, network])

  const openExplorer = (hash) => {
    let explorerUrl = ''
    
    if (blockchain === 'ethereum') {
      if (network === 'mainnet') {
        explorerUrl = `https://etherscan.io/tx/${hash}`
      } else {
        explorerUrl = `https://sepolia.etherscan.io/tx/${hash}`
      }
    } else if (blockchain === 'solana') {
      if (network === 'mainnet') {
        explorerUrl = `https://explorer.solana.com/tx/${hash}`
      } else {
        explorerUrl = `https://explorer.solana.com/tx/${hash}?cluster=devnet`
      }
    }
    
    window.open(explorerUrl, '_blank')
  }

  const formatValue = (value, tokenSymbol = null) => {
    if (value === 0) return '0'
    
    const symbol = tokenSymbol || (blockchain === 'ethereum' ? 'ETH' : 'SOL')
    
    // Format based on value size - avoid scientific notation
    if (value >= 1) {
      return `${value.toFixed(4)} ${symbol}`
    } else if (value >= 0.001) {
      return `${value.toFixed(6)} ${symbol}`
    } else if (value >= 0.000001) {
      return `${value.toFixed(8)} ${symbol}`
    } else if (value >= 0.000000001) {
      return `${value.toFixed(12)} ${symbol}`
    } else {
      // For extremely small values, show with appropriate decimal places
      return `${value.toFixed(18)} ${symbol}`
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 font-medium"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-500">No transactions found</p>
          <p className="text-sm text-gray-400 mt-1">
            Transactions will appear here once you send or receive {blockchain === 'ethereum' ? 'ETH' : 'SOL'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={tx.hash || index}
              className="group flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-300 transition-all duration-200 cursor-pointer hover:shadow-md"
              onClick={() => openExplorer(tx.hash)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full transition-colors ${
                  tx.type === 'sent' 
                    ? 'bg-red-100 text-red-600 group-hover:bg-red-200' 
                    : tx.type === 'received'
                    ? 'bg-green-100 text-green-600 group-hover:bg-green-200'
                    : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                }`}>
                  {tx.type === 'sent' ? (
                    <ArrowUpRight size={18} />
                  ) : tx.type === 'received' ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <ExternalLink size={18} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 capitalize">
                      {tx.type === 'unknown' ? 'Transaction' : tx.type}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{formatDate(tx.timestamp)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {tx.hash?.slice(0, 8)}...{tx.hash?.slice(-6)}
                    </span>
                  </div>
                  
                  {tx.value > 0 && (tx.from !== 'Unknown' || tx.to !== 'Unknown') && (
                    <div className="text-xs text-gray-500 mt-1">
                      {tx.type === 'sent' ? 'To: ' : 'From: '}
                      <span className="font-mono bg-gray-50 px-1 rounded">
                        {tx.type === 'sent' 
                          ? `${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`
                          : `${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  {tx.value > 0 ? (
                    <div>
                      <p className={`font-bold text-lg ${
                        tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}{formatValue(tx.value, tx.tokenSymbol)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {tx.type === 'sent' ? 'Sent' : 'Received'}
                        {tx.fee && tx.fee > 0 && (
                          <span className="block text-gray-400">
                            Fee: {formatValue(tx.fee, tx.tokenSymbol)}
                          </span>
                        )}
                      </p>
                    </div>
                  ) : tx.type === 'unknown' && tx.status === 'confirmed' ? (
                    <div>
                      <p className="text-blue-600 font-medium">Contract Call</p>
                      <p className="text-xs text-gray-500 mt-1">
                        No token transfer
                        {tx.fee && tx.fee > 0 && (
                          <span className="block text-gray-400">
                            Fee: {formatValue(tx.fee, tx.tokenSymbol)}
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-600 font-medium">View Details</p>
                      <p className="text-xs text-gray-500 mt-1">Click to explore</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-blue-500 group-hover:text-blue-600 transition-colors">
                  <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TransactionHistory