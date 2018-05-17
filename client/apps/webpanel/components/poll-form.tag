<poll-form>
  <script>
    const authToken = '123' // TODO

    tag.form = {
      rate: null
    }

    tag.onFormSubmit = e => {
      e.preventDefault()

      const inputs = this.refs
      const values = {}
      Object.keys(inputs).forEach(key => {
        values[key] = inputs[key].value
      })

      const payload = {
        rate: values.rate
      }

      fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify(payload)
      })
      .then(res => console.error(res))
    }
  </script>
  <form onsubmit={tag.onFormSubmit}>
    <div class="form-control">
      <label for="rate-input">Enter new rate</label>
      <input id="rate-input" type="number" ref="rate" value={tag.form.rate} />
    </div>
    <div class="form-control">
      <button type="submit">Create poll</button>
    </div>
  </form>
</poll-form>