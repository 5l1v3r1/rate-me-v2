const Poll = require('../models/poll')

function getPolls (c, next) {
  Poll.find({}, '-__v')
    .then(polls => {
      next(null, polls)
    })
    .catch(err => next(err))
}

function createPoll (c, next) {
  Poll
    .create({
      userId: c.userId,
      rate: c.rate,
      completedAt: null,
      approved: null,
      votes: []
    })
    .then(poll => {
      next(null, poll)
    })
    .catch(err => next(err))
}

function updatePoll (c, next) {
  const updateKeys = ['approved', 'votes', 'status']
  Poll.findById(c.id)
    .then(poll => {
      if (!poll) {
        next(new Error('Poll with id ' + c.id + ' not found.'))
      }
      const pollPatch = {}
      // pick values to patch
      updateKeys.forEach(key => {
        if (key in c) {
          const value = c[key]
          const valueNotNullOrUndefined = value !== null && typeof value !== 'undefined'
          if (valueNotNullOrUndefined) {
            pollPatch[key] = c[key]
          }
        }
      })
      // fill up completed date if approved field is being set
      if ('approved' in c) {
        const valueNotNullOrUndefined = c['approved'] !== null && typeof c['approved'] !== 'undefined'
        if (valueNotNullOrUndefined) {
          pollPatch['completedAt'] = Date.now()
        }
      }
      Object.assign(poll, pollPatch)
      poll.save()
        .then(() => next(null, poll))
        .catch(err => next(err))
    })
    .catch(err => next(err))
}

function deletePoll (c, next) {
  Poll.findByIdAndDelete(c.id)
    .then(() => {
      next(null, true)
    })
    .catch(err => next(err))
}

module.exports = function Polls (plasma, dna) {
  plasma.on('polls-list', getPolls, this)

  plasma.on('polls-create', createPoll, this)

  plasma.on('polls-update', updatePoll, this)

  plasma.on('polls-delete', deletePoll, this)
}
