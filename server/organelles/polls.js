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
      userId: c.args.userId,
      rate: c.args.rate,
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
  const args = c.args
  const updateKeys = ['approved', 'votes', 'status']
  Poll.findById(args.id)
    .then(poll => {
      const pollPatch = {}
      // pick values to patch
      updateKeys.forEach(key => {
        if (key in args) pollPatch[key] = args[key]
      })
      // fill up completed date if approved field is being set
      if ('approved' in args) {
        pollPatch['completedAt'] = Date.now()
      }
      Object.assign(poll, pollPatch)
      poll.save()
        .then(() => next(null, poll))
        .catch(err => next(err))
    })
    .catch(err => next(err))
}

function deletePoll (c, next) {
  Poll.findByIdAndDelete(c.args.id)
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
