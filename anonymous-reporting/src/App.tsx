import { useState } from 'react';
import { FhevmProvider } from '@fhevm-template/sdk';
import { ethers } from 'ethers';
import Header from './components/Header';
import ConnectionStatus from './components/ConnectionStatus';
import Tabs from './components/Tabs';
import ReportTab from './components/ReportTab';
import TrackTab from './components/TrackTab';
import InvestigateTab from './components/InvestigateTab';
import StatsTab from './components/StatsTab';

function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const fhevmConfig = {
    network: {
      chainId: 11155111, // Sepolia testnet
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    },
  };

  return (
    <FhevmProvider config={fhevmConfig}>
      <div className="container">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ConnectionStatus isConnected={isConnected} account={account} onConnect={connectWallet} />

        {activeTab === 'report' && <ReportTab signer={signer} isConnected={isConnected} />}
        {activeTab === 'track' && <TrackTab provider={provider} />}
        {activeTab === 'investigate' && <InvestigateTab signer={signer} isConnected={isConnected} />}
        {activeTab === 'stats' && <StatsTab provider={provider} />}
      </div>
    </FhevmProvider>
  );
}

export default App;
