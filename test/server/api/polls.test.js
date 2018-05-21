const mongoose = require('mongoose')
const async = require('async')
const request = require('request')

const User = require('../../../server/models/user')
const Poll = require('../../../server/models/poll')
const auth = require('../../../server/http/routes/middlewares/auth')

describe('/api/polls', function () {
  beforeEach(done => {
    test.startServer(['organic-mongoose', 'organic-api-routes', 'organic-express-server', 'organic-express-response'], err => {
      if (err) return done(err)

      User.create({
        email: 'test@test.test',
        password: '12345',
        firstname: 'Testfn',
        lastname: 'Testln',
        rate: 999999.69
      }, (err, user) => {
        if (err) return done(err)
        this.user = user
        this.authToken = auth.createToken(user, 'test-jwt-secret')

        return done()
      })
    })
  })

  afterEach(done => {
    async.series([
      next => {
        mongoose.connection.db.dropDatabase(next)
      },
      test.stopServer
    ], done)
  })

  it('GETs all polls', done => {
    // plasma response handler
    test.variables.cell.plasma.on('polls-list', (args, next) => {
      return next(null, 'test-response')
    })

    // call
    request({
      uri: test.variables.apiendpoint + '/polls/',
      method: 'GET',
      headers: {
        authorization: this.authToken
      }
    }, (err, res, body) => {
      if (err) return done(err)
      // assert
      expect(res.statusCode).to.eq(200)
      expect(body).to.eq('test-response')
      return done()
    })
  })

  it('POSTs poll', done => {
    const reqBody = {
      rate: 10000
    }
    // plasma response handler
    test.variables.cell.plasma.on('polls-create', (args, next) => {
      expect(args.userId).to.eq(this.user.id)
      expect(args.rate).to.eq(reqBody.rate)
      return next(null, 'test-response')
    })

    // call
    request({
      uri: test.variables.apiendpoint + '/polls/',
      method: 'POST',
      body: reqBody,
      json: true,
      headers: {
        authorization: this.authToken
      },
    }, (err, res, body) => {
      if (err) return done(err)
      // assert
      expect(res.statusCode).to.eq(200)
      expect(body).to.eq('test-response')
      return done()
    })
  })

  it('PUTs poll', done => {
    // params
    const reqBody = {
      approved: true
    }
    const pollId = mongoose.Types.ObjectId()
    const requestParams = {
      uri: test.variables.apiendpoint + '/polls/' + pollId,
      method: 'PUT',
      body: reqBody,
      json: true,
      headers: {
        authorization: this.authToken
      },
    }
    // plasma response handler
    test.variables.cell.plasma.on('polls-update', (args, next) => {
      expect(args.id).to.eq(pollId.toString())
      expect(args.approved).to.eq(reqBody.approved)
      return next(null, 'test-response')
    })
    async.series([
      next => {
        // try updating non-existent poll
        request(requestParams, (err, res, body) => {
          if (err) return next(err)
          expect(res.statusCode).to.eq(404)
          expect(body).to.eq('Poll not found.')
          return next()
        })
      },
      next => {
        // add test data
        Poll.create({
          _id: pollId,
          userId: this.user.id,
          rate: 6000,
          completedAt: null,
          approved: null,
          votes: []
        }, next)
      },
      next => {
        // update approved status
        request(requestParams, (err, res, body) => {
          if (err) return next(err)
          expect(res.statusCode).to.eq(200)
          expect(body).to.eq('test-response')
          return next()
        })
      }
    ], done)
  })

  it('DELETEs poll', done => {
    // params
    const pollId = mongoose.Types.ObjectId()
    const requestParams = {
      uri: test.variables.apiendpoint + '/polls/' + pollId,
      method: 'DELETE',
      json: true,
      headers: {
        authorization: this.authToken
      },
    }
    // plasma response handler
    test.variables.cell.plasma.on('polls-delete', (args, next) => {
      expect(args.id).to.eq(pollId.toString())
      return next(null, 'test-response')
    })
    async.series([
      next => {
        // add test data
        Poll.create({
          _id: pollId,
          userId: this.user.id,
          rate: 6000,
          completedAt: null,
          approved: null,
          votes: []
        }, next)
      },
      next => {
        // delete poll
        request(requestParams, (err, res, body) => {
          if (err) return next(err)
          expect(res.statusCode).to.eq(200)
          expect(body).to.eq('test-response')
          return next()
        })
      }
    ], done)
  })
})
