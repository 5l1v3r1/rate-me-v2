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
    },

    'POST /register': (req, res, next) => {
      if (!req.body.email) {
        // todo: move error creating to helpers
        let error = new Error()
        error.code = 400
        error.body = 'Missing email'
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
