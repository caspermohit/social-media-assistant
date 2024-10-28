import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from Chrome storage
    const fetchData = async () => {
      try {
        // Check if Chrome storage API is available
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['socialMediaData'], (result) => {
            if (result.socialMediaData) {
              setData(result.socialMediaData);
            } else {
              // Initialize with default data if nothing is stored
              const defaultData = {
                settings: {},
                history: [],
                preferences: {}
              };
              
              chrome.storage.local.set({ socialMediaData: defaultData });
              setData(defaultData);
            }
            setLoading(false);
          });
        } else {
          // Fallback for development environment
          setData({
            settings: {},
            history: [],
            preferences: {}
          });
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();

    // Optional: Set up storage change listener
    const handleStorageChange = (changes) => {
      if (changes.socialMediaData) {
        setData(changes.socialMediaData.newValue);
      }
    };

    if (chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    // Cleanup listener on unmount
    return () => {
      if (chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, []);

  // Helper function to update storage
  const updateStorage = async (newData) => {
    try {
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ socialMediaData: newData });
        setData(newData);
      }
    } catch (err) {
      console.error('Error updating storage:', err);
      setError('Failed to save data');
    }
  };

  // Example usage
  const handleDataUpdate = async () => {
    const newData = {
      ...data,
      settings: { /* new settings */ }
    };
    await updateStorage(newData);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app-container">
      <h1>Social Media Personalization Assistant</h1>
      <h2>Engagement Metrics</h2>
      {/* Display metrics */}
      <h2>User Interests</h2>
      {/* Display interests */}
      <h2>Content Recommendations</h2>
      {/* Display recommendations */}
      {data && (
        <div>
          {/* Example of how to use the data */}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
