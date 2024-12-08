const express = require('express');
const router = express.Router();
const Restaurant = require('./models/Restaurant'); // Update this path to your Restaurant model

// Search by name
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required' });
    }

    const restaurants = await Restaurant.find({
      'Restaurant Name': { $regex: name, $options: 'i' } // Case-insensitive search
    });

    res.json(restaurants);
  } catch (error) {
    console.error('Error searching restaurants by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
