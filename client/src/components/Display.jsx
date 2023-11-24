import { useState, useEffect } from "react";
import Metadata from "./Metadata";
import "./Display.css";

const Display = ({ state }) => {
  const [lastEventUri, setLastEventUri] = useState("");
  const { contract2 } = state;
  const counter = 10;
  const [eventId, setEventId] = useState(counter.toString()); // Default event ID as string

  useEffect(() => {
    const getLastEventUri = async () => {
      const eventNumber = parseInt(eventId, 10);

      if (eventNumber > counter) {
        setLastEventUri("");
      } else {
        const last = await contract2.uri(eventNumber);
        setLastEventUri(last);
      }
    };

    getLastEventUri();
  }, [contract2, eventId, counter]);

  const handleEventIdChange = (e) => {
    const input = e.target.value.trim(); // Remove leading/trailing spaces
    setEventId(input); // Store input as string
  };

  return (
    <div className="display">
      <h1>Latest Event</h1>
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
