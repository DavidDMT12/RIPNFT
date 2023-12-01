import { useState } from 'react';
import "./Top.css";
const Mint=({state})=>{
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'FDAI minted successfully!') {
      window.location.reload();
    }
  };


    const mintDAI = async(event)=>{
      event.preventDefault();
      const {contract}=state;
      const address = document.querySelector("#address").value;
      const amount = document.querySelector("#amount").value;
      try{
      const transaction = await contract.mint(address, amount)
      await transaction.wait();
      setPopupMessage('FDAI minted successfully!');
    } catch (error) {
      if (error.data && error.data.message) {
        setPopupMessage(`Transaction failed: ${error.data.message}`);
      } else {
        console.error(error); // Log any other unexpected errors to the console
        setPopupMessage('Transaction failed for an unexpected reason');
      }
    }
      
    }
    return  (
      <div className="top">
       <div className="tooltip">
        <h1>Faucet</h1>
        <span className="tooltiptext">
          <p>
            This component is used for minting FakeDAI. Input the address you want to mint to and the amount. No decimals implemented yet.
          </p>
        </span>
      </div>
        <form onSubmit={mintDAI}>
          <div className="inputbox">
            <input type="text" required="required" id="address" />
            <span>Address</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="amount" />
            <span>Amount</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Mint"  disabled={!state.contract}/>
          </div>
        </form>

        {popupMessage && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handlePopupClose}>
              &times;
            </span>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
        </div>
      );
}
export default Mint;