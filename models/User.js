import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  chatId: String,
  userName: String,
  userId: String,
  date: { type: Date, default: new Date().toLocaleString() }
})

module.exports = mongoose.model('Users', UserSchema)
