import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from '@emotion/styled';

interface Transaction {
  hash: string;
  gasFee: string;
  status: 'pending' | 'confirmed';
}

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  font-family: Arial, sans-serif;
  padding: 1rem;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #6c5ce7;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Button = styled.button`
  background: #6c5ce7;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s;

  &:hover {
    background: #5a4fcf;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TransactionList = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }

  a {
    text-decoration: none;
    color: #6c5ce7;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const GasFeeTracker = () => {
  const [account, setAccount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const contractAddress = "0x00Acd1141b964c0e06455F81c6aFfd15b4d69f46";
  const abi = [
    {
      "inputs": [],
      "name": "makeTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "gasUsed", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
      ],
      "name": "TransactionMade",
      "type": "event"
    }
  ];

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask or another Ethereum wallet extension is required.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const makeTransaction = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const pendingTx = { hash: 'pending-' + Date.now(), gasFee: '0', status: 'pending' };
      setTransactions(prev => [...prev, pendingTx]);

      const tx = await contract.makeTransaction();
      const receipt = await tx.wait();

      setTransactions(prev => prev.map(t =>
        t.hash.startsWith('pending')
          ? { hash: tx.hash, gasFee: receipt.gasUsed.toString(), status: 'confirmed' }
          : t
      ));
    } catch (error) {
      console.error("Transaction failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Gas Fee Tracker</Title>
      
      {!account ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <>
          <Button onClick={makeTransaction} disabled={loading}>
            {loading ? 'Processing...' : 'Make Transaction'}
          </Button>

          <h2 style={{ textAlign: "center", marginTop: "1rem" }}>Transaction History</h2>
          <TransactionList>
            {transactions.map((tx, index) => (
              <TransactionItem key={tx.hash}>
                <div>
                  <span style={{ color: '#6c5ce7', marginRight: '8px' }}>✔️</span>
                  {tx.hash.startsWith('0x') ? (
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tx.hash.slice(0, 10)}...
                    </a>
                  ) : (
                    <span>Pending...</span>
                  )}
                </div>
                <div>
                  <span>{ethers.formatUnits(tx.gasFee, 'wei')} wei</span>
                </div>
              </TransactionItem>
            ))}
          </TransactionList>
        </>
      )}
    </Container>
  );
};

export default GasFeeTracker;
