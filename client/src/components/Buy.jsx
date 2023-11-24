import "./Top.css";
import { useState } from 'react';

const Buy = ({ state }) => {

  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
      window.location.reload();
    }
  };

  const buyF = async (event) => {
    event.preventDefault();
    const { contract } = state;
    const { contract2 } = state;
    const amount1 = document.querySelector("#amount1").value;
    try {
      const approval = await contract.approve('0x5FC8d32690cc91D4c39d9d3abcBD16989F875707', amount1);
      await approval.wait();
      const transaction = await contract2.getFcoins(amount1)
      await transaction.wait();
      setPopupMessage("Transaction is successful"); // Update popup message
      window.location.reload();
    } catch (error) {
      if (error.data && error.data.message) {
        setPopupMessage(`Transaction failed: ${error.data.message}`);
      } else {
        console.error(error); // Log any other unexpected errors to the console
        setPopupMessage('Transaction failed for an unexpected reason');
      }
    }
  }

  return (
    <div className="top">
      <h1>GetFcoins</h1>
      <form onSubmit={buyF}>
        <div className="inputbox">
          <input type="text" required="required" id="amount1" />
          <span>Amount</span>
        </div>
        <div className="inputbox">
          <input type="submit" value="Buy" disabled={!state.contract} />
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
export default Buy;