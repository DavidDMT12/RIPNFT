import "./Center.css";
import { useState } from 'react'; 

const Event = ({ state }) => {
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Transaction is successful') {
      window.location.reload();
    }
  };

  const startEvent = async (event) => {
    event.preventDefault();
    const { contract2 } = state;
    const name = document.querySelector("#name").value;
    const uri = document.querySelector("#uri").value;
    const duration = document.querySelector("#duration").value;
    const mintip = document.querySelector("#mintip").value;
    try {
      const transaction = await contract2.startEvent(name, uri, duration, mintip);
      await transaction.wait();
      setPopupMessage('Transaction is successful');
      window.location.reload();
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
      <h1>Start Event </h1>
      <form onSubmit={startEvent}>
        <div className="inputbox">
          <input type="text" required="required" id="name" />
          <span>Name</span>
        </div>
        <div className="inputbox">
          <input type="text" required="required" id="uri" />
          <span>URI</span>
        </div>
        <div className="inputbox">
          <input type="text" required="required" id="duration" />
          <span>Duration min.</span>
        </div>
        <div className="inputbox">
          <input type="text" required="required" id="mintip" />
          <span>Minimun tip</span>
        </div>
        <div className="inputbox">
          <input type="submit" value="Start Event" disabled={!state.contract} />
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

export default Event;
