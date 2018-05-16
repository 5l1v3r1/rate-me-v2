const User = require('../../../server/models/user')
const bcrypt = require('bcrypt')

describe('models/users', function () {
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
    })
  })

  after(function (next) {
    test.stopServer(next)
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
