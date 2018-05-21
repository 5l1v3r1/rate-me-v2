<poll-view>
  <script>
    require('../components/vote-view.tag')
  </script>
  <h3>User({tag.props.poll.user})'s poll for new rate of {tag.props.poll.rate} billion dollars</h3>
  <section>
    <ul>
      <li>Status: <strong>{tag.props.poll.status}</strong></li>
      <li if={tag.props.poll.status}>Completed at: <strong>{tag.props.poll.completedAt}</strong></li>
      <li if={tag.props.poll.status}>Completed at: <strong>{tag.props.poll.approved}</strong></li>
      <li>Votes:
        <ul>
          <each vote in {tag.props.poll.votes}>
            <li><vote-view prop-vote={vote} /></li>
          </each>
          <li if={!tag.props.poll.votes.length}>No votes, be the first one to vote!</li>
        </ul>
      </li>
    </ul>
  </section>
</poll-view>
