import React, { useState } from 'react';
// import './SearchByName.css';
import './Restaurant.css';
const SearchByName = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchByName = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a restaurant name to search.');
      return;
    } 
    try {
      const response = await fetch(`http://localhost:5000/api/restaurants/search?name=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      onSearchResults(data);  
    } catch (error) {
      console.error('Error fetching restaurants by name:', error);
      alert('Error fetching restaurants by name.');
    }
  };

  return (
    <div className="search-container">
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
