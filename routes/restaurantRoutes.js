const express = require('express');
const Restaurant = require('../models/restaurant');
const router = express.Router();

// Get restaurant by ID
router.get('/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get list of restaurants with pagination
router.get('/restaurants', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const restaurants = await Restaurant.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Restaurant.countDocuments();
    res.json({ data: restaurants, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
