import { useState, useEffect } from "react";
import "./Table.css";

const Table = ({ state }) => {
  const [sortedEvents, setSortedEvents] = useState([]);

  useEffect(() => {
    const fetchAllEvents = async () => {
      const { contract2 } = state;
      const eventCounter = await contract2.eventCounter() -1;

      const allEvents = [];
      for (let eventId = 1; eventId <= eventCounter; eventId++) {
        const eventData = await contract2.events(eventId);
        allEvents.push({ eventId, ...eventData });
      }

      // Sort events by FCoins in descending order
      const sorted = allEvents.sort((a, b) => b.FCoins - a.FCoins);

      // Get the top 10 events based on FCoins
      const top10Events = sorted.slice(0, 10);
      setSortedEvents(top10Events);
    };

    if (state.contract2) {
      fetchAllEvents();
    }
  }, [state.contract2]);

  return (
    <div className="container-fluid">
      <h1>Top Events</h1>
      <table>
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Event Name</th>
            <th>Creator</th>
            <th>FCoins</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map((event, index) => (
            <tr key={event.eventId}>
              <td>{index + 1}</td>
              <td>{event.Name}</td>
              <td>{event.Creator}</td>
              <td>{event.FCoins.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
