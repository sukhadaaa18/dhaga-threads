const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/auth');

// GET settings
router.get('/', async (req, res) => {
  try {
    console.log('GET Settings hit');
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('Creating initial settings');
      settings = await Settings.create({});
    }

    // NEW: Automatically calculate the real "Saved Pieces" count from all users' wishlists
    const User = require('../models/User');
    const allUsers = await User.find({}, 'wishlist');
    const totalWishlistItems = allUsers.reduce((acc, user) => acc + (user.wishlist?.length || 0), 0);
    
    // Add a virtual or calculated field
    const settingsObj = settings.toObject();
    settingsObj.realWishlistCount = totalWishlistItems;

    res.json(settingsObj);
  } catch (error) {
    console.error('GET Settings Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE settings
router.put('/', protect, admin, async (req, res) => {
  try {
    console.log('Update Settings Request:', req.body);
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('No settings found, creating new one');
      settings = new Settings({});
    }

    settings.instagramFollowers = req.body.instagramFollowers !== undefined ? req.body.instagramFollowers : settings.instagramFollowers;
    settings.instagramPosts = req.body.instagramPosts !== undefined ? req.body.instagramPosts : settings.instagramPosts;
    settings.instagramSaved = req.body.instagramSaved !== undefined ? req.body.instagramSaved : settings.instagramSaved;
    settings.instagramAccessToken = req.body.instagramAccessToken !== undefined ? req.body.instagramAccessToken : settings.instagramAccessToken;

    const updated = await settings.save();
    console.log('Settings updated successfully');
    res.json(updated);
  } catch (error) {
    console.error('Update Settings Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// SYNC with Instagram
router.post('/sync', protect, admin, async (req, res) => {
  const settings = await Settings.findOne();
  if (!settings || !settings.instagramAccessToken) {
    return res.status(400).json({ message: 'No Instagram Access Token found. Please add it in settings.' });
  }

  try {
    // Official Instagram Graph API call
    // Note: This requires a Professional/Business account connected to a FB Page
    const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=followers_count,media_count&access_token=${settings.instagramAccessToken}`);
    const data = await response.json();
    
    if (data.error) {
       return res.status(400).json({ message: 'Instagram API Error', detail: data.error.message });
    }

    if (data.followers_count !== undefined) {
       const followers = data.followers_count;
       settings.instagramFollowers = followers >= 1000 ? (followers / 1000).toFixed(1) + 'K' : followers.toString();
       settings.instagramPosts = data.media_count.toString();
       settings.lastSynced = new Date();
       await settings.save();
       return res.json(settings);
    }
    
    res.status(400).json({ message: 'Could not fetch necessary data fields from Instagram.' });
  } catch (error) {
    console.error('Instagram Sync Error:', error.message);
    res.status(500).json({ message: 'Failed to sync with Instagram', detail: error.message });
  }
});

module.exports = router;
