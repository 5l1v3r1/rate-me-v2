<polls-view>
  <script>
    require('../components/poll-view.tag')
  </script>
  <h2>Polls <small>({tag.props.polls.items.length})</small></h2>
  <each poll in {tag.props.polls.items}>
    <poll-view prop-poll={poll} />
  </each>
</polls-view>
