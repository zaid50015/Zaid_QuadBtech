import { useState, useEffect } from 'react'
import { Aptos, AptosConfig, Network, InputGenerateTransactionPayloadData } from "@aptos-labs/ts-sdk"
import useWallet from './useWallet'
import styles from './App.module.css'

function App() {
  const [count, setCount] = useState(0)
  const { account } = useWallet()
  const MODULE_ADDRESS = "0x1";
  const MODULE_NAME = "counter";
  const RESOURCE_TYPE = `${MODULE_ADDRESS}::${MODULE_NAME}::Counter`;

  const aptosConfig = new AptosConfig({ network: Network.DEVNET });
  const client = new Aptos(aptosConfig);
  const reFetchCount = async() => {
    const resource = await client.getAccountResource({
      accountAddress: account.address,
      resourceType: RESOURCE_TYPE
      })
    console.log(Number(resource));
  }

  useEffect(() => {
    const fetchCount = async() => {
      const resource = await client.getAccountResource({
        accountAddress: account.address,
        resourceType: RESOURCE_TYPE
        })
      console.log(Number(resource));
    }
    fetchCount();
  
  }, [])
  





  const increment = () => {
    const payload:  InputGenerateTransactionPayloadData  = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::initialize_counter`,
      typeArguments: [],
    };
    const transaction = await client.transaction.build.simple({
      sender: account.address,
      data:
    })
    setCount((prev) => prev + 1)
  }
  const decrement = () => setCount((prev) => prev - 1)
  const reset = () => setCount(0)

  return (
    account?.address?
    <div className={styles.container}>
      <div className={styles.counterWrapper}>
        <div className={styles.glowEffect}></div>
        <div className={styles.counterDisplay}>
          <span className={styles.counterValue}>{count}</span>
        </div>
        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.decrementButton}`} onClick={decrement}>
            -
          </button>
          <button className={`${styles.button} ${styles.resetButton}`} onClick={reset}>
            ↺
          </button>
          <button className={`${styles.button} ${styles.incrementButton}`} onClick={increment}>
            +
          </button>
        </div>
      </div>
    </div>
    :
    <div className={styles.container}>
      <button onClick={handleConnect}>Connect Wallet</button>
    </div>
  )
}

export default App
