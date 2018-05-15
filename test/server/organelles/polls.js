const async = require('async')
const mongoose = require('mongoose')

const User = require('../../../server/models/user')
const Poll = require('../../../server/models/poll')
const PollsOrganelle = require('../../../server/organelles/polls')

describe('organelles/polls', function () {
  const ObjectId = mongoose.Types.ObjectId
  const user1Id = ObjectId()
  const user2Id = ObjectId()

  before(done => {
    test.startServer(err => {
      if (err) return done(err)
      // insert test data
      async.series([
        next => {
          User
            .insertMany([{
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
            }])
            .catch(err => next(err))
            .then(users => next())
        },
        next => {
          Poll
            .insertMany([{
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
              votes: []
            }])
            .catch(err => next(err))
            .then(polls => next())
        }
      ], (err, result) => {
        if (err) return done(err)
        return done(null)
      })
    })
  })

  after(done => {
    async.series([
      next => {
        mongoose.connection.db.dropDatabase(next)
      },
      test.stopServer
    ], done)
  })

  it('fetches all polls on "polls-list"', done => {
    const plasma = test.getPlasma()
    const dna = {}
    PollsOrganelle(plasma, dna)

    const chemical = {
      type: 'polls-list'
    }
    plasma.emit(chemical, (err, polls) => {
      expect(err).to.not.exist
      expect(polls.length).to.eq(2)
      expect(polls[0].rate).to.eq(60)
      expect(polls[1].rate).to.eq(90)

      return done()
    })
  })

  it('creates a poll with "polls-create"', done => {
    const plasma = test.getPlasma()
    const dna = {}
    PollsOrganelle(plasma, dna)

    const chemical = {
      type: 'polls-create',
      args: {
        userId: user1Id,
        rate: 75
      }
    }
    plasma.emit(chemical, (err, poll) => {
      expect(err).to.not.exist
      expect(poll).to.exist
      expect(poll.userId).to.eq(user1Id)
      expect(poll.rate).to.eq(75)

      Poll.find({}, (err, polls) => {
        if (err) return done(err)

        expect(polls.length).to.eq(3)
        expect(polls[2].userId.toString()).to.eq(user1Id.toString())
        expect(polls[2].rate).to.eq(75)
        expect(polls[2].approved).to.eq(null)

        return done()
      })
    })
  })
})
