const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')


const auth = {
  createToken: (user, jwtSecret) => {
    const userToEncode = {
      userId: user._id
    }
    return jwt.sign(userToEncode, jwtSecret)
  },
  authorize: (jwtSecret) => {
    // attaches decoded user to req.user
    return expressJwt({ secret: jwtSecret })
  }
}

module.exports = auth