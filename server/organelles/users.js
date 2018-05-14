const User = require('../models/user')

function getUser (args, next) {
  if (!args.userId) return next(new Error('missing userId'))

  User.findOne({ _id: args.userId }, (err, res) => {
    if (err) return next(err)
    if (!res) return next(new Error('user not found'))

    return next(null, {
      email: res.email,
      firstname: res.firstname,
      lastname: res.lastname,
      rate: res.rate
    })
  })
}

module.exports = function Users (plasma, dna) {
  plasma.on('users-get', getUser, this)
}
