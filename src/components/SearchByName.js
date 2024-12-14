import React, { useState, useEffect } from 'react';
import './Restaurant.css';

const SearchByName = ({ onSearchResults, nearbyRestaurants, hasLatLon, latitude, longitude }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [topSearches, setTopSearches] = useState([]);
  const fetchTopSearches = async () => {
    try {
      const url = hasLatLon
        ? `http://localhost:5000/api/top-searches?lat=${latitude}&lon=${longitude}`
        : 'http://localhost:5000/api/top-searches';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch top searches');
      }
      const data = await response.json();
      setTopSearches(data);
    } catch (error) {
      console.error('Error fetching top searches:', error);
    }
  };

  useEffect(() => {
    fetchTopSearches();
  }, [hasLatLon, latitude, longitude]);  
  const handleSearchByName = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a restaurant name to search.');
      return;
    }
    try { 
      await fetch('http://localhost:5000/api/update-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          lat: hasLatLon ? latitude : null,
          lon: hasLatLon ? longitude : null,
        }),
      });

      let filteredRestaurants;
      if (hasLatLon && nearbyRestaurants) { 
        filteredRestaurants = nearbyRestaurants.filter((restaurant) =>
          restaurant['Restaurant Name']?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else { 
        const response = await fetch(`http://localhost:5000/api/restaurants/search?name=${searchQuery}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        filteredRestaurants = await response.json();
      } 
      onSearchResults(filteredRestaurants); 
      fetchTopSearches();
    } catch (error) {
      console.error('Error fetching restaurants by name:', error);
      alert('Error fetching restaurants by name.');
    }
  };

  return (
    <div className="search-container">
      <div className="top-searches">
        <h4>Top Searches:</h4>
        <p>{topSearches.length > 0 ? topSearches.join(', ') : 'No searches yet'}</p>
      </div>
      <input
        type="text"
        placeholder="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearchByName}>Search</button>
    </div>
  );
};

export default SearchByName;
