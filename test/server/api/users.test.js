const User = require('../../../server/models/user')
const request = require('request')
const auth = require('../../../server/http/routes/middlewares/auth')

describe('/api/version', function () {
  before(function (next) {
    test.startServer(err => {
      if (err) return next(err)

      let user = new User()
      user.email = 'test@test.test'
      user.password = '12345'
      user.firstname = 'Testfn'
      user.lastname = 'Testln'
      user.rate = 999999.69
      user.save(next)

      this.user = user
      this.authToken = auth.createToken(user, 'test-jwt-secret')
    })
  })
  after(test.stopServer)

  it('GETs valid user data', function (next) {
    // mock organelle response
    test.variables.cell.plasma.on('users-get', (args, next) => {
      expect(args.userId).to.eq(this.user.id)

      return next(null, 'test-response')
    })

    request({
      uri: test.variables.apiendpoint + '/users/' + this.user.id,
      method: 'GET',
      headers: {
        authorization: this.authToken
      }
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.eq('test-response')
      next()
    })
  })
})
