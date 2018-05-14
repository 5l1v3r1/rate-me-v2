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

    'GET /me': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        return res
          .status(200)
          .send(req.user.toObject())
      }
    ],

    'GET /:userId': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        plasma.emit({ type: 'users-get', userId: req.params.userId }, (err, user) => {
          if (err) return next(err)

          res.status(200).send(user)

          return next()
        })
      }
    ],

    'PUT /:userId': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        plasma.emit({ type: 'users-update', userId: req.params.userId, data: req.body }, (err, user) => {
          if (err) return next(err)

          res.status(200).send()

          return next()
        })
      }
    ],

    'POST /login': (req, res, next) => {
      // TODO: real authentication
      const seedUserEmail = 'aivo@devlabs.bg'

      User.findOne({ email: seedUserEmail }, (err, user) => {
        if (err) return next(err)

        const token = auth.createToken(user, dna.jwtSecret)

        return res
          .status(200)
          .send({
            authToken: token
          })
      })
    }
  }
}
