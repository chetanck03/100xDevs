## wallet setup :

```
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
```

## Solana Token :

- Notes: https://petal-estimate-4e9.notion.site/Token-launchpad-in-react-f0027bd023d4467ab5eb87d16ab21b40


## Tokens dependiences:

```
# Installing dependencies

## Adding functionality to create tokens

- Install dependencies
    
    ```jsx
    npm install @solana/spl-token @solana/web3.js
    ```
    
- Add polyfills to ensure a few `node apis` are available in the browser
    
    ```jsx
    npm install --save-dev vite-plugin-node-polyfills
    ```
    
- Add the plugin to your `vite.config.ts` file.
    
    ```jsx
    import { defineConfig } from 'vite'
    import { nodePolyfills } from 'vite-plugin-node-polyfills'
    
    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [
        nodePolyfills(),
      ],
    })
    ```
    
- Add `onclick` handler in `TokenLaunchpad.jsx`
    
    ```jsx
    
    export function TokenLaunchpad() {
    
        function createToken() {
            const name = document.getElementById('name').value;
            const symbol = document.getElementById('symbol').value;
            const image = document.getElementById('image').value;
            const initialSupply = document.getElementById('initialSupply').value;
        }
    
        return  <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>
            <h1>Solana Token Launchpad</h1>
            <input className='inputText' type='text' placeholder='Name'></input> <br />
            <input className='inputText' type='text' placeholder='Symbol'></input> <br />
            <input className='inputText' type='text' placeholder='Image URL'></input> <br />
            <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
            <button onClick={createToken} className='btn'>Create a token</button>
        </div>
    }
    ```
    

## Wallet adapter vs local wallet

<aside>
💡

Do you think we should use the `createMint` function to create the token mint?
Like we did here - [https://www.notion.so/Equivalent-code-in-JS-afed3cf599d64ee5bae4cc05a7b9f346](https://www.notion.so/Equivalent-code-in-JS-afed3cf599d64ee5bae4cc05a7b9f346?pvs=21) ?

```jsx
const { createMint } = require('@solana/spl-token');
const mint = await createMint(
        connection,
        payer,
        mintAuthority,
        null,
        6,
        TOKEN_PROGRAM_ID
);
```

</aside>

Since we want an `end user` to create their own token, pay for gas for creating that token, we need to ask `THEIR WALLET` for approval to create a token. We `CANT` create our own `KeyPair` and create a token using it.

```
