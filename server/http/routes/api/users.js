const bcrypt = require('bcrypt')

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
          // todo: move error creating to helpers
          let error = new Error()
          error.code = 401
          error.body = 'Unauthorized'
          return next(error)
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
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Email is required'
        return next(error)
      }
      if (!req.body.password) {
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Password is required'
        return next(error)
      }

      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return next(err)
        if (!user) {
          // todo: move error creating to helpers
          let error = new Error()
          error.code = 400
          error.body = 'Email not registered'
          return next(error)
        }

        // validate password
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) return next(err)
          if (!result) {
            // todo: move error creating to helpers
            let error = new Error()
            error.code = 400
            error.body = 'Incorrect password'
            return next(error)
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
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Email is required'
        return next(error)
      }
      if (!req.body.password) {
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Password is required'
        return next(error)
      }
      if (!req.body.password_confirm) {
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Password confirm is required'
        return next(error)
      }
      if (req.body.password !== req.body.password_confirm) {
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Passwords don\'t match'
        return next(error)
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
