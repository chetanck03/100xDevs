import React from 'react'
import Wallet from './Wallet/Wallet'

function Hero() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            WalletX
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Your secure, multi-blockchain wallet manager. Generate, store, and manage your crypto wallets with ease.
          </p>
        </div>
        <Wallet/>
      </div>
    </div>
  )
}

export default Hero