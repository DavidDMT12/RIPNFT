import "./Bottom.css";
import { useState } from 'react';

const Claim = ({ state }) => {
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
      window.location.reload();
    }
  };

  const claimOwner = async (event) => {
    event.preventDefault();
    const { contract2 } = state;
    try {
      const transaction = await contract2.takeProfits(); //change this
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
  };

  const takeProfits = async (event) => {
    event.preventDefault();
    const { contract2 } = state;
    try {
      const transaction = await contract2.claimDAI();
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
  };

  return (
    <div className="bottom">
      <div className="tooltip">
        <h1>Claim Profits</h1>
        <span className="tooltiptext">
          <p>
            Claim profits as creator or protocol owner. 
          </p>
        </span>
      </div>

      <form onSubmit={takeProfits}>
        <div className="inputbox">
          <input type="submit" value="Claim creator" disabled={!state.contract} />
        </div>
      </form>

      <form onSubmit={claimOwner}>
        <div className="inputbox">
          <input type="submit" value="Claim owner" disabled={!state.contract} />
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
};

export default Claim;