const async = require('async')
const mongoose = require('mongoose')

const User = require('../../../server/models/user')
const Poll = require('../../../server/models/poll')

describe('organelles/polls', function () {
  const ObjectId = mongoose.Types.ObjectId
  const user1Id = ObjectId()
  const user2Id = ObjectId()
  const pollId = ObjectId()

  beforeEach(done => {
    test.startServer({
      'organic-mongoose': {},
      'organic-express-server': {
        'expressSetupDoneOnce': 'Mongoose'
      },
      'polls': {} // spawns the tested `polls` organelle for all tests
    }, err => {
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
              _id: pollId,
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

  afterEach(done => {
    async.series([
      next => {
        mongoose.connection.db.dropDatabase(next)
      },
      test.stopServer
    ], done)
  })

  it('fetches all polls on "polls-list"', done => {
    const chemical = {
      type: 'polls-list'
    }
    test.variables.cell.plasma.emit(chemical, (err, polls) => {
      expect(err).to.not.exist
      expect(polls.length).to.eq(2)
      expect(polls[0].rate).to.eq(60)
      expect(polls[1].rate).to.eq(90)

      return done()
    })
  })

  it('creates a poll with "polls-create"', done => {
    const chemical = {
      type: 'polls-create',
      userId: user1Id,
      rate: 75
    }
    test.variables.cell.plasma.emit(chemical, (err, poll) => {
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

  it('updates a poll with "polls-update"', done => {
    // set votes
    const votesChemical = {
      type: 'polls-update',
      id: pollId,
      votes: [{
        userId: user2Id,
        reason: 'last month raise',
        approved: 0
      }]
    }
    test.variables.cell.plasma.emit(votesChemical, (err, poll) => {
      expect(err).to.not.exist
      expect(poll).to.exist
      expect(poll.votes.length).to.eq(1)

      // set status
      const statusChemical = {
        type: 'polls-update',
        id: pollId,
        approved: false,
        status: Poll.proposalStatuses[1]
      }
      test.variables.cell.plasma.emit(statusChemical, (err, poll) => {
        expect(err).to.not.exist
        expect(poll).to.exist
        expect(poll.approved).to.eq(false)

        Poll.findById(pollId, (err, poll) => {
          if (err) return done(err)

          expect(poll.rate).to.eq(60)
          expect(poll.createdAt).to.exist
          expect(poll.completedAt).to.exist
          expect(poll.approved).to.eq(false)
          expect(poll.votes.length).to.eq(1)
          expect(poll.votes[0].approved).to.eq(0)
          expect(poll.votes[0].reason).to.eq('last month raise')
          expect(poll.status).to.eq(Poll.proposalStatuses[1])

          return done()
        })
      })
    })
  })

  it('deletes with "polls-delete"', done => {
    const chemical = {
      type: 'polls-delete',
      id: pollId
    }
    test.variables.cell.plasma.emit(chemical, (err, poll) => {
      expect(err).to.not.exist

      Poll.find({}, (err, polls) => {
        if (err) return done(err)

        // first added poll should be deleted
        expect(polls.length).to.eq(1)
        expect(polls[0].rate).to.eq(90)

        return done()
      })
    })
  })
})
