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

  it('PUTs user data', function (next) {
    let newUserData = {
      firstname: 'George',
      lastname: 'Restful'
    }

    // mock organelle response
    test.variables.cell.plasma.on('users-update', (args, next) => {
      expect(args.userId).to.eq(this.user.id)
      expect(args.data).to.deep.eq(newUserData)

      return next()
    })

    request({
      uri: test.variables.apiendpoint + '/users/' + this.user.id,
      method: 'PUT',
      body: newUserData,
      json: true,
      headers: {
        authorization: this.authToken
      }
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      next()
    })
  })

  it('PUTs only own user data', function (next) {
    let newUserData = {
      firstname: 'George',
      lastname: 'Restful'
    }

    let otherUser = new User()
    otherUser.email = 'test2@test.test'
    otherUser.password = '12345'
    otherUser.firstname = 'Testfn2'
    otherUser.lastname = 'Testln2'
    otherUser.rate = 9.69
    otherUser.save(err => {
      if (err) return next(err)
      // mock organelle response
      test.variables.cell.plasma.on('users-update', (args, next) => {
        expect(args.userId, 'topic [userId]').to.eq(this.user.id)
        expect(args.data).to.deep.eq(newUserData)

        return next()
      })

      request({
        uri: test.variables.apiendpoint + '/users/' + otherUser.id,
        method: 'PUT',
        body: newUserData,
        json: true,
        headers: {
          authorization: this.authToken
        }
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode, body).to.eq(401)
        next()
      })
    })
  })
})
