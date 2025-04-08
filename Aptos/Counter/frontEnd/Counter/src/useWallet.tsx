import React, { useEffect, useState } from 'react'

const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [wallet, setWallet] = useState(null);

    
    useEffect(() => {
    const isPetraInstalled = window.aptos;
    const getAptosWallet = () => {
        if ('aptos' in window) {
          return window.aptos;
        } else {
          window.open('https://petra.app/', `_blank`);
        }
      };

    const wallet = getAptosWallet();
    const connectWallet = async () => {
            try {
            const response = await wallet.connect();
            
            const account = await wallet.account();
            setAccount(account);
            setWallet(response);
            } catch (error) {
                console.error(error);
            }
    }
    }, [])
    return { account, wallet }
}

export default useWallet