const mongoose = require('mongoose')
const voteSchema = require('./schemas/vote')

const ObjectId = mongoose.Schema.Types.ObjectId

const proposalStatuses = [
  'In progress',
  'Completed'
]

const schema = {
  userId: { type: ObjectId, ref: 'User' },
  rate: Number,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  approved: Boolean,
  votes: [voteSchema],
  status: { type: String, enum: proposalStatuses, default: proposalStatuses[0] }
}

module.exports = mongoose.model('Poll', schema)