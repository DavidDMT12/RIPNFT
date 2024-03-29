import React, { useState, useEffect } from 'react';
import FDAIabi from "./contractJson/FakeDAI.json";
import RIPabi from "./contractJson/RIPNFT.json";
import { ethers } from "ethers";
import Table from './components/Table';
import Mint from './components/Mint';
import Buy from './components/Buy';
import Event from './components/Event';
import End from './components/End';
import NFT from './components/NFT';
import Pay from './components/Pay';
import Claim from './components/Claim';
import Display from './components/Display';
import './App.css';
import img from './assets/FCoin.svg';

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    contract2: null
  });
  const [account, setAccount] = useState('Not connected');
  const [balanceF, setBalanceF] = useState(null);
  const [balanceDAI, setBalanceDAI] = useState(null);
  const [showNoWalletMessage, setShowNoWalletMessage] = useState(false);

  useEffect(() => {
    const template = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          setShowNoWalletMessage(true); // Show message when no MetaMask wallet is detected
          return;
        }

        const FDAIAddress = "0x3042EC71201Df1A9aE4A2285371802F6efeC1a42";
        const RIPAddress = "0x9FfBa46bc75c4924598a14C2b9b415993464E973";
        const FDAIABI = FDAIabi.abi;
        const RIPABI = RIPabi.abi;

        const account = await ethereum.request({
          method: "eth_requestAccounts"
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        setAccount(account[0]);
        const provider = new ethers.providers.Web3Provider(ethereum); // Read the Blockchain
        const signer = provider.getSigner(); // Write the blockchain

        const contract = new ethers.Contract(FDAIAddress, FDAIABI, signer);
        const contract2 = new ethers.Contract(RIPAddress, RIPABI, signer);

        const balanceF = await contract2.balanceOf(account[0], 0);
        setBalanceF(balanceF.toString());

        const balanceDAI = await contract.balanceOf(account[0]);
        setBalanceDAI(balanceDAI.toString());

        setState({ provider, signer, contract, contract2 });

      } catch (error) {
        console.error(error);
        setShowNoWalletMessage(true); // Set showNoWalletMessage to true in case of an error
      }
    };

    template();
  }, []);

  return (
    <div>
      {showNoWalletMessage ? (
        <div className="no-wallet-message">
          <h1>RIPNFT</h1>
          <p>No MetaMask wallet detected</p>
          <p>Please install MetaMask and log in to interact with this application</p>
          <img src={img} alt="FCoin Logo" className="fcoin-logo" />
        </div>
      ) : (
        <div>
          <div className="header">
            <h1>RIPNFT</h1>
            <p className="account-info">
              <small>Connected Account - {account}</small>
            </p>
            <p className="account-info">
              <small>BalanceF - {balanceF}</small>
              {/* Display balanceF */}
            </p>
            <p className="account-info">
              <small>BalanceDAI - {balanceDAI}</small>
              {/* Display balanceDAI */}
            </p>
            <img src={img} alt="FCoin Logo" className="fcoin-logo" />
          </div>
    
          <div className="section-with-border" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Mint state={state} />
            <Buy state={state} />
            <Pay state={state} />
          </div>
          <div className="section-with-border" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Event state={state} />
            <End state={state} />
            <NFT state={state} />
          </div>
          <div className="section-with-border" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Claim state={state} />
          </div>
          <div className="section-with-border" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Table state={state} />
          </div>
          <div className="section-with-border" style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Display state={state} />
          </div>
          </div>
      )}
    </div>
  );
}

export default App;

