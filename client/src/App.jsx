import { useState, useEffect } from 'react';
import FDAIabi from "./contractJson/FakeDAI.json";
import RIPabi from "./contractJson/RIPNFT.json";

import { ethers } from "ethers";
import Table from './components/Table'
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
  const [balanceF, setBalanceF] = useState(null); // State variable for balanceF
  const [balanceDAI, setBalanceDAI] = useState(null);

  useEffect(() => {
    const template = async () => {
      const FDAIAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
      const RIPAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
      const FDAIABI = FDAIabi.abi;
      const RIPABI = RIPabi.abi;
      //Metamask part
      //1. In order do transactions on goerli testnet
      //2. Metmask consists of infura api which actually help in connectig to the blockhain
      try {
        const { ethereum } = window;
        const account = await ethereum.request({
          method: "eth_requestAccounts"
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        setAccount(account[0]);
        const provider = new ethers.providers.Web3Provider(ethereum); //read the Blockchain
        const signer = provider.getSigner(); //write the blockchain

        const contract = new ethers.Contract(
          FDAIAddress,
          FDAIABI,
          signer
        );
        const contract2 = new ethers.Contract(
          RIPAddress,
          RIPABI,
          signer
        );

        const balanceF = await contract2.balanceOf(account[0], 0);
        setBalanceF(balanceF.toString()); // Set balanceF to state variable
        console.log("BalanceF:", balanceF.toString());

        const balanceDAI = await contract.balanceOf(account[0]);
        setBalanceDAI(balanceDAI.toString()); // Set balanceF to state variable
        console.log("BalanceDAI:", balanceDAI.toString());

        console.log(contract);
        console.log(contract2);
        setState({ provider, signer, contract, contract2 });

      } catch (error) {
        console.log(error);
      }
    };
    template();
  }, []);

  return (
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
  );
}

export default App;
