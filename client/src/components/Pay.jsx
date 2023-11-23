import { useState } from 'react';
import "./Top.css";

const Pay=({state})=>{

  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
      window.location.reload();
    }
  };

    const payRes = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const evid = document.querySelector("#evid").value;
      const tip = document.querySelector("#tip").value;
      try {
      const transaction = await contract2.payRespects(evid, tip);
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
      <div className="top">
       <h1>Pay Respects</h1>
        <form onSubmit={payRes}>
          <div className="inputbox">
            <input type="text" required="required" id="evid" />
            <span>EventID</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="tip" />
            <span>Tip</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Pay Respects"  disabled={!state.contract}/>
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
export default Pay;