const User = require('../../../models/user')
const auth = require('../middlewares/auth')

module.exports = (plasma, dna, helpers) => {
  return {
    'GET': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        User
          .find({}, (err, users) => {
            if (err) return next(err)
            return res
              .status(200)
              .send(users)
          })
      }
    ],

    'POST /login': (req, res, next) => {
      // TODO: real authentication
      const userId = 1

      User.find({id: userId}, (err, user) => {
        if (err) return next(err)

        const token = createToken(user, dna.jwtSecret)

        return res
          .status(200)
          .send({
            authToken: token
          })
      })
    }
  }
}
