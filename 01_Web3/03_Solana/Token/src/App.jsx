import React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Hero from "./components/Hero"
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {

  return (
    <>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider >
            <WalletMultiButton />

            <Hero />

          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>

  )
}

export default App
