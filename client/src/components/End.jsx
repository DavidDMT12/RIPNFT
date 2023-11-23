import "./Center.css";
import { useState } from 'react';

const End = ({ state }) => {
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
      window.location.reload();
    }
  };

  const endEvent = async (event) => {
    event.preventDefault();
    const { contract2 } = state;
    const id = document.querySelector("#id").value;
    try {
      const transaction = await contract2.endEvent(id);
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
    <div className="center">
      <h1>End Event </h1>
      <form onSubmit={endEvent}>
        <div className="inputbox">
          <input type="text" required="required" id="id" />
          <span>Event Id</span>
        </div>
        <div className="inputbox">
          <input type="submit" value="End Event" disabled={!state.contract} />
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

export default End;