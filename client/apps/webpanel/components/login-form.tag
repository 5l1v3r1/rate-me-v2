<login-form>
  <script>
    const authToken = '123' // TODO

    tag.form = {
      email: null,
      password: null
    }

    tag.errors = { }

    tag.onInputChange = e => {
      const { name, value } = e.target
      tag.form[name] = value
    }

    tag.onFormSubmit = e => {
      e.preventDefault()

      fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify(tag.form)
      })
      .then(res => {
        if (!res.ok) {
          return Promise.reject(res.json())
        }
        return res.json()
      })
      .then(res => {
        // TODO: store token and redirect
        console.log(res.authToken)
      })
      .catch(err => console.error(err))
    }

    tag.renderErrorOn = fieldName => {
      // 'if' directive in component does not seem to work when element is returned
      if (fieldName in tag.errors) {
        return <span>
          {tag.errors[fieldName]}
        </span>
      }

      return null
    }
  </script>
  <form onsubmit={tag.onFormSubmit}>
    <div>
      <label for="email-input">Email Address</label>
      <input
        id="email-input"
        name="email"
        oninput={tag.onInputChange}
        type="email"
      />
      { tag.renderErrorOn('email') }
    </div>
    <div>
      <label for="password-input">Password</label>
      <input
        id="password-input"
        name="password"
        oninput={tag.onInputChange}
        type="password"
      />
      { tag.renderErrorOn('password') }
    </div>
    <div>
      <button>Login</button>
    </div>
  </form>
</login-form>