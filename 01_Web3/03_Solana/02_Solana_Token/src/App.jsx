import React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import Token from "./components/Token";

function App() {

  return (
    <>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider >
            <WalletMultiButton />
              <Token/>      
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>

  )
}

export default App