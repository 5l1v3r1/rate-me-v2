<login-form>
  <link rel="stylesheet" type="text/css" href="webpanel/components/login-form.css"/>
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
      .catch(err => console.error(err))
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => Promise.reject(err))
        }
        return res.json()
      })
      .then(res => {
        // TODO: store token and redirect
        console.log(res.authToken)
      })
      .catch(err => {
        console.error(err)
        // Note: all errors are set on password, since backend doesn't sort them out
        tag.errors['password'] = err
        // TODO: trigger rerendering?
      })
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
  <form class="login-form" onsubmit={tag.onFormSubmit}>
    <div class="c-input">
      <label
        for="email-input"
        class="c-input__label"
      >
        Email Address
      </label>
      <input
        id="email-input"
        class="c-input__field"
        name="email"
        oninput={tag.onInputChange}
        type="email"
      />
      { tag.renderErrorOn('email') }
    </div>
    <div class="c-input">
      <label
        for="password-input"
        class="c-input__label"
      >
        Password
      </label>
      <input
        id="password-input"
        class="c-input__field"
        name="password"
        oninput={tag.onInputChange}
        type="password"
      />
      { tag.renderErrorOn('password') }
    </div>
    <div class="c-input">
      <button class="c-btn">Login</button>
    </div>
  </form>
</login-form>