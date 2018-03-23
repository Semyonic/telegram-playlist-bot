import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema({
  chatId: String,
  userName: String,
  message: String,
  date: { type: Date, default: new Date().toLocaleString() }
})

module.exports = mongoose.model('Chat', ChatSchema)
