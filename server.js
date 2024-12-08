const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const fs = require('fs');
require('dotenv').config(); 
const app = express();
const port = 5000; 
app.use(express.json());
app.use(cors());
 
mongoose.connect('mongodb://localhost:27017/my_database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_API_KEY,  
    }); 
    const upload = multer({ dest: 'uploads/' });
     
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
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;  
  const dLat = (lat2 - lat1) * (Math.PI / 180); 
  const dLon = (lon2 - lon1) * (Math.PI / 180);   
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;  
  return distance;
};
//restaurant list
app.get('/api/restaurants', async (req, res) => {
  console.log("GET /api/restaurants request received");
  try {
    const restaurants = await Restaurant.find();
    console.log("Restaurants fetched:", restaurants);   
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).send('Server error');
  }
});
//restaurant individual
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
//lat long based
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
//detecting cuisine
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    console.log('Uploaded file:', req.file);
    if (!req.file) {
    return res.status(400).send('No file uploaded');
    }
    const imagePath = req.file.path;
    try {
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations;
    console.log('Labels detected:', result.labelAnnotations);
    const CuisinesDetected = labels
    .map(label => label.description.toLowerCase()) 
    .filter(label => 
        ['french', 'japanese', 'desserts', 'italian', 'seafood', 'filipino', 'ice cream', 'dessert', 'pizza', 'biryani', 'sushi', 'korean', 'seafood']
        .includes(label)  
    );
    fs.unlinkSync(imagePath);  
    if (CuisinesDetected.length > 0) {
        return res.json({ Cuisine: CuisinesDetected[0] });  
        } else {
        return res.status(400).send('No Cuisine detected');
        }
    } catch (error) {
    console.error('Error detecting Cuisine:', error);
    return res.status(500).send('Error detecting Cuisine');
    }
});
//fetching restaurants by cuisine     
app.get('/api/restaurants-by-Cuisine', async (req, res) => {
    const { Cuisine } = req.query;
    if (!Cuisine) {
        return res.status(400).send('Cuisine is required');
    }
    try {
    const restaurants = await Restaurant.find({
        Cuisines: { $regex: Cuisine, $options: 'i' },
    });
    res.json(restaurants);
    } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).send('Error fetching restaurants');
    }
}); 
 
app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
