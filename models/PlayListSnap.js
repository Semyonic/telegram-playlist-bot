import mongoose from 'mongoose'

const PlayListSnapShots = new mongoose.Schema({
  snapshot_id: String,
  date: { type: Date, default: new Date().toLocaleString() }
})

module.export = mongoose.model('SnapShots', PlayListSnapShots)
