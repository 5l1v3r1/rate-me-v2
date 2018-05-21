const mongoose = require('mongoose')

const User = require('../../../server/models/user')
const Plasma = require('organic-plasma')
const UsersOrganelle = require('../../../server/organelles/users')

describe('organelles/users', function () {
  beforeEach(function (next) {
    test.startServer({
      'organic-mongoose': {},
      'organic-express-server': {
        'expressSetupDoneOnce': 'Mongoose'
      },
      'users': {} // spawns the tested `users` organelle for all tests
    }, err => {
      if (err) return next(err)

      let user = new User()
      user.email = 'test@test.test'
      user.password = '12345'
      user.firstname = 'Testfn'
      user.lastname = 'Testln'
      user.rate = 999999.69
      this.user = user
      user.save(next)
    })
  })

  afterEach(function (next) {
    mongoose.connection.db.dropDatabase(() => test.stopServer(next))
  })

  it('fetches a single user on users-get', function (next) {
    test.variables.cell.plasma.emit({ type: 'users-get', userId: this.user.id }, (err, res) => {
      if (err) return next(err)

      expect(res.email).to.eq('test@test.test')
      expect(res.password).to.not.exist
      expect(res.firstname).to.eq('Testfn')
      expect(res.lastname).to.eq('Testln')
      expect(res.rate).to.eq(999999.69)

      return next()
    })
  })

  it('updates a single user on users-update', function (next) {
    let data = {
      firstname: 'George',
      lastname: 'Restful',
      rate: 20
    }

    test.variables.cell.plasma.emit({ type: 'users-update', userId: this.user.id, data: data }, (err, res) => {
      if (err) return next(err)

      User.findOne({ _id: this.user.id }, (err, user) => {
        if (err) return next(err)

        expect(user).to.exist
        expect(user.firstname).to.eq('George')
        expect(user.lastname).to.eq('Restful')
        expect(user.rate).to.eq(20)

        return next()
      })
    })
  })

  it('creates a new user on users-create', function (next) {
    let chemical = {
      type: 'users-create',
      email: 'test-new-user@test.test',
      password: '123456',
    }

    test.variables.cell.plasma.emit(chemical, (err, response) => {
      if (err) return next(err)
      expect(response).to.exist
      expect(response.email).to.eq('test-new-user@test.test')

      User.findOne({ email: 'test-new-user@test.test' }, (err, user) => {
        if (err) return next(err)

        expect(user).to.exist
        expect(user.id).to.eq(response.id)

        return next()
      })
    })
  })
})
