const auth = require('../middlewares/auth')

module.exports = (plasma, dna, helpers) => {
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
        // TODO: validate
        const createChemical = {
          type: 'polls-create',
          args: {
            userId: req.user._id,
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
        // TODO: validate
        // user should not be able to add votes to himself
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
        plasma.emit(updateChemical, (err, poll) => {
          if (err) return next(err)
          res
            .status(200)
            .send(poll)

          return next()
        })
      }
    ],

    'DELETE /:id': [
      auth.authorize(dna.jwtSecret),
      (req, res, next) => {
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
      }
    ]

  }
}
