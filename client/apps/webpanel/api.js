const Polls = require('./models/polls').Polls
const Poll = require('./models/polls').Poll
const Vote = require('./models/polls').Vote

export class Api {
  getAllPolls () {
    return new Polls([
      new Poll(1, 99.99, null, null, [], 0),
      new Poll(2, 19.99, Date.now(), true, [
        new Vote(1, 'Me leik!', 1)
      ], 1),
      new Poll(2, 999.99, Date.now(), false, [
        new Vote(1, 'Nah!', 0),
        new Vote(3, null, 0),
      ], 0),
    ])
  }
}
