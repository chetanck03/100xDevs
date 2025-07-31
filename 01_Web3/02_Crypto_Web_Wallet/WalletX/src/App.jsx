import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import { generateMnemonic, mnemonicToSeedSync } from "bip39"
import { derivePath } from "ed25519-hd-key"
import { Keypair } from "@solana/web3.js"
import { ethers } from "ethers"
import nacl from "tweetnacl"

function App() {

  // Function to create Solana HD wallet
  const createSolanaWallet = (mnemonic = null, accountIndex = 0) => {
    try {
      // Generate or use provided mnemonic
      const seedPhrase = mnemonic || generateMnemonic()

      // Convert mnemonic to seed
      const seed = mnemonicToSeedSync(seedPhrase)

      // Derive path for Solana (coin type 501)
      const path = `m/44'/501'/${accountIndex}'/0'`
      const derivedSeed = derivePath(path, seed.toString("hex")).key

      // Generate keypair
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey
      const keypair = Keypair.fromSecretKey(secret)

      return {
        seedPhrase,
        publicKey: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(secret).toString('hex'),
        path
      }
    } catch (error) {
      console.error('Error creating Solana wallet:', error)
      return null
    }
  }

  // Function to create Ethereum HD wallet
  const createEthereumWallet = (mnemonic = null, accountIndex = 0) => {
    try {
      // Generate or use provided mnemonic
      const seedPhrase = mnemonic || generateMnemonic()

      // Create HD wallet from mnemonic
      const hdWallet = ethers.HDNodeWallet.fromPhrase(seedPhrase)

      // Derive path for Ethereum (coin type 60)
      const path = `m/44'/60'/${accountIndex}'/0/0`
      const derivedWallet = hdWallet.derivePath(path)

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-16">
        <Hero />
      </main>
      <Footer />
    </div>

  )
}

export default App
