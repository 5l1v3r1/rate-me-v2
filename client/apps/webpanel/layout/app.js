const oval = require('organic-oval')
oval.init()

require('../landing/landing-view.tag')
require('../components/poll-form.tag')
require('../components/polls-view.tag')
const Polls = require('../models/polls').Polls
const Poll = require('../models/polls').Poll
const Vote = require('../models/polls').Vote

// todo: fetch from API
function getSamplePolls() {
  return [
    new Poll(1, 99.99, null, null, [], 0),
    new Poll(2, 19.99, Date.now(), true, [
      new Vote(1, 'Me leik!', 1)
    ], 0),
    new Poll(2, 999.99, Date.now(), false, [
      new Vote(1, 'Nah!', 0)
    ], 0),
  ]
}

class App {
  constructor(rootEl, props, attrs) {
    oval.BaseTag(this, rootEl, props, attrs)

    this.polls = new Polls(getSamplePolls())
  }

  render(createElement) {
    return (
      <div>
        <h1>Layout</h1>
        <landing-view></landing-view>

        <poll-form></poll-form>

        <polls-view prop-polls={this.polls}></polls-view>
      </div>
    )
  }
}

oval.registerTag('app', App)
