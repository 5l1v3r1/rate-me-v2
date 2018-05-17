const mongoose = require('mongoose')
const voteSchema = require('./schemas/vote')

const ObjectId = mongoose.Schema.Types.ObjectId

const proposalStatuses = [
  'In progress',
  'Completed'
]

const schema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User' },
  rate: Number,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  approved: { type: Boolean, default: null },
  votes: [voteSchema],
  status: { type: String, enum: proposalStatuses, default: proposalStatuses[0] }
})

schema.statics.proposalStatuses = proposalStatuses

module.exports = mongoose.model('Poll', schema)
