import { useState } from 'react';
import "./Center.css";
const Mint=({state})=>{
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
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
      setPopupMessage('Transaction is successful');
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
      <div className="center">
       <h1>Faucet</h1>
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