import { useState, useEffect } from "react";
import Metadata from "./Metadata";
import "./Display.css";

const Display = ({ state }) => {
  const { contract2 } = state;
  const [lastEventUri, setLastEventUri] = useState("");
  const [eventId, setEventId] = useState(""); // Default event ID as string

  useEffect(() => {
    const getEventCounter = async () => {
      const counter = await contract2.eventCounter() -1;
      console.log(counter);
      setEventId(counter.toString());
    };

    getEventCounter();
  }, [contract2]);

  useEffect(() => {
    const getLastEventUri = async () => {
      const eventNumber = parseInt(eventId, 10);
      if (!isNaN(eventNumber)) {
        const counter = await contract2.eventCounter() - 1;
        if (eventNumber > counter) {
          setLastEventUri("");
        } else {
          const last = await contract2.uri(eventNumber);
          setLastEventUri(last);
        }
      }
    };

    getLastEventUri();
  }, [contract2, eventId]);

  const handleEventIdChange = (e) => {
    const input = e.target.value.trim(); // Remove leading/trailing spaces
    setEventId(input); // Store input as string
  };

  return (
    <div className="display">
      <div className="tooltip">
        <h1>Latest Event</h1>
        <span className="tooltiptext">
          <p>
            Display the latest event. Input the event ID to display a specific NFT.
          </p>
        </span>
      </div>
      <div className="event-selector">
        <label htmlFor="eventId">Enter Event ID: </label>
        <input
          type="text" // Use type="text" to allow any input
          id="eventId"
          name="eventId"
          value={eventId}
          onChange={handleEventIdChange}
        />
      </div>
      {eventId === "" ? (
        <div>Loading...</div>
      ) : lastEventUri !== "" ? (
        <Metadata url={lastEventUri} />
      ) : (
        <div>Event has not been created yet.</div>
      )}
    </div>
  );
};

export default Display;
