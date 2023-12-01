import { useState } from 'react';
import "./Center.css";
const NFT=({state})=>{
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'NFT Minted') {
      window.location.reload();
    }
  };

    const getNFT = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const eventid = document.querySelector("#eventid").value;
      try{
      const transaction = await contract2.mintNFT(eventid)
      await transaction.wait();
      setPopupMessage('NFT Minted');
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
       <div className="tooltip">
        <h1>Mint NFT</h1>
        <span className="tooltiptext">
          <p>
           Input an event you are a supporter of to mint your NFT. 
          </p>
        </span>
      </div>
        <form onSubmit={getNFT}>
          <div className="inputbox">
            <input type="text" required="required" id="eventid" />
            <span>Eventid</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Mint NFT"  disabled={!state.contract}/>
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
export default NFT;