const async = require('async')
const mongoose = require('mongoose')

const User = require('../models/user')
const Poll = require('../models/poll')

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

    async.series([
      // insert users
      next => {
        User.insertMany(users)
          .catch(err => {
            return next(err)
          })
          .then(users => {
            console.log('Inserted ' + users.length + ' users')
            return next()
          })
      },
      // insert polls
      next => {
        Poll.insertMany(polls)
          .catch(err => {
            return next(err)
          })
          .then(polls => {
            console.log('Inserted ' + polls.length + ' polls')
            return next()
          })
      }
    ], (err, result) => {
      if (err) return console.log(err)
      console.log('Seed done.')
    })
  })
}

const ObjectId = mongoose.Types.ObjectId
const user1Id = ObjectId()
const user2Id = ObjectId()
const user3Id = ObjectId()

const users = [{
  _id: user1Id,
  email: 'aivo@devlabs.bg',
  password: 'nd2ibd57GJlAjOpS',
  firstname: 'Ivaylo',
  lastname: 'Atanasov',
  rate: 50
}, {
  _id: user2Id,
  email: 'veselin@devlabs.bg',
  password: 'nd2ibd57GJlAjOpS',
  firstname: 'Veselin',
  lastname: 'Bratanov',
  rate: 100
}, {
  _id: user3Id,
  email: 'goran@devlabs.bg',
  password: 'nd2ibd57GJlAjOpS',
  firstname: 'George',
  lastname: 'Restful',
  rate: 75
}]

const polls = [{
  userId: user1Id,
  rate: 60,
  completedAt: null,
  approved: null,
  votes: []
}, {
  userId: user2Id,
  rate: 90,
  completedAt: null,
  approved: null,
  votes: [{
    userId: user1Id,
    reason: 'no decrease for you',
    approved: 0
  }, {
    userId: user3Id,
    reason: 'none',
    approved: 0
  }]
}]
