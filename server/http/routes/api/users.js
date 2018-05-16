const bcrypt = require('bcrypt')

const User = require('../../../models/user')
const auth = require('../middlewares/auth')

module.exports = (plasma, dna, helpers) => {
  let responseError = helpers['response-error']

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

    'GET /:userId': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        let userId = req.params.userId
        if (userId === 'me') {
          userId = req.user.id
        }

        plasma.emit({ type: 'users-get', userId: userId }, (err, user) => {
          if (err) return next(err)

          res.status(200).send(user)

          return next()
        })
      }
    ],

    'PUT /:userId': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        if (req.user.id !== req.params.userId) {
          return next(responseError(401, 'Unauthorized'))
        }

        plasma.emit({ type: 'users-update', userId: req.params.userId, data: req.body }, (err, user) => {
          if (err) return next(err)

          res.status(200).send()

          return next()
        })
      }
    ],

    'POST /login': (req, res, next) => {
      if (!req.body.email) {
        return next(responseError(400, 'Email is required'))
      }
      if (!req.body.password) {
        return next(responseError(400, 'Password is required'))
      }

      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return next(err)
        if (!user) {
          return next(responseError(400, 'Email not registered'))
        }

        // validate password
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) return next(err)
          if (!result) {
            return next(responseError(400, 'Incorrect password'))
          }

          const token = auth.createToken(user, dna.jwtSecret)

          return res
            .status(200)
            .send({
              authToken: token
            })
        })
      })
    },

    'POST /register': (req, res, next) => {
      if (!req.body.email) {
        return next(responseError(400, 'Email is required'))
      }
      if (!req.body.password) {
        return next(responseError(400, 'Password is required'))
      }
      if (!req.body.password_confirm) {
        return next(responseError(400, 'Password confirm is required'))
      }
      if (req.body.password !== req.body.password_confirm) {
        return next(responseError(400, 'Passwords don\'t match'))
      }

      plasma.emit({ type: 'users-create', email: req.body.email, password: req.body.password }, (err, user) => {
        if (err) return next(err)

        const token = auth.createToken(user, dna.jwtSecret)
        res.status(200)
          .send({
            authToken: token
          })

        return next()
      })
    }
  }
}
