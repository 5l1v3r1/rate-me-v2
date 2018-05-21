<poll-view>
  <script>
    require('../components/vote-view.tag')
  </script>
  <h3>User({tag.props.poll.user})'s poll for new rate of {tag.props.poll.rate} billion dollars</h3>
  <section>
    <ul>
      <li>Status: <strong>{tag.props.poll.status}</strong></li>
      <li>Completed at: <strong>{tag.props.poll.completedAt}</strong></li>
      <li>Completed at: <strong>{tag.props.poll.approved}</strong></li>
      <li>Votes:
        <ul>
          <each vote in {tag.props.poll.votes}>
            <li><vote-view prop-vote={vote} /></li>
          </each>
        </ul>
      </li>
    </ul>
  </section>
</poll-view>
