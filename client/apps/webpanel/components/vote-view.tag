<vote-view>
  <script>
    //todo logic here
  </script>
  <h4>User({tag.props.vote.userId}) voted {tag.props.vote.approved ? 'YES!' : 'NO!'}
    <span if={tag.props.vote.reason}>, reason: "{tag.props.vote.reason}"</span>
  </h4>
</vote-view>
