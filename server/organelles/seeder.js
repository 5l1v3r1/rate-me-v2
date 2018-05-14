const User = require('../models/user')

module.exports = function Seeder (plasma, dna) {
  this.dna = dna

  if (this.dna.reactOn) {
    plasma.on(this.dna.reactOn, module.exports.seedIfDbEmpty, this)
  } else {
    module.exports.seedIfDbEmpty()
  }
}

module.exports.seedIfDbEmpty = () => {
  User.count({}, (err, count) => {
    if (err) return console.log(err)
    if (count !== 0) return console.log('Seeding already done, continue...')

    // create single user
    User.create({
      email: 'aivo@devlabs.bg',
      password: 'nd2ibd57GJlAjOpS',
      firstname: 'George',
      lastname: 'Restful'
    }, (err, user) => {
      if (err) return console.log(err)
      return console.log('Seed done.')
    })
  })
}
