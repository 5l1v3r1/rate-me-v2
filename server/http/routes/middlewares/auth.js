const jwt = require('jsonwebtoken')
const User = require('../../../models/user')

const auth = {

  _getJwtFromRequest: (req) => {
    if (req.headers && req.headers.authorization) {
      return req.headers.authorization
    }

    return false
  },

  _getUserFromToken: (jwToken, done) => {
    const decoded = jwt.decode(jwToken, {complete: true})
    const userId = decoded.payload.userId
    return User.findOne({_id: userId}, '-__v -password', (err, user) => {
      if (err) return done(err)
      return done(null, user)
    })
  },

  createToken: (user, jwtSecret) => {
    const userToEncode = {
      userId: user._id
    }
    return jwt.sign(userToEncode, jwtSecret)
  },

  authorize: (jwtSecret) => {
    const self = auth
    // TODO: check error interceptors and assign the right response codes
    return (req, res, next) => {
      const unauthorizedError = new Error('Unauthorized')

      const token = self._getJwtFromRequest(req)
      if (!token) return next(unauthorizedError)

      jwt.verify(token, jwtSecret, function (err) {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return next(new Error('Token expired'))
          } else {
            return next(unauthorizedError)
          }
        }

        self._getUserFromToken(token, (err, user) => {
          if (err) return next(err)
          if (!user) return next(new Error('Invalid User'))

          req.user = user

          // Allow `me` to be used in request params instead of `:userId`
          if (req.params.userId && req.params.userId === 'me') {
            req.params.userId = req.user.id
          }

          return next(null, user)
        })
      })
    }
  }

}

module.exports = auth
