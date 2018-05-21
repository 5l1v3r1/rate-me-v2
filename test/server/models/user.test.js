const mongoose = require('mongoose')

const User = require('../../../server/models/user')
const bcrypt = require('bcrypt')

describe('models/users', function () {
  beforeEach(function (next) {
    test.startServer({
      'organic-mongoose': {},
      // this overrides `readyChemcals` for `startServer`; can be improved by adding
      // the option to overwrite it without spawning the express-server organelle
      'organic-express-server': {
        'expressSetupDoneOnce': 'Mongoose'
      }
    }, next)
  })

  afterEach(function (next) {
    mongoose.connection.db.dropDatabase(() => test.stopServer(next))
  })

  it('hashes password on save', function (next) {
    let user = new User()
    user.email = 'test@test.test'
    user.password = '123456'
    user.save(err => {
      if (err) return next(err)

      expect(user.password).to.not.eq('123456')
      bcrypt.compare('123456', user.password, (err, result) => {
        if (err) return next(err)

        expect(result).to.eq(true)

        return next()
      })
    })
  })
})
