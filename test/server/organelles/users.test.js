const User = require('../../../server/models/user')
const Plasma = require('organic-plasma')
const UsersOrganelle = require('../../../server/organelles/users')

describe('organelles/users', function () {
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

  it('fetches a single user on users-get', function (next) {
    let plasma = require('organic-plasma-feedback')(new Plasma())
    let dna = {}

    UsersOrganelle(plasma, dna)
    plasma.emit({ type: 'users-get', userId: this.user.id }, (err, res) => {
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
    let plasma = require('organic-plasma-feedback')(new Plasma())
    let dna = {}
    let data = {
      firstname: 'George',
      lastname: 'Restful',
      rate: 20
    }

    UsersOrganelle(plasma, dna)
    plasma.emit({ type: 'users-update', userId: this.user.id, data: data }, (err, res) => {
      if (err) return next(err)

      User.findOne({ id: this.user.id }, (err, user) => {
        if (err) return next(err)

        expect(user.firstname).to.eq('George')
        expect(user.lastname).to.eq('Restful')
        expect(user.rate).to.eq(20)
      })

      return next()
    })
  })
})
