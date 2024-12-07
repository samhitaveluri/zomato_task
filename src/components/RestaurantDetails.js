import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './RestaurantDetails.css';  // Import the CSS file

const RestaurantDetails = () => {
  const { id } = useParams();  // Get the restaurant ID from the URL params
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/restaurant/${id}`)  // API to fetch restaurant by ID
      .then(response => response.json())
      .then(data => setRestaurant(data))
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [id]);  // Re-run effect when the restaurant ID changes

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="restaurant-details-container">
      <div className="restaurant-details-card">
        <h1>{restaurant['Restaurant Name']}</h1>
        {/* <p><strong>Description:</strong> {restaurant.description}</p> */}
        <p><strong>Rating:</strong> {restaurant['Aggregate rating']}</p>
        <p><strong>Address:</strong> {restaurant.Address}</p>
        <p><strong>City:</strong> {restaurant.City}</p>
        <p><strong>Cuisine:</strong> {restaurant.Cuisines}</p>
        <p><strong>Cost for two:</strong> {restaurant['Average Cost for two']} {restaurant.Currency}</p>
      </div>
    </div>
  );
};

export default RestaurantDetails;
