const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const schema = {
  userId: { type: ObjectId, ref: 'User' },
  approved: {
    type: Number,
    enum: [0, 1] // 0 - rejected; 1 - approved;
  }
}

module.exports = schema