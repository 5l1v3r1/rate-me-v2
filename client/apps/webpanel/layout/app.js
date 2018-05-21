const oval = require('organic-oval')
oval.init()

require('../landing/landing-view.tag')
require('../components/login-form.tag')
require('../components/poll-form.tag')
require('../components/polls-view.tag')
const api = new (require('../api')).Api()

class App {
  constructor(rootEl, props, attrs) {
    oval.BaseTag(this, rootEl, props, attrs)

    this.polls = api.getAllPolls()
  }

  render(createElement) {
    return (
      <div>
        <h1>Layout</h1>
        <landing-view></landing-view>

        <login-form></login-form>
        <poll-form></poll-form>

        <polls-view prop-polls={this.polls}></polls-view>
      </div>
    )
  }
}

oval.registerTag('app', App)
