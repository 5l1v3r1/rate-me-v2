const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  email: String,
  password: String,
  firstname: String,
  lastname: String
})

module.exports = mongoose.model('User', schema)