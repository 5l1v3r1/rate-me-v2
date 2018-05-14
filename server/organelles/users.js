const User = require('../models/user')

/**
 * Fetches an existing user info
 * args: `{ userId: String }`
 *
 * @param args
 * @param next
 * @returns {*}
 */
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

/**
 * Updates a single user with the specified data
 * args: `{ userId: String, data: { fieldName: newValue } }`
 *
 * @param args
 * @param next
 * @returns {*}
 */
function updateUser (args, next) {
  if (!args.userId) return next(new Error('missing userId'))
  if (!args.data) return next(new Error('missing data'))

  User.findOne({ _id: args.userId }, (err, res) => {
    if (err) return next(err)
    if (!res) return next(new Error('user not found'))

    console.log(args)
    for (let param in args.data) {
      if (args.data.hasOwnProperty(param)) {
        res[param] = args.data[param]
      }
    }
    res.save(next)
  })
}

module.exports = function Users (plasma, dna) {
  plasma.on('users-get', getUser, this)
  plasma.on('users-update', updateUser, this)
}
