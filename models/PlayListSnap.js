import mongoose from 'mongoose'

const PlayListSnapShots = new mongoose.Schema({
  snapshot_id: String,
  date: { type: Date, default: new Date().toLocaleString() }
})

module.exports = mongoose.model('SnapShots', PlayListSnapShots)
