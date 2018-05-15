const Poll = require('../models/poll')

function getPolls (c, next) {
  Poll.find({}, '-__v', (err, polls) => {
    if (err) return next(err)
    return next(null, polls)
  })
}

function createPoll (c, next) {
  Poll
    .create({
      userId: c.args.userId,
      rate: c.args.rate,
      completedAt: null,
      approved: null,
      votes: []
    }, (err, poll) => {
      if (err) return next(err)
      return next(null, poll)
    })
}

function updatePoll (c, next) {
  const args = c.args
  const updateKeys = ['approved', 'votes', 'status']
  Poll.findById(args.id, (err, poll) => {
    if (err) return next(err)
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
    poll.save(err => {
      if (err) return next(err)
      return next(null, poll)
    })
  })
}

function deletePoll (c, next) {
  Poll.findByIdAndDelete(c.args.id)
    .catch(err => next(err))
    .then(() => {
      next(null, true)
    })
}

module.exports = function Polls (plasma, dna) {
  plasma.on('polls-list', getPolls, this)

  plasma.on('polls-create', createPoll, this)

  plasma.on('polls-update', updatePoll, this)

  plasma.on('polls-delete', deletePoll, this)
}
