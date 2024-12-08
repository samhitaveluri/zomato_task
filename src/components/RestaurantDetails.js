import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Restaurant.css';   

const RestaurantDetails = () => {
  const { id } = useParams();   
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/restaurant/${id}`)   
      .then(response => response.json())
      .then(data => setRestaurant(data))
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [id]);  

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
