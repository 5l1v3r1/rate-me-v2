const oval = require('organic-oval')
oval.init()

require('../landing/landing-view')
require('../components/poll-form.tag')

class App {
  constructor(rootEl, props, attrs) {
    oval.BaseTag(this, rootEl, props, attrs)
  }

  render(createElement) {
    return (
      <div>
        <h1>Layout</h1>
        <landing-view></landing-view>

        <poll-form></poll-form>
      </div>
    )
  }
}

oval.registerTag('app', App)

oval.mountAll(document.body)