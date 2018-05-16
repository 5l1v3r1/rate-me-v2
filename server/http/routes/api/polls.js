const auth = require('../middlewares/auth')
const Poll = require('../../../models/poll')

module.exports = (plasma, dna, helpers) => {
  const responseError = helpers['response-error']
  const validateExistance = helpers['validate'].existance
  return {

    'GET': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        const listChemical = {
          type: 'polls-list'
        }
        plasma.emit(listChemical, (err, polls) => {
          if (err) return next(err)
          res
            .status(200)
            .send(polls)

          return next()
        })
      }
    ],

    'POST': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        try {
          validateExistance(req.body, ['rate'])
        } catch (e) {
          return next(responseError(400, e))
        }

        const createChemical = {
          type: 'polls-create',
          args: {
            userId: req.user.id,
            rate: req.body.rate
          }
        }
        plasma.emit(createChemical, (err, poll) => {
          if (err) return next(err)
          res
            .status(200)
            .send(poll)

          return next()
        })
      }
    ],

    'PUT /:id': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        try {
          validateExistance(req.params, ['id'])
        } catch (e) {
          return next(responseError(400, e))
        }
        Poll.findById(req.params.id)
          .then(poll => {
            if (!poll) {
              return next(responseError(404, 'Poll not found.'))
            }
            if (poll.user.id === req.user.id) {
              // user should not be able to add votes to himself
              if (req.params.votes) {
                return next(responseError(400, 'Tou can\'t add votes to your poll.'))
              }
            } else {
              // other users should not be able to approve or change the status
              if (req.params.approved || req.params.status) {
                return next(responseError(400, 'You can only approve or change status of your own poll.'))
              }
            }
            // no votes adding after poll is completed
            if (poll.approved && req.body.votes) {
              return next(responseError(400, 'Votes can\'t be added on approved polls.'))
            }

            // if approved status changes, put completedAt value as well
            const updateChemical = {
              type: 'polls-update',
              args: {
                id: req.params.id,
                approved: req.body.approved,
                votes: req.body.votes,
                status: req.body.status
              }
            }
            plasma.emit(updateChemical, (err, updatedPoll) => {
              if (err) return next(err)
              res
                .status(200)
                .send(updatedPoll)

              return next()
            })
          })
          .catch(err => next(responseError(404, err)))
      }
    ],

    'DELETE /:id': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
        Poll.findById(req.params.id)
          .then(poll => {
            if (!poll) {
              return next(responseError(404, 'Poll not found.'))
            }

            const deleteChemical = {
              type: 'polls-delete',
              args: {
                id: req.params.id
              }
            }
            plasma.emit(deleteChemical, (err, success) => {
              if (err) return next(err)
              res
                .status(200)
                .send(success)

              return next()
            })
          })
          .catch(err => next(responseError(404, err)))
      }
    ]

  }
}
