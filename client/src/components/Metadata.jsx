import { useState, useEffect } from "react";

const Metadata = ({ url }) => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchData();
  }, [url]);

  if (!metadata) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Name: {metadata.name}</p> {/* Display metadata name */}
      <p>Description: {metadata.description}</p> {/* Display metadata description */}
      <img src={metadata.image} alt={metadata.name} />
    </div>
  );
};

export default Metadata;
