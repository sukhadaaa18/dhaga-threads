const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
  instagramFollowers: { type: String, default: '3.5K' },
  instagramPosts: { type: String, default: '100' },
  instagramSaved: { type: String, default: '300' },
  instagramAccessToken: { type: String, default: '' },
  lastSynced: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
