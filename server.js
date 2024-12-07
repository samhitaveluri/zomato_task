const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express
const app = express();
const port = 5000;

// Middleware for parsing JSON data
app.use(express.json());

// Enable CORS for all routes (adjust the origin as per your needs)
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define the restaurant schema and model
const restaurantSchema = new mongoose.Schema({
  restaurantId: { type: Number, required: true },
  restaurantName: { type: String, required: true },
  countryCode: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  locality: { type: String },
  localityVerbose: { type: String },
  Longitude: { type: Number },
  Latitude: { type: Number },
  cuisines: { type: String },
  AverageCostfortwo: { type: Number },
  currency: { type: String },
  hasTableBooking: { type: String },
  hasOnlineDelivery: { type: String },
  isDeliveringNow: { type: String },
  switchToOrderMenu: { type: String },
  priceRange: { type: Number },
  aggregateRating: { type: Number },
  ratingColor: { type: String },
  ratingText: { type: String },
  votes: { type: Number }
});

const Restaurant = mongoose.model('zomato_restaurants', restaurantSchema);

// Haversine formula to calculate the distance between two lat/lon points in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
  const dLon = (lon2 - lon1) * (Math.PI / 180); // Convert degrees to radians

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in km
  return distance;
};

// API Routes
// Get list of all restaurants
app.get('/api/restaurants', async (req, res) => {
  console.log("GET /api/restaurants request received");
  try {
    const restaurants = await Restaurant.find();
    console.log("Restaurants fetched:", restaurants);  // Log the fetched data
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send('Server error');
  }
});

// Get a restaurant by ID
app.get('/api/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).send('Restaurant not found');
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get nearby restaurants within a certain radius (in km)
app.get('/api/nearby-restaurants', async (req, res) => {
  const { Latitude, Longitude, radius } = req.query;

  if (!Latitude || !Longitude || !radius) {
    return res.status(400).send('Missing required parameters');
  }

  const lat = parseFloat(Latitude);
  const lon = parseFloat(Longitude);
  const rad = parseFloat(radius);

  console.log('Latitude:', lat, 'Longitude:', lon, 'Radius:', rad);  // Log incoming query parameters

  try {
    const allRestaurants = await Restaurant.find();
    const nearbyRestaurants = allRestaurants.filter((restaurant) => {
      if (!restaurant.Latitude || !restaurant.Longitude) return false; // Skip restaurants without coordinates
      const distance = haversineDistance(lat, lon, restaurant.Latitude, restaurant.Longitude);
      console.log(`Distance to ${restaurant['Restaurant Name']}: ${distance} km`);  // Log distances
      return distance <= rad;
    });

    res.json(nearbyRestaurants);
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
