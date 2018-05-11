const User = require('../../models/user')

module.exports = (plasma, dna, helpers) => {
  return {
    'GET': (req, res, next) => {
      User
        .find({}, (err, users) => {
          if (err) return next(err)
          return res
            .status(200)
            .send(users)
        })
    }
  }
}
