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
              // Initialize with more meaningful default data
              const defaultData = {
                settings: {
                  darkMode: false,
                  notifications: true
                },
                history: [],
                preferences: {
                  interests: ['Technology', 'Social Media', 'Digital Marketing'],
                  contentTypes: ['Articles', 'Videos', 'Infographics']
                },
                metrics: {
                  likes: 0,
                  shares: 0,
                  comments: 0,
                  engagementRate: '0%'
                }
              };
              
              chrome.storage.local.set({ socialMediaData: defaultData });
              setData(defaultData);
            }
            setLoading(false);
          });
        } else {
          // Development fallback with sample data
          setData({
            settings: {
              darkMode: false,
              notifications: true
            },
            history: [],
            preferences: {
              interests: ['Technology', 'Social Media', 'Digital Marketing'],
              contentTypes: ['Articles', 'Videos', 'Infographics']
            },
            metrics: {
              likes: 0,
              shares: 0,
              comments: 0,
              engagementRate: '0%'
            }
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="app-container">
      <h1>Social Media Personalization Assistant</h1>
      
      <section className="metrics-section">
        <h2>Engagement Metrics</h2>
        {data?.metrics && (
          <div className="metrics-grid">
            <div className="metric-item">
              <h3>Likes</h3>
              <p>{data.metrics.likes}</p>
            </div>
            <div className="metric-item">
              <h3>Shares</h3>
              <p>{data.metrics.shares}</p>
            </div>
            <div className="metric-item">
              <h3>Comments</h3>
              <p>{data.metrics.comments}</p>
            </div>
            <div className="metric-item">
              <h3>Engagement Rate</h3>
              <p>{data.metrics.engagementRate}</p>
            </div>
          </div>
        )}
      </section>

      <section className="interests-section">
        <h2>User Interests</h2>
        {data?.preferences?.interests && (
          <div className="interests-list">
            {data.preferences.interests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="recommendations-section">
        <h2>Content Recommendations</h2>
        {data?.preferences?.contentTypes && (
          <div className="content-types">
            <h3>Preferred Content Types:</h3>
            <ul>
              {data.preferences.contentTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
