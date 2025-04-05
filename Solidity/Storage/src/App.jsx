import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAbi from './abi.json';
import './App.css';

const CONTRACT_ADDRESS = '0x3E0d0Cb98388a743EaADbfA2032148c413516CFE';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const isWalletConnected = !!account;

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_requestAccounts', []);
          setAccount(accounts[0]);
          const signer = await provider.getSigner();
          setContract(new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer));
        } catch (error) {
          console.error('Error connecting wallet:', error);
        }
      }
    };
    connectWallet();
  }, []);

  const executeTransaction = async (type, args, method) => {
    if (!contract) return;
    
    setLoading(true);
    const transactionId = Date.now();
    
    try {
      setResults(prev => [...prev, {
        id: transactionId,
        type,
        args,
        gasUsed: 'Calculating...',
        transactionHash: 'Pending...',
        status: 'pending'
      }]);

      const tx = await method(...args);
      
      setResults(prev => prev.map(item => 
        item.id === transactionId ? { ...item, transactionHash: tx.hash } : item
      ));

      const receipt = await tx.wait();
      const eventLog = receipt.logs.find(log => 
        contract.interface.parseLog(log)?.name === 'GasUsed'
      );
      const parsedLog = contract.interface.parseLog(eventLog);

      setResults(prev => prev.map(item =>
        item.id === transactionId ? { 
          ...item, 
          gasUsed: `${parsedLog.args.gasUsed.toString()} gas`,
          status: 'completed'
        } : item
      ));
    } catch (error) {
      setResults(prev => prev.filter(item => item.id !== transactionId));
      console.error('Transaction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateString = (str, start = 6, end = 4) => 
    str ? `${str.slice(0, start)}...${str.slice(-end)}` : '';

  return (
    <div className="App">
      <header>
        <h1>Gas Fee Comparison DApp</h1>
        <div className="wallet-info">
          <p>Connected Account: {truncateString(account) || 'None'}</p>
          <p>Contract Address: {truncateString(CONTRACT_ADDRESS)}</p>
        </div>
      </header>

      <main>
        <section className="transaction-section">
          <h2>Execute Transactions</h2>
          
          {!isWalletConnected && (
            <div className="wallet-warning">
              🔐 Connect your wallet to interact with the contract
            </div>
          )}

          <div className="button-group">
            <button
              className="transaction-button"
              disabled={!isWalletConnected || loading}
              onClick={() => executeTransaction('simple', [], contract.simpleTransaction)}
            >
              Simple Transaction
            </button>

            <button
              className="transaction-button"
              disabled={!isWalletConnected || loading}
              onClick={() => executeTransaction('storage', [68, "test"], contract.storageTransaction)}
            >
              Storage Transaction
            </button>

            <button
              className="transaction-button"
              disabled={!isWalletConnected || loading}
              onClick={() => executeTransaction('memory', [[1,2,3,4,5]], contract.memoryTransaction)}
            >
              Memory Transaction
            </button>
          </div>
        </section>

        <section className="results-section">
          <h2>Transaction Results</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Arguments</th>
                  <th>Gas Used</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className={result.status}>
                    <td>{result.type}</td>
                    <td>{JSON.stringify(result.args)}</td>
                    <td>{result.gasUsed}</td>
                    <td>
                      {result.transactionHash.startsWith('0x') ? (
                        <a
                          href={`https://etherscan.io/tx/${result.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {truncateString(result.transactionHash)}
                        </a>
                      ) : (
                        result.transactionHash
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;