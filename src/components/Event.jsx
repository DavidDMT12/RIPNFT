import "./Center.css";
import { useState } from 'react'; 

const Event = ({ state }) => {
  const [popupMessage, setPopupMessage] = useState(null);

  const handlePopupClose = () => {
    setPopupMessage(null);
    if (popupMessage === 'Event started') {
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
      setPopupMessage('Event started');
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
      <div className="tooltip">
        <h1>Start Event</h1>
        <span className="tooltiptext">
          <p>
            Input the name, uri, duration in minutes and minimum tip in FCoins of the event you want to start. The event will be added to the list of events.
          </p>
        </span>
      </div>
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
