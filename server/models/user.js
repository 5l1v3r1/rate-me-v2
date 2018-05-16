const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const schema = new mongoose.Schema({
  email: String,
  password: String,
  firstname: String,
  lastname: String,
  rate: Number
})
schema.pre('save', function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err)

    this.password = hash
    next()
  })
})

module.exports = mongoose.model('User', schema)
