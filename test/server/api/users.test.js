const User = require('../../../server/models/user')
const mongoose = require('mongoose')

const request = require('request')
const auth = require('../../../server/http/routes/middlewares/auth')

describe('/api/users', function () {
  beforeEach(function (next) {
    test.startServer(err => {
      if (err) return next(err)

      let user = new User()
      user.email = 'test@test.test'
      user.password = '12345'
      user.firstname = 'Testfn'
      user.lastname = 'Testln'
      user.rate = 999999.69

      this.user = user
      this.authToken = auth.createToken(user, 'test-jwt-secret')

      user.save(next)
    })
  })

  afterEach(function (next) {
    mongoose.connection.db.dropDatabase(() => test.stopServer(next))
  })

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

  it('GETs valid user data using "me" in url', function (next) {
    // mock organelle response
    test.variables.cell.plasma.on('users-get', (args, next) => {
      expect(args.userId).to.eq(this.user.id)

      return next(null, 'test-response')
    })

    request({
      uri: test.variables.apiendpoint + '/users/me',
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
        expect(args.userId).to.eq(this.user.id)
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

  it('registers new users', function (next) {
    let newUserData = {
      email: 'test@test.test',
      password: '12345',
      password_confirm: '12345'
    }

    test.variables.cell.plasma.on('users-create', (args, next) => {
      expect(args.email).to.eq('test@test.test')
      expect(args.password).to.eq('12345')
      expect(args.password_confirm).to.not.exist

      // we rely on the fact that this user is already created here
      return next(null, this.user)
    })

    request({
      uri: test.variables.apiendpoint + '/users/register',
      method: 'POST',
      body: newUserData,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)

      expect(res.statusCode, body).to.eq(200)
      expect(body).to.exist
      expect(body.authToken).to.exist
      next()
    })
  })

  it('logins existing users', function (next) {
    request({
      uri: test.variables.apiendpoint + '/users/login',
      method: 'POST',
      body: {
        email: 'test@test.test',
        password: '12345'
      },
      json: true
    }, function (err, res, body) {
      if (err) return next(err)

      expect(res.statusCode, body).to.eq(200)
      expect(body).to.exist
      expect(body.authToken).to.exist
      next()
    })
  })

  it('does not login with wrong password', function (next) {
    request({
      uri: test.variables.apiendpoint + '/users/login',
      method: 'POST',
      body: {
        email: 'test@test.test',
        password: 'i-am-wrong'
      },
      json: true
    }, function (err, res, body) {
      if (err) return next(err)

      expect(res.statusCode, body).to.eq(400)
      expect(body).to.eq('Incorrect password')
      next()
    })
  })

  it('does not login with wrong email', function (next) {
    request({
      uri: test.variables.apiendpoint + '/users/login',
      method: 'POST',
      body: {
        email: 'i-am-not-registered@test.test',
        password: '12345'
      },
      json: true
    }, function (err, res, body) {
      if (err) return next(err)

      expect(res.statusCode, body).to.eq(400)
      expect(body).to.eq('Email not registered')
      next()
    })
  })
})
