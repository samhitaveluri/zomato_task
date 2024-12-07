import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './RestaurantList.css';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [radius, setRadius] = useState(''); 
  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched data:", data);
        setRestaurants(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Function to handle nearby restaurant search
  const handleSearch = async () => {
    if (!lat || !lon || !radius) {
      alert('Please enter latitude, longitude, and radius.');
      return;
    }

    console.log(`Searching for restaurants within ${radius} km of (${lat}, ${lon})`);

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/nearby-restaurants?Latitude=${lat}&Longitude=${lon}&radius=${radius}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      alert('Error fetching nearby restaurants');
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="restaurant-list-container">
      <h1>Restaurant List</h1> 
      <div className="search-container">
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />
        <input
          type="number"
          placeholder="Radius (in km)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <button onClick={handleSearch}>Search Nearby Restaurants</button>
      </div> 
      {restaurants.length > 0 ? (
        <div className="restaurant-list">
          {restaurants.map((restaurant) => {
            console.log(restaurant);
            return (
              <div key={restaurant._id} className="restaurant-card">
                <Link to={`/restaurant/${restaurant._id}`}>
                  <h2>{restaurant['Restaurant Name'] || 'Unnamed Restaurant'}</h2>
                  <p>{restaurant.city}</p>
                  <p>{restaurant.address}</p>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No restaurants available</p>
      )}
    </div>
  );
};

export default RestaurantList;
