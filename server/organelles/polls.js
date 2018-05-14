const Poll = require('../models/poll')

function getPolls(args, next) {
  Poll.find({}, '-__v', (err, polls) => {
    if (err) return next(err)
    return next(null, polls)
  })
}

function createPoll(args, next) {
  Poll
    .create({
      userId: args.userId,
      rate: args.rate,
      completedAt: null,
      approved: null,
      votes: []
    })
    .catch(err => next(err))
    .then(poll => {
      return next(null, poll)
    })
}

function updatePoll(args, next) {
  const updateKeys = ['approved', 'votes', 'status']
  Poll.findById(args.id)
    .catch(err => next(err))
    .then(poll => {
      const pollPatch = {}
      // pick values to patch
      updateKeys.forEach(key => {
        if (key in args) pollPatch[key] = args.key
      })
      Object.assign(poll, pollPatch)
      poll.save()
        .catch(err => next(err))
        .then(() => {
          return next(null, poll)
        })
    })
}

function deletePoll(args, next) {
  Post.findByIdAndDelete(args.id)
    .catch(err => next(err))
    .then(() => {
      next(null, true)
    })
}

module.exports = function Polls(plasma, dna) {

  plasma.on('polls-list', getPolls, this)

  plasma.on('polls-create', createPoll, this)

  plasma.on('polls-update', updatePoll, this)

  plasma.on('polls-delete', deletePoll, this)

}