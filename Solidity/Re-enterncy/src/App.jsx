import { useEffect, useState } from "react";
import { ethers } from "ethers";
import VulnerableBankABI from "./abis/VulnerableBank.json";
import SafeBankABI from "./abis/SafeBank.json";
import AttackerABI from "./abis/Attacker.json";

const VULNERABLE_BANK_ADDRESS = "0xa7EA68a204D112eF1AaA05c23d9336B2548FBd16";
const SAFE_BANK_ADDRESS = "0x014e294a4cFa66eC86AbE3c3601bE173d6edD61e";
const ATTACKER_ADDRESS = "0x21E6dfA56698D3881076D57c4c54182cC0Cb6E8b";

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [vulnerableBank, setVulnerableBank] = useState(null);
  const [safeBank, setSafeBank] = useState(null);
  const [attacker, setAttacker] = useState(null);
  const [vulnerableBalance, setVulnerableBalance] = useState("0");
  const [safeBalance, setSafeBalance] = useState("0");

  useEffect(() => {
    const load = async () => {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask and refresh.");
        return;
      }
      
      try {
        const prov = new ethers.providers.Web3Provider(window.ethereum);
        await prov.send("eth_requestAccounts", []);
        const signer = prov.getSigner();
        setProvider(prov);
        setSigner(signer);

        // Instantiate contracts
        const vb = new ethers.Contract(VULNERABLE_BANK_ADDRESS, VulnerableBankABI, signer);
        const sb = new ethers.Contract(SAFE_BANK_ADDRESS, SafeBankABI, signer);
        const at = new ethers.Contract(ATTACKER_ADDRESS, AttackerABI, signer);

        setVulnerableBank(vb);
        setSafeBank(sb);
        setAttacker(at);

        const userAddress = await signer.getAddress();
        const vbBal = await vb.balances(userAddress);
        const sbBal = await sb.balances(userAddress);
        setVulnerableBalance(ethers.utils.formatEther(vbBal));
        setSafeBalance(ethers.utils.formatEther(sbBal));
      } catch (error) {
        console.error("Error loading provider or contracts:", error);
      }
    };
    load();
  }, []);

  const handleDeposit = async (bankContract) => {
    if (!bankContract) {
      alert("Contract not loaded yet!");
      return;
    }
    try {
      const tx = await bankContract.deposit({ value: ethers.utils.parseEther("0.001") });
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async (bankContract) => {
    if (!bankContract) {
      alert("Contract not loaded yet!");
      return;
    }
    try {
      const tx = await bankContract.withdraw();
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const handleAttack = async () => {
    if (!attacker) {
      alert("Attacker contract not loaded yet!");
      return;
    }
    try {
      const tx = await attacker.attack({ value: ethers.utils.parseEther("0.001") });
      await tx.wait();
      window.location.reload();
    } catch (error) {
      console.error("Attack failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">🧨 Reentrancy Attack Simulator</h1>

      {/* Vulnerable Bank Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-red-600">Vulnerable Bank</h2>
        <p className="text-gray-700 mb-4">Balance: {vulnerableBalance} ETH</p>
        <button
          onClick={() => handleDeposit(vulnerableBank)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full mb-2"
        >
          Deposit 0.001 ETH
        </button>
        <button
          onClick={() => handleWithdraw(vulnerableBank)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Withdraw
        </button>
      </div>

      {/* Safe Bank Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-green-600">Safe Bank</h2>
        <p className="text-gray-700 mb-4">Balance: {safeBalance} ETH</p>
        <button
          onClick={() => handleDeposit(safeBank)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full mb-2"
        >
          Deposit 0.001 ETH
        </button>
        <button
          onClick={() => handleWithdraw(safeBank)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full"
        >
          Withdraw
        </button>
      </div>

      {/* Attack Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-yellow-600">⚠️ Attacker</h2>
        <p className="text-gray-700 mb-4">Simulate attack on VulnerableBank</p>
        <button
          onClick={handleAttack}
          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg w-full"
        >
          Attack (0.001 ETH)
        </button>
      </div>
    </div>
  );
}
